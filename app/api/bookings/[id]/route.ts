import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors, jsonError } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        hike: { select: { title: true, id: true, date: true } },
        guideProfile: { include: { user: { select: { name: true, username: true, image: true } } } },
        payment: true,
      },
    });

    if (!booking || booking.userId !== user.id) return jsonError("Booking not found", 404);

    return NextResponse.json(booking);
  });
}