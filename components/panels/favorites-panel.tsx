"use client";

import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/states";
import { SafeImage } from "@/components/shared/safe-image";
import { PanelLink } from "@/components/panels/panel-link";
import { usePanelFetch } from "@/components/panels/use-panel-fetch";
import { destinationHero, hikeImage, avatarUrl } from "@/lib/images";
import { formatCurrency } from "@/lib/utils";

interface FavoritesHydrated {
  destinations: { id: string; slug: string; name: string; region: string }[];
  guides: { id: string; pricePerDay: number; user: { name: string; username: string } }[];
  hikes: { id: string; title: string; status: string; destination: { name: string } }[];
}

export function FavoritesPanel() {
  const { data, loading, error, reload } = usePanelFetch<FavoritesHydrated>("/api/favorites?hydrate=1");

  const isEmpty = data && data.destinations.length === 0 && data.guides.length === 0 && data.hikes.length === 0;

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Saved favorites</DialogTitle>
      </DialogHeader>

      {loading && <LoadingState label="Loading favorites…" />}
      {!loading && error && <ErrorState title="Couldn't load your favorites" description={error} onRetry={reload} />}
      {!loading && !error && isEmpty && (
        <EmptyState icon={Heart} title="No favorites yet" description="Save destinations, guides, and hikes to find them here." />
      )}
      {!loading && !error && data && !isEmpty && (
        <div className="space-y-10 pb-6">
          {data.destinations.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-base font-semibold text-forest-950">Destinations</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.destinations.map((d) => (
                  <PanelLink key={d.id} view="destination" id={d.slug} className="block">
                    <Card className="hover:shadow-md">
                      <div className="relative h-32 w-full overflow-hidden rounded-t-2xl bg-stone-200">
                        <SafeImage src={destinationHero(d.slug, 500, 300)} alt={d.name} fill sizes="300px" className="object-cover" />
                      </div>
                      <CardContent className="pt-4">
                        <p className="font-medium text-forest-950">{d.name}</p>
                        <p className="text-xs text-stone-500">{d.region}</p>
                      </CardContent>
                    </Card>
                  </PanelLink>
                ))}
              </div>
            </section>
          )}

          {data.guides.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-base font-semibold text-forest-950">Guides</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.guides.map((g) => (
                  <PanelLink key={g.id} view="guide" id={g.user.username} className="block">
                    <Card className="hover:shadow-md">
                      <CardContent className="flex items-center gap-3 pt-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-stone-200">
                          <SafeImage src={avatarUrl(g.user.username)} alt={g.user.name} fill sizes="48px" className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-forest-950">{g.user.name}</p>
                          <p className="text-xs text-stone-500">{formatCurrency(g.pricePerDay)} / day</p>
                        </div>
                      </CardContent>
                    </Card>
                  </PanelLink>
                ))}
              </div>
            </section>
          )}

          {data.hikes.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-base font-semibold text-forest-950">Hikes</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.hikes.map((h) => (
                  <PanelLink key={h.id} view="hike" id={h.id} className="block">
                    <Card className="hover:shadow-md">
                      <div className="relative h-32 w-full overflow-hidden rounded-t-2xl bg-stone-200">
                        <SafeImage src={hikeImage(h.id, 500, 300)} alt={h.title} fill sizes="300px" className="object-cover" />
                        {h.status === "FULL" && <Badge variant="warning" className="absolute left-2 top-2">Full</Badge>}
                      </div>
                      <CardContent className="pt-4">
                        <p className="line-clamp-1 font-medium text-forest-950">{h.title}</p>
                        <p className="text-xs text-stone-500">{h.destination.name}</p>
                      </CardContent>
                    </Card>
                  </PanelLink>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
