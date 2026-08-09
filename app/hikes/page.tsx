import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, MapPin, Users as UsersIcon, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/shared/safe-image";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/states";
import { hikeImage } from "@/lib/images";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from "@/types/enums";

export const metadata: Metadata = { title: "Browse hikes" };

const PAGE_SIZE = 12;

export default async function HikesPage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string; destinationId?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const difficulty = DIFFICULTIES.includes(sp.difficulty as Difficulty) ? (sp.difficulty as Difficulty) : undefined;

  const where = {
    status: { in: ["UPCOMING", "FULL"] as string[] },
    date: { gte: new Date() },
    ...(difficulty ? { difficulty } : {}),
    ...(sp.destinationId ? { destinationId: sp.destinationId } : {}),
  };

  const [items, total, destinations] = await Promise.all([
    prisma.hike.findMany({
      where,
      orderBy: { date: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        destination: { select: { name: true, slug: true, region: true } },
        host: { select: { name: true, username: true } },
        _count: { select: { participants: { where: { status: "JOINED" } } } },
      },
    }),
    prisma.hike.count({ where }),
    prisma.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">Upcoming group hikes</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            {total} hike{total === 1 ? "" : "s"} open for hikers to join.
          </p>
        </div>
        <Button asChild>
          <Link href="/hikes/create">
            <Plus className="h-4 w-4" /> Host a hike
          </Link>
        </Button>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/hikes"
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium",
            !difficulty ? "border-forest-700 bg-forest-700 text-stone-50" : "border-stone-300 text-forest-800 hover:bg-stone-100"
          )}
        >
          All difficulties
        </Link>
        {DIFFICULTIES.map((d) => (
          <Link
            key={d}
            href={`/hikes?difficulty=${d}${sp.destinationId ? `&destinationId=${sp.destinationId}` : ""}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium",
              difficulty === d ? "border-forest-700 bg-forest-700 text-stone-50" : "border-stone-300 text-forest-800 hover:bg-stone-100"
            )}
          >
            {DIFFICULTY_LABELS[d]}
          </Link>
        ))}
        <span className="mx-1 w-px self-stretch bg-stone-200" />
        <Link
          href={`/hikes${difficulty ? `?difficulty=${difficulty}` : ""}`}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium",
            !sp.destinationId ? "border-forest-700 bg-forest-700 text-stone-50" : "border-stone-300 text-forest-800 hover:bg-stone-100"
          )}
        >
          All destinations
        </Link>
        {destinations.map((d) => (
          <Link
            key={d.id}
            href={`/hikes?destinationId=${d.id}${difficulty ? `&difficulty=${difficulty}` : ""}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium",
              sp.destinationId === d.id ? "border-forest-700 bg-forest-700 text-stone-50" : "border-stone-300 text-forest-800 hover:bg-stone-100"
            )}
          >
            {d.name}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No hikes match your filters"
          description="Try a different filter, or host your own hike."
          action={
            <Button asChild size="sm">
              <Link href="/hikes/create">Host a hike</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((hike) => {
            const spotsLeft = hike.maxParticipants - hike._count.participants;
            return (
              <Link key={hike.id} href={`/hikes/${hike.id}`}>
                <Card className="group h-full overflow-hidden hover:shadow-md">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200">
                    <SafeImage
                      src={hikeImage(hike.id, 800, 600)}
                      alt={hike.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute left-3 top-3 bg-white/90 text-forest-900">
                      {DIFFICULTY_LABELS[hike.difficulty as Difficulty] ?? hike.difficulty}
                    </Badge>
                    {hike.status === "FULL" && (
                      <Badge variant="warning" className="absolute right-3 top-3">
                        Full
                      </Badge>
                    )}
                  </div>
                  <CardContent className="pt-5">
                    <h3 className="font-display text-lg font-semibold text-forest-950 line-clamp-1">{hike.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                      <MapPin className="h-3.5 w-3.5" /> {hike.destination.name}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                      <Calendar className="h-3.5 w-3.5" /> {formatDate(hike.date)} · {hike.startTime}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-forest-800">
                        {hike.price === 0 ? "Free" : formatCurrency(hike.price)}
                      </span>
                      <span className="text-xs text-stone-500">
                        {hike.status === "FULL" ? "Waitlist only" : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/hikes"
        query={{ difficulty: sp.difficulty, destinationId: sp.destinationId }}
      />
    </div>
  );
}