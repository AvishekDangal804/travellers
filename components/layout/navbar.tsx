"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { cn, initials } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/hikes", label: "Hikes" },
  { href: "/meet", label: "Meet" },
  { href: "/guides", label: "Guides" },
  { href: "/messages", label: "Messages" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-forest-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-700 text-stone-50">
            <Mountain className="h-5 w-5" />
          </span>
          TrailLink <span className="hidden text-earth-600 sm:inline">Nepal</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-forest-800 transition-colors hover:bg-stone-100",
                pathname === link.href && "bg-forest-100 text-forest-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={session ? "/hikes/create" : "/login?callbackUrl=/hikes/create"}>
              <Plus className="h-4 w-4" />
              Create Hike
            </Link>
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
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${session.user.username}`}>My profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  {session.user.role === "GUIDE" && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/guide">Guide dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/favorites">Favorites</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/register">Join</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
