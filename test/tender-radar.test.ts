import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { deduplicateByTenderId, extractPdfPages, normalizeText, parseTenderPages, verifyTenders } from '../lib/tender-radar/index.ts';

const expected = { count: 345, ictSerials: [35, 49, 174], amendmentSerials: [117, 167, 203, 209, 285] };
const pages = await extractPdfPages(await readFile(new URL('./fixtures/egp-all-tenders-2026-09-28.pdf', import.meta.url)));
const result = parseTenderPages(pages);
const record = (serial: number) => {
  const found = result.records.find(r => r.serial_no === serial);
  assert.ok(found, `Missing tender #${serial}`);
  return found;
};

test('fixture meets every Tender Radar acceptance condition', () => {
  const report = verifyTenders(result, expected);
  console.log('TENDER RADAR VERIFICATION\n' + JSON.stringify(report, null, 2));
  assert.equal(report.status, 'PASS', JSON.stringify(report, null, 2));
  assert.equal(result.records.length, 345);
  assert.equal(new Set(result.records.map(r => r.tender_id)).size, 345);
  assert.deepEqual(result.records.map(r => r.serial_no), Array.from({ length: 345 }, (_, i) => i + 1));
  assert.deepEqual(report.ict_tender_serial_numbers, expected.ictSerials);
  assert.deepEqual(report.amendment_corrigendum_tender_serial_numbers, expected.amendmentSerials);
});

test('page continuations retain organization, title and closing date', () => {
  assert.deepEqual(record(6).source_pages, [1, 2]);
  assert.equal(record(6).procuring_entity, 'Chittagong Medical College Hospital');
  assert.deepEqual(record(155).source_pages, [16, 17]);
  assert.equal(record(155).title, 'Procurement of furniture for kolhapur 10 Bed Mother & Child Welfare Centre (MCWC) at Sadar Upazila in Gopalganj District.');
  assert.equal(record(155).organization, 'Health Engineering Department (HED)');
  assert.equal(record(155).division, '');
  assert.equal(record(155).procuring_entity, 'Health Engineering Department (HED) Head Office');
  assert.equal(record(155).closing_datetime, '08-Oct-2026 16:00');
  assert.equal(record(345).tender_id, '1340245');
  assert.equal(record(345).closing_datetime, '12-Oct-2026 14:00');
});

test('framework nature and punctuation survive; amendment stays in its row', () => {
  assert.equal(record(55).nature, 'Goods (Framework Agreement)');
  assert.equal(record(117).ministry, 'Ministry of Local Government, Rural Development and Co-operatives');
  assert.equal(record(117).procuring_entity, 'Office of the Executive Engineer, LGED, Sylhet');
  assert.equal(record(117).has_amendment, true);
  assert.equal(record(116).has_amendment, false);
  assert.equal(record(118).has_amendment, false);
  assert.doesNotMatch(record(117).reference_no, /Amendment/);
  assert.match(record(159).title, /10\. Ensure compliance/);
  assert.match(record(157).title, /Rajbari$/);
  assert.equal(normalizeText('Ângela — café'), 'Ângela — café');
});

test('numeric title content cannot override the ID column', () => {
  const changed = structuredClone(pages);
  const title = changed[0].items.find(i => i.text === 'Procurement of MSR Surgical Goods (Disposable');
  assert.ok(title);
  title.text += ' RMS ID 7654321';
  const parsed = parseTenderPages(changed);
  assert.equal(parsed.records[0].tender_id, '1335524');
  assert.match(parsed.records[0].title, /7654321/);
});

test('deduplication uses only nonempty tender IDs and verification exposes duplicates', () => {
  const a = record(1);
  const b = { ...record(2), reference_no: a.reference_no, title: a.title };
  assert.equal(deduplicateByTenderId([a, b]).length, 2);
  assert.equal(deduplicateByTenderId([a, { ...b, tender_id: a.tender_id }]).length, 1);
  assert.equal(deduplicateByTenderId([{ ...a, tender_id: '' }, { ...b, tender_id: '' }]).length, 2);
  const duplicate = { ...result, sourceRecords: [...result.sourceRecords, a] };
  const report = verifyTenders(duplicate, expected);
  assert.equal(report.status, 'FAIL');
  assert.deepEqual(report.duplicate_serial_numbers, [1]);
  assert.deepEqual(report.duplicate_tender_ids, ['1335524']);
});

test('verification rejects missing data and incorrectly assigned classifications', () => {
  for (const field of ['tender_id', 'nature', 'title', 'closing_datetime'] as const) {
    const records = structuredClone(result.records);
    records[0][field] = '';
    assert.equal(verifyTenders({ ...result, records, sourceRecords: records }, expected).status, 'FAIL', field);
  }
  for (const change of ['missing', 'serial', 'ict', 'amendment'] as const) {
    const records = structuredClone(result.records);
    if (change === 'missing') records.pop();
    if (change === 'serial') records[0].serial_no = 346;
    if (change === 'ict') records[34].type = 'NCT';
    if (change === 'amendment') records[116].has_amendment = false;
    assert.equal(verifyTenders({ ...result, records, sourceRecords: records }, expected).status, 'FAIL', change);
  }
});

test('unsupported layout fails explicitly instead of guessing columns', () => {
  assert.throws(() => parseTenderPages([{ ...pages[0], headerBoxes: [] }]), /refusing to guess/);
});
