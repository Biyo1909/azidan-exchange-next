import { NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";
import { body, fail, number, ok, oneOf, text } from "@/lib/api";
import { deleteAnnouncement, updateAnnouncement, type AnnouncementInput } from "@/lib/db";
import { emitAnnouncements } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  if (!getAdmin(request)) return fail("Unauthorised.", 401);
  const { id: rawId } = await context.params;
  const id = number(rawId);
  if (!Number.isInteger(id)) return fail("Invalid announcement.", 400);

  const data = await body(request);
  const input: AnnouncementInput = {
    title: text(data.title, 140),
    body: text(data.body, 1000),
    tone: oneOf(data.tone, ["info", "success", "warning"] as const, "info"),
    is_published: data.is_published ? 1 : 0,
  };
  if (input.title.length < 4 || input.body.length < 8) return fail("A title and message are required.", 400);
  const announcement = updateAnnouncement(id, input);
  if (!announcement) return fail("Announcement not found.", 404);
  emitAnnouncements();
  return ok({ announcement });
}

export async function DELETE(request: NextRequest, context: Context) {
  if (!getAdmin(request)) return fail("Unauthorised.", 401);
  const { id: rawId } = await context.params;
  const id = number(rawId);
  if (!Number.isInteger(id)) return fail("Invalid announcement.", 400);
  if (!deleteAnnouncement(id)) return fail("Announcement not found.", 404);
  emitAnnouncements();
  return ok({ ok: true });
}
