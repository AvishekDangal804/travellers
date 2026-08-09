import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors, jsonError } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";
import { getPaymentProvider } from "@/services/payment";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({ where: { id }, include: { payment: true } });
    if (!booking || booking.userId !== user.id) return jsonError("Booking not found", 404);
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      return jsonError("This booking can't be cancelled.", 400);
    }

    if (booking.payment?.status === "SUCCESS") {
      const provider = getPaymentProvider();
      await provider.refund(booking.payment.transactionRef ?? "", booking.totalPrice);
      await prisma.payment.update({ where: { bookingId: booking.id }, data: { status: "REFUNDED" } });
    }

    const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
    return NextResponse.json(updated);
  });
}