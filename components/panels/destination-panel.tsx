"use client";

import { useSession } from "next-auth/react";
import { MapPin, Mountain as MountainIcon, Wallet, Calendar, TrendingUp, ShieldAlert, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Rating } from "@/components/shared/rating";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { FavoriteButton } from "@/components/destinations/favorite-button";
import { PanelLink } from "@/components/panels/panel-link";
import { usePanelFetch } from "@/components/panels/use-panel-fetch";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DIFFICULTY_LABELS, type Difficulty } from "@/types/enums";

interface DestinationDetail {
  id: string;
  slug: string;
  name: string;
  region: string;
  summary: string;
  description: string;
  difficulty: string;
  durationDays: number;
  elevationM: number;
  bestSeason: string;
  budgetMinUsd: number;
  budgetMaxUsd: number;
  highlights: unknown;
  safetyInfo: string;
  ratingAvg: number;
  ratingCount: number;
  itinerary: { id: string; day: number; title: string; description: string; distanceKm: number | null; elevationGainM: number | null }[];
  hikes: {
    id: string;
    title: string;
    date: string;
    maxParticipants: number;
    host: { name: string };
    _count: { participants: number };
  }[];
}

interface Favorite {
  type: string;
  destinationId: string | null;
}

export function DestinationPanel({ id: slug }: { id: string }) {
  const { data: session } = useSession();
  const { data: destination, loading, error, reload } = usePanelFetch<DestinationDetail>(`/api/destinations/${slug}`);
  const { data: favorites } = usePanelFetch<Favorite[]>(session?.user ? "/api/favorites" : null);

  if (loading) return <LoadingState label="Loading destination…" />;
  if (error || !destination) return <ErrorState title="Couldn't load this destination" description={error ?? undefined} onRetry={reload} />;

  const highlights = Array.isArray(destination.highlights) ? (destination.highlights as string[]) : [];
  const difficultyLabel = DIFFICULTY_LABELS[destination.difficulty as Difficulty] ?? destination.difficulty;
  const isFavorited = Boolean(favorites?.some((f) => f.type === "DESTINATION" && f.destinationId === destination.id));

  return (
    <div>
      <DialogHeader>
        <Badge>{difficultyLabel}</Badge>
        <DialogTitle className="text-2xl">{destination.name}</DialogTitle>
        <p className="flex items-center gap-1.5 text-sm text-stone-600">
          <MapPin className="h-3.5 w-3.5" /> {destination.region}, Nepal
        </p>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-8 pb-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Calendar} label="Duration" value={`${destination.durationDays} days`} />
            <StatCard icon={TrendingUp} label="Max elevation" value={`${destination.elevationM.toLocaleString()} m`} />
            <StatCard icon={Wallet} label="Budget" value={`${formatCurrency(destination.budgetMinUsd, "USD")}–${formatCurrency(destination.budgetMaxUsd, "USD")}`} />
            <StatCard icon={MountainIcon} label="Best season" value={destination.bestSeason} />
          </div>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold text-forest-950">About this trek</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-stone-700">{destination.description}</p>
            <div className="mt-4 flex items-center gap-3">
              <Rating value={destination.ratingAvg} count={destination.ratingCount} size="md" />
            </div>
          </section>

          {highlights.length > 0 && (
            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold text-forest-950">Highlights</h2>
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
            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold text-forest-950">Sample itinerary</h2>
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
            <section className="mb-8 rounded-2xl border border-earth-300/60 bg-earth-100/50 p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-earth-700">
                <ShieldAlert className="h-4 w-4" /> Safety information
              </h2>
              <p className="mt-2 text-sm text-forest-900">{destination.safetyInfo}</p>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardContent className="flex flex-col gap-3 pt-6">
              <FavoriteButton type="DESTINATION" destinationId={destination.id} initialFavorited={isFavorited} />
              <Button asChild variant="outline">
                <a href={`/guides?destination=${destination.slug}`}>Find a guide for this trek</a>
              </Button>
              <Button asChild variant="ghost">
                <a href={`/hikes/create?destination=${destination.id}`}>Host a group hike here</a>
              </Button>
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-forest-950">
              <Users className="h-4 w-4" /> Upcoming group hikes
            </h3>
            {destination.hikes.length === 0 ? (
              <p className="text-sm text-stone-500">No hikes scheduled yet — be the first to host one.</p>
            ) : (
              <div className="space-y-3">
                {destination.hikes.map((hike) => (
                  <PanelLink key={hike.id} view="hike" id={hike.id} className="block">
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
                  </PanelLink>
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
