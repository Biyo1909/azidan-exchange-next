import type { NextRequest, NextResponse } from "next/server";
import { verifySession, signSession } from "./security";

export const SESSION_COOKIE = "azidan_admin";

export type AdminIdentity = { id: number; username: string; role: string };

export function getAdmin(request: NextRequest): AdminIdentity | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = verifySession(token);
  if (!payload) return null;
  return { id: payload.sub, username: payload.username, role: payload.role };
}

export function createAdminToken(admin: AdminIdentity): string {
  return signSession({ sub: admin.id, username: admin.username, role: admin.role });
}

export function attachSession(response: NextResponse, token: string): NextResponse {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  return response;
}

export function clearSession(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
