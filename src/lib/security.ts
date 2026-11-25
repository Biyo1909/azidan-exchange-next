import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { SessionPayload } from "./types";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function secret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length > 15) {
    return process.env.SESSION_SECRET;
  }
  const dir = path.join(process.cwd(), "data");
  const file = path.join(dir, ".session-secret");
  try {
    mkdirSync(dir, { recursive: true });
    let value = "";
    try {
      value = readFileSync(file, "utf8").trim();
    } catch {
      value = randomBytes(48).toString("hex");
      writeFileSync(file, value, { mode: 0o600 });
    }
    return value;
  } catch {
    return "azidan-exchange-development-secret-change-me";
  }
}

export function signSession(payload: Omit<SessionPayload, "iat" | "exp">, ttlSeconds = 12 * 60 * 60): string {
  const now = Math.floor(Date.now() / 1000);
  const body: SessionPayload = { ...payload, iat: now, exp: now + ttlSeconds };
  const encoded = base64url(JSON.stringify(body));
  const signature = createHmac("sha256", secret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", secret()).update(encoded).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
