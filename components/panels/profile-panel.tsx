"use client";

import { useSession } from "next-auth/react";
import { MapPin, Calendar, ShieldCheck, Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Rating } from "@/components/shared/rating";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { PanelLink } from "@/components/panels/panel-link";
import { usePanelFetch } from "@/components/panels/use-panel-fetch";
import { avatarUrl } from "@/lib/images";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import { EXPERIENCE_LABELS, type ExperienceLevel } from "@/types/enums";

interface ProfileDetail {
  id: string;
  name: string;
  username: string;
  image: string | null;
  role: string;
  hikerProfile: { bio: string | null; location: string | null; interests: unknown; experienceLevel: string } | null;
  guideProfile: { bio: string | null; location: string | null; pricePerDay: number; languages: unknown; specialties: unknown; ratingAvg: number; ratingCount: number } | null;
  hikesHosted: { id: string; title: string; date: string; destination: { name: string; slug: string } }[];
  hikesJoined: { id: string; title: string; date: string; destination: { name: string; slug: string } }[];
}

export function ProfilePanel({ id: username }: { id: string }) {
  const { data: session } = useSession();
  const { data: user, loading, error, reload } = usePanelFetch<ProfileDetail>(`/api/profile/${username}`);

  if (loading) return <LoadingState label="Loading profile…" />;
  if (error || !user) return <ErrorState title="Couldn't load this profile" description={error ?? undefined} onRetry={reload} />;

  const isOwnProfile = session?.user?.id === user.id;
  const interests = Array.isArray(user.hikerProfile?.interests) ? (user.hikerProfile.interests as string[]) : [];

  return (
    <div>
      <DialogHeader>
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image ?? avatarUrl(username)} alt={user.name} />
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                {user.name}
                {user.role === "GUIDE" && <ShieldCheck className="h-5 w-5 text-forest-600" aria-label="Guide" />}
              </DialogTitle>
              <p className="text-sm text-stone-500">@{user.username}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={user.role === "GUIDE" ? "success" : "outline"}>{user.role === "GUIDE" ? "Guide" : "Hiker"}</Badge>
                {user.guideProfile && <Rating value={user.guideProfile.ratingAvg} count={user.guideProfile.ratingCount} />}
              </div>
            </div>
          </div>

          {isOwnProfile ? (
            <EditProfileDialog
              role={user.role as "HIKER" | "GUIDE"}
              hiker={
                user.hikerProfile
                  ? { bio: user.hikerProfile.bio ?? "", location: user.hikerProfile.location ?? "", interests }
                  : undefined
              }
              guide={
                user.guideProfile
                  ? {
                      bio: user.guideProfile.bio ?? "",
                      location: user.guideProfile.location ?? "",
                      pricePerDay: user.guideProfile.pricePerDay,
                      languages: Array.isArray(user.guideProfile.languages) ? (user.guideProfile.languages as string[]) : [],
                      specialties: Array.isArray(user.guideProfile.specialties) ? (user.guideProfile.specialties as string[]) : [],
                    }
                  : undefined
              }
            />
          ) : (
            user.role === "GUIDE" && (
              <PanelLink view="guide" id={user.username} className={buttonVariants({})}>
                View guide profile &amp; book
              </PanelLink>
            )
          )}
        </div>
      </DialogHeader>

      {(user.hikerProfile?.bio || user.guideProfile?.bio) && (
        <p className="mt-2 max-w-2xl leading-relaxed text-stone-700">{user.hikerProfile?.bio ?? user.guideProfile?.bio}</p>
      )}

      {(user.hikerProfile?.location || user.guideProfile?.location) && (
        <p className="mt-2 flex items-center gap-1 text-sm text-stone-500">
          <MapPin className="h-3.5 w-3.5" /> {user.hikerProfile?.location ?? user.guideProfile?.location}
        </p>
      )}

      {user.hikerProfile && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="earth">{EXPERIENCE_LABELS[user.hikerProfile.experienceLevel as ExperienceLevel] ?? user.hikerProfile.experienceLevel}</Badge>
          {interests.map((i) => (
            <Badge key={i} variant="outline">
              {i}
            </Badge>
          ))}
        </div>
      )}

      {user.guideProfile && <p className="mt-4 font-medium text-forest-800">{formatCurrency(user.guideProfile.pricePerDay)} / day</p>}

      <div className="mt-8 grid grid-cols-1 gap-8 pb-6 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-forest-950">
            <Compass className="h-4 w-4" /> Hosting
          </h2>
          {user.hikesHosted.length === 0 ? (
            <p className="text-sm text-stone-500">No upcoming hikes hosted.</p>
          ) : (
            <div className="space-y-3">
              {user.hikesHosted.map((hike) => (
                <PanelLink key={hike.id} view="hike" id={hike.id} className="block">
                  <Card className="hover:shadow-md">
                    <CardContent className="pt-4">
                      <p className="font-medium text-forest-950">{hike.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                        <Calendar className="h-3 w-3" /> {formatDate(hike.date)} · {hike.destination.name}
                      </p>
                    </CardContent>
                  </Card>
                </PanelLink>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-base font-semibold text-forest-950">Joining</h2>
          {user.hikesJoined.length === 0 ? (
            <p className="text-sm text-stone-500">No upcoming hikes joined.</p>
          ) : (
            <div className="space-y-3">
              {user.hikesJoined.map((hike) => (
                <PanelLink key={hike.id} view="hike" id={hike.id} className="block">
                  <Card className="hover:shadow-md">
                    <CardContent className="pt-4">
                      <p className="font-medium text-forest-950">{hike.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                        <Calendar className="h-3 w-3" /> {formatDate(hike.date)} · {hike.destination.name}
                      </p>
                    </CardContent>
                  </Card>
                </PanelLink>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
