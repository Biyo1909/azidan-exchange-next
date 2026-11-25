import { NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { getAdminById } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const session = getAdmin(request);
  if (!session) return fail("Not signed in.", 401);
  const admin = getAdminById(session.id);
  if (!admin) return fail("Not signed in.", 401);
  return ok({ admin });
}
