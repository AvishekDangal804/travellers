"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/states";
import { PanelLink } from "@/components/panels/panel-link";
import { usePanelFetch } from "@/components/panels/use-panel-fetch";
import { formatCurrency, formatDate } from "@/lib/utils";

interface BookingListItem {
  id: string;
  status: string;
  numberOfPeople: number;
  totalPrice: number;
  currency: string;
  tripDate: string | null;
  hike: { title: string } | null;
  guideProfile: { user: { name: string } } | null;
}

const STATUS_META: Record<string, { icon: typeof Clock; label: string; variant: NonNullable<BadgeProps["variant"]> }> = {
  PENDING: { icon: Clock, label: "Awaiting payment", variant: "warning" },
  CONFIRMED: { icon: CheckCircle2, label: "Confirmed", variant: "success" },
  CANCELLED: { icon: XCircle, label: "Cancelled", variant: "danger" },
  COMPLETED: { icon: CheckCircle2, label: "Completed", variant: "success" },
  REFUNDED: { icon: XCircle, label: "Refunded", variant: "danger" },
};

export function BookingsListPanel() {
  const { data: bookings, loading, error, reload } = usePanelFetch<BookingListItem[]>("/api/bookings");

  return (
    <div>
      <DialogHeader>
        <DialogTitle>My bookings</DialogTitle>
      </DialogHeader>

      {loading && <LoadingState label="Loading bookings…" />}
      {!loading && error && <ErrorState title="Couldn't load your bookings" description={error} onRetry={reload} />}
      {!loading && !error && bookings && bookings.length === 0 && (
        <EmptyState title="No bookings yet" description="Book a guide or join a hike to see it here." />
      )}
      {!loading && !error && bookings && bookings.length > 0 && (
        <div className="space-y-4 pb-6">
          {bookings.map((booking) => {
            const meta = STATUS_META[booking.status] ?? STATUS_META.PENDING;
            const StatusIcon = meta.icon;
            const title = booking.guideProfile ? `Guide: ${booking.guideProfile.user.name}` : (booking.hike?.title ?? "Booking");
            return (
              <PanelLink key={booking.id} view="booking" id={booking.id} className="block">
                <Card className="hover:shadow-md">
                  <CardContent className="flex items-center justify-between gap-4 pt-6">
                    <div>
                      <p className="font-medium text-forest-950">{title}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {booking.numberOfPeople} traveler{booking.numberOfPeople === 1 ? "" : "s"} ·{" "}
                        {formatCurrency(booking.totalPrice, booking.currency)}
                        {booking.tripDate ? ` · ${formatDate(booking.tripDate)}` : ""}
                      </p>
                    </div>
                    <Badge variant={meta.variant}>
                      <StatusIcon className="h-3.5 w-3.5" /> {meta.label}
                    </Badge>
                  </CardContent>
                </Card>
              </PanelLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
