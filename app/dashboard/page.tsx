import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CalendarCheck, Heart, User as UserIcon, Compass, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  const [bookingCount, favoriteCount, hostedCount, joinedCount] = await Promise.all([
    prisma.booking.count({ where: { userId: session.user.id } }),
    prisma.favorite.count({ where: { userId: session.user.id } }),
    prisma.hike.count({ where: { hostId: session.user.id, status: { in: ["UPCOMING", "FULL"] } } }),
    prisma.hikeParticipant.count({ where: { userId: session.user.id, status: "JOINED" } }),
  ]);

  const tiles = [
    { href: "/bookings", icon: CalendarCheck, label: "Bookings", value: bookingCount },
    { href: "/favorites", icon: Heart, label: "Favorites", value: favoriteCount },
    { href: `/profile/${session.user.username}`, icon: Compass, label: "Hikes hosted", value: hostedCount },
    { href: `/profile/${session.user.username}`, icon: UserIcon, label: "Hikes joined", value: joinedCount },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-forest-950">Welcome back, {session.user.name?.split(" ")[0]}</h1>
      <p className="mt-2 text-stone-600">A quick look at your TrailLink activity.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href}>
            <Card className="h-full hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
                <tile.icon className="h-6 w-6 text-forest-600" />
                <p className="font-display text-2xl font-bold text-forest-950">{tile.value}</p>
                <p className="text-xs text-stone-500">{tile.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/hikes/create" className="rounded-full bg-forest-700 px-5 py-2.5 text-sm font-medium text-stone-50 hover:bg-forest-800">
          Host a hike
        </Link>
        <Link href="/explore" className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-forest-800 hover:bg-stone-100">
          Explore destinations
        </Link>
        {session.user.role === "GUIDE" && (
          <Link
            href="/dashboard/guide"
            className="flex items-center gap-1.5 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-forest-800 hover:bg-stone-100"
          >
            <ShieldCheck className="h-4 w-4" /> Guide dashboard
          </Link>
        )}
      </div>
    </div>
  );
}