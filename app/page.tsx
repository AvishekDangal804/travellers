import Link from "next/link";
import type { Metadata } from "next";
import { Compass, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Reveal } from "@/components/shared/reveal";
import { ParallaxHero } from "@/components/home/parallax-hero";
import { TiltCard } from "@/components/home/tilt-card";
import { RoutePreview } from "@/components/home/route-preview";
import { DestinationArt, destinationPhoto } from "@/components/home/destination-art";
import { JoinHikeButton } from "@/components/hikes/join-hike-button";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import { DIFFICULTY_LABELS, type Difficulty, type HikeParticipantStatus } from "@/types/enums";

export const metadata: Metadata = { title: "TrailLink Nepal — Find Your Trail. Find Your People." };

// Renders per-request instead of at build time: this page queries the database,
// and build-time prerendering would require a live DB connection during every
// `next build` (including on Vercel).
export const dynamic = "force-dynamic";

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  EASY: "text-forest-700",
  MODERATE: "text-earth-700",
  CHALLENGING: "text-earth-700",
  STRENUOUS: "text-danger-500",
};

const AVATAR_RING_COLORS = ["bg-earth-300 text-stone-800", "bg-sky-400 text-forest-950", "bg-forest-200 text-forest-950", "bg-earth-500 text-stone-50"];

const shortDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default async function Home() {
  const session = await getSession();

  const upcomingHikeWhere = { status: { in: ["UPCOMING", "FULL"] as string[] }, date: { gte: new Date() } };

  const [destinations, destinationCount, hikes, guides] = await Promise.all([
    prisma.destination.findMany({
      orderBy: { popularity: "desc" },
      take: 6,
      select: {
        id: true,
        slug: true,
        name: true,
        region: true,
        difficulty: true,
        durationDays: true,
        elevationM: true,
        bestSeason: true,
        budgetMinUsd: true,
        budgetMaxUsd: true,
        _count: { select: { hikes: { where: upcomingHikeWhere } } },
      },
    }),
    prisma.destination.count(),
    prisma.hike.findMany({
      where: upcomingHikeWhere,
      orderBy: { date: "asc" },
      take: 6,
      include: {
        destination: { select: { name: true, slug: true } },
        host: {
          select: {
            name: true,
            username: true,
            image: true,
            guideProfile: { select: { verificationStatus: true } },
            _count: { select: { hikesHosted: true } },
          },
        },
        participants: {
          where: { status: "JOINED" },
          take: 4,
          select: { user: { select: { name: true, username: true, image: true } } },
        },
        _count: { select: { participants: { where: { status: "JOINED" } } } },
      },
    }),
    prisma.guideProfile.findMany({
      where: { verificationStatus: "VERIFIED" },
      orderBy: { ratingAvg: "desc" },
      take: 5,
      include: { user: { select: { name: true, username: true, image: true } } },
    }),
  ]);

  const heroHikes = hikes.slice(0, 3);
  const gridHikes = hikes.slice(0, 3);

  const myParticipations = session?.user
    ? await prisma.hikeParticipant.findMany({
        where: { userId: session.user.id, hikeId: { in: hikes.map((h) => h.id) } },
        select: { hikeId: true, status: true },
      })
    : [];
  const participationByHike = new Map(myParticipations.map((p) => [p.hikeId, p.status as HikeParticipantStatus]));

  return (
    <div>
      <ParallaxHero>
        <div>
          <h1 className="max-w-[16ch] text-balance font-display text-5xl font-semibold leading-[1.04] tracking-tight text-stone-50 sm:text-7xl">
            Find your trail.
            <br />
            <span className="text-earth-300">Find your people.</span>
          </h1>
          <p className="mt-6 max-w-[50ch] text-pretty text-lg leading-relaxed text-stone-200">
            See who is walking which trail this month, join a group that matches your pace and budget, or book a guide who
            has led the route before.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Button asChild size="lg" className="bg-stone-50 text-forest-950 shadow-[0_10px_30px_-12px_rgba(0,0,0,.7)] hover:bg-stone-100">
              <Link href="#trails">Browse trails</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-stone-300/45 text-stone-50 hover:bg-white/10">
              <Link href="#hikes">See group hikes</Link>
            </Button>
          </div>
        </div>

        <aside className="w-full justify-self-stretch overflow-hidden rounded-[10px] border border-stone-200/90 bg-stone-50/96">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-stone-200 px-6 py-5">
            <h2 className="font-narrow text-sm font-bold uppercase tracking-[.12em] text-stone-700">Leaving in the next two weeks</h2>
            <Link href="#hikes" className="text-[13px] font-semibold text-forest-700 hover:underline">
              All hikes
            </Link>
          </div>
          {heroHikes.length === 0 ? (
            <p className="px-6 py-6 text-sm text-stone-500">No hikes scheduled in the next two weeks — be the first to host one.</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {heroHikes.map((hike, i) => {
                const spotsLeft = Math.max(0, hike.maxParticipants - hike._count.participants);
                return (
                  <li
                    key={hike.id}
                    className={`grid grid-cols-[56px_1fr_auto] items-center gap-4 px-6 py-4 ${i < heroHikes.length - 1 ? "border-b border-stone-100" : ""}`}
                  >
                    <div className="rounded-md bg-stone-100 py-2 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-[.1em] text-earth-700">{hike.date.toLocaleDateString("en-US", { month: "short" })}</div>
                      <div className="font-display text-xl leading-tight text-forest-950">{hike.date.getDate()}</div>
                    </div>
                    <div className="min-w-0">
                      <Link href={`/hikes/${hike.id}`} className="text-[15px] font-semibold text-forest-950 hover:underline">
                        {hike.title}
                      </Link>
                      <div className="mt-0.5 text-[13px] text-stone-500">
                        {hike.meetingPoint} · {DIFFICULTY_LABELS[hike.difficulty as Difficulty] ?? hike.difficulty}
                      </div>
                    </div>
                    <div className={`whitespace-nowrap text-[13px] font-semibold ${spotsLeft <= 1 ? "text-danger-500" : spotsLeft <= 3 ? "text-earth-700" : "text-stone-500"}`}>
                      {hike.status === "FULL" ? "Full" : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"}`}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="bg-stone-100 px-6 py-3.5 text-xs text-stone-500">Seeded demo data — no real bookings are taken yet.</div>
        </aside>
      </ParallaxHero>

      <section id="trails" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[60ch]">
            <h2 className="font-display text-4xl font-semibold tracking-tight text-forest-950 sm:text-5xl">Trails on TrailLink</h2>
            <p className="mt-2.5 max-w-lg text-base text-stone-600">
              Route details, elevation and season windows for the trails groups are currently walking.
            </p>
          </div>
          <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:underline">
            All {destinationCount} trails <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest, i) => {
            const photo = destinationPhoto(dest.slug);
            const groups = dest._count.hikes;
            return (
              <Reveal key={dest.id} delay={(i % 3) * 70}>
                <TiltCard className="flex h-full flex-col overflow-hidden rounded-[10px] border border-stone-200 bg-white transition-shadow">
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-200">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.src} alt={photo.alt} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <DestinationArt index={i} />
                    )}
                  </div>
                  <div className="px-[22px] pt-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link href={`/explore/${dest.slug}`} className="font-display text-[22px] text-forest-950 hover:underline">
                        {dest.name}
                      </Link>
                      <span className={`text-xs font-bold uppercase tracking-[.06em] ${DIFFICULTY_COLOR[dest.difficulty as Difficulty] ?? ""}`}>
                        {DIFFICULTY_LABELS[dest.difficulty as Difficulty] ?? dest.difficulty}
                      </span>
                    </div>
                    <div className="mt-1.5 text-sm text-stone-500">{dest.region}</div>
                  </div>
                  <dl className="mx-[22px] mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-100 pt-4">
                    <div>
                      <dt className="font-narrow text-[11px] font-semibold uppercase tracking-[.12em] text-stone-500">Duration</dt>
                      <dd className="mt-1 text-sm text-stone-800">{dest.durationDays} days</dd>
                    </div>
                    <div>
                      <dt className="font-narrow text-[11px] font-semibold uppercase tracking-[.12em] text-stone-500">Highest point</dt>
                      <dd className="mt-1 text-sm text-stone-800">{dest.elevationM.toLocaleString("en-US")} m</dd>
                    </div>
                    <div>
                      <dt className="font-narrow text-[11px] font-semibold uppercase tracking-[.12em] text-stone-500">Season</dt>
                      <dd className="mt-1 text-sm text-stone-800">{dest.bestSeason}</dd>
                    </div>
                    <div>
                      <dt className="font-narrow text-[11px] font-semibold uppercase tracking-[.12em] text-stone-500">Budget</dt>
                      <dd className="mt-1 text-sm text-stone-800">
                        {formatCurrency(dest.budgetMinUsd, "USD")}–{formatCurrency(dest.budgetMaxUsd, "USD")}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-auto flex items-center justify-between gap-3 px-[22px] py-5 pt-4">
                    <span className="text-[13px] text-stone-500">{groups === 0 ? "No groups yet" : `${groups} group${groups === 1 ? "" : "s"} planned`}</span>
                    <Link href={`/explore/${dest.slug}`} className="text-sm font-semibold text-forest-700 hover:underline">
                      View trail →
                    </Link>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      <RoutePreview />

      {gridHikes.length > 0 && (
        <section id="hikes" className="bg-stone-100/60 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-[60ch]">
                <h2 className="font-display text-4xl font-semibold tracking-tight text-forest-950 sm:text-5xl">Upcoming group hikes</h2>
                <p className="mt-2.5 max-w-lg text-base text-stone-600">
                  Hikes posted by leaders in the community. Join one, or post your own with a date and a group size.
                </p>
              </div>
              <Link href="/hikes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:underline">
                All hikes <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>

            <div className="mt-11 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gridHikes.map((hike, i) => {
                const spotsLeft = hike.maxParticipants - hike._count.participants;
                const isVerifiedGuide = hike.host.guideProfile?.verificationStatus === "VERIFIED";
                const overflow = Math.max(0, hike._count.participants - hike.participants.length);
                return (
                  <Reveal key={hike.id} delay={i * 80}>
                    <article className="flex h-full flex-col rounded-[10px] border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-semibold text-stone-600">
                          {formatDate(hike.date, { weekday: "short", month: "short", day: "numeric", year: undefined })} · {hike.startTime}
                        </span>
                        <span className={`text-xs font-bold ${spotsLeft <= 1 ? "text-danger-500" : spotsLeft <= 3 ? "text-earth-700" : "text-stone-600"}`}>
                          {hike.status === "FULL" ? "Waitlist only" : `${spotsLeft} of ${hike.maxParticipants} spots left`}
                        </span>
                      </div>
                      <Link href={`/hikes/${hike.id}`}>
                        <h3 className="mt-3 font-display text-2xl leading-tight text-forest-950 hover:underline">{hike.title}</h3>
                      </Link>
                      <div className="mt-2 text-sm text-stone-600">
                        {hike.destination.name} · {DIFFICULTY_LABELS[hike.difficulty as Difficulty] ?? hike.difficulty}
                      </div>

                      <div className="mt-4.5 flex items-center gap-3 border-t border-stone-100 pt-4.5">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={hike.host.image ?? undefined} alt={hike.host.name} />
                          <AvatarFallback>{initials(hike.host.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-forest-950">
                            {hike.host.name} <span className="font-medium text-stone-500">· leader</span>
                          </div>
                          {isVerifiedGuide ? (
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-sky-600">
                              <CheckCircle2 className="h-3 w-3" /> Verified guide · licence and ID checked
                            </div>
                          ) : (
                            <div className="mt-0.5 text-xs text-stone-500">Community member · {hike.host._count.hikesHosted} hikes led</div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4.5 flex flex-wrap items-center gap-3.5">
                        <div className="flex flex-none items-center">
                          {hike.participants.map((p, idx) => (
                            <Avatar
                              key={p.user.username}
                              className={`h-9 w-9 border-2 border-white ${idx > 0 ? "-ml-2.5" : ""} ${AVATAR_RING_COLORS[idx % AVATAR_RING_COLORS.length]}`}
                            >
                              <AvatarImage src={p.user.image ?? undefined} alt={p.user.name} />
                              <AvatarFallback className="bg-transparent text-current">{initials(p.user.name)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {overflow > 0 && (
                            <span className="-ml-2.5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-stone-100 text-[11px] font-bold text-stone-600">
                              +{overflow}
                            </span>
                          )}
                        </div>
                        <span className="text-[13px] text-stone-600">
                          {hike._count.participants} going{participationByHike.get(hike.id) === "JOINED" ? ", including you" : ""}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center gap-3.5 pt-4.5">
                        <span className="whitespace-nowrap text-sm font-semibold text-forest-950">
                          {hike.price === 0 ? "Free" : formatCurrency(hike.price)}
                        </span>
                        <div className="flex-1">
                          <JoinHikeButton hikeId={hike.id} isFull={hike.status === "FULL"} initialStatus={participationByHike.get(hike.id) ?? null} />
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section id="guides" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="max-w-[60ch]">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-forest-950 sm:text-5xl">Guides you can book</h2>
          <p className="mt-2.5 max-w-lg text-base text-stone-600">
            Verified means TrailLink has checked the guide&apos;s licence and ID. Regions show where they&apos;ve led hikes on the
            platform.
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {guides.map((guide, i) => (
            <Reveal key={guide.id} delay={i * 70}>
              <Link href={`/guides/${guide.user.username}`} className="flex items-center gap-4 rounded-[10px] border border-stone-200 bg-white p-[22px] transition-shadow hover:shadow-md">
                <Avatar className="h-13 w-13 shrink-0">
                  <AvatarImage src={guide.user.image ?? undefined} alt={guide.user.name} />
                  <AvatarFallback className="font-display text-lg">{initials(guide.user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-forest-950">{guide.user.name}</div>
                  <div className="mt-0.5 text-[13px] text-stone-500">{guide.tripsCompleted} hikes led</div>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.06em] text-sky-600">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="join" className="relative overflow-hidden bg-forest-900 py-24 text-center">
        <Reveal className="relative z-[2] mx-auto max-w-2xl px-4">
          <Compass className="mx-auto h-10 w-10 text-earth-300" />
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-stone-50 sm:text-5xl">
            Post a hike, or find one to join
          </h2>
          <p className="mt-3.5 text-lg text-forest-200">Accounts are free for hikers. Guides apply separately for verification.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3.5">
            <Button asChild size="lg" className="bg-stone-50 text-forest-950 hover:bg-stone-100">
              <Link href="/register">Create an account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-stone-300/45 text-stone-50 hover:bg-white/10">
              <Link href="#hikes">Browse hikes first</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
