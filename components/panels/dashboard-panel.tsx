"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Heart, User as UserIcon, Compass, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { usePanelFetch } from "@/components/panels/use-panel-fetch";
import { openPanel } from "@/lib/panel-nav";

interface DashboardStats {
  bookingCount: number;
  favoriteCount: number;
  hostedCount: number;
  joinedCount: number;
}

export function DashboardPanel() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: stats, loading, error, reload } = usePanelFetch<DashboardStats>("/api/dashboard");

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error || !stats || !session?.user) return <ErrorState title="Couldn't load your dashboard" description={error ?? undefined} onRetry={reload} />;

  const username = session.user.username;
  const tiles: { onClick: () => void; icon: typeof CalendarCheck; label: string; value: number }[] = [
    { onClick: () => openPanel(router, { view: "bookings-list" }), icon: CalendarCheck, label: "Bookings", value: stats.bookingCount },
    { onClick: () => openPanel(router, { view: "favorites" }), icon: Heart, label: "Favorites", value: stats.favoriteCount },
    { onClick: () => openPanel(router, { view: "profile", id: username }), icon: Compass, label: "Hikes hosted", value: stats.hostedCount },
    { onClick: () => openPanel(router, { view: "profile", id: username }), icon: UserIcon, label: "Hikes joined", value: stats.joinedCount },
  ];

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Welcome back, {session.user.name?.split(" ")[0]}</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-stone-600">A quick look at your TrailLink activity.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile) => (
          <button key={tile.label} type="button" onClick={tile.onClick} className="text-left">
            <Card className="h-full hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
                <tile.icon className="h-6 w-6 text-forest-600" />
                <p className="font-display text-2xl font-bold text-forest-950">{tile.value}</p>
                <p className="text-xs text-stone-500">{tile.label}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 pb-2">
        <Button onClick={() => openPanel(router, { view: "create-hike" })}>Host a hike</Button>
        <Button variant="outline" asChild>
          <a href="/#destinations">Explore destinations</a>
        </Button>
        {session.user.role === "GUIDE" && (
          <Button variant="outline" onClick={() => openPanel(router, { view: "guide-dashboard" })}>
            <ShieldCheck className="h-4 w-4" /> Guide dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
