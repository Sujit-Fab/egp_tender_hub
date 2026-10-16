const activePrompts = new WeakSet();
export const DEMO_PROMPT = 'DEMO ONLY: enter admin, ordinary, other, owner-a, or owner-b';
const accounts = ['admin', 'ordinary', 'other', 'owner-a', 'owner-b'];
const codes = new Set(['INVALID_DEMO_ACCOUNT', 'PROMPT_OVERLAP', 'PROMPT_TIMEOUT',
  'UNEXPECTED_DIALOG', 'DUPLICATE_DIALOG', 'DIALOG_HANDLING_FAILED', 'INVALID_CHECK_SEQUENCE']);
export class HarnessError extends Error {
  constructor(code) { super(code); this.name = 'HarnessError'; this.code = code; }
}

export function createDemoAccountSession(adapter) {
  let signedIn = false;
  const logout = async () => {
    // A restored Firebase session initially renders the signed-out header.
    // Track completed harness actions instead of trusting that transient view.
    if (signedIn) {
      await adapter.waitForRestoredSession();
      await adapter.signOut();
    }
    await adapter.waitForSignedOut();
    signedIn = false;
  };
  return {
    logout,
    async login(account) {
      await logout();
      await adapter.signIn(account);
      signedIn = true;
    },
  };
}

export async function withDemoAccountPrompt(page, account, trigger, { timeoutMs = 15000 } = {}) {
  if (!accounts.includes(account)) throw new HarnessError('INVALID_DEMO_ACCOUNT');
  if (activePrompts.has(page)) throw new HarnessError('PROMPT_OVERLAP');
  let acceptPrompt;
  let fail;
  let claimed = false;
  let active = true;
  const accepted = new Promise(resolve => { acceptPrompt = resolve; });
  const failed = new Promise((resolve, reject) => { fail = reject; });
  // The race below owns all rejections, including late accept/click failures.
  const handler = dialog => {
    const handling = async () => {
      if (!active) return;
      if (claimed || dialog.type() !== 'prompt' || dialog.message() !== DEMO_PROMPT) {
        fail(new HarnessError(claimed ? 'DUPLICATE_DIALOG' : 'UNEXPECTED_DIALOG'));
        await dialog.dismiss().catch(() => {});
        return;
      }
      claimed = true;
      try { await dialog.accept(account); }
      catch { throw new HarnessError('DIALOG_HANDLING_FAILED'); }
      if (active) acceptPrompt();
    };
    void handling().catch(fail);
  };
  activePrompts.add(page);
  page.on('dialog', handler);
  const timer = setTimeout(() => fail(new HarnessError('PROMPT_TIMEOUT')), timeoutMs);
  try {
    await Promise.race([Promise.all([Promise.resolve().then(trigger), accepted]), failed]);
  } finally {
    active = false;
    clearTimeout(timer);
    page.off('dialog', handler);
    activePrompts.delete(page);
  }
}

export function guardUnexpectedDialogs(page, onFailure) {
  const handler = dialog => {
    if (activePrompts.has(page)) return;
    onFailure(new HarnessError('UNEXPECTED_DIALOG'));
    // Dismiss only to unblock the browser; the failure remains recorded.
    void dialog.dismiss().catch(() => {});
  };
  page.on('dialog', handler);
  return () => page.off('dialog', handler);
}

export function sanitizedFailure(error) {
  const names = new Set(['Error', 'AssertionError', 'TimeoutError', 'TypeError', 'AbortError', 'HarnessError']);
  const safe = { error: names.has(error?.name) ? error.name : 'Error' };
  if (error instanceof HarnessError && codes.has(error.code)) safe.code = error.code;
  if (typeof error?.stack === 'string') {
    const match = error.stack.match(/(?:\/|\\)test(?:\/|\\)manual-spa(?:\/|\\)((?:checks|std-persistence|screenshots|session|harness)\.mjs):(\d{1,6}):(\d{1,6})(?:\)|\s|$)/);
    if (match) safe.location = `${match[1]}:${match[2]}:${match[3]}`;
  }
  return safe;
}

export function createCheckProgress(report, requiredNames, persist) {
  report.checks = [];
  report.activeCheck = null;
  report.firstFailure = null;
  let currentFailure;
  let queue = Promise.resolve();
  const checkpoint = () => {
    // Every progress checkpoint is rejected by the acceptance gate, even if
    // all actions happened to finish before an abnormal exit or cleanup failure.
    const snapshot = JSON.stringify({ ...report, complete: false, cleanupVerified: false }, null, 2);
    queue = queue.then(() => persist(snapshot));
    return queue;
  };
  const noteFailure = error => {
    const failure = { name: report.activeCheck ?? 'Harness outside required check', status: 'failed', ...sanitizedFailure(error) };
    report.firstFailure ??= failure;
    if (report.activeCheck) currentFailure ??= failure;
    return checkpoint();
  };
  const check = async (name, action) => {
    if (report.activeCheck || name !== requiredNames[report.checks.length]) throw new HarnessError('INVALID_CHECK_SEQUENCE');
    report.activeCheck = name;
    currentFailure = undefined;
    await checkpoint();
    try { await action(); }
    catch (error) { await noteFailure(error); }
    const result = currentFailure ?? { name, status: 'passed' };
    report.checks.push(result);
    report.activeCheck = null;
    await checkpoint();
  };
  return { check, noteFailure, checkpoint, flush: () => queue, results: report.checks };
}
