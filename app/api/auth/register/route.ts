import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation/auth";
import { withApiErrors, jsonError } from "@/lib/api-utils";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  return withApiErrors(async () => {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    const rate = checkRateLimit(`register:${ip}`, 10, 60_000);
    if (!rate.allowed) return jsonError("Too many attempts. Try again shortly.", 429);

    const body = await req.json();
    const input = registerSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { username: input.username }] },
      select: { email: true, username: true },
    });
    if (existing) {
      const field = existing.email === input.email ? "email" : "username";
      return jsonError(`That ${field} is already taken.`, 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: input.name,
          username: input.username,
          email: input.email,
          passwordHash,
          role: input.role,
        },
      });

      if (input.role === "GUIDE") {
        await tx.guideProfile.create({ data: { userId: created.id } });
      } else {
        await tx.hikerProfile.create({ data: { userId: created.id } });
      }

      return created;
    });

    return NextResponse.json({ id: user.id, email: user.email, username: user.username }, { status: 201 });
  });
}
