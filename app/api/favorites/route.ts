import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { withApiErrors } from "@/lib/api-utils";
import { toggleFavoriteSchema } from "@/lib/validation/favorite";

export async function GET(req: NextRequest) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const favorites = await prisma.favorite.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

    // Bare favorite rows (id/type/resourceId) are enough for FavoriteButton's
    // initialFavorited check; ?hydrate=1 additionally resolves each resource
    // for a favorites list view.
    if (req.nextUrl.searchParams.get("hydrate") !== "1") {
      return NextResponse.json(favorites);
    }

    const destinationIds = favorites.filter((f) => f.type === "DESTINATION").map((f) => f.destinationId!).filter(Boolean);
    const guideProfileIds = favorites.filter((f) => f.type === "GUIDE").map((f) => f.guideProfileId!).filter(Boolean);
    const hikeIds = favorites.filter((f) => f.type === "HIKE").map((f) => f.hikeId!).filter(Boolean);

    const [destinations, guides, hikes] = await Promise.all([
      destinationIds.length ? prisma.destination.findMany({ where: { id: { in: destinationIds } } }) : Promise.resolve([]),
      guideProfileIds.length
        ? prisma.guideProfile.findMany({ where: { id: { in: guideProfileIds } }, include: { user: { select: { name: true, username: true } } } })
        : Promise.resolve([]),
      hikeIds.length
        ? prisma.hike.findMany({ where: { id: { in: hikeIds } }, include: { destination: { select: { name: true } } } })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({ destinations, guides, hikes });
  });
}

/** Toggles a favorite on/off for the current user. Returns { favorited: boolean }. */
export async function POST(req: NextRequest) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const input = toggleFavoriteSchema.parse(await req.json());

    const existing = await prisma.favorite.findFirst({
      where: {
        userId: user.id,
        type: input.type,
        destinationId: input.destinationId ?? null,
        guideProfileId: input.guideProfileId ?? null,
        hikeId: input.hikeId ?? null,
      },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }

    await prisma.favorite.create({
      data: {
        userId: user.id,
        type: input.type,
        destinationId: input.destinationId,
        guideProfileId: input.guideProfileId,
        hikeId: input.hikeId,
      },
    });
    return NextResponse.json({ favorited: true });
  });
}