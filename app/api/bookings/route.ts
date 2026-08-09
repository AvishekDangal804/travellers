import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors, jsonError } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";
import { createBookingSchema } from "@/lib/validation/booking";

export async function GET() {
  return withApiErrors(async () => {
    const user = await requireUser();
    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        hike: { select: { title: true, id: true } },
        guideProfile: { include: { user: { select: { name: true, username: true } } } },
        payment: true,
      },
    });
    return NextResponse.json(bookings);
  });
}

export async function POST(req: NextRequest) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const input = createBookingSchema.parse(await req.json());

    let unitPrice: number;
    let currency = "NPR";

    if (input.guideProfileId) {
      const guide = await prisma.guideProfile.findUnique({ where: { id: input.guideProfileId } });
      if (!guide) return jsonError("Guide not found", 404);
      if (guide.verificationStatus !== "VERIFIED") return jsonError("This guide is not yet verified", 400);
      unitPrice = guide.pricePerDay;
      currency = guide.currency;
    } else if (input.hikeId) {
      const hike = await prisma.hike.findUnique({ where: { id: input.hikeId } });
      if (!hike) return jsonError("Hike not found", 404);
      unitPrice = hike.price;
      currency = hike.currency;
    } else {
      return jsonError("A booking must reference a hike or a guide", 422);
    }

    const totalPrice = unitPrice * input.numberOfPeople;

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        hikeId: input.hikeId,
        guideProfileId: input.guideProfileId,
        numberOfPeople: input.numberOfPeople,
        unitPrice,
        totalPrice,
        currency,
        tripDate: input.tripDate,
        status: "PENDING",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  });
}