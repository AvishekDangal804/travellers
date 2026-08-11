import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors, jsonError } from "@/lib/api-utils";
import { getSession } from "@/lib/auth-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  return withApiErrors(async () => {
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        guideProfile: {
          include: {
            availability: { where: { date: { gte: new Date() } }, orderBy: { date: "asc" }, take: 30 },
          },
        },
      },
    });

    if (!user?.guideProfile) return jsonError("Guide not found", 404);

    const reviews = await prisma.review.findMany({
      where: { targetType: "GUIDE", targetUserId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { author: { select: { name: true, username: true, image: true } } },
    });

    const session = await getSession();
    let canReview = false;
    if (session?.user && session.user.id !== user.id) {
      const [hasBooking, alreadyReviewed] = await Promise.all([
        prisma.booking.findFirst({
          where: { userId: session.user.id, guideProfileId: user.guideProfile.id, status: { in: ["CONFIRMED", "COMPLETED"] } },
        }),
        prisma.review.findFirst({ where: { authorId: session.user.id, targetType: "GUIDE", targetUserId: user.id } }),
      ]);
      canReview = Boolean(hasBooking) && !alreadyReviewed;
    }

    return NextResponse.json({ ...user, reviews, canReview });
  });
}