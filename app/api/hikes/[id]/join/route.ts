import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors, jsonError } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const { id } = await params;

    const hike = await prisma.hike.findUnique({
      where: { id },
      include: { _count: { select: { participants: { where: { status: "JOINED" } } } } },
    });
    if (!hike) return jsonError("Hike not found", 404);
    if (hike.hostId === user.id) return jsonError("You're already hosting this hike.", 400);
    if (hike.status === "CANCELLED" || hike.status === "COMPLETED") {
      return jsonError("This hike is no longer accepting participants.", 400);
    }

    const existing = await prisma.hikeParticipant.findUnique({
      where: { hikeId_userId: { hikeId: id, userId: user.id } },
    });
    if (existing && existing.status !== "LEFT") {
      return jsonError("You've already joined this hike.", 400);
    }

    const isFull = hike._count.participants >= hike.maxParticipants;
    const status = isFull ? "WAITLISTED" : "JOINED";

    await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.hikeParticipant.update({ where: { id: existing.id }, data: { status, joinedAt: new Date() } });
      } else {
        await tx.hikeParticipant.create({ data: { hikeId: id, userId: user.id, status } });
      }

      if (status === "JOINED" && hike._count.participants + 1 >= hike.maxParticipants) {
        await tx.hike.update({ where: { id }, data: { status: "FULL" } });
      }

      const conversation = await tx.conversation.findUnique({ where: { hikeId: id } });
      if (conversation) {
        await tx.conversationParticipant.upsert({
          where: { conversationId_userId: { conversationId: conversation.id, userId: user.id } },
          create: { conversationId: conversation.id, userId: user.id },
          update: {},
        });
      }
    });

    return NextResponse.json({ status });
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const { id } = await params;

    const participant = await prisma.hikeParticipant.findUnique({
      where: { hikeId_userId: { hikeId: id, userId: user.id } },
    });
    if (!participant || participant.status === "LEFT") {
      return jsonError("You haven't joined this hike.", 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.hikeParticipant.update({ where: { id: participant.id }, data: { status: "LEFT" } });

      const hike = await tx.hike.findUnique({ where: { id } });
      if (hike?.status === "FULL") {
        await tx.hike.update({ where: { id }, data: { status: "UPCOMING" } });

        const nextWaitlisted = await tx.hikeParticipant.findFirst({
          where: { hikeId: id, status: "WAITLISTED" },
          orderBy: { joinedAt: "asc" },
        });
        if (nextWaitlisted) {
          await tx.hikeParticipant.update({ where: { id: nextWaitlisted.id }, data: { status: "JOINED" } });
        }
      }
    });

    return NextResponse.json({ status: "LEFT" });
  });
}