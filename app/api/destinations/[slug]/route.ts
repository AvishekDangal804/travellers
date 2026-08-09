import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors, jsonError } from "@/lib/api-utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return withApiErrors(async () => {
    const { slug } = await params;

    const destination = await prisma.destination.findUnique({
      where: { slug },
      include: {
        itinerary: { orderBy: { day: "asc" } },
        trail: true,
        hikes: {
          where: { status: "UPCOMING", date: { gte: new Date() } },
          orderBy: { date: "asc" },
          take: 10,
          include: {
            host: { select: { id: true, name: true, username: true, image: true } },
            _count: { select: { participants: { where: { status: "JOINED" } } } },
          },
        },
      },
    });

    if (!destination) return jsonError("Destination not found", 404);

    return NextResponse.json(destination);
  });
}