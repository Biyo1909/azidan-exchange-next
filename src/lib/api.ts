import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function body(request: Request): Promise<Record<string, unknown>> {
  try {
    const value = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return value as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function text(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function number(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function oneOf<T extends string>(value: unknown, choices: readonly T[], fallback: T): T {
  return typeof value === "string" && (choices as readonly string[]).includes(value) ? (value as T) : fallback;
}
