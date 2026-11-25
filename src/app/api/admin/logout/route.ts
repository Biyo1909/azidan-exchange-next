import { clearSession } from "@/lib/auth";
import { ok } from "@/lib/api";

export const runtime = "nodejs";

export function POST() {
  return clearSession(ok({ ok: true }));
}
