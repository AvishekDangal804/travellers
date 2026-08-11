"use client";

import { useSession } from "next-auth/react";
import { Calendar, Clock, MapPin, Users as UsersIcon, ShieldAlert, Backpack } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { JoinHikeButton } from "@/components/hikes/join-hike-button";
import { PanelLink } from "@/components/panels/panel-link";
import { usePanelFetch } from "@/components/panels/use-panel-fetch";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import { DIFFICULTY_LABELS, type Difficulty, type HikeParticipantStatus } from "@/types/enums";

interface HikeDetail {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  meetingPoint: string;
  difficulty: string;
  maxParticipants: number;
  price: number;
  requirements: unknown;
  equipment: unknown;
  safetyNotes: string;
  status: string;
  hostId: string;
  destination: { name: string; slug: string; region: string };
  host: { id: string; name: string; username: string; image: string | null };
  participants: { id: string; user: { id: string; name: string; username: string; image: string | null } }[];
  _count: { participants: number };
}

export function HikePanel({ id }: { id: string }) {
  const { data: session } = useSession();
  const { data: hike, loading, error, reload } = usePanelFetch<HikeDetail>(`/api/hikes/${id}`);

  if (loading) return <LoadingState label="Loading hike…" />;
  if (error || !hike) return <ErrorState title="Couldn't load this hike" description={error ?? undefined} onRetry={reload} />;

  const requirements = Array.isArray(hike.requirements) ? (hike.requirements as string[]) : [];
  const equipment = Array.isArray(hike.equipment) ? (hike.equipment as string[]) : [];
  const spotsLeft = Math.max(0, hike.maxParticipants - hike._count.participants);
  const isHost = session?.user?.id === hike.hostId;
  const myParticipation = hike.participants.find((p) => p.user.id === session?.user?.id);

  return (
    <div>
      <DialogHeader>
        <div className="flex flex-wrap gap-2">
          <Badge>{DIFFICULTY_LABELS[hike.difficulty as Difficulty] ?? hike.difficulty}</Badge>
          {hike.status === "FULL" && <Badge variant="warning">Full — waitlist open</Badge>}
        </div>
        <DialogTitle className="text-2xl">{hike.title}</DialogTitle>
        <p className="flex items-center gap-1.5 text-sm text-stone-600">
          <MapPin className="h-3.5 w-3.5" /> {hike.destination.name}, {hike.destination.region}
        </p>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-8 pb-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoTile icon={Calendar} label="Date" value={formatDate(hike.date)} />
            <InfoTile icon={Clock} label="Meets at" value={hike.startTime} />
            <InfoTile icon={UsersIcon} label="Group size" value={`${hike._count.participants}/${hike.maxParticipants}`} />
            <InfoTile icon={MapPin} label="Meeting point" value={hike.meetingPoint} />
          </div>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold text-forest-950">About this hike</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-stone-700">{hike.description}</p>
          </section>

          {requirements.length > 0 && (
            <section className="mb-6">
              <h2 className="font-display text-lg font-semibold text-forest-950">Requirements</h2>
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
            <section className="mb-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-forest-950">
                <Backpack className="h-4 w-4" /> What to bring
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
            <section className="mb-6 rounded-2xl border border-earth-300/60 bg-earth-100/50 p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-earth-700">
                <ShieldAlert className="h-4 w-4" /> Safety notes
              </h2>
              <p className="mt-2 text-sm text-forest-900">{hike.safetyNotes}</p>
            </section>
          )}

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-forest-950">Who&apos;s going</h2>
            <div className="flex flex-wrap gap-3">
              {hike.participants.map((p) => (
                <PanelLink key={p.id} view="profile" id={p.user.username} className="flex items-center gap-2 rounded-full bg-stone-100 py-1.5 pl-1.5 pr-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={p.user.image ?? undefined} alt={p.user.name} />
                    <AvatarFallback>{initials(p.user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-forest-900">{p.user.name}</span>
                </PanelLink>
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
                  initialStatus={(myParticipation ? "JOINED" : null) as HikeParticipantStatus | null}
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
                <PanelLink view="profile" id={hike.host.username} className="font-medium text-forest-950 hover:underline">
                  {hike.host.name}
                </PanelLink>
              </div>
            </CardContent>
          </Card>

          <PanelLink view="destination" id={hike.destination.slug} className="block text-sm font-medium text-forest-700 hover:underline">
            View full destination guide →
          </PanelLink>
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
