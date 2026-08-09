import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PayButton } from "@/components/bookings/pay-button";

export const metadata: Metadata = { title: "Booking" };

const STATUS_META = {
  PENDING: { icon: Clock, label: "Awaiting payment", variant: "warning" as const },
  CONFIRMED: { icon: CheckCircle2, label: "Confirmed", variant: "success" as const },
  CANCELLED: { icon: XCircle, label: "Cancelled", variant: "danger" as const },
  COMPLETED: { icon: CheckCircle2, label: "Completed", variant: "success" as const },
  REFUNDED: { icon: XCircle, label: "Refunded", variant: "danger" as const },
};

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getSession();
  if (!session?.user) redirect(`/login?callbackUrl=/bookings/${id}`);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      hike: { select: { title: true, id: true, date: true } },
      guideProfile: { include: { user: { select: { name: true, username: true } } } },
      payment: true,
    },
  });

  if (!booking || booking.userId !== session.user.id) notFound();

  const meta = STATUS_META[booking.status as keyof typeof STATUS_META] ?? STATUS_META.PENDING;
  const StatusIcon = meta.icon;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-forest-950">Booking details</h1>

      <Card className="mt-6">
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
                <Link href={`/guides/${booking.guideProfile.user.username}`} className="text-forest-700 hover:underline">
                  {booking.guideProfile.user.name}
                </Link>
              </Row>
            )}
            {booking.hike && (
              <Row label="Hike">
                <Link href={`/hikes/${booking.hike.id}`} className="text-forest-700 hover:underline">
                  {booking.hike.title}
                </Link>
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
            {booking.status === "PENDING" && <PayButton bookingId={booking.id} />}
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

      <Button asChild variant="ghost" className="mt-4">
        <Link href="/bookings">View all bookings</Link>
      </Button>
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