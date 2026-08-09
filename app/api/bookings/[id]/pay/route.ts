import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors, jsonError } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";
import { getPaymentProvider } from "@/services/payment";
import { createNotification } from "@/services/notifications";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking || booking.userId !== user.id) return jsonError("Booking not found", 404);
    if (booking.status !== "PENDING") return jsonError("This booking has already been processed.", 400);

    const provider = getPaymentProvider();
    const result = await provider.charge({
      bookingId: booking.id,
      amount: booking.totalPrice,
      currency: booking.currency,
      description: `TrailLink Nepal booking ${booking.id}`,
    });

    const [, updatedBooking] = await prisma.$transaction([
      prisma.payment.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          provider: provider.name,
          amount: booking.totalPrice,
          currency: booking.currency,
          status: result.status,
          transactionRef: result.transactionRef,
        },
        update: { status: result.status, transactionRef: result.transactionRef },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: result.success ? "CONFIRMED" : "CANCELLED" },
      }),
    ]);

    if (result.success) {
      await createNotification({
        userId: user.id,
        type: "BOOKING_CONFIRMED",
        title: "Booking confirmed",
        body: `Your booking is confirmed. ${result.message ?? ""}`.trim(),
        link: `/bookings/${booking.id}`,
      });
    }

    return NextResponse.json({ booking: updatedBooking, payment: result });
  });
}