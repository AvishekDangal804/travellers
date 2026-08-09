import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth-helpers";

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

/** Wrap a route handler body so thrown AuthError/ZodError produce consistent JSON responses. */
export async function withApiErrors<T>(fn: () => Promise<T>): Promise<T | NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AuthError) return jsonError(err.message, err.status);
    if (err instanceof ZodError) return jsonError("Validation failed", 422, err.flatten());
    if (err instanceof Error) {
      console.error(err);
      return jsonError(err.message || "Something went wrong", 500);
    }
    console.error(err);
    return jsonError("Something went wrong", 500);
  }
}
