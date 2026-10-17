'use strict';

module.exports = Object.freeze({
  MAX_PDF_BYTES: 10 * 1024 * 1024,
  MAX_TENDERS: 400,
  MAX_RECORD_BYTES: 2 * 1024 * 1024,
  PARSER_VERSION: 'egp-admin-v1',
  EXTRACTION_LIMITS: Object.freeze({
    maxPages: 100, maxItems: 100000, maxTextCharacters: 1000000, maxOperatorsPerPage: 200000,
  }),
});
