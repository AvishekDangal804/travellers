import { z } from "zod";
import { DIFFICULTIES } from "@/types/enums";

export const createHikeSchema = z.object({
  destinationId: z.string().min(1, "Choose a destination"),
  title: z.string().trim().min(4, "Title must be at least 4 characters").max(100),
  description: z.string().trim().min(10, "Tell people what to expect").max(2000),
  date: z.coerce.date().refine((d) => d.getTime() > Date.now() - 86400000, {
    message: "Date must be today or in the future",
  }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24h HH:MM format"),
  meetingPoint: z.string().trim().min(3).max(200),
  difficulty: z.enum(DIFFICULTIES),
  durationHours: z.coerce.number().int().min(1).max(720),
  maxParticipants: z.coerce.number().int().min(1).max(200),
  price: z.coerce.number().int().min(0).max(10_000_000),
  images: z.array(z.string().url()).max(10).default([]),
  requirements: z.array(z.string().trim().min(1)).max(20).default([]),
  equipment: z.array(z.string().trim().min(1)).max(30).default([]),
  safetyNotes: z.string().trim().max(2000).optional().default(""),
});
export type CreateHikeInput = z.infer<typeof createHikeSchema>;

export const joinHikeSchema = z.object({
  hikeId: z.string().min(1),
});

export const hikeFiltersSchema = z.object({
  destinationId: z.string().optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  query: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});
export type HikeFiltersInput = z.infer<typeof hikeFiltersSchema>;
