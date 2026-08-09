"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { HikeParticipantStatus } from "@/types/enums";

export function JoinHikeButton({
  hikeId,
  isFull,
  initialStatus,
}: {
  hikeId: string;
  isFull: boolean;
  initialStatus: HikeParticipantStatus | null;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  function join() {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/hikes/${hikeId}`);
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/hikes/${hikeId}/join`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Could not join this hike.");
        return;
      }
      setStatus(body.status);
      toast.success(body.status === "WAITLISTED" ? "You're on the waitlist." : "You're in! See you on the trail.");
      router.refresh();
    });
  }

  function leave() {
    startTransition(async () => {
      const res = await fetch(`/api/hikes/${hikeId}/join`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Could not leave this hike.");
        return;
      }
      setStatus("LEFT");
      toast.success("You've left this hike.");
      router.refresh();
    });
  }

  if (status === "JOINED" || status === "WAITLISTED") {
    return (
      <div className="flex flex-col gap-2">
        <Button variant="secondary" disabled className="w-full">
          {status === "JOINED" ? "You're going" : "You're on the waitlist"}
        </Button>
        <Button variant="ghost" size="sm" onClick={leave} disabled={isPending}>
          Leave hike
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={join} disabled={isPending} className="w-full">
      {isPending ? "Joining…" : isFull ? "Join waitlist" : "Join this hike"}
    </Button>
  );
}