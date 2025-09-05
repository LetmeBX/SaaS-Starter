import type { OcrResult } from "@/types/invoices";
import type { InvoiceItem, FieldBBox, InvoiceType } from "@/types/invoices";

export interface VatCnExtractionResult {
  invoiceType: InvoiceType;
  invoiceCode?: string | null;
  invoiceNumber?: string | null;
  issueDate?: Date | null;
  buyerName?: string | null;
  buyerTaxId?: string | null;
  sellerName?: string | null;
  sellerTaxId?: string | null;
  totalAmount?: number | null; // cents
  taxAmount?: number | null; // cents
  amountWithTax?: number | null; // cents
  items: InvoiceItem[];
  fieldBBoxes: FieldBBox;
}

const RMB = (s?: string | null) => (s ?? "").replace(/[,，]/g, "");
const toCents = (val?: string | number | null) => {
  if (val === undefined || val === null || val === "") return undefined;
  const n = typeof val === "number" ? val : parseFloat(RMB(val));
  if (Number.isNaN(n)) return undefined;
  return Math.round(n * 100);
};

export function extractVatCn(ocr: OcrResult): VatCnExtractionResult {
  const text = ocr.blocks.map((b) => b.text).join("\n");
  const fieldBBoxes: FieldBBox = {};

  const find = (key: string, re: RegExp) => {
    const m = text.match(re);
    if (!m) return null;
    const idx = ocr.blocks.findIndex((b) => re.test(b.text));
    if (idx >= 0) fieldBBoxes[key] = ocr.blocks[idx].bbox;
    return m[1] || m[0];
  };

  const invoiceCode = find("invoiceCode", /发票代码[:：]?\s*(\d{10,12})/);
  const invoiceNumber = find("invoiceNumber", /发票号码[:：]?\s*(\d{6,12})/);
  const issueDateStr = find("issueDate", /开票日期[:：]?\s*(\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2})/);
  const buyerName = find("buyerName", /购买方名称[:：]?\s*([\u4e00-\u9fa5A-Za-z0-9（）()（ ）\-_.·]+)/);
  const buyerTaxId = find("buyerTaxId", /购买方税号[:：]?\s*([A-Z0-9]{10,20})/);
  const sellerName = find("sellerName", /销售方名称[:：]?\s*([\u4e00-\u9fa5A-Za-z0-9（）()（ ）\-_.·]+)/);
  const sellerTaxId = find("sellerTaxId", /销售方税号[:：]?\s*([A-Z0-9]{10,20})/);

  const totalWithTaxStr = find("amountWithTax", /价税合计.*?([0-9]+(?:\.[0-9]{1,2})?)/);
  const totalAmountStr = find("totalAmount", /合计[:：]?\s*([0-9]+(?:\.[0-9]{1,2})?)/);
  const taxAmountStr = find("taxAmount", /税额[:：]?\s*([0-9]+(?:\.[0-9]{1,2})?)/);

  const items: InvoiceItem[] = [];
  const headerIdx = ocr.blocks.findIndex((b) => /名\s*称.*税\s*额/.test(b.text));
  if (headerIdx >= 0) {
    for (let i = headerIdx + 1; i < ocr.blocks.length; i++) {
      const line = ocr.blocks[i].text.trim();
      // Split by tabs or multiple spaces
      const parts = line.split(/\t+|\s{2,}/).map((s) => s.trim()).filter(Boolean);
      // Expect at least: name, quantity, unitPrice, amount, taxRate, taxAmount
      if (parts.length >= 6) {
        const name = parts[0];
        const quantity = parseFloat(parts.find((p) => /\d/.test(p)) || "");
        // Heuristic mapping by position for mock data
        const unitPrice = toCents(parts[4]);
        const amount = toCents(parts[5]);
        const rateMatch = parts.find((p) => /%$/.test(p));
        const taxRate = rateMatch ? parseFloat(rateMatch.replace("%", "")) / 100 : undefined;
        const taxAmount = toCents(parts[parts.length - 1]);
        items.push({
          name,
          quantity: Number.isFinite(quantity) ? quantity : undefined,
          unitPrice: unitPrice,
          amount: amount,
          taxRate,
          taxAmount,
          bbox: ocr.blocks[i].bbox,
        });
      } else if (/^[-\s]*$/.test(line)) {
        break;
      }
    }
  }

  let issueDate: Date | null = null;
  if (issueDateStr) {
    const norm = issueDateStr.replace(/[年/.]/g, "-").replace(/月/g, "-").replace(/日/g, "");
    const d = new Date(norm);
    if (!isNaN(d.getTime())) issueDate = d;
  }

  const totalAmount = toCents(totalAmountStr ?? undefined);
  const taxAmount = toCents(taxAmountStr ?? undefined);
  const amountWithTax = toCents(totalWithTaxStr ?? undefined);

  const invoiceType: InvoiceType = "VAT_NORMAL"; // default for MVP

  return {
    invoiceType,
    invoiceCode: invoiceCode || null,
    invoiceNumber: invoiceNumber || null,
    issueDate: issueDate || null,
    buyerName: buyerName || null,
    buyerTaxId: buyerTaxId || null,
    sellerName: sellerName || null,
    sellerTaxId: sellerTaxId || null,
    totalAmount: totalAmount ?? null,
    taxAmount: taxAmount ?? null,
    amountWithTax: amountWithTax ?? null,
    items,
    fieldBBoxes,
  };
}
