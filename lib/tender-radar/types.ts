export interface TenderRecord {
  serial_no: number;
  tender_id: string;
  reference_no: string;
  nature: string;
  title: string;
  ministry: string;
  division: string;
  organization: string;
  procuring_entity: string;
  type: string;
  method: string;
  /** Local e-GP date/time, as printed; no implicit UTC conversion. */
  publishing_datetime: string;
  closing_datetime: string;
  has_amendment: boolean;
  source_pages: number[];
}

export interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hasEOL: boolean;
  contentId?: string;
}

export interface Box {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

export interface PdfPage {
  page: number;
  /** Preserve PDF content-stream order, not global y-sort (cells are centered). */
  items: TextItem[];
  headerBoxes: Box[];
}

export interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  page?: number;
  serial_no?: number;
}

export interface ParseResult {
  records: TenderRecord[];
  /** Before tender-ID deduplication, so verification cannot hide duplicates. */
  sourceRecords: TenderRecord[];
  diagnostics: Diagnostic[];
}
