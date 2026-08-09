import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors, jsonError } from "@/lib/api-utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrors(async () => {
    const { id } = await params;

    const hike = await prisma.hike.findUnique({
      where: { id },
      include: {
        destination: { select: { name: true, slug: true, region: true, difficulty: true } },
        host: { select: { id: true, name: true, username: true, image: true } },
        participants: {
          where: { status: "JOINED" },
          include: { user: { select: { id: true, name: true, username: true, image: true } } },
        },
        _count: { select: { participants: { where: { status: "JOINED" } } } },
      },
    });

    if (!hike) return jsonError("Hike not found", 404);

    return NextResponse.json(hike);
  });
}