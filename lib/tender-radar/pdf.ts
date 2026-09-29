import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { PDFPageProxy } from 'pdfjs-dist';
import type { Box, PdfPage, TextItem } from './types.ts';

type Matrix = [number, number, number, number, number, number];
const identity = (): Matrix => [1, 0, 0, 1, 0, 0];

function multiply(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

/** Read the actual painted TH rectangles in this Chromium e-GP export.
 * This PDF.js 5 operator adapter is deliberately separate from row parsing.
 * Unsupported/unmarked layouts fail in the parser instead of guessing columns.
 */
async function headerBoxes(page: PDFPageProxy): Promise<Box[]> {
  const operators = await page.getOperatorList();
  let matrix = identity();
  const matrices: Matrix[] = [];
  const tags: string[] = [];
  const boxes: Box[] = [];
  operators.fnArray.forEach((op, index) => {
    const args = operators.argsArray[index];
    if (op === OPS.save) matrices.push([...matrix]);
    else if (op === OPS.restore) matrix = matrices.pop() ?? identity();
    else if (op === OPS.transform) matrix = multiply(matrix, args as Matrix);
    else if (op === OPS.beginMarkedContentProps || op === OPS.beginMarkedContent) tags.push(args[0]);
    else if (op === OPS.endMarkedContent) tags.pop();
    else if (op === OPS.constructPath && tags.at(-1) === 'TH') {
      const bounds = args[2] as ArrayLike<number> | undefined;
      if (!bounds || bounds.length !== 4) return;
      const points = [[bounds[0], bounds[1]], [bounds[2], bounds[1]],
        [bounds[2], bounds[3]], [bounds[0], bounds[3]]].map(([x, y]) => [
        matrix[0] * x + matrix[2] * y + matrix[4],
        matrix[1] * x + matrix[3] * y + matrix[5],
      ]);
      const box = {
        left: Math.min(...points.map(p => p[0])), right: Math.max(...points.map(p => p[0])),
        bottom: Math.min(...points.map(p => p[1])), top: Math.max(...points.map(p => p[1])),
      };
      if (box.right > box.left && box.top > box.bottom && !boxes.some(b =>
        Math.abs(b.left - box.left) < 0.1 && Math.abs(b.bottom - box.bottom) < 0.1)) boxes.push(box);
    }
  });
  return boxes.sort((a, b) => a.left - b.left);
}

/** No filesystem, network, app, or Firebase dependency. Caller owns byte loading. */
export async function extractPdfPages(bytes: Uint8Array): Promise<PdfPage[]> {
  // PDF.js may transfer/detach its input; never detach the caller's buffer.
  const task = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true,
    isEvalSupported: false, stopAtErrors: true });
  try {
    const document = await task.promise;
    const pages: PdfPage[] = [];
    for (let number = 1; number <= document.numPages; number++) {
      const page = await document.getPage(number);
      const content = await page.getTextContent({ includeMarkedContent: true });
      const ids: (string | undefined)[] = [];
      const items: TextItem[] = [];
      for (const item of content.items) {
        if ('str' in item) {
          if (item.str.trim()) items.push({ text: item.str, x: item.transform[4], y: item.transform[5],
            width: item.width, height: item.height, hasEOL: item.hasEOL, contentId: ids.at(-1) });
        } else if (item.type === 'endMarkedContent') ids.pop();
        else ids.push(item.id);
      }
      pages.push({ page: number, items, headerBoxes: await headerBoxes(page) });
      page.cleanup();
    }
    return pages;
  } finally {
    await task.destroy();
  }
}
