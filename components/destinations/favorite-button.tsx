"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { openPanel } from "@/lib/panel-nav";
import { cn } from "@/lib/utils";
import type { FavoriteType } from "@/types/enums";

export function FavoriteButton({
  type,
  destinationId,
  guideProfileId,
  hikeId,
  initialFavorited = false,
}: {
  type: FavoriteType;
  destinationId?: string;
  guideProfileId?: string;
  hikeId?: string;
  initialFavorited?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (!session?.user) {
      openPanel(router, { view: "login" });
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, destinationId, guideProfileId, hikeId }),
      });
      if (!res.ok) {
        toast.error("Could not update favorites.");
        return;
      }
      const body = await res.json();
      setFavorited(body.favorited);
      toast.success(body.favorited ? "Saved to favorites" : "Removed from favorites");
    });
  }

  return (
    <Button variant={favorited ? "earth" : "outline"} onClick={toggle} disabled={isPending}>
      <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
      {favorited ? "Saved" : "Save"}
    </Button>
  );
}