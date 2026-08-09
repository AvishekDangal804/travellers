import { z } from "zod";
import { REPORT_CATEGORIES, REPORT_TARGET_TYPES } from "@/types/enums";

export const createReportSchema = z.object({
  targetType: z.enum(REPORT_TARGET_TYPES),
  targetUserId: z.string().optional(),
  targetHikeId: z.string().optional(),
  category: z.enum(REPORT_CATEGORIES),
  description: z.string().trim().min(10, "Please describe what happened").max(2000),
});
export type CreateReportInput = z.infer<typeof createReportSchema>;

export const reviewReportSchema = z.object({
  reportId: z.string().min(1),
  status: z.enum(["REVIEWED", "RESOLVED", "DISMISSED"]),
  reviewNote: z.string().trim().max(1000).optional(),
});

export const blockUserSchema = z.object({
  userId: z.string().min(1),
});
