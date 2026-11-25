import { NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";
import { fail, number, ok } from "@/lib/api";
import { getRateHistory } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  if (!getAdmin(request)) return fail("Unauthorised.", 401);
  const assetId = number(request.nextUrl.searchParams.get("assetId"));
  const limit = number(request.nextUrl.searchParams.get("limit"));
  const validAssetId = Number.isInteger(assetId) && assetId > 0 ? assetId : undefined;
  const validLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 300) : 100;
  return ok({ history: getRateHistory(validAssetId, validLimit) });
}
