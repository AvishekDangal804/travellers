"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Compass, Users, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/meet", label: "Meet", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageCircle },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const profileHref = session?.user ? `/profile/${session.user.username}` : "/login";

  const items = [...LINKS, { href: profileHref, label: "Profile", icon: User }];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-stone-200 bg-stone-50/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-stone-500",
              active && "text-forest-800"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "text-forest-700")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}