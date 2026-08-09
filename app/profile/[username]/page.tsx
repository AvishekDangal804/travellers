import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, Calendar, ShieldCheck, Compass } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Rating } from "@/components/shared/rating";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { avatarUrl } from "@/lib/images";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import { EXPERIENCE_LABELS, type ExperienceLevel } from "@/types/enums";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, select: { name: true } });
  return { title: user?.name ?? "Profile" };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { hikerProfile: true, guideProfile: true },
  });

  if (!user) notFound();

  const session = await getSession();
  const isOwnProfile = session?.user?.id === user.id;

  const [hikesHosted, hikesJoined] = await Promise.all([
    prisma.hike.findMany({
      where: { hostId: user.id, status: { in: ["UPCOMING", "FULL"] } },
      orderBy: { date: "asc" },
      include: { destination: { select: { name: true, slug: true } } },
      take: 6,
    }),
    prisma.hike.findMany({
      where: {
        status: { in: ["UPCOMING", "FULL"] },
        participants: { some: { userId: user.id, status: "JOINED" } },
      },
      orderBy: { date: "asc" },
      include: { destination: { select: { name: true, slug: true } } },
      take: 6,
    }),
  ]);

  const interests = Array.isArray(user.hikerProfile?.interests) ? (user.hikerProfile.interests as string[]) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.image ?? avatarUrl(username)} alt={user.name} />
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-forest-950">
              {user.name}
              {user.role === "GUIDE" && <ShieldCheck className="h-6 w-6 text-forest-600" aria-label="Guide" />}
            </h1>
            <p className="text-stone-500">@{user.username}</p>
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
            <Button asChild>
              <Link href={`/guides/${user.username}`}>View guide profile &amp; book</Link>
            </Button>
          )
        )}
      </div>

      {(user.hikerProfile?.bio || user.guideProfile?.bio) && (
        <p className="mt-6 max-w-2xl leading-relaxed text-stone-700">{user.hikerProfile?.bio ?? user.guideProfile?.bio}</p>
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

      {user.guideProfile && (
        <p className="mt-4 font-medium text-forest-800">{formatCurrency(user.guideProfile.pricePerDay)} / day</p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-forest-950">
            <Compass className="h-4 w-4" /> Hosting
          </h2>
          {hikesHosted.length === 0 ? (
            <p className="text-sm text-stone-500">No upcoming hikes hosted.</p>
          ) : (
            <div className="space-y-3">
              {hikesHosted.map((hike) => (
                <Link key={hike.id} href={`/hikes/${hike.id}`}>
                  <Card className="hover:shadow-md">
                    <CardContent className="pt-4">
                      <p className="font-medium text-forest-950">{hike.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                        <Calendar className="h-3 w-3" /> {formatDate(hike.date)} · {hike.destination.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-forest-950">Joining</h2>
          {hikesJoined.length === 0 ? (
            <p className="text-sm text-stone-500">No upcoming hikes joined.</p>
          ) : (
            <div className="space-y-3">
              {hikesJoined.map((hike) => (
                <Link key={hike.id} href={`/hikes/${hike.id}`}>
                  <Card className="hover:shadow-md">
                    <CardContent className="pt-4">
                      <p className="font-medium text-forest-950">{hike.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                        <Calendar className="h-3 w-3" /> {formatDate(hike.date)} · {hike.destination.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}