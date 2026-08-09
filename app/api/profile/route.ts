import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiErrors, jsonError } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";
import { updateHikerProfileSchema } from "@/lib/validation/profile";
import { updateGuideProfileSchema } from "@/lib/validation/guide";

export async function PATCH(req: NextRequest) {
  return withApiErrors(async () => {
    const user = await requireUser();
    const body = await req.json();

    if (user.role === "GUIDE") {
      const input = updateGuideProfileSchema.parse(body);
      const updated = await prisma.guideProfile.update({ where: { userId: user.id }, data: input });
      return NextResponse.json(updated);
    }

    if (user.role === "HIKER") {
      const input = updateHikerProfileSchema.parse(body);
      const { name, image, ...profileFields } = input;

      const [, updatedProfile] = await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { ...(name ? { name } : {}), ...(image ? { image } : {}) },
        }),
        prisma.hikerProfile.update({ where: { userId: user.id }, data: profileFields }),
      ]);
      return NextResponse.json(updatedProfile);
    }

    return jsonError("Profile editing isn't available for this account type.", 400);
  });
}