import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withApiErrors } from "@/lib/api-utils";

const guideFiltersSchema = z.object({
  destination: z.string().optional(),
  language: z.string().optional(),
  query: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(req: NextRequest) {
  return withApiErrors(async () => {
    const { destination, language, query, page, pageSize } = guideFiltersSchema.parse(
      Object.fromEntries(req.nextUrl.searchParams)
    );

    // SQLite's Prisma JSON filters don't support array_contains, so destination/language
    // matching happens in-memory below rather than in the `where` clause.
    const where = {
      verificationStatus: "VERIFIED",
      ...(query
        ? { OR: [{ bio: { contains: query } }, { user: { name: { contains: query } } }] }
        : {}),
    };

    const all = await prisma.guideProfile.findMany({
      where,
      orderBy: { ratingAvg: "desc" },
      include: { user: { select: { name: true, username: true, image: true } } },
    });

    const filtered = all.filter((g) => {
      const destinations = Array.isArray(g.destinationsCovered) ? (g.destinationsCovered as string[]) : [];
      const languages = Array.isArray(g.languages) ? (g.languages as string[]) : [];
      if (destination && !destinations.includes(destination)) return false;
      if (language && !languages.includes(language)) return false;
      return true;
    });

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  });
}