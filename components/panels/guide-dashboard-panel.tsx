"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/states";
import { PanelLink } from "@/components/panels/panel-link";
import { usePanelFetch } from "@/components/panels/use-panel-fetch";
import { formatCurrency, formatDate, initials } from "@/lib/utils";

interface GuideDashboardData {
  guide: { verificationStatus: string; ratingAvg: number; tripsCompleted: number };
  bookings: {
    id: string;
    status: string;
    numberOfPeople: number;
    totalPrice: number;
    currency: string;
    tripDate: string | null;
    user: { name: string; username: string; image: string | null };
  }[];
  confirmedRevenue: number;
}

const STATUS_META: Record<string, { icon: typeof Clock; label: string; variant: NonNullable<BadgeProps["variant"]> }> = {
  PENDING: { icon: Clock, label: "Awaiting payment", variant: "warning" },
  CONFIRMED: { icon: CheckCircle2, label: "Confirmed", variant: "success" },
  CANCELLED: { icon: XCircle, label: "Cancelled", variant: "danger" },
  COMPLETED: { icon: CheckCircle2, label: "Completed", variant: "success" },
  REFUNDED: { icon: XCircle, label: "Refunded", variant: "danger" },
};

export function GuideDashboardPanel() {
  const { data, loading, error, reload } = usePanelFetch<GuideDashboardData>("/api/dashboard/guide");

  if (loading) return <LoadingState label="Loading guide dashboard…" />;
  if (error || !data) return <ErrorState title="Couldn't load your guide dashboard" description={error ?? undefined} onRetry={reload} />;

  const { guide, bookings, confirmedRevenue } = data;

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Guide dashboard</DialogTitle>
      </DialogHeader>

      <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Verification" value={guide.verificationStatus} />
        <Stat label="Rating" value={guide.ratingAvg > 0 ? guide.ratingAvg.toFixed(1) : "New"} />
        <Stat label="Trips completed" value={String(guide.tripsCompleted)} />
        <Stat label="Confirmed revenue" value={formatCurrency(confirmedRevenue)} />
      </div>

      <h2 className="mt-10 mb-4 font-display text-lg font-semibold text-forest-950">Booking requests</h2>
      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" description="Bookings from hikers will show up here." />
      ) : (
        <div className="space-y-3 pb-6">
          {bookings.map((booking) => {
            const meta = STATUS_META[booking.status] ?? STATUS_META.PENDING;
            const StatusIcon = meta.icon;
            return (
              <Card key={booking.id}>
                <CardContent className="flex items-center justify-between gap-4 pt-6">
                  <PanelLink view="profile" id={booking.user.username} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={booking.user.image ?? undefined} alt={booking.user.name} />
                      <AvatarFallback>{initials(booking.user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-forest-950">{booking.user.name}</p>
                      <p className="text-xs text-stone-500">
                        {booking.numberOfPeople} traveler{booking.numberOfPeople === 1 ? "" : "s"} ·{" "}
                        {formatCurrency(booking.totalPrice, booking.currency)}
                        {booking.tripDate ? ` · ${formatDate(booking.tripDate)}` : ""}
                      </p>
                    </div>
                  </PanelLink>
                  <Badge variant={meta.variant}>
                    <StatusIcon className="h-3.5 w-3.5" /> {meta.label}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 text-center shadow-sm">
      <p className="font-display text-lg font-semibold text-forest-950">{value}</p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  );
}
