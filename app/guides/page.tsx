import Link from "next/link";
import type { Metadata } from "next";
import { Languages, Mountain as MountainIcon, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Rating } from "@/components/shared/rating";
import { EmptyState } from "@/components/shared/states";
import { formatCurrency, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Find a guide" };

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  const sp = await searchParams;

  const guides = await prisma.guideProfile.findMany({
    where: { verificationStatus: "VERIFIED" },
    orderBy: { ratingAvg: "desc" },
    include: { user: { select: { name: true, username: true, image: true } } },
  });

  const filtered = sp.destination
    ? guides.filter((g) => (Array.isArray(g.destinationsCovered) ? (g.destinationsCovered as string[]) : []).includes(sp.destination!))
    : guides;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">Find a verified local guide</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          {filtered.length} verified guide{filtered.length === 1 ? "" : "s"} across Nepal&apos;s trekking regions.
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={MountainIcon} title="No guides match this filter" description="Try browsing all guides instead." />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((guide) => {
            const languages = Array.isArray(guide.languages) ? (guide.languages as string[]) : [];
            const specialties = Array.isArray(guide.specialties) ? (guide.specialties as string[]) : [];
            return (
              <Link key={guide.id} href={`/guides/${guide.user.username}`}>
                <Card className="h-full hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={guide.user.image ?? undefined} alt={guide.user.name} />
                        <AvatarFallback>{initials(guide.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="flex items-center gap-1 font-display text-lg font-semibold text-forest-950">
                          {guide.user.name}
                          <ShieldCheck className="h-4 w-4 text-forest-600" aria-label="Verified guide" />
                        </p>
                        <Rating value={guide.ratingAvg} count={guide.ratingCount} />
                      </div>
                    </div>
                    {guide.bio && <p className="mt-3 line-clamp-2 text-sm text-stone-600">{guide.bio}</p>}
                    {languages.length > 0 && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
                        <Languages className="h-3.5 w-3.5" /> {languages.join(", ")}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {specialties.slice(0, 3).map((s) => (
                        <Badge key={s} variant="outline">
                          {s}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-4 font-medium text-forest-800">{formatCurrency(guide.pricePerDay)} / day</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}