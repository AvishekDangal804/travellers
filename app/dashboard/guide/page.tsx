import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/states";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata: Metadata = { title: "Guide dashboard" };

const STATUS_META = {
  PENDING: { icon: Clock, label: "Awaiting payment", variant: "warning" as const },
  CONFIRMED: { icon: CheckCircle2, label: "Confirmed", variant: "success" as const },
  CANCELLED: { icon: XCircle, label: "Cancelled", variant: "danger" as const },
  COMPLETED: { icon: CheckCircle2, label: "Completed", variant: "success" as const },
  REFUNDED: { icon: XCircle, label: "Refunded", variant: "danger" as const },
};

export default async function GuideDashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/guide");
  if (session.user.role !== "GUIDE") redirect("/dashboard");

  const guide = await prisma.guideProfile.findUnique({ where: { userId: session.user.id } });
  if (!guide) redirect("/dashboard");

  const bookings = await prisma.booking.findMany({
    where: { guideProfileId: guide.id },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, username: true, image: true } } },
  });

  const confirmedRevenue = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-forest-950">Guide dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Verification" value={guide.verificationStatus} />
        <Stat label="Rating" value={guide.ratingAvg > 0 ? guide.ratingAvg.toFixed(1) : "New"} />
        <Stat label="Trips completed" value={String(guide.tripsCompleted)} />
        <Stat label="Confirmed revenue" value={formatCurrency(confirmedRevenue)} />
      </div>

      <h2 className="mt-10 mb-4 font-display text-xl font-semibold text-forest-950">Booking requests</h2>
      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" description="Bookings from hikers will show up here." />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const meta = STATUS_META[booking.status as keyof typeof STATUS_META] ?? STATUS_META.PENDING;
            const StatusIcon = meta.icon;
            return (
              <Card key={booking.id}>
                <CardContent className="flex items-center justify-between gap-4 pt-6">
                  <Link href={`/profile/${booking.user.username}`} className="flex items-center gap-3">
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
                  </Link>
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