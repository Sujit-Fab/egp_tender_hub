# Standalone e-GP All Tenders parser

Run from the repository root with existing dependencies (no installation needed):

```powershell
node --import tsx --test test/tender-radar.test.ts
node --import tsx scripts/tender-radar/parse-pdf.ts test/fixtures/egp-all-tenders-2026-09-28.pdf
node --import tsx scripts/tender-radar/inspect-pdf.ts test/fixtures/egp-all-tenders-2026-09-28.pdf 1,2,16,17,34
```

The CLIs only read the supplied PDF and print to stdout. The test uses Node's
built-in test runner and the already-installed `tsx` and `pdfjs-dist` packages.

## API and separation

`parseAllTendersPdf(bytes)` returns `records`, pre-deduplication `sourceRecords`,
and structured `diagnostics`. `verifyTenders(result, expectations)` checks counts,
IDs, serial continuity, required fields, ICT/amendment assignments and parser errors.
Fixture expectations live in the test, not in parsing logic.

`pdf.ts` adapts PDF.js text items, marked-content IDs and painted TH rectangles.
`parser.ts` is pure TypeScript and accepts extracted `PdfPage[]`; an admin UI or
backend can reuse it independently of filesystem access, React or Firebase.
Browser integration will need its own PDF.js worker setup. No app integration is
part of this step. PDF.js 5.5.207 is installed; its declared Node minimum is
20.19 / 22.13 on those release lines (this fixture was inspected using Node 22.23.2).

## Layout evidence and rules

Before implementation the fixture's text items and coordinates were inspected on
pages 1, 2, 16, 17 and 34. The measured header x edges, in PDF points, are
37.583, 55.748, 191.989, 349.802, 445.171, 480.934, 535.430, 577.438.
These are **evidence, not hard-coded parsing thresholds**: each page's TH drawing
rectangles supply its actual boundaries, validated against the header text.

The content stream is table-row/cell ordered, while cells are vertically centered.
Global y-sorting would mix adjacent rows, especially a long title such as #159.
Serial-column items start rows. Content before the next serial, including a new
page's leading continuation, belongs to the current row. Repeated headers and
browser/pagination footers are removed by their identified coordinate bands.

Observed continuations include #6's procuring entity (pages 1–2) and #155's title,
organization and closing date (pages 16–17). Organization field tags preserve
internal commas. Three groups mean an absent division; four include division.
An unfinished group at a page boundary is joined before fields are assigned.

IDs come only from the first item in the ID/reference cell. Amendment text is
recognized only in that cell. Nature is the prefix of the nature/title cell,
including the separate same-line Framework Agreement item. Only tender ID is
used for deduplication; duplicates remain detectable through `sourceRecords`.
Dates remain local strings as printed; no timezone is inferred. A missing division
is an empty string, not an invented value. Wrapped text is joined, preserving hard
hyphens. Limited U+00C2 mojibake cleanup is reported as an informational diagnostic.

## Limits

This supports the inspected tagged Chromium e-GP table export, not arbitrary or
scanned PDFs. Missing header rectangles, changed field grouping, unexpected
nature/type/date layouts or orphan continuations fail explicitly or produce error
diagnostics. It does not run OCR, call an LLM, access the network, or infer omitted
fields. The drawing-operator adapter targets the installed PDF.js 5 format.
Other e-GP export layouts require additional fixtures before claiming support.

The final page prints `Total Records : 500`, although the supplied acceptance
target is 345 rows. That website pagination label is excluded from the table;
it is not used to manufacture records or override the supplied expectation.
