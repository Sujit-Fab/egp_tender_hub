import type { ParseResult, TenderRecord } from './types.ts';

export interface VerificationExpectation {
  count: number;
  ictSerials: readonly number[];
  amendmentSerials: readonly number[];
}

function duplicates<T extends string | number>(values: T[]): T[] {
  const seen = new Set<T>();
  const repeated = new Set<T>();
  for (const value of values) { if (seen.has(value)) repeated.add(value); seen.add(value); }
  return [...repeated].sort((a, b) => String(a).localeCompare(String(b), 'en', { numeric: true }));
}

function counts(records: TenderRecord[], key: 'nature' | 'type') {
  const result: Record<string, number> = {};
  for (const record of records) result[record[key]] = (result[record[key]] ?? 0) + 1;
  return result;
}

const sorted = (values: readonly number[]) => [...values].sort((a, b) => a - b);
const equal = (a: readonly number[], b: readonly number[]) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));

export function verifyTenders(result: ParseResult, expected: VerificationExpectation) {
  const records = result.records;
  const source = result.sourceRecords;
  const serials = new Set(records.map(r => r.serial_no));
  const missing = Array.from({ length: expected.count }, (_, index) => index + 1).filter(n => !serials.has(n));
  const empty = (key: 'tender_id' | 'nature' | 'title' | 'closing_datetime') =>
    source.filter(r => !r[key].trim()).map(r => r.serial_no);
  const report = {
    expected_count: expected.count,
    parsed_count: records.length,
    source_record_count: source.length,
    unique_tender_id_count: new Set(records.map(r => r.tender_id).filter(Boolean)).size,
    missing_serial_numbers: missing,
    duplicate_serial_numbers: duplicates(source.map(r => r.serial_no)),
    unexpected_serial_numbers: source.filter(r => !Number.isInteger(r.serial_no) || r.serial_no < 1 || r.serial_no > expected.count).map(r => r.serial_no),
    duplicate_tender_ids: duplicates(source.map(r => r.tender_id).filter(Boolean)),
    records_with_empty_tender_id: empty('tender_id'),
    records_with_empty_nature: empty('nature'),
    records_with_empty_title: empty('title'),
    records_with_empty_closing_datetime: empty('closing_datetime'),
    counts_by_nature: counts(records, 'nature'),
    counts_by_type: counts(records, 'type'),
    ict_tender_serial_numbers: sorted(records.filter(r => r.type === 'ICT').map(r => r.serial_no)),
    amendment_corrigendum_tender_serial_numbers: sorted(records.filter(r => r.has_amendment).map(r => r.serial_no)),
    diagnostics: result.diagnostics,
    status: 'FAIL' as 'PASS' | 'FAIL',
  };
  const failures = [report.missing_serial_numbers, report.duplicate_serial_numbers, report.unexpected_serial_numbers,
    report.duplicate_tender_ids, report.records_with_empty_tender_id, report.records_with_empty_nature,
    report.records_with_empty_title, report.records_with_empty_closing_datetime];
  if (report.parsed_count === expected.count && report.source_record_count === expected.count &&
    report.unique_tender_id_count === expected.count && failures.every(list => list.length === 0) &&
    equal(report.ict_tender_serial_numbers, expected.ictSerials) &&
    equal(report.amendment_corrigendum_tender_serial_numbers, expected.amendmentSerials) &&
    !result.diagnostics.some(d => d.severity === 'error')) report.status = 'PASS';
  return report;
}
