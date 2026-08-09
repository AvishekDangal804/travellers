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
        guideProfile: {
          include: {
            availability: { where: { date: { gte: new Date() } }, orderBy: { date: "asc" }, take: 30 },
          },
        },
      },
    });

    if (!user?.guideProfile) return jsonError("Guide not found", 404);

    return NextResponse.json(user);
  });
}