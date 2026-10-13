'use strict';

const { createHash } = require('node:crypto');
const { createPublicError } = require('./errors');
const { MAX_PDF_BYTES, MAX_TENDERS, MAX_RECORD_BYTES, PARSER_VERSION } = require('./limits');

const digest = value => createHash('sha256').update(value).digest('hex');
const fields = ['reference_no', 'nature', 'title', 'ministry', 'division', 'organization',
  'procuring_entity', 'type', 'method', 'publishing_datetime', 'closing_datetime'];

function expectedCount(request) {
  const value = request.headers?.['x-tender-radar-expected-count'];
  if (typeof value !== 'string' || !/^[1-9]\d{0,2}$/.test(value) || Number(value) > MAX_TENDERS) {
    throw createPublicError('INVALID_COUNT');
  }
  return Number(value);
}

function validatePdf(bytes) {
  if (!Buffer.isBuffer(bytes)) throw createPublicError('INVALID_PDF');
  if (bytes.length > MAX_PDF_BYTES) throw createPublicError('PDF_TOO_LARGE');
  if (bytes.length < 16 || !/^%PDF-1\.[0-7]|^%PDF-2\.0/.test(bytes.subarray(0, 8).toString('ascii')) ||
      !/%%EOF\s*$/.test(bytes.subarray(-1024).toString('ascii'))) throw createPublicError('INVALID_PDF');
}

// Compare the actual tender content, excluding row numbers/page positions that
// change between otherwise identical daily exports. Keep full source provenance.
function prepareRecords(parsed, count, categoryKeys) {
  if (!parsed || !Array.isArray(parsed.records) || parsed.records.length !== count ||
      Buffer.byteLength(JSON.stringify(parsed.records)) > MAX_RECORD_BYTES) throw createPublicError('PARSER_FAILED');
  const ids = new Set();
  return parsed.records.map((record, index) => {
    if (record.serial_no !== index + 1 || !/^\d{1,20}$/.test(record.tender_id) || ids.has(record.tender_id) ||
        !categoryKeys.includes(record.category) || typeof record.has_amendment !== 'boolean' ||
        !Array.isArray(record.source_pages) || record.source_pages.length === 0 || record.source_pages.length > 100 ||
        record.source_pages.some(page => !Number.isInteger(page) || page < 1 || page > 100) ||
        fields.some(field => typeof record[field] !== 'string' || record[field].length > (field === 'title' ? 16000 : 4000)) ||
        !record.title.trim() || !record.nature.trim() || !record.closing_datetime.trim()) {
      throw createPublicError('PARSER_FAILED');
    }
    ids.add(record.tender_id);
    const content = { tender_id: record.tender_id };
    for (const field of fields) content[field] = record[field];
    content.has_amendment = record.has_amendment;
    content.category = record.category;
    return { ...content, serial_no: record.serial_no, source_pages: [...record.source_pages],
      contentHash: digest(JSON.stringify(content)) };
  });
}

function createIngestionService({ authorize, readPdf, parse, store, loadCategories }) {
  async function validate(request) {
    // Authenticate before reading/buffering the PDF or accessing Firestore.
    const principal = await authorize(request);
    const count = expectedCount(request);
    const bytes = await readPdf(request);
    validatePdf(bytes);
    const parsed = await parse(bytes, count);
    const categoryKeys = await loadCategories();
    const records = prepareRecords(parsed, count, categoryKeys);
    const fileHash = digest(bytes);
    const previewHash = digest(JSON.stringify({ version: PARSER_VERSION, fileHash, count, records }));
    return { uid: principal.uid, records, fileHash, previewHash, expectedCount: count, parsed, categoryKeys };
  }
  return {
    async preview(request) {
      const batch = await validate(request);
      const existing = await store.inspect(batch);
      const byCategory = Object.fromEntries(batch.categoryKeys.map(key => [key, 0]));
      for (const record of batch.records) byCategory[record.category]++;
      return { fileHash: batch.fileHash, previewHash: batch.previewHash, totalCount: batch.records.length,
        byCategory, warningCount: batch.parsed.warningCount || 0, infoCount: batch.parsed.infoCount || 0,
        ...existing };
    },
    async confirm(request) {
      const batch = await validate(request);
      if (request.headers?.['x-tender-radar-preview-hash'] !== batch.previewHash) {
        throw createPublicError('PREVIEW_CHANGED');
      }
      return store.persist(batch);
    },
  };
}

module.exports = { createIngestionService, prepareRecords, validatePdf };
