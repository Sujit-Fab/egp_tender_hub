import { extractPdfPages, type PdfExtractionLimits } from './pdf.ts';
import { parseTenderPages } from './parser.ts';

export async function parseAllTendersPdf(bytes: Uint8Array, limits?: PdfExtractionLimits) {
  return parseTenderPages(await extractPdfPages(bytes, limits));
}

export { extractPdfPages } from './pdf.ts';
export { parseTenderPages, deduplicateByTenderId, normalizeText } from './parser.ts';
export { verifyTenders } from './verify.ts';
export type { VerificationExpectation } from './verify.ts';
export type { TenderRecord, ParseResult, Diagnostic, PdfPage, TextItem } from './types.ts';
