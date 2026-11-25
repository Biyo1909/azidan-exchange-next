import { NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";
import { body, fail, number, ok, text } from "@/lib/api";
import { getAssetById, updateAsset } from "@/lib/db";
import { emitRates } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  const admin = getAdmin(request);
  if (!admin) return fail("Unauthorised.", 401);

  const { id: rawId } = await context.params;
  const id = number(rawId);
  if (!Number.isInteger(id) || !getAssetById(id)) return fail("Asset not found.", 404);

  const data = await body(request);
  const update: { buy_rate?: number; is_active?: number; note?: string } = { note: text(data.note, 300) };

  if (data.buy_rate !== undefined) {
    const rate = number(data.buy_rate);
    if (!Number.isFinite(rate) || rate <= 0 || rate > 100_000_000) return fail("Enter a valid buying rate.", 400);
    update.buy_rate = Number(rate.toFixed(4));
  }
  if (data.is_active !== undefined) {
    if (data.is_active !== 0 && data.is_active !== 1) return fail("Invalid status.", 400);
    update.is_active = data.is_active;
  }
  if (update.buy_rate === undefined && update.is_active === undefined) {
    return fail("Provide a rate or status change.", 400);
  }

  const asset = updateAsset(id, update, admin);
  if (!asset) return fail("Asset not found.", 404);
  emitRates();
  return ok({ asset });
}
