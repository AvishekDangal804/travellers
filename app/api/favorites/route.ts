import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { withApiErrors } from "@/lib/api-utils";
import { toggleFavoriteSchema } from "@/lib/validation/favorite";

export async function GET() {
  return withApiErrors(async () => {
    const user = await requireUser();
    const favorites = await prisma.favorite.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(favorites);
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