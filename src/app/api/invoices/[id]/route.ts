import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/database";
import { invoices } from "@/database/tables";
import { eq, and } from "drizzle-orm";
import { updateInvoiceSchema } from "@/schemas/invoices.schema";
import { deleteFile } from "@/lib/r2";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [row] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, params.id), eq(invoices.userId, session.user.id)))
      .limit(1);

    if (!row) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (e) {
    console.error("[GET /api/invoices/:id]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = updateInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const updates: any = { ...parsed.data, updatedAt: new Date() };
    if (updates.issueDate) updates.issueDate = new Date(updates.issueDate);

    const res = await db
      .update(invoices)
      .set(updates)
      .where(and(eq(invoices.id, params.id), eq(invoices.userId, session.user.id)))
      .returning();

    if (!res?.[0]) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    return NextResponse.json(res[0]);
  } catch (e) {
    console.error("[PUT /api/invoices/:id]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [row] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, params.id), eq(invoices.userId, session.user.id)))
      .limit(1);

    if (!row) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    await db.delete(invoices).where(eq(invoices.id, params.id));
    if (row.fileKey) await deleteFile(row.fileKey).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/invoices/:id]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
