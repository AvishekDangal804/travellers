import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";
import { createHikeSchema, hikeFiltersSchema } from "@/lib/validation/hike";

export async function GET(req: NextRequest) {
  return withApiErrors(async () => {
    const { destinationId, difficulty, minPrice, maxPrice, dateFrom, dateTo, query, page, pageSize } =
      hikeFiltersSchema.parse(Object.fromEntries(req.nextUrl.searchParams));

    const where = {
      status: { in: ["UPCOMING", "FULL"] },
      date: { gte: dateFrom ?? new Date(), ...(dateTo ? { lte: dateTo } : {}) },
      ...(destinationId ? { destinationId } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? { price: { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) } }
        : {}),
      ...(query ? { title: { contains: query } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.hike.findMany({
        where,
        orderBy: { date: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          destination: { select: { name: true, slug: true, region: true } },
          host: { select: { id: true, name: true, username: true, image: true } },
          _count: { select: { participants: { where: { status: "JOINED" } } } },
        },
      }),
      prisma.hike.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  });
}

export async function POST(req: NextRequest) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const input = createHikeSchema.parse(await req.json());

    const destination = await prisma.destination.findUnique({ where: { id: input.destinationId }, select: { id: true } });
    if (!destination) {
      return NextResponse.json({ error: "Choose a valid destination" }, { status: 422 });
    }

    const hike = await prisma.hike.create({
      data: { ...input, hostId: user.id },
    });

    await prisma.conversation.create({
      data: {
        type: "GROUP",
        hikeId: hike.id,
        participants: { create: [{ userId: user.id }] },
      },
    });

    return NextResponse.json(hike, { status: 201 });
  });
}