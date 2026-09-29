import type { Diagnostic, ParseResult, PdfPage, TenderRecord, TextItem } from './types.ts';

interface SourceItem extends TextItem { page: number }
interface RawRow { serial: number; cells: SourceItem[][]; pages: Set<number> }

/** Repair only observed mojibake patterns; retain accents, punctuation and hyphens. */
export function normalizeText(text: string): string {
  return text.replace(/\u00c2(?=\u00a0)/g, '')
    .replace(/(?<=[A-Za-z])\u00c2(?=\s|$)/g, '')
    .replace(/\s+/gu, ' ').trim();
}

function joinItems(items: SourceItem[]): string {
  return items.reduce((text, item, index) => {
    const previous = items[index - 1];
    if (!previous) return item.text;
    const sameLine = previous.page === item.page && Math.abs(previous.y - item.y) < 0.5;
    const adjacent = sameLine && Math.abs(item.x - previous.x - previous.width) < 0.5;
    const wrappedHyphen = !sameLine && /[-/]$/.test(previous.text) && /^\p{L}|^\p{N}/u.test(item.text);
    return text + (adjacent || wrappedHyphen ? '' : ' ') + item.text;
  }, '');
}

const stripSeparator = (text: string) => text.replace(/,\s*$/, '').trim();
const headerLabels = ['S.', 'Tender/Proposal ID,', 'Procurement Nature,',
  'Ministry, Division,', 'Type,', 'Publishing', 'Dashboard'];

function reconstructRows(pages: PdfPage[], diagnostics: Diagnostic[]): RawRow[] {
  const rows: RawRow[] = [];
  let current: RawRow | undefined;
  for (const page of pages) {
    const boxes = page.headerBoxes;
    if (boxes.length !== 7 || !boxes.every((box, column) => page.items.some(item =>
      item.text === headerLabels[column] && item.x >= box.left - 0.1 && item.x < box.right &&
      item.y >= box.bottom && item.y < box.top))) {
      throw new Error(`Unsupported e-GP table headers on page ${page.page}; refusing to guess column boundaries.`);
    }
    const top = Math.min(...boxes.map(b => b.bottom));
    // These are document chrome, identified by label AND position, never a global
    // text replacement that could erase the same words in a tender title.
    const pager = page.items.find(i => i.text === 'Total Records :' && i.y < top &&
      i.x >= boxes[1].left && i.x < boxes[1].right);
    const footer = page.items.find(i => /^https?:\/\/www\.eprocure\.gov\.bd\//.test(i.text) &&
      i.x < boxes[0].left && i.y < top);
    if (!footer) throw new Error(`Missing print-footer boundary on page ${page.page}.`);
    const boundary = pager ?? footer;
    const bottom = boundary.y + boundary.height;
    for (const item of page.items) {
      if (item.y >= top || item.y <= bottom) continue;
      const column = boxes.findIndex(b => item.x >= b.left - 0.1 && item.x < b.right);
      if (column < 0) {
        diagnostics.push({ severity: 'error', code: 'OUTSIDE_TABLE', page: page.page,
          message: `Unassigned table text: ${item.text}` });
        continue;
      }
      if (column === 0) {
        if (!/^\d+$/.test(item.text)) {
          diagnostics.push({ severity: 'error', code: 'INVALID_SERIAL', page: page.page,
            message: `Unexpected serial-column text: ${item.text}` });
          continue;
        }
        current = { serial: Number(item.text), cells: Array.from({ length: 7 }, () => []), pages: new Set() };
        rows.push(current);
      }
      if (!current) throw new Error(`Orphan continuation before the first serial on page ${page.page}.`);
      current.pages.add(page.page);
      current.cells[column].push({ ...item, page: page.page });
    }
  }
  return rows;
}

function parseRow(row: RawRow, diagnostics: Diagnostic[]): TenderRecord {
  const issue = (code: string, message: string, severity: Diagnostic['severity'] = 'error') =>
    diagnostics.push({ severity, code, message, serial_no: row.serial });
  const clean = (items: SourceItem[]) => {
    const raw = joinItems(items);
    const value = normalizeText(raw);
    if (raw.includes('\u00c2') && !value.includes('\u00c2'))
      issue('NORMALIZED_ENCODING', 'Removed an observed stray U+00C2 encoding artifact.', 'info');
    return value;
  };

  // ID is ONLY the first item in the ID/reference cell. Never scan the title
  // (which contains RMS IDs, road IDs and other numeric identifiers).
  const idCell = row.cells[1];
  const id = idCell[0]?.text.trim().match(/^(\d+),?$/)?.[1] ?? '';
  if (!id) issue('INVALID_TENDER_ID', 'The first ID-column item is not a numeric tender ID.');
  const reference = clean(idCell.slice(id ? 1 : 0));
  const amendment = /\bAmendment\s*\/\s*Corrigendum\s+issued\s*:\s*\d+\b/i;
  const hasAmendment = amendment.test(reference);
  const referenceNo = stripSeparator(reference.replace(amendment, ''));

  const natureAndTitle = clean(row.cells[2]);
  const natureMatch = natureAndTitle.match(/^(Goods(?:\s*\(Framework Agreement\))?|Works|Physical Services),\s*/);
  if (!natureMatch) issue('UNKNOWN_NATURE', 'Missing or unsupported procurement nature at the start of its cell.');

  // Marked-content groups correspond to fields, unlike commas inside names.
  // A group split by printing continues with a new page-local content ID.
  const groups: SourceItem[][] = [];
  for (const item of row.cells[3]) {
    const group = groups.at(-1);
    const last = group?.at(-1);
    if (!item.contentId) issue('MISSING_FIELD_TAG', 'Organization cell lacks marked-content field boundaries.');
    if (group && last && ((last.contentId === item.contentId && last.page === item.page) ||
      (last.page !== item.page && !joinItems(group).trimEnd().endsWith(',')))) group.push(item);
    else groups.push([item]);
  }
  const organizations = groups.map(group => stripSeparator(clean(group)));
  if (organizations.length !== 3 && organizations.length !== 4)
    issue('AMBIGUOUS_ORGANIZATION', `Expected 3 or 4 organization fields, found ${organizations.length}: ${JSON.stringify(organizations)}`);

  const typeAndMethod = clean(row.cells[4]);
  const typeMatch = typeAndMethod.match(/^(NCT|ICT),\s*(\S+)$/);
  if (!typeMatch) issue('INVALID_TYPE_METHOD', `Cannot split procurement type/method: ${typeAndMethod}`);
  const dates = clean(row.cells[5]);
  const dateMatch = dates.match(/^(\d{2}-[A-Za-z]{3}-\d{4} \d{2}:\d{2}),\s*(\d{2}-[A-Za-z]{3}-\d{4} \d{2}:\d{2})$/);
  if (!dateMatch) issue('INVALID_DATES', `Cannot split publishing/closing date-times: ${dates}`);

  return {
    serial_no: row.serial, tender_id: id, reference_no: referenceNo,
    nature: natureMatch?.[1] ?? '', title: natureMatch ? natureAndTitle.slice(natureMatch[0].length) : natureAndTitle,
    ministry: organizations[0] ?? '', division: organizations.length === 4 ? organizations[1] : '',
    organization: organizations.length >= 3 ? organizations.at(-2)! : '',
    procuring_entity: organizations.length >= 3 ? organizations.at(-1)! : '',
    type: typeMatch?.[1] ?? '', method: typeMatch?.[2] ?? '',
    publishing_datetime: dateMatch?.[1] ?? '', closing_datetime: dateMatch?.[2] ?? '',
    has_amendment: hasAmendment, source_pages: [...row.pages],
  };
}

/** First occurrence wins by nonempty tender_id only. Empty IDs remain visible. */
export function deduplicateByTenderId(records: TenderRecord[]): TenderRecord[] {
  const seen = new Set<string>();
  return records.filter(record => {
    if (!record.tender_id) return true;
    if (seen.has(record.tender_id)) return false;
    seen.add(record.tender_id);
    return true;
  });
}

/** Pure reconstruction/normalization: no PDF.js, filesystem or application imports. */
export function parseTenderPages(pages: PdfPage[]): ParseResult {
  const diagnostics: Diagnostic[] = [];
  const sourceRecords = reconstructRows(pages, diagnostics).map(row => parseRow(row, diagnostics));
  return { records: deduplicateByTenderId(sourceRecords), sourceRecords, diagnostics };
}
