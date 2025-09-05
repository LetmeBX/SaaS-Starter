import { exportInvoicesToCSV } from "./csv";

describe("CSV exporter", () => {
  it("exports selected fields and formats money", () => {
    const csv = exportInvoicesToCSV([
      {
        id: "1",
        userId: "u1",
        fileKey: "k",
        fileUrl: "u",
        contentType: "image/png",
        invoiceType: "VAT_NORMAL",
        invoiceCode: "A",
        invoiceNumber: "B",
        issueDate: "2024-01-02T00:00:00.000Z",
        buyerName: "X",
        buyerTaxId: "T",
        sellerName: "Y",
        sellerTaxId: "S",
        totalAmount: 10000,
        taxAmount: 1500,
        amountWithTax: 11500,
        items: [],
        recognizedData: {},
        status: "PENDING_REVIEW",
        errorMessage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ] as any, {
      fields: ["invoiceCode", "invoiceNumber", "amountWithTax"],
    });
    expect(csv.trim()).toBe("invoiceCode,invoiceNumber,amountWithTax\nA,B,115.00");
  });
});
