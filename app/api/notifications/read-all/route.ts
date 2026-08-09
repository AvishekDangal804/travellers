import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";

export async function POST() {
  return withApiErrors(async () => {
    const user = await requireUser();
    await prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
    return NextResponse.json({ ok: true });
  });
}