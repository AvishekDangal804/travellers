import Link from "next/link";
import { Mountain } from "lucide-react";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/explore", label: "Destinations" },
      { href: "/hikes", label: "Browse hikes" },
      { href: "/guides", label: "Find a guide" },
      { href: "/meet", label: "Meet hikers" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/register", label: "Join TrailLink" },
      { href: "/register?role=GUIDE", label: "Become a guide" },
      { href: "/hikes/create", label: "Create a hike" },
      { href: "/favorites", label: "Saved trips" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/safety", label: "Safety center" },
      { href: "/help", label: "Help center" },
      { href: "/login", label: "Sign in" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-stone-200 bg-forest-950 text-stone-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-bold text-stone-50">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700">
                <Mountain className="h-4 w-4" />
              </span>
              TrailLink Nepal
            </div>
            <p className="mt-3 max-w-xs text-sm text-stone-400">
              Find your trail. Find your people. The social hiking platform for Nepal&apos;s trails, guides, and travelers.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-400">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-stone-300 hover:text-stone-50">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-forest-800 pt-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TrailLink Nepal. Built for adventurers, by adventurers.</p>
          <p>Development build — seeded demo data, mock payments.</p>
        </div>
      </div>
    </footer>
  );
}