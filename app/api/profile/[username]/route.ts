import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors, jsonError } from "@/lib/api-utils";

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
        role: true,
        hikerProfile: true,
        guideProfile: true,
      },
    });
    if (!user) return jsonError("User not found", 404);

    const [hikesHosted, hikesJoined] = await Promise.all([
      prisma.hike.findMany({
        where: { hostId: user.id, status: { in: ["UPCOMING", "FULL"] } },
        orderBy: { date: "asc" },
        include: { destination: { select: { name: true, slug: true } } },
        take: 6,
      }),
      prisma.hike.findMany({
        where: { status: { in: ["UPCOMING", "FULL"] }, participants: { some: { userId: user.id, status: "JOINED" } } },
        orderBy: { date: "asc" },
        include: { destination: { select: { name: true, slug: true } } },
        take: 6,
      }),
    ]);

    return NextResponse.json({ ...user, hikesHosted, hikesJoined });
  });
}
