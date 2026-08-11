"use client";

import { useEffect, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/shared/states";
import { openPanel, type PanelState } from "@/lib/panel-nav";
import type { Role } from "@/types/enums";

// Client-side gate for UX only — it avoids flashing a panel the server would
// reject anyway. The real gate is inside app/api/*, which independently
// re-checks auth via requireUser()/requireRole() on every request.
export function RequireAuth({ role, then, children }: { role?: Role; then: PanelState; children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const roleMismatch = status === "authenticated" && role !== undefined && session.user.role !== role;

  useEffect(() => {
    if (status === "unauthenticated") {
      openPanel(router, { view: "login", then });
    } else if (roleMismatch) {
      openPanel(router, { view: "dashboard" });
    }
  }, [status, roleMismatch, router, then]);

  if (status !== "authenticated" || roleMismatch) return <LoadingState />;
  return <>{children}</>;
}
