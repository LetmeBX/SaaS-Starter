import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/database";
import { invoices } from "@/database/tables";
import { inArray, and, eq } from "drizzle-orm";
import { exportInvoicesSchema } from "@/schemas/invoices.schema";
import type { InvoiceDTO } from "@/types/invoices";
import { exportInvoicesToCSV } from "@/lib/exporters/csv";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const body = await req.json();
  const parsed = exportInvoicesSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid body", details: parsed.error.flatten() }), { status: 400 });
  }

  const ids = parsed.data.ids;
  const rows = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.userId, session.user.id), inArray(invoices.id, ids)));

  const data = rows.map((r) => ({
    ...r,
    issueDate: r.issueDate ? r.issueDate.toISOString() : null,
    createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
    updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt,
  })) as unknown as InvoiceDTO[];

  // Only CSV for MVP
  const csv = exportInvoicesToCSV(data, { fields: parsed.data.fields, order: parsed.data.order });
  const filename = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${filename}`,
      "Cache-Control": "no-store",
    },
  });
}
