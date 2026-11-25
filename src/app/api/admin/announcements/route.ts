import { NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";
import { body, fail, ok, oneOf, text } from "@/lib/api";
import { createAnnouncement, getAllAnnouncements, type AnnouncementInput } from "@/lib/db";
import { emitAnnouncements } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  if (!getAdmin(request)) return fail("Unauthorised.", 401);
  return ok({ announcements: getAllAnnouncements() });
}

function parseInput(data: Record<string, unknown>): AnnouncementInput | null {
  const title = text(data.title, 140);
  const announcementBody = text(data.body, 1000);
  if (title.length < 4 || announcementBody.length < 8) return null;
  return {
    title,
    body: announcementBody,
    tone: oneOf(data.tone, ["info", "success", "warning"] as const, "info"),
    is_published: data.is_published ? 1 : 0,
  };
}

export async function POST(request: NextRequest) {
  const admin = getAdmin(request);
  if (!admin) return fail("Unauthorised.", 401);
  const input = parseInput(await body(request));
  if (!input) return fail("A title and message are required.", 400);
  const announcement = createAnnouncement(input, admin.username);
  if (input.is_published) emitAnnouncements();
  return ok({ announcement }, 201);
}
