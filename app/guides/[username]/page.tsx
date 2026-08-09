import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Languages, Mountain as MountainIcon, ShieldCheck, Briefcase, MapPin, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SafeImage } from "@/components/shared/safe-image";
import { Rating } from "@/components/shared/rating";
import { ReviewForm } from "@/components/reviews/review-form";
import { avatarUrl, destinationGallery } from "@/lib/images";
import { formatCurrency, formatRelativeTime, initials } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, select: { name: true } });
  return { title: user ? `${user.name} — Guide` : "Guide" };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { guideProfile: true },
  });

  if (!user?.guideProfile) notFound();
  const guide = user.guideProfile;

  const reviews = await prisma.review.findMany({
    where: { targetType: "GUIDE", targetUserId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { author: { select: { name: true, username: true, image: true } } },
  });

  const session = await getSession();
  let canReview = false;
  if (session?.user && session.user.id !== user.id) {
    const [hasBooking, alreadyReviewed] = await Promise.all([
      prisma.booking.findFirst({
        where: { userId: session.user.id, guideProfileId: guide.id, status: { in: ["CONFIRMED", "COMPLETED"] } },
      }),
      prisma.review.findFirst({ where: { authorId: session.user.id, targetType: "GUIDE", targetUserId: user.id } }),
    ]);
    canReview = Boolean(hasBooking) && !alreadyReviewed;
  }

  const languages = Array.isArray(guide.languages) ? (guide.languages as string[]) : [];
  const specialties = Array.isArray(guide.specialties) ? (guide.specialties as string[]) : [];
  const destinationsCovered = Array.isArray(guide.destinationsCovered) ? (guide.destinationsCovered as string[]) : [];
  const gallery = Array.isArray(guide.gallery) && guide.gallery.length > 0
    ? (guide.gallery as string[])
    : destinationGallery(username, 4, 600, 450);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image ?? avatarUrl(username)} alt={user.name} />
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-forest-950">
                {user.name}
                <ShieldCheck className="h-6 w-6 text-forest-600" aria-label="Verified guide" />
              </h1>
              <Rating value={guide.ratingAvg} count={guide.ratingCount} size="md" className="mt-1" />
              {guide.location && (
                <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                  <MapPin className="h-3.5 w-3.5" /> {guide.location}
                </p>
              )}
            </div>
          </div>

          {guide.bio && <p className="mt-6 leading-relaxed text-stone-700">{guide.bio}</p>}

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatTile icon={Briefcase} label="Experience" value={`${guide.experienceYears} yrs`} />
            <StatTile icon={MountainIcon} label="Trips completed" value={String(guide.tripsCompleted)} />
            <StatTile icon={Star} label="Rating" value={guide.ratingAvg > 0 ? guide.ratingAvg.toFixed(1) : "New"} />
          </div>

          {languages.length > 0 && (
            <section className="mt-8">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-forest-950">
                <Languages className="h-4 w-4" /> Languages
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {languages.map((l) => (
                  <Badge key={l} variant="outline">
                    {l}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {specialties.length > 0 && (
            <section className="mt-6">
              <h2 className="font-display text-lg font-semibold text-forest-950">Specialties</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            </section>
          )}

          {destinationsCovered.length > 0 && (
            <section className="mt-6">
              <h2 className="font-display text-lg font-semibold text-forest-950">Destinations covered</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {destinationsCovered.map((d) => (
                  <Link key={d} href={`/explore/${d}`}>
                    <Badge variant="sky">{d.replace(/-/g, " ")}</Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold text-forest-950">Gallery</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gallery.slice(0, 4).map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-stone-200">
                  <SafeImage src={src} alt="" fill sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-forest-950">Reviews ({reviews.length})</h2>
            {canReview && (
              <div className="mt-4">
                <ReviewForm targetType="GUIDE" targetUserId={user.id} />
              </div>
            )}
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">No reviews yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-stone-200 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.author.image ?? undefined} alt={review.author.name} />
                        <AvatarFallback>{initials(review.author.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-forest-950">{review.author.name}</p>
                        <p className="text-xs text-stone-500">{formatRelativeTime(review.createdAt)}</p>
                      </div>
                      <Rating value={review.rating} />
                    </div>
                    <p className="mt-2 text-sm text-stone-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside>
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <p className="text-center font-display text-2xl font-bold text-forest-950">
                {formatCurrency(guide.pricePerDay)}
                <span className="text-sm font-normal text-stone-500"> / day</span>
              </p>
              <Button asChild size="lg" className="mt-4 w-full">
                <Link href={`/book/guide/${guide.id}`}>Book this guide</Link>
              </Button>
              <p className="mt-3 text-center text-xs text-stone-500">You won&apos;t be charged yet</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 text-center shadow-sm">
      <Icon className="mx-auto h-4 w-4 text-forest-600" />
      <p className="mt-1 text-sm font-semibold text-forest-950">{value}</p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  );
}