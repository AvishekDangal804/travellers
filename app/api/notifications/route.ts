import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const limit = Math.min(50, Number(req.nextUrl.searchParams.get("limit")) || 20);

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ notifications });
  });
}