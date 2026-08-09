import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Mountain as MountainIcon, Wallet } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/shared/safe-image";
import { Rating } from "@/components/shared/rating";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/states";
import { destinationHero } from "@/lib/images";
import { formatCurrency, cn } from "@/lib/utils";
import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from "@/types/enums";

export const metadata: Metadata = { title: "Explore destinations" };

const PAGE_SIZE = 12;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; difficulty?: string; query?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const difficulty = DIFFICULTIES.includes(sp.difficulty as Difficulty) ? (sp.difficulty as Difficulty) : undefined;

  const where = {
    ...(sp.region ? { region: sp.region } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(sp.query
      ? {
          OR: [
            { name: { contains: sp.query } },
            { region: { contains: sp.query } },
            { summary: { contains: sp.query } },
          ],
        }
      : {}),
  };

  const [items, total, regions] = await Promise.all([
    prisma.destination.findMany({
      where,
      orderBy: { popularity: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.destination.count({ where }),
    prisma.destination.findMany({ distinct: ["region"], select: { region: true }, orderBy: { region: "asc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function makeHref(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    const merged = { region: sp.region, difficulty: sp.difficulty, query: sp.query, page: sp.page, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, String(value));
    }
    const qs = params.toString();
    return qs ? `/explore?${qs}` : "/explore";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">Explore Nepal&apos;s trails</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          {total} trekking destination{total === 1 ? "" : "s"}, from easy day hikes to high-altitude classics.
        </p>
      </div>

      <form action="/explore" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          name="query"
          defaultValue={sp.query}
          placeholder="Search destinations…"
          className="h-11 w-full max-w-sm rounded-xl border border-stone-300 bg-stone-50 px-4 text-sm text-forest-950 placeholder:text-stone-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-500 sm:max-w-xs"
        />
        <button
          type="submit"
          className="h-11 rounded-full bg-forest-700 px-6 text-sm font-medium text-stone-50 hover:bg-forest-800"
        >
          Search
        </button>
      </form>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href={makeHref({ difficulty: undefined, page: undefined })}
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
            href={makeHref({ difficulty: d, page: undefined })}
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
          href={makeHref({ region: undefined, page: undefined })}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium",
            !sp.region ? "border-forest-700 bg-forest-700 text-stone-50" : "border-stone-300 text-forest-800 hover:bg-stone-100"
          )}
        >
          All regions
        </Link>
        {regions.map(({ region }) => (
          <Link
            key={region}
            href={makeHref({ region, page: undefined })}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium",
              sp.region === region ? "border-forest-700 bg-forest-700 text-stone-50" : "border-stone-300 text-forest-800 hover:bg-stone-100"
            )}
          >
            {region}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={MountainIcon}
          title="No destinations match your filters"
          description="Try clearing a filter or searching a different region."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((dest) => (
            <Link key={dest.id} href={`/explore/${dest.slug}`}>
              <Card className="group h-full overflow-hidden hover:shadow-md">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200">
                  <SafeImage
                    src={destinationHero(dest.slug, 800, 600)}
                    alt={dest.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge className="absolute left-3 top-3 bg-white/90 text-forest-900">{DIFFICULTY_LABELS[dest.difficulty as Difficulty] ?? dest.difficulty}</Badge>
                </div>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-forest-950">{dest.name}</h3>
                    <Rating value={dest.ratingAvg} count={dest.ratingCount} />
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                    <MapPin className="h-3.5 w-3.5" /> {dest.region} · {dest.durationDays} days
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-stone-600">{dest.summary}</p>
                  <p className="mt-3 flex items-center gap-1 text-sm font-medium text-forest-800">
                    <Wallet className="h-3.5 w-3.5" /> {formatCurrency(dest.budgetMinUsd, "USD")}–{formatCurrency(dest.budgetMaxUsd, "USD")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/explore"
        query={{ region: sp.region, difficulty: sp.difficulty, query: sp.query }}
      />
    </div>
  );
}