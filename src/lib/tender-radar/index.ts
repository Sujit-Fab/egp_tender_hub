export { categorizeTender, categorizeAll, groupByCategory } from "./categorizer";
export type { TenderCategory, ParsedTender, CategorizedTender } from "./categorizer";

import { readFile } from "node:fs/promises";
import { categorizeAll, groupByCategory } from "./categorizer";
import type { ParsedTender, CategorizedTender, TenderCategory } from "./categorizer";

export interface TenderRadarResult {
  date: string;
  totalTenders: number;
  byCategory: Record<TenderCategory, CategorizedTender[]>;
  diagnostics: unknown[];
}

export async function parseAllTendersPdf(
  pdfBuffer: Buffer
): Promise<TenderRadarResult> {
  // pdf.ts handles raw extraction — here we call the API endpoint
  // This function is used by scripts/tender-radar/parse-pdf.ts
  throw new Error(
    "parseAllTendersPdf: call via the /api/ai/extract-file endpoint. " +
    "Use parseTendersFromJson() if you already have the JSON result."
  );
}

export function parseTendersFromJson(raw: {
  tenders: ParsedTender[];
  diagnostics: unknown[];
}): TenderRadarResult {
  const categorized = categorizeAll(raw.tenders);
  const byCategory  = groupByCategory(categorized);
  return {
    date: new Date().toISOString().split("T")[0],
    totalTenders: categorized.length,
    byCategory,
    diagnostics: raw.diagnostics ?? [],
  };
}
