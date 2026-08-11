"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Mountain, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/shared/notification-bell";
import { openPanel } from "@/lib/panel-nav";
import { initials } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#trails", label: "Explore" },
  { href: "#hikes", label: "Hikes" },
  { href: "#map", label: "Trail maps" },
  { href: "#guides", label: "Guides" },
];

export function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/90 text-forest-900 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-forest-700 text-stone-50">
            <Mountain className="h-5 w-5" />
          </span>
          TrailLink <span className="hidden text-earth-600 sm:inline">Nepal</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-forest-800 transition-colors hover:bg-stone-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() =>
              session
                ? openPanel(router, { view: "create-hike" })
                : openPanel(router, { view: "login", then: { view: "create-hike" } })
            }
          >
            <Plus className="h-4 w-4" />
            Create Hike
          </Button>

          {status === "authenticated" && session?.user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500">
                  <Avatar>
                    <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "Profile"} />
                    <AvatarFallback>{initials(session.user.name ?? "?")}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => openPanel(router, { view: "profile", id: session.user.username })}>
                    My profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => openPanel(router, { view: "dashboard" })}>Dashboard</DropdownMenuItem>
                  {session.user.role === "GUIDE" && (
                    <DropdownMenuItem onSelect={() => openPanel(router, { view: "guide-dashboard" })}>
                      Guide dashboard
                    </DropdownMenuItem>
                  )}
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => openPanel(router, { view: "favorites" })}>Favorites</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openPanel(router, { view: "login" })}
              >
                Sign in
              </Button>
              <Button
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => openPanel(router, { view: "register" })}
              >
                Join
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
