import "server-only";
import { auth } from "@/lib/auth";
import type { Role } from "@/types/enums";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** Returns the current session, or null. Safe to call anywhere on the server. */
export async function getSession() {
  return auth();
}

/** Throws AuthError(401) if unauthenticated. Use inside API routes and Server Actions. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new AuthError("You must be signed in to do that.", 401);
  if (session.user.status === "SUSPENDED") {
    throw new AuthError("This account has been suspended.", 403);
  }
  return session.user;
}

/** Throws AuthError(403) if the current user does not hold one of `roles`. */
export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new AuthError("You do not have permission to do that.", 403);
  }
  return user;
}
