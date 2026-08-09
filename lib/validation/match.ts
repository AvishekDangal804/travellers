import { z } from "zod";
import { DIFFICULTIES, EXPERIENCE_LEVELS } from "@/types/enums";

export const createMatchSchema = z.object({
  destinationId: z.string().optional(),
  preferredDate: z.coerce.date(),
  difficulty: z.enum(DIFFICULTIES),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  ageRangeMin: z.coerce.number().int().min(13).max(100).optional(),
  ageRangeMax: z.coerce.number().int().min(13).max(100).optional(),
  groupSizePref: z.coerce.number().int().min(2).max(30).default(4),
  interests: z.array(z.string().trim().min(1)).max(15).default([]),
});
export type CreateMatchInput = z.infer<typeof createMatchSchema>;

export const inviteToAdventureSchema = z.object({
  matchId: z.string().min(1),
  inviteeUserId: z.string().min(1),
});

export const respondToInviteSchema = z.object({
  groupId: z.string().min(1),
  response: z.enum(["ACCEPTED", "DECLINED"]),
});
