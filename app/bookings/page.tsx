import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/states";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "My bookings" };

const STATUS_META = {
  PENDING: { icon: Clock, label: "Awaiting payment", variant: "warning" as const },
  CONFIRMED: { icon: CheckCircle2, label: "Confirmed", variant: "success" as const },
  CANCELLED: { icon: XCircle, label: "Cancelled", variant: "danger" as const },
  COMPLETED: { icon: CheckCircle2, label: "Completed", variant: "success" as const },
  REFUNDED: { icon: XCircle, label: "Refunded", variant: "danger" as const },
};

export default async function BookingsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/bookings");

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      hike: { select: { title: true } },
      guideProfile: { include: { user: { select: { name: true } } } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-forest-950">My bookings</h1>

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="Book a guide or join a hike to see it here."
          className="mt-8"
        />
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((booking) => {
            const meta = STATUS_META[booking.status as keyof typeof STATUS_META] ?? STATUS_META.PENDING;
            const StatusIcon = meta.icon;
            const title = booking.guideProfile ? `Guide: ${booking.guideProfile.user.name}` : booking.hike?.title ?? "Booking";
            return (
              <Link key={booking.id} href={`/bookings/${booking.id}`}>
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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}