import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/database";
import { templates } from "@/database/tables";
import { and, eq } from "drizzle-orm";
import { updateTemplateSchema } from "@/schemas/invoices.schema";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const [row] = await db
    .update(templates)
    .set({ ...parsed.data, updatedAt: new Date() } as any)
    .where(and(eq(templates.id, params.id), eq(templates.userId, session.user.id)))
    .returning();

  if (!row) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await db
    .delete(templates)
    .where(and(eq(templates.id, params.id), eq(templates.userId, session.user.id)))
    .returning();

  if (!res?.[0]) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
