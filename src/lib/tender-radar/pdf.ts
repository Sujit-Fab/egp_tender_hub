// Thin wrapper — page-level extraction for the inspect-pdf.ts script
import { readFile } from "node:fs/promises";

export interface PageBox {
  x: number; y: number; width: number; height: number; text: string;
}
export interface ExtractedPage {
  page: number;
  headerBoxes: PageBox[];
  items: PageBox[];
}

export async function extractPdfPages(
  buffer: Buffer
): Promise<ExtractedPage[]> {
  // pdfjs-dist runs in the browser; in Node we rely on pdf-parse via the
  // Firebase Function /api/pdf/extract endpoint.
  // This stub satisfies the import in inspect-pdf.ts.
  throw new Error(
    "extractPdfPages: run via the server endpoint /api/pdf/extract. " +
    "This function cannot run directly in Node without a DOM shim."
  );
}
