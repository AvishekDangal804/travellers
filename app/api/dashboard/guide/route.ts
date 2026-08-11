import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, withApiErrors } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  return withApiErrors(async () => {
    const user = await requireRole("GUIDE");

    const guide = await prisma.guideProfile.findUnique({ where: { userId: user.id } });
    if (!guide) return jsonError("No guide profile found", 404);

    const bookings = await prisma.booking.findMany({
      where: { guideProfileId: guide.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, username: true, image: true } } },
    });

    const confirmedRevenue = bookings
      .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
      .reduce((sum, b) => sum + b.totalPrice, 0);

    return NextResponse.json({ guide, bookings, confirmedRevenue });
  });
}
