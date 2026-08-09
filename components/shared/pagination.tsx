"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** basePath + query (current filters, without `page`) are combined with the target page to build each link — kept serializable so this component can be handed props from a Server Component. */
export function Pagination({
  page,
  totalPages,
  basePath,
  query = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | number | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") params.set(key, String(value));
    }
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav className="flex items-center justify-center gap-2 pt-8" aria-label="Pagination">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-forest-900 hover:bg-stone-100",
          page <= 1 && "pointer-events-none opacity-40"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="px-3 text-sm text-stone-600">
        Page {page} of {totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-forest-900 hover:bg-stone-100",
          page >= totalPages && "pointer-events-none opacity-40"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
