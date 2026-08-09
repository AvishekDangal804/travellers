import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/states";
import { SafeImage } from "@/components/shared/safe-image";
import { destinationHero, hikeImage, avatarUrl } from "@/lib/images";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "My favorites" };

export default async function FavoritesPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/favorites");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const destinationIds = favorites.filter((f) => f.type === "DESTINATION").map((f) => f.destinationId!).filter(Boolean);
  const guideProfileIds = favorites.filter((f) => f.type === "GUIDE").map((f) => f.guideProfileId!).filter(Boolean);
  const hikeIds = favorites.filter((f) => f.type === "HIKE").map((f) => f.hikeId!).filter(Boolean);

  const [destinations, guides, hikes] = await Promise.all([
    destinationIds.length
      ? prisma.destination.findMany({ where: { id: { in: destinationIds } } })
      : Promise.resolve([]),
    guideProfileIds.length
      ? prisma.guideProfile.findMany({ where: { id: { in: guideProfileIds } }, include: { user: { select: { name: true, username: true } } } })
      : Promise.resolve([]),
    hikeIds.length
      ? prisma.hike.findMany({ where: { id: { in: hikeIds } }, include: { destination: { select: { name: true } } } })
      : Promise.resolve([]),
  ]);

  const isEmpty = destinations.length === 0 && guides.length === 0 && hikes.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-forest-950">Saved favorites</h1>

      {isEmpty ? (
        <EmptyState icon={Heart} title="No favorites yet" description="Save destinations, guides, and hikes to find them here." className="mt-8" />
      ) : (
        <div className="mt-8 space-y-10">
          {destinations.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold text-forest-950">Destinations</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {destinations.map((d) => (
                  <Link key={d.id} href={`/explore/${d.slug}`}>
                    <Card className="hover:shadow-md">
                      <div className="relative h-32 w-full overflow-hidden rounded-t-2xl bg-stone-200">
                        <SafeImage src={destinationHero(d.slug, 500, 300)} alt={d.name} fill sizes="300px" className="object-cover" />
                      </div>
                      <CardContent className="pt-4">
                        <p className="font-medium text-forest-950">{d.name}</p>
                        <p className="text-xs text-stone-500">{d.region}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {guides.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold text-forest-950">Guides</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {guides.map((g) => (
                  <Link key={g.id} href={`/guides/${g.user.username}`}>
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
                  </Link>
                ))}
              </div>
            </section>
          )}

          {hikes.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold text-forest-950">Hikes</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hikes.map((h) => (
                  <Link key={h.id} href={`/hikes/${h.id}`}>
                    <Card className="hover:shadow-md">
                      <div className="relative h-32 w-full overflow-hidden rounded-t-2xl bg-stone-200">
                        <SafeImage src={hikeImage(h.id, 500, 300)} alt={h.title} fill sizes="300px" className="object-cover" />
                      </div>
                      <CardContent className="pt-4">
                        <p className="font-medium text-forest-950 line-clamp-1">{h.title}</p>
                        <p className="text-xs text-stone-500">{h.destination.name}</p>
                      </CardContent>
                    </Card>
                    {h.status === "FULL" && <Badge variant="warning">Full</Badge>}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}