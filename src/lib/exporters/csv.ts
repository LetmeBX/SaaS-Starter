import type { InvoiceDTO } from "@/types/invoices";

const moneyYuan = (cents?: number | null) =>
  cents === undefined || cents === null ? "" : (cents / 100).toFixed(2);

export function exportInvoicesToCSV(
  data: InvoiceDTO[],
  options: { fields?: string[]; order?: string[] } = {},
) {
  const defaultFields = [
    "invoiceCode",
    "invoiceNumber",
    "issueDate",
    "buyerName",
    "buyerTaxId",
    "sellerName",
    "sellerTaxId",
    "totalAmount",
    "taxAmount",
    "amountWithTax",
    "status",
  ];
  const fields = options.fields ?? defaultFields;

  const header = fields.join(",");
  const rows = data.map((inv) => {
    const cells = fields.map((f) => {
      const v = (inv as any)[f];
      if (["totalAmount", "taxAmount", "amountWithTax"].includes(f)) {
        return moneyYuan(v);
      }
      if (v === undefined || v === null) return "";
      // escape commas and quotes
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    });
    return cells.join(",");
  });

  return [header, ...rows].join("\n");
}
