const transportCodes = new Set([
  'EPERM', 'EACCES', 'ECONNREFUSED', 'ECONNRESET', 'EHOSTUNREACH', 'ENETUNREACH',
  'ETIMEDOUT', 'EPIPE', 'EINVAL', 'ENOTFOUND', 'EAI_AGAIN', 'ERR_INVALID_ARG_TYPE',
  'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_SOCKET', 'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT', 'UND_ERR_REQ_CONTENT_LENGTH_MISMATCH',
]);

// Observe existing attempts only. Forward the exact receiver/arguments and never
// inspect URLs, request bodies, response bodies, or exception messages.
export function createUploadFetchObserver(fetchImpl, expectedToken, records) {
  return async function (...args) {
    const headers = new Headers(args[1]?.headers ?? args[0]?.headers);
    const auth = headers.get('authorization');
    records.push({ status: 0, code: auth === null ? 'upload-auth-missing' :
      auth === `Firebase ${expectedToken}` ? 'upload-auth-match' : 'upload-auth-mismatch' });
    try {
      const response = await Reflect.apply(fetchImpl, this, args);
      if (Number.isInteger(response.status) && response.status >= 100 && response.status <= 599) {
        records.push({ status: response.status, code: null });
      }
      return response;
    } catch (error) {
      const code = [error?.cause?.code, error?.code].find(value => transportCodes.has(value));
      records.push({ status: 0, code: code ?? 'transport-error-other' });
      throw error;
    }
  };
}
