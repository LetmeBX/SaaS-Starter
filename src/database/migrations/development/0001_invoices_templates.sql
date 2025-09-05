-- Invoices and Templates tables for VAT invoice module

CREATE TABLE IF NOT EXISTS "invoices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" text NOT NULL,
  "fileKey" text NOT NULL,
  "fileUrl" text NOT NULL,
  "contentType" text NOT NULL,
  "invoiceType" text NOT NULL DEFAULT 'UNKNOWN',
  "invoiceCode" text,
  "invoiceNumber" text,
  "issueDate" timestamp,
  "buyerName" text,
  "buyerTaxId" text,
  "sellerName" text,
  "sellerTaxId" text,
  "totalAmount" integer,
  "taxAmount" integer,
  "amountWithTax" integer,
  "items" jsonb,
  "recognizedData" jsonb,
  "status" text NOT NULL DEFAULT 'UPLOADED',
  "errorMessage" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "invoices"
  ADD CONSTRAINT IF NOT EXISTS "invoices_userId_users_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "invoices_userId_idx" ON "invoices" USING btree ("userId");
CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices" USING btree ("status");
CREATE INDEX IF NOT EXISTS "invoices_issueDate_idx" ON "invoices" USING btree ("issueDate");
CREATE INDEX IF NOT EXISTS "invoices_code_number_idx" ON "invoices" USING btree ("invoiceCode", "invoiceNumber");

-- Templates table
CREATE TABLE IF NOT EXISTS "templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" text NOT NULL,
  "name" text NOT NULL,
  "type" text NOT NULL DEFAULT 'VAT_INVOICE',
  "config" jsonb,
  "visualSignature" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "templates"
  ADD CONSTRAINT IF NOT EXISTS "templates_userId_users_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "templates_userId_idx" ON "templates" USING btree ("userId");
CREATE INDEX IF NOT EXISTS "templates_name_idx" ON "templates" USING btree ("name");
