import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, Mountain as MountainIcon, Wallet, Calendar, TrendingUp, ShieldAlert, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SafeImage } from "@/components/shared/safe-image";
import { Rating } from "@/components/shared/rating";
import { destinationHero } from "@/lib/images";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DIFFICULTY_LABELS, type Difficulty } from "@/types/enums";
import { FavoriteButton } from "@/components/destinations/favorite-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const dest = await prisma.destination.findUnique({ where: { slug }, select: { name: true, summary: true } });
  return { title: dest?.name ?? "Destination", description: dest?.summary };
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const destination = await prisma.destination.findUnique({
    where: { slug },
    include: {
      itinerary: { orderBy: { day: "asc" } },
      trail: true,
      hikes: {
        where: { status: "UPCOMING", date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 8,
        include: {
          host: { select: { name: true, username: true } },
          _count: { select: { participants: { where: { status: "JOINED" } } } },
        },
      },
    },
  });

  if (!destination) notFound();

  const session = await getSession();
  const existingFavorite = session?.user
    ? await prisma.favorite.findFirst({
        where: { userId: session.user.id, type: "DESTINATION", destinationId: destination.id },
        select: { id: true },
      })
    : null;

  const highlights = Array.isArray(destination.highlights) ? (destination.highlights as string[]) : [];
  const difficultyLabel = DIFFICULTY_LABELS[destination.difficulty as Difficulty] ?? destination.difficulty;

  return (
    <div>
      <div className="relative h-72 w-full overflow-hidden bg-stone-800 sm:h-96">
        <SafeImage
          src={destinationHero(destination.slug, 1600, 900)}
          alt={destination.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
          <Badge className="mb-3 bg-white/90 text-forest-900">{difficultyLabel}</Badge>
          <h1 className="font-display text-3xl font-bold text-stone-50 sm:text-5xl">{destination.name}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-stone-200">
            <MapPin className="h-4 w-4" /> {destination.region}, Nepal
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-2">
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Calendar} label="Duration" value={`${destination.durationDays} days`} />
            <StatCard icon={TrendingUp} label="Max elevation" value={`${destination.elevationM.toLocaleString()} m`} />
            <StatCard icon={Wallet} label="Budget" value={`${formatCurrency(destination.budgetMinUsd, "USD")}–${formatCurrency(destination.budgetMaxUsd, "USD")}`} />
            <StatCard icon={MountainIcon} label="Best season" value={destination.bestSeason} />
          </div>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-semibold text-forest-950">About this trek</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-stone-700">{destination.description}</p>
            <div className="mt-4 flex items-center gap-3">
              <Rating value={destination.ratingAvg} count={destination.ratingCount} size="md" />
            </div>
          </section>

          {highlights.length > 0 && (
            <section className="mb-10">
              <h2 className="font-display text-2xl font-semibold text-forest-950">Highlights</h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 rounded-xl bg-stone-100 px-4 py-3 text-sm text-forest-900">
                    <MountainIcon className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" /> {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {destination.itinerary.length > 0 && (
            <section className="mb-10">
              <h2 className="font-display text-2xl font-semibold text-forest-950">Sample itinerary</h2>
              <ol className="mt-4 space-y-4 border-l-2 border-stone-200 pl-6">
                {destination.itinerary.map((day) => (
                  <li key={day.id} className="relative">
                    <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-forest-700 text-xs font-bold text-stone-50">
                      {day.day}
                    </span>
                    <h3 className="font-medium text-forest-950">{day.title}</h3>
                    <p className="mt-1 text-sm text-stone-600">{day.description}</p>
                    {(day.distanceKm || day.elevationGainM) && (
                      <p className="mt-1 text-xs text-stone-500">
                        {day.distanceKm ? `${day.distanceKm} km` : ""}
                        {day.distanceKm && day.elevationGainM ? " · " : ""}
                        {day.elevationGainM ? `+${day.elevationGainM} m gain` : ""}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {destination.safetyInfo && (
            <section className="mb-10 rounded-2xl border border-earth-300/60 bg-earth-100/50 p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-earth-700">
                <ShieldAlert className="h-5 w-5" /> Safety information
              </h2>
              <p className="mt-2 text-sm text-forest-900">{destination.safetyInfo}</p>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardContent className="flex flex-col gap-3 pt-6">
              <FavoriteButton
                type="DESTINATION"
                destinationId={destination.id}
                initialFavorited={Boolean(existingFavorite)}
              />
              <Button asChild variant="outline">
                <Link href={`/guides?destination=${destination.slug}`}>Find a guide for this trek</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={`/hikes/create?destination=${destination.id}`}>Host a group hike here</Link>
              </Button>
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-forest-950">
              <Users className="h-4 w-4" /> Upcoming group hikes
            </h3>
            {destination.hikes.length === 0 ? (
              <p className="text-sm text-stone-500">No hikes scheduled yet — be the first to host one.</p>
            ) : (
              <div className="space-y-3">
                {destination.hikes.map((hike) => (
                  <Link key={hike.id} href={`/hikes/${hike.id}`}>
                    <Card className="hover:shadow-md">
                      <CardContent className="pt-4">
                        <p className="font-medium text-forest-950">{hike.title}</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatDate(hike.date)} · hosted by {hike.host.name}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {hike._count.participants}/{hike.maxParticipants} joined
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 text-center shadow-sm">
      <Icon className="mx-auto h-4 w-4 text-forest-600" />
      <p className="mt-1 text-sm font-semibold text-forest-950">{value}</p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  );
}