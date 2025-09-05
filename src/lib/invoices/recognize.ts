import { db } from "@/database";
import { invoices } from "@/database/tables";
import type { OcrResult } from "@/types/invoices";
import { getOcrProvider } from "@/lib/ocr/provider";
import { extractVatCn } from "./extractors/vat_cn";
import { eq } from "drizzle-orm";

export async function recognizeInvoice(opts: {
  invoiceId: string;
  fileUrl: string;
  contentType: string;
}) {
  // Choose provider and run OCR
  const provider = await getOcrProvider();
  const ocr: OcrResult = await provider.recognize({
    url: opts.fileUrl,
    contentType: opts.contentType,
  });

  // Parse as CN VAT
  const parsed = extractVatCn(ocr);

  // Persist results
  await db
    .update(invoices)
    .set({
      recognizedData: { ...ocr, fieldBBoxes: parsed.fieldBBoxes } as any,
      invoiceType: parsed.invoiceType,
      invoiceCode: parsed.invoiceCode ?? null,
      invoiceNumber: parsed.invoiceNumber ?? null,
      issueDate: parsed.issueDate ?? null,
      buyerName: parsed.buyerName ?? null,
      buyerTaxId: parsed.buyerTaxId ?? null,
      sellerName: parsed.sellerName ?? null,
      sellerTaxId: parsed.sellerTaxId ?? null,
      totalAmount: parsed.totalAmount ?? null,
      taxAmount: parsed.taxAmount ?? null,
      amountWithTax: parsed.amountWithTax ?? null,
      items: (parsed.items || []) as any,
      status: "PENDING_REVIEW",
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, opts.invoiceId));
}
