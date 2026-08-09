import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withApiErrors } from "@/lib/api-utils";
import { DIFFICULTIES } from "@/types/enums";

const destinationFiltersSchema = z.object({
  region: z.string().optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  query: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(req: NextRequest) {
  return withApiErrors(async () => {
    const { region, difficulty, query, page, pageSize } = destinationFiltersSchema.parse(
      Object.fromEntries(req.nextUrl.searchParams)
    );

    const where = {
      ...(region ? { region } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { region: { contains: query } },
              { summary: { contains: query } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.destination.findMany({
        where,
        orderBy: { popularity: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.destination.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  });
}