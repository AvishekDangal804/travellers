"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime, cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=8");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const unreadCount = items.filter((n) => !n.isRead).length;

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/notifications/read-all", { method: "POST" });
  }

  return (
    <DropdownMenu open={open} onOpenChange={(next) => { setOpen(next); if (next) load(); }}>
      <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full text-forest-800 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-earth-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-medium text-forest-700 hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <p className="px-3 py-6 text-center text-sm text-stone-500">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-stone-500">You&apos;re all caught up.</p>
          ) : (
            items.map((n) => (
              <DropdownMenuItem key={n.id} asChild className={cn(!n.isRead && "bg-forest-50")}>
                <Link href={n.link ?? "/dashboard"} className="flex flex-col items-start gap-0.5 whitespace-normal">
                  <span className="text-sm font-medium text-forest-950">{n.title}</span>
                  <span className="text-xs text-stone-600 line-clamp-2">{n.body}</span>
                  <span className="text-[11px] text-stone-400">{formatRelativeTime(n.createdAt)}</span>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}