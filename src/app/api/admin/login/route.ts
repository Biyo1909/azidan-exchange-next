import { NextResponse } from "next/server";
import { attachSession, createAdminToken } from "@/lib/auth";
import { body, fail, ok, text } from "@/lib/api";
import { getAdminByUsername, touchAdminLogin } from "@/lib/db";
import { verifyPassword } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const data = await body(request);
  const username = text(data.username, 100);
  const password = typeof data.password === "string" ? data.password : "";

  if (!username || !password) return fail("Enter your username and password.", 400);

  const admin = getAdminByUsername(username);
  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return fail("Invalid username or password.", 401);
  }

  touchAdminLogin(admin.id);
  const token = createAdminToken({ id: admin.id, username: admin.username, role: admin.role });
  const response = ok({
    admin: {
      id: admin.id,
      username: admin.username,
      full_name: admin.full_name,
      role: admin.role,
    },
  });
  return attachSession(response, token);
}

export function GET() {
  return NextResponse.json({ error: "Use POST to sign in." }, { status: 405 });
}
