import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, Clock, MapPin, Users as UsersIcon, ShieldAlert, Backpack } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SafeImage } from "@/components/shared/safe-image";
import { hikeImage } from "@/lib/images";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import { DIFFICULTY_LABELS, type Difficulty, type HikeParticipantStatus } from "@/types/enums";
import { JoinHikeButton } from "@/components/hikes/join-hike-button";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const hike = await prisma.hike.findUnique({ where: { id }, select: { title: true, description: true } });
  return { title: hike?.title ?? "Hike", description: hike?.description };
}

export default async function HikeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const hike = await prisma.hike.findUnique({
    where: { id },
    include: {
      destination: { select: { name: true, slug: true, region: true } },
      host: { select: { id: true, name: true, username: true, image: true } },
      participants: {
        where: { status: "JOINED" },
        include: { user: { select: { id: true, name: true, username: true, image: true } } },
      },
      _count: { select: { participants: { where: { status: "JOINED" } } } },
    },
  });

  if (!hike) notFound();

  const session = await getSession();
  const myParticipation = session?.user
    ? await prisma.hikeParticipant.findUnique({
        where: { hikeId_userId: { hikeId: id, userId: session.user.id } },
        select: { status: true },
      })
    : null;

  const isHost = session?.user?.id === hike.hostId;
  const requirements = Array.isArray(hike.requirements) ? (hike.requirements as string[]) : [];
  const equipment = Array.isArray(hike.equipment) ? (hike.equipment as string[]) : [];
  const spotsLeft = Math.max(0, hike.maxParticipants - hike._count.participants);

  return (
    <div>
      <div className="relative h-64 w-full overflow-hidden bg-stone-800 sm:h-80">
        <SafeImage src={hikeImage(hike.id, 1600, 900)} alt={hike.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white/90 text-forest-900">{DIFFICULTY_LABELS[hike.difficulty as Difficulty] ?? hike.difficulty}</Badge>
            {hike.status === "FULL" && <Badge variant="warning">Full — waitlist open</Badge>}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-stone-50 sm:text-4xl">{hike.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-stone-200">
            <MapPin className="h-4 w-4" /> {hike.destination.name}, {hike.destination.region}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-2">
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <InfoTile icon={Calendar} label="Date" value={formatDate(hike.date)} />
            <InfoTile icon={Clock} label="Meets at" value={hike.startTime} />
            <InfoTile icon={UsersIcon} label="Group size" value={`${hike._count.participants}/${hike.maxParticipants}`} />
            <InfoTile icon={MapPin} label="Meeting point" value={hike.meetingPoint} />
          </div>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-semibold text-forest-950">About this hike</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-stone-700">{hike.description}</p>
          </section>

          {requirements.length > 0 && (
            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold text-forest-950">Requirements</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-stone-700">
                {requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-600" /> {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {equipment.length > 0 && (
            <section className="mb-8">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-forest-950">
                <Backpack className="h-5 w-5" /> What to bring
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {equipment.map((e) => (
                  <Badge key={e} variant="outline">
                    {e}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {hike.safetyNotes && (
            <section className="mb-8 rounded-2xl border border-earth-300/60 bg-earth-100/50 p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-earth-700">
                <ShieldAlert className="h-5 w-5" /> Safety notes
              </h2>
              <p className="mt-2 text-sm text-forest-900">{hike.safetyNotes}</p>
            </section>
          )}

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-forest-950">Who&apos;s going</h2>
            <div className="flex flex-wrap gap-3">
              {hike.participants.map((p) => (
                <Link key={p.id} href={`/profile/${p.user.username}`} className="flex items-center gap-2 rounded-full bg-stone-100 py-1.5 pl-1.5 pr-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={p.user.image ?? undefined} alt={p.user.name} />
                    <AvatarFallback>{initials(p.user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-forest-900">{p.user.name}</span>
                </Link>
              ))}
              {hike.participants.length === 0 && <p className="text-sm text-stone-500">No one has joined yet — be the first!</p>}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4 text-center font-display text-2xl font-bold text-forest-950">
                {hike.price === 0 ? "Free" : formatCurrency(hike.price)}
              </p>
              {isHost ? (
                <Badge className="w-full justify-center py-2" variant="success">
                  You&apos;re hosting this hike
                </Badge>
              ) : (
                <JoinHikeButton
                  hikeId={hike.id}
                  isFull={hike.status === "FULL"}
                  initialStatus={(myParticipation?.status as HikeParticipantStatus) ?? null}
                />
              )}
              <p className="mt-3 text-center text-xs text-stone-500">
                {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left` : "Full — new joiners are waitlisted"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Avatar className="h-12 w-12">
                <AvatarImage src={hike.host.image ?? undefined} alt={hike.host.name} />
                <AvatarFallback>{initials(hike.host.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-stone-500">Hosted by</p>
                <Link href={`/profile/${hike.host.username}`} className="font-medium text-forest-950 hover:underline">
                  {hike.host.name}
                </Link>
              </div>
            </CardContent>
          </Card>

          <Link href={`/explore/${hike.destination.slug}`} className="block text-sm font-medium text-forest-700 hover:underline">
            View full destination guide →
          </Link>
        </aside>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 text-center shadow-sm">
      <Icon className="mx-auto h-4 w-4 text-forest-600" />
      <p className="mt-1 truncate text-sm font-semibold text-forest-950">{value}</p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  );
}