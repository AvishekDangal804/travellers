import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";

export async function GET() {
  return withApiErrors(async () => {
    const user = await requireUser();

    const [bookingCount, favoriteCount, hostedCount, joinedCount] = await Promise.all([
      prisma.booking.count({ where: { userId: user.id } }),
      prisma.favorite.count({ where: { userId: user.id } }),
      prisma.hike.count({ where: { hostId: user.id, status: { in: ["UPCOMING", "FULL"] } } }),
      prisma.hikeParticipant.count({ where: { userId: user.id, status: "JOINED" } }),
    ]);

    return NextResponse.json({ bookingCount, favoriteCount, hostedCount, joinedCount });
  });
}
