"use client";

import { useSession } from "next-auth/react";
import { Languages, Mountain as MountainIcon, ShieldCheck, Briefcase, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SafeImage } from "@/components/shared/safe-image";
import { Rating } from "@/components/shared/rating";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { ReviewForm } from "@/components/reviews/review-form";
import { usePanelFetch } from "@/components/panels/use-panel-fetch";
import { avatarUrl, destinationGallery } from "@/lib/images";
import { formatCurrency, formatRelativeTime, initials } from "@/lib/utils";

interface GuideDetail {
  id: string;
  name: string;
  username: string;
  image: string | null;
  guideProfile: {
    id: string;
    bio: string | null;
    location: string | null;
    experienceYears: number;
    languages: unknown;
    specialties: unknown;
    destinationsCovered: unknown;
    pricePerDay: number;
    tripsCompleted: number;
    ratingAvg: number;
    ratingCount: number;
    gallery: unknown;
  };
  reviews: { id: string; rating: number; comment: string; createdAt: string; author: { name: string; username: string; image: string | null } }[];
  canReview: boolean;
}

export function GuidePanel({ id: username }: { id: string }) {
  const { data: session } = useSession();
  const { data: user, loading, error, reload } = usePanelFetch<GuideDetail>(`/api/guides/${username}`);

  if (loading) return <LoadingState label="Loading guide…" />;
  if (error || !user) return <ErrorState title="Couldn't load this guide" description={error ?? undefined} onRetry={reload} />;

  const guide = user.guideProfile;
  const languages = Array.isArray(guide.languages) ? (guide.languages as string[]) : [];
  const specialties = Array.isArray(guide.specialties) ? (guide.specialties as string[]) : [];
  const destinationsCovered = Array.isArray(guide.destinationsCovered) ? (guide.destinationsCovered as string[]) : [];
  const gallery =
    Array.isArray(guide.gallery) && (guide.gallery as string[]).length > 0
      ? (guide.gallery as string[])
      : destinationGallery(username, 4, 600, 450);
  const isSelf = session?.user?.id === user.id;

  return (
    <div>
      <DialogHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image ?? avatarUrl(username)} alt={user.name} />
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              {user.name}
              <ShieldCheck className="h-5 w-5 text-forest-600" aria-label="Verified guide" />
            </DialogTitle>
            <Rating value={guide.ratingAvg} count={guide.ratingCount} size="md" className="mt-1" />
            {guide.location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                <MapPin className="h-3.5 w-3.5" /> {guide.location}
              </p>
            )}
          </div>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-8 pb-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {guide.bio && <p className="leading-relaxed text-stone-700">{guide.bio}</p>}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatTile icon={Briefcase} label="Experience" value={`${guide.experienceYears} yrs`} />
            <StatTile icon={MountainIcon} label="Trips completed" value={String(guide.tripsCompleted)} />
            <StatTile icon={Star} label="Rating" value={guide.ratingAvg > 0 ? guide.ratingAvg.toFixed(1) : "New"} />
          </div>

          {languages.length > 0 && (
            <section className="mt-6">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-forest-950">
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
            <section className="mt-5">
              <h2 className="font-display text-base font-semibold text-forest-950">Specialties</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            </section>
          )}

          {destinationsCovered.length > 0 && (
            <section className="mt-5">
              <h2 className="font-display text-base font-semibold text-forest-950">Destinations covered</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {destinationsCovered.map((d) => (
                  <Badge key={d} variant="sky">
                    {d.replace(/-/g, " ")}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <section className="mt-6">
            <h2 className="font-display text-base font-semibold text-forest-950">Gallery</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gallery.slice(0, 4).map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-stone-200">
                  <SafeImage src={src} alt="" fill sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold text-forest-950">Reviews ({user.reviews.length})</h2>
            {user.canReview && !isSelf && (
              <div className="mt-4">
                <ReviewForm targetType="GUIDE" targetUserId={user.id} />
              </div>
            )}
            {user.reviews.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">No reviews yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {user.reviews.map((review) => (
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
          <Card>
            <CardContent className="pt-6">
              <p className="text-center font-display text-2xl font-bold text-forest-950">
                {formatCurrency(guide.pricePerDay)}
                <span className="text-sm font-normal text-stone-500"> / day</span>
              </p>
              <Button asChild size="lg" className="mt-4 w-full">
                <a href={`/book/guide/${guide.id}`}>Book this guide</a>
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
