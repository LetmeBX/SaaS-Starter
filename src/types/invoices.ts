export type InvoiceStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "PENDING_REVIEW"
  | "COMPLETED"
  | "FAILED";

export type InvoiceType = "VAT_SPECIAL" | "VAT_NORMAL" | "UNKNOWN";

export interface FieldBBox {
  [field: string]: [number, number, number, number] | undefined; // [x,y,w,h] in 0..1
}

export interface InvoiceItem {
  name: string;
  model?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number; // cents
  amount?: number; // cents
  taxRate?: number; // 0-1
  taxAmount?: number; // cents
  bbox?: [number, number, number, number];
}

export interface InvoiceDTO {
  id: string;
  userId: string;
  fileKey: string;
  fileUrl: string;
  contentType: string;
  invoiceType: InvoiceType;
  invoiceCode?: string | null;
  invoiceNumber?: string | null;
  issueDate?: string | null; // ISO date string
  buyerName?: string | null;
  buyerTaxId?: string | null;
  sellerName?: string | null;
  sellerTaxId?: string | null;
  totalAmount?: number | null; // cents
  taxAmount?: number | null; // cents
  amountWithTax?: number | null; // cents
  items?: InvoiceItem[] | null;
  recognizedData?: unknown;
  status: InvoiceStatus;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFieldConfig {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "bool" | "money";
  bbox?: [number, number, number, number];
}

export interface TemplateConfig {
  fields: TemplateFieldConfig[];
  itemsArea?: [number, number, number, number];
  mapping?: Record<string, string>; // fieldKey -> OCR keyword/regex
}

export interface OcrTextBlock {
  text: string;
  bbox: [number, number, number, number];
  line?: number;
}

export interface OcrResult {
  blocks: OcrTextBlock[];
  raw?: any;
}
