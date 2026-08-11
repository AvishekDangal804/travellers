import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors, jsonError } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ guideProfileId: string }> }) {
  return withApiErrors(async () => {
    await requireUser();
    const { guideProfileId } = await params;

    const guide = await prisma.guideProfile.findUnique({
      where: { id: guideProfileId },
      include: { user: { select: { name: true, username: true, image: true } } },
    });
    if (!guide || guide.verificationStatus !== "VERIFIED") return jsonError("Guide not found", 404);

    return NextResponse.json(guide);
  });
}
