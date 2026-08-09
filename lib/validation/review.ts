import { z } from "zod";
import { REVIEW_TARGET_TYPES } from "@/types/enums";

export const createReviewSchema = z
  .object({
    targetType: z.enum(REVIEW_TARGET_TYPES),
    targetUserId: z.string().optional(),
    hikeId: z.string().optional(),
    bookingId: z.string().optional(),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().min(5, "Share a bit more detail").max(1000),
  })
  .refine((data) => (data.targetType === "TRIP" ? Boolean(data.hikeId) : Boolean(data.targetUserId)), {
    message: "Missing review target",
    path: ["targetType"],
  });
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
