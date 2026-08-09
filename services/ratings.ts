import { prisma } from "@/lib/db";

/** Recomputes a guide's denormalized ratingAvg/ratingCount from their reviews. Always server-side, never client-supplied. */
export async function recalculateGuideRating(guideUserId: string) {
  const agg = await prisma.review.aggregate({
    where: { targetType: "GUIDE", targetUserId: guideUserId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.guideProfile.update({
    where: { userId: guideUserId },
    data: {
      ratingAvg: agg._avg.rating ?? 0,
      ratingCount: agg._count.rating,
    },
  });
}

/** Hiker ratings are small in volume and shown less often, so they're aggregated on read rather than denormalized. */
export async function getHikerRating(userId: string) {
  const agg = await prisma.review.aggregate({
    where: { targetType: "HIKER", targetUserId: userId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return { average: agg._avg.rating ?? 0, count: agg._count.rating };
}

export async function getDestinationRating(destinationId: string) {
  const hikes = await prisma.hike.findMany({ where: { destinationId }, select: { id: true } });
  const hikeIds = hikes.map((h) => h.id);
  if (hikeIds.length === 0) return { average: 0, count: 0 };

  const agg = await prisma.review.aggregate({
    where: { targetType: "TRIP", hikeId: { in: hikeIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return { average: agg._avg.rating ?? 0, count: agg._count.rating };
}
