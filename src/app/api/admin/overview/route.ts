import { NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { getOverview } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  if (!getAdmin(request)) return fail("Unauthorised.", 401);
  return ok({ overview: getOverview() });
}
