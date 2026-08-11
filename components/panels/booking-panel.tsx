"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { PayButton } from "@/components/bookings/pay-button";
import { PanelLink } from "@/components/panels/panel-link";
import { usePanelFetch } from "@/components/panels/use-panel-fetch";
import { formatCurrency, formatDate } from "@/lib/utils";

interface BookingDetail {
  id: string;
  status: string;
  numberOfPeople: number;
  totalPrice: number;
  currency: string;
  tripDate: string | null;
  hike: { id: string; title: string } | null;
  guideProfile: { user: { name: string; username: string } } | null;
  payment: { provider: string; transactionRef: string | null } | null;
}

const STATUS_META: Record<string, { icon: typeof Clock; label: string; variant: NonNullable<BadgeProps["variant"]> }> = {
  PENDING: { icon: Clock, label: "Awaiting payment", variant: "warning" },
  CONFIRMED: { icon: CheckCircle2, label: "Confirmed", variant: "success" },
  CANCELLED: { icon: XCircle, label: "Cancelled", variant: "danger" },
  COMPLETED: { icon: CheckCircle2, label: "Completed", variant: "success" },
  REFUNDED: { icon: XCircle, label: "Refunded", variant: "danger" },
};

export function BookingPanel({ id }: { id: string }) {
  const { data: booking, loading, error, reload } = usePanelFetch<BookingDetail>(`/api/bookings/${id}`);

  if (loading) return <LoadingState label="Loading booking…" />;
  if (error || !booking) return <ErrorState title="Couldn't load this booking" description={error ?? undefined} onRetry={reload} />;

  const meta = STATUS_META[booking.status] ?? STATUS_META.PENDING;
  const StatusIcon = meta.icon;

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Booking details</DialogTitle>
      </DialogHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Badge variant={meta.variant}>
              <StatusIcon className="h-3.5 w-3.5" /> {meta.label}
            </Badge>
            <span className="text-xs text-stone-500">#{booking.id.slice(-8)}</span>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            {booking.guideProfile && (
              <Row label="Guide">
                <PanelLink view="guide" id={booking.guideProfile.user.username} className="text-forest-700 hover:underline">
                  {booking.guideProfile.user.name}
                </PanelLink>
              </Row>
            )}
            {booking.hike && (
              <Row label="Hike">
                <PanelLink view="hike" id={booking.hike.id} className="text-forest-700 hover:underline">
                  {booking.hike.title}
                </PanelLink>
              </Row>
            )}
            {booking.tripDate && <Row label="Trip date">{formatDate(booking.tripDate)}</Row>}
            <Row label="Travelers">{booking.numberOfPeople}</Row>
            <Row label="Total">{formatCurrency(booking.totalPrice, booking.currency)}</Row>
            {booking.payment && (
              <Row label="Payment">
                {booking.payment.provider} · {booking.payment.transactionRef ?? "—"}
              </Row>
            )}
          </dl>

          <div className="mt-6">
            {booking.status === "PENDING" && <PayButton bookingId={booking.id} onSuccess={reload} />}
            {booking.status === "CONFIRMED" && (
              <p className="rounded-lg bg-forest-100 px-4 py-3 text-center text-sm text-forest-800">
                You&apos;re all set! We&apos;ve saved this to your bookings.
              </p>
            )}
            {(booking.status === "CANCELLED" || booking.status === "REFUNDED") && (
              <p className="rounded-lg bg-danger-100 px-4 py-3 text-center text-sm text-danger-500">
                This booking is {booking.status.toLowerCase()}.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-stone-500">{label}</dt>
      <dd className="font-medium text-forest-950">{children}</dd>
    </div>
  );
}
