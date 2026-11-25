import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { getAssets } from "@/lib/db";
import type { AssetKind } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get("kind");
  const valid = kind === "crypto" || kind === "gift_card" ? (kind as AssetKind) : undefined;
  return ok({ assets: getAssets(valid, true) });
}
