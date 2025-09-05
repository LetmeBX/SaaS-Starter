import { db } from "@/database";
import { invoices } from "@/database/tables";
import { getUserSubscription } from "@/lib/database/subscription";
import { PRODUCT_TIERS } from "@/lib/config/products";
import { and, between, eq, sql } from "drizzle-orm";

export async function getUserTier(userId: string) {
  const sub = await getUserSubscription(userId);
  if (!sub) return { tierId: "plus", quota: 200 };
  const tier = PRODUCT_TIERS.find((t) => t.id === sub.tierId) ||
    PRODUCT_TIERS.find((t) => t.id === "plus");
  const quota = tier?.recommendedInvoiceQuota ?? 200;
  return { tierId: tier?.id || "plus", quota };
}

export async function getMonthlyUsage(userId: string) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(and(eq(invoices.userId, userId), between(invoices.createdAt, start, end)));

  return Number(rows?.[0]?.count || 0);
}

export async function canProcess(userId: string) {
  const { quota } = await getUserTier(userId);
  const used = await getMonthlyUsage(userId);
  const remaining = Math.max(quota - used, 0);
  return { allowed: remaining > 0, remaining, quota, used };
}
