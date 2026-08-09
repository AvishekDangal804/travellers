import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors, jsonError } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";
import { createReviewSchema } from "@/lib/validation/review";
import { recalculateGuideRating } from "@/services/ratings";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const rate = checkRateLimit(`review:${user.id}`, 20, 60_000);
    if (!rate.allowed) return jsonError("Too many reviews submitted. Try again shortly.", 429);

    const input = createReviewSchema.parse(await req.json());

    if (input.targetUserId === user.id) {
      return jsonError("You can't review yourself.", 400);
    }

    let guideProfileId: string | undefined;

    if (input.targetType === "TRIP") {
      const hike = await prisma.hike.findUnique({ where: { id: input.hikeId } });
      if (!hike) return jsonError("Hike not found", 404);
      if (hike.status !== "COMPLETED") return jsonError("You can only review completed hikes.", 400);

      const wasInvolved =
        hike.hostId === user.id ||
        (await prisma.hikeParticipant.findFirst({ where: { hikeId: hike.id, userId: user.id, status: "JOINED" } }));
      if (!wasInvolved) return jsonError("You can only review hikes you took part in.", 403);

      const existing = await prisma.review.findFirst({
        where: { authorId: user.id, targetType: "TRIP", hikeId: hike.id },
      });
      if (existing) return jsonError("You've already reviewed this hike.", 400);
    } else if (input.targetType === "GUIDE") {
      if (!input.targetUserId) return jsonError("Missing review target", 422);
      const guide = await prisma.guideProfile.findUnique({ where: { userId: input.targetUserId } });
      if (!guide) return jsonError("Guide not found", 404);
      guideProfileId = guide.id;

      const hasBooking = await prisma.booking.findFirst({
        where: { userId: user.id, guideProfileId: guide.id, status: { in: ["CONFIRMED", "COMPLETED"] } },
      });
      if (!hasBooking) return jsonError("You can only review a guide after booking them.", 403);

      const existing = await prisma.review.findFirst({
        where: { authorId: user.id, targetType: "GUIDE", targetUserId: input.targetUserId },
      });
      if (existing) return jsonError("You've already reviewed this guide.", 400);
    } else {
      // HIKER: peer review after sharing a completed hike.
      if (!input.targetUserId) return jsonError("Missing review target", 422);

      const sharedHike = await prisma.hike.findFirst({
        where: {
          status: "COMPLETED",
          OR: [
            { hostId: user.id, participants: { some: { userId: input.targetUserId, status: "JOINED" } } },
            { hostId: input.targetUserId, participants: { some: { userId: user.id, status: "JOINED" } } },
            {
              participants: { some: { userId: user.id, status: "JOINED" } },
              AND: { participants: { some: { userId: input.targetUserId, status: "JOINED" } } },
            },
          ],
        },
      });
      if (!sharedHike) return jsonError("You can only review hikers you've shared a completed hike with.", 403);

      const existing = await prisma.review.findFirst({
        where: { authorId: user.id, targetType: "HIKER", targetUserId: input.targetUserId },
      });
      if (existing) return jsonError("You've already reviewed this hiker.", 400);
    }

    const review = await prisma.review.create({
      data: {
        authorId: user.id,
        targetType: input.targetType,
        targetUserId: input.targetUserId,
        guideProfileId,
        hikeId: input.hikeId,
        bookingId: input.bookingId,
        rating: input.rating,
        comment: input.comment,
      },
    });

    if (input.targetType === "GUIDE" && input.targetUserId) {
      await recalculateGuideRating(input.targetUserId);
    }

    return NextResponse.json(review, { status: 201 });
  });
}