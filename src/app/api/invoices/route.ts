import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/database";
import { invoices } from "@/database/tables";
import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { createInvoicesSchema } from "@/schemas/invoices.schema";
import { canProcess } from "@/lib/billing/usage";
import { recognizeInvoice } from "@/lib/invoices/recognize";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = createInvoicesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const usage = await canProcess(userId);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: "Quota exceeded", code: "QUOTA_EXCEEDED", upgradeUrl: "/dashboard/pricing", quota: usage.quota },
        { status: 402 },
      );
    }

    const created: any[] = [];
    for (const f of parsed.data.files) {
      const [inv] = await db
        .insert(invoices)
        .values({
          userId,
          fileKey: f.key,
          fileUrl: f.url,
          contentType: f.contentType,
          status: "PROCESSING",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      try {
        await recognizeInvoice({ invoiceId: inv.id, fileUrl: f.url, contentType: f.contentType });
        const [fresh] = await db.select().from(invoices).where(eq(invoices.id, inv.id));
        created.push(fresh);
      } catch (e: any) {
        await db
          .update(invoices)
          .set({ status: "FAILED", errorMessage: e?.message || "Recognition failed", updatedAt: new Date() })
          .where(eq(invoices.id, inv.id));
        const [fresh] = await db.select().from(invoices).where(eq(invoices.id, inv.id));
        created.push(fresh);
      }
    }

    return NextResponse.json({ invoices: created });
  } catch (e) {
    console.error("[POST /api/invoices]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || "";
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Math.min(100, Number(searchParams.get("pageSize") || 10));

    const whereClauses: any[] = [eq(invoices.userId, userId)];
    if (status) whereClauses.push(eq(invoices.status, status));
    if (dateFrom) whereClauses.push(gte(invoices.issueDate, new Date(dateFrom)));
    if (dateTo) whereClauses.push(lte(invoices.issueDate, new Date(dateTo)));
    if (q) {
      const like = `%${q}%`;
      whereClauses.push(
        or(
          sql`${invoices.invoiceCode} ILIKE ${like}`,
          sql`${invoices.invoiceNumber} ILIKE ${like}`,
        ),
      );
    }

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: invoices.id,
          fileUrl: invoices.fileUrl,
          invoiceCode: invoices.invoiceCode,
          invoiceNumber: invoices.invoiceNumber,
          issueDate: invoices.issueDate,
          amountWithTax: invoices.amountWithTax,
          status: invoices.status,
          errorMessage: invoices.errorMessage,
          createdAt: invoices.createdAt,
        })
        .from(invoices)
        .where(and(...whereClauses))
        .orderBy(desc(invoices.createdAt))
        .offset((page - 1) * pageSize)
        .limit(pageSize),
      db
        .select({ total: sql<number>`count(*)` })
        .from(invoices)
        .where(and(...whereClauses)),
    ]);

    return NextResponse.json({ page, pageSize, total, rows });
  } catch (e) {
    console.error("[GET /api/invoices]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
