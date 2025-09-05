import { z } from "zod";

export const invoiceFileSchema = z.object({
  key: z.string(),
  url: z.string().url(),
  contentType: z.string(),
  fileName: z.string(),
  size: z.number().int().nonnegative(),
});

export const createInvoicesSchema = z.object({
  files: z.array(invoiceFileSchema).min(1).max(20),
});

export const updateInvoiceSchema = z.object({
  invoiceType: z.enum(["VAT_SPECIAL", "VAT_NORMAL", "UNKNOWN"]).optional(),
  invoiceCode: z.string().optional().nullable(),
  invoiceNumber: z.string().optional().nullable(),
  issueDate: z.string().datetime().optional().nullable(),
  buyerName: z.string().optional().nullable(),
  buyerTaxId: z.string().optional().nullable(),
  sellerName: z.string().optional().nullable(),
  sellerTaxId: z.string().optional().nullable(),
  totalAmount: z.number().int().optional().nullable(),
  taxAmount: z.number().int().optional().nullable(),
  amountWithTax: z.number().int().optional().nullable(),
  items: z.array(
    z.object({
      name: z.string(),
      model: z.string().optional(),
      unit: z.string().optional(),
      quantity: z.number().optional(),
      unitPrice: z.number().int().optional(),
      amount: z.number().int().optional(),
      taxRate: z.number().optional(),
      taxAmount: z.number().int().optional(),
      bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
    }),
  ).optional(),
  status: z.enum(["PENDING_REVIEW", "COMPLETED"]).optional(),
});

export const exportInvoicesSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  format: z.enum(["csv", "xlsx"]).default("csv"),
  fields: z.array(z.string()).optional(),
  order: z.array(z.string()).optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1),
  config: z.record(z.any()),
  visualSignature: z.record(z.any()).optional(),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  config: z.record(z.any()).optional(),
  visualSignature: z.record(z.any()).optional(),
});
