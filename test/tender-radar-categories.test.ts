import assert from 'node:assert/strict';
import test from 'node:test';
import { categorizeAll, categorizeTender, groupByCategory, normalizeTenderCategories, TENDER_CATEGORIES, TENDER_CATEGORY_KEYS, type ParsedTender } from '../src/lib/tender-radar/categorizer.ts';

const tender = (title: string, organization = ''): ParsedTender => ({
  serial_no: 1, tender_id: '1234567', reference_no: '', nature: 'Goods', title,
  ministry: '', division: '', organization, procuring_entity: '', type: 'NCT', method: 'OTM',
  publishing_datetime: '', closing_datetime: '', has_amendment: false,
});

test('canonical category keys/metadata retain all nine existing values and order', () => {
  assert.deepEqual(TENDER_CATEGORY_KEYS, [
    'Road & Highway', 'Building & Civil', 'Medical & Hospital', 'IT & Equipment',
    'Water & Drainage', 'Power & Electrical', 'Vehicles & Spare Parts', 'Food & Ration', 'Others',
  ]);
  assert.equal(new Set(TENDER_CATEGORY_KEYS).size, 9);
  assert.deepEqual(TENDER_CATEGORIES.map(category => category.id), TENDER_CATEGORY_KEYS);
  assert.ok(TENDER_CATEGORIES.every(category => category.desc.length > 0));
});

test('existing title and organization matching, case handling and precedence remain unchanged', () => {
  const cases = [
    ['HIGHWAY paving', '', 'Road & Highway'], ['Hostel construction', '', 'Building & Civil'],
    ['Surgical gauze', '', 'Medical & Hospital'], ['Server supply', '', 'IT & Equipment'],
    ['River dredging', '', 'Water & Drainage'], ['Transformer supply', '', 'Power & Electrical'],
    ['Locomotive parts', '', 'Vehicles & Spare Parts'], ['Rice ration', '', 'Food & Ration'],
    ['Paper supply', '', 'Others'], ['', 'RHD', 'Road & Highway'],
    ['', 'PWD', 'Building & Civil'], ['', 'NICVD', 'Medical & Hospital'],
    ['', 'Meteorological', 'IT & Equipment'], ['', 'BWDB', 'Water & Drainage'],
    ['', 'BPDB', 'Power & Electrical'], ['', 'Bangladesh Railway', 'Vehicles & Spare Parts'],
    ['', 'Police Superintendent', 'Food & Ration'],
    ['Road construction at hospital', '', 'Road & Highway'],
    ['Hospital building', '', 'Building & Civil'],
    ['Pump assembly', '', 'Water & Drainage'],
    ['Lantern supply', '', 'IT & Equipment'], // Existing substring behavior: LAN.
    ['Planet survey', '', 'Road & Highway'], // Earlier lane rule wins over LAN.
    ['Miscellaneous procurement', '', 'Road & Highway'], // Existing substring behavior: lane.
  ];
  for (const [title, org, expected] of cases) assert.equal(categorizeTender(tender(title, org)), expected, title || org);
});

test('categorization preserves input and grouping retains only populated categories', () => {
  const input = [tender('Server supply'), tender('Highway paving')];
  const before = structuredClone(input);
  const categorized = categorizeAll(input);
  assert.deepEqual(input, before);
  assert.deepEqual(categorized.map(item => item.category), ['IT & Equipment', 'Road & Highway']);
  const grouped = groupByCategory(categorized);
  assert.deepEqual(grouped['IT & Equipment'], [categorized[0]]);
  assert.deepEqual(grouped['Road & Highway'], [categorized[1]]);
  assert.equal(grouped.Others, undefined);
});

test('preference normalization ignores unknown values, deduplicates and bounds selection', () => {
  assert.deepEqual(normalizeTenderCategories(null), []);
  assert.deepEqual(normalizeTenderCategories('IT & Equipment'), []);
  assert.deepEqual(normalizeTenderCategories(['tampered', 'IT & Equipment', 'IT & Equipment', 42]), ['IT & Equipment']);
  assert.deepEqual(normalizeTenderCategories([]), []);
  assert.equal(normalizeTenderCategories([...TENDER_CATEGORY_KEYS, ...TENDER_CATEGORY_KEYS]).length, 9);
});
