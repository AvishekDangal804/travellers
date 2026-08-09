import Link from "next/link";
import type { Metadata } from "next";
import { Compass, Users, ShieldCheck, MapPin, Calendar, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/shared/safe-image";
import { Rating } from "@/components/shared/rating";
import { destinationHero, avatarUrl } from "@/lib/images";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DIFFICULTY_LABELS, type Difficulty } from "@/types/enums";

export const metadata: Metadata = { title: "TrailLink Nepal — Find Your Trail. Find Your People." };

// Render per-request instead of at build time: this page queries the database,
// and build-time prerendering would require a live DB connection during every
// `next build` (including on Vercel). Every other data-driven page in this app
// already renders this way.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [destinations, hikes, guides, stats] = await Promise.all([
    prisma.destination.findMany({ orderBy: { popularity: "desc" }, take: 6 }),
    prisma.hike.findMany({
      where: { status: { in: ["UPCOMING", "FULL"] }, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 3,
      include: { destination: { select: { name: true } }, host: { select: { name: true } } },
    }),
    prisma.guideProfile.findMany({
      where: { verificationStatus: "VERIFIED" },
      orderBy: { ratingAvg: "desc" },
      take: 4,
      include: { user: { select: { name: true, username: true, image: true } } },
    }),
    Promise.all([
      prisma.destination.count(),
      prisma.guideProfile.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.user.count({ where: { role: "HIKER" } }),
    ]),
  ]);
  const [destinationCount, guideCount, hikerCount] = stats;

  return (
    <div>
      <section className="relative overflow-hidden bg-forest-950">
        <div className="absolute inset-0">
          <SafeImage
            src={destinationHero("everest-base-camp", 1920, 1080)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/60 via-forest-950/70 to-forest-950" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <Badge className="bg-white/10 text-stone-100">Nepal&apos;s social hiking platform</Badge>
          <h1 className="mt-6 font-display text-4xl font-bold text-stone-50 sm:text-6xl">
            Find your trail. <span className="text-earth-300">Find your people.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-200">
            Discover trekking destinations across Nepal, join group hikes with fellow adventurers, and book
            verified local guides — all in one place.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/explore">
                <Compass className="h-4 w-4" /> Explore destinations
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-stone-300 text-stone-50 hover:bg-white/10">
              <Link href="/hikes">Browse group hikes</Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 text-stone-200">
            <StatBlock value={destinationCount} label="Destinations" />
            <StatBlock value={guideCount} label="Verified guides" />
            <StatBlock value={hikerCount} label="Hikers" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-forest-950 sm:text-3xl">Popular destinations</h2>
            <p className="mt-1 text-stone-600">Handpicked treks across Nepal&apos;s most iconic regions.</p>
          </div>
          <Link href="/explore" className="hidden items-center gap-1 text-sm font-medium text-forest-700 hover:underline sm:flex">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest) => (
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
                  <Badge className="absolute left-3 top-3 bg-white/90 text-forest-900">
                    {DIFFICULTY_LABELS[dest.difficulty as Difficulty] ?? dest.difficulty}
                  </Badge>
                </div>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-forest-950">{dest.name}</h3>
                    <Rating value={dest.ratingAvg} count={dest.ratingCount} />
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                    <MapPin className="h-3.5 w-3.5" /> {dest.region} · {dest.durationDays} days
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {hikes.length > 0 && (
        <section className="bg-stone-100/60 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-forest-950 sm:text-3xl">Upcoming group hikes</h2>
                <p className="mt-1 text-stone-600">Join fellow hikers on their next adventure.</p>
              </div>
              <Link href="/hikes" className="hidden items-center gap-1 text-sm font-medium text-forest-700 hover:underline sm:flex">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {hikes.map((hike) => (
                <Link key={hike.id} href={`/hikes/${hike.id}`}>
                  <Card className="h-full hover:shadow-md">
                    <CardContent className="pt-6">
                      <p className="flex items-center gap-1.5 text-xs text-stone-500">
                        <Calendar className="h-3.5 w-3.5" /> {formatDate(hike.date)}
                      </p>
                      <h3 className="mt-2 font-display text-lg font-semibold text-forest-950 line-clamp-1">{hike.title}</h3>
                      <p className="mt-1 text-sm text-stone-600">{hike.destination.name} · hosted by {hike.host.name}</p>
                      <p className="mt-3 font-medium text-forest-800">{hike.price === 0 ? "Free" : formatCurrency(hike.price)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-forest-950 sm:text-3xl">Verified local guides</h2>
            <p className="mt-1 text-stone-600">Experienced, vetted guides who know Nepal&apos;s trails best.</p>
          </div>
          <Link href="/guides" className="hidden items-center gap-1 text-sm font-medium text-forest-700 hover:underline sm:flex">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {guides.map((guide) => (
            <Link key={guide.id} href={`/guides/${guide.user.username}`} className="text-center">
              <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full bg-stone-200 ring-2 ring-white shadow-sm">
                <SafeImage src={guide.user.image ?? avatarUrl(guide.user.username)} alt={guide.user.name} fill sizes="80px" className="object-cover" />
              </div>
              <p className="mt-2 flex items-center justify-center gap-1 text-sm font-medium text-forest-950">
                {guide.user.name}
                <ShieldCheck className="h-3.5 w-3.5 text-forest-600" />
              </p>
              <Rating value={guide.ratingAvg} count={guide.ratingCount} className="justify-center" />
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-forest-900 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Users className="mx-auto h-10 w-10 text-earth-300" />
          <h2 className="mt-4 font-display text-2xl font-bold text-stone-50 sm:text-3xl">Ready for your next trail?</h2>
          <p className="mt-3 text-stone-300">Join TrailLink Nepal today — it&apos;s free for hikers.</p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/register">Create your account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function StatBlock({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-bold text-stone-50">{value}+</p>
      <p className="text-sm text-stone-300">{label}</p>
    </div>
  );
}