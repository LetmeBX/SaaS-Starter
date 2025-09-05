import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/database";
import { invoices } from "@/database/tables";
import { and, eq } from "drizzle-orm";
import { recognizeInvoice } from "@/lib/invoices/recognize";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [row] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, params.id), eq(invoices.userId, session.user.id)))
      .limit(1);

    if (!row) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    await db
      .update(invoices)
      .set({ status: "PROCESSING", recognizedData: null, errorMessage: null, updatedAt: new Date() })
      .where(eq(invoices.id, params.id));

    try {
      await recognizeInvoice({ invoiceId: row.id, fileUrl: row.fileUrl, contentType: row.contentType });
      const [fresh] = await db.select().from(invoices).where(eq(invoices.id, row.id));
      return NextResponse.json(fresh);
    } catch (e: any) {
      await db
        .update(invoices)
        .set({ status: "FAILED", errorMessage: e?.message || "Reprocess failed", updatedAt: new Date() })
        .where(eq(invoices.id, row.id));
      const [fresh] = await db.select().from(invoices).where(eq(invoices.id, row.id));
      return NextResponse.json(fresh);
    }
  } catch (e) {
    console.error("[POST /api/invoices/:id/reprocess]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
