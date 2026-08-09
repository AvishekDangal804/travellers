import { z } from "zod";
import { DIFFICULTIES, EXPERIENCE_LEVELS } from "@/types/enums";

export const updateHikerProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  bio: z.string().trim().max(1000).optional(),
  location: z.string().trim().max(100).optional(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
  preferredDifficulty: z.enum(DIFFICULTIES).optional(),
  interests: z.array(z.string().trim().min(1)).max(20).optional(),
  image: z.string().url().optional(),
});
export type UpdateHikerProfileInput = z.infer<typeof updateHikerProfileSchema>;
