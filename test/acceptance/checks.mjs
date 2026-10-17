export const requiredChecks = [
  'Rules: repository rules loaded and read back on both emulator databases',
  'Isolation: missing/non-loopback emulator configuration fails closed',
  'HTTP: missing/ordinary/disabled/revoked/removed admin authorization rejected',
  'HTTP: real parser preview and real SDK atomic ingestion/provenance',
  'HTTP: parallel and repeated confirmations create exactly one receipt/batch',
  'HTTP: overlapping exports skip identical existing content and reject duplicate IDs within a PDF',
  'HTTP: real SDK commit precondition failure rolls back tender and receipt writes',
  'HTTP: amendments and conflicts introduced after preview reject the whole batch',
  'HTTP: invalid PDF/count and tampered digest cannot persist',
  'Rules: named database denies direct create/update/delete including nested paths for ordinary/admin/anonymous clients',
  ...['en', 'bn'].flatMap(lang => [
    `Browser ${lang}: preview/confirmation, changed files/counts, retry and double-click protection`,
    `Browser ${lang}: tampered preview cannot hide server amendment conflicts`,
    `Browser ${lang}: account switching discards delayed preview and cannot confirm as another user`,
    `Browser ${lang}: keyboard, invalid PDF, refresh and sign-out discard preview`,
  ]),
  'Isolation: browser and SDK made no non-loopback requests or credential fallback attempts',
];
