import { ok } from "@/lib/api";
import { getPublishedAnnouncements } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return ok({ announcements: getPublishedAnnouncements() });
}
