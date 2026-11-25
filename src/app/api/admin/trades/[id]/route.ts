import { NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";
import { body, fail, number, ok, text } from "@/lib/api";
import { updateTradeStatus } from "@/lib/db";
import type { TradeStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
const allowed: TradeStatus[] = ["pending", "processing", "paid", "rejected"];

export async function PATCH(request: NextRequest, context: Context) {
  if (!getAdmin(request)) return fail("Unauthorised.", 401);
  const { id: rawId } = await context.params;
  const id = number(rawId);
  if (!Number.isInteger(id)) return fail("Invalid trade.", 400);

  const data = await body(request);
  const status = text(data.status, 20) as TradeStatus;
  if (!allowed.includes(status)) return fail("Invalid status.", 400);

  const trade = updateTradeStatus(id, status, text(data.admin_note, 500));
  if (!trade) return fail("Trade not found.", 404);
  return ok({ trade });
}
