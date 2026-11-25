import { NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";
import { fail, ok, text } from "@/lib/api";
import { getTrades } from "@/lib/db";
import type { TradeStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statuses: TradeStatus[] = ["pending", "processing", "paid", "rejected"];

export function GET(request: NextRequest) {
  if (!getAdmin(request)) return fail("Unauthorised.", 401);
  const status = text(request.nextUrl.searchParams.get("status"), 20) as TradeStatus;
  return ok({ trades: getTrades(statuses.includes(status) ? status : undefined) });
}
