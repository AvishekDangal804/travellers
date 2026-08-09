import { z } from "zod";
import { FAVORITE_TYPES } from "@/types/enums";

export const toggleFavoriteSchema = z.object({
  type: z.enum(FAVORITE_TYPES),
  destinationId: z.string().optional(),
  guideProfileId: z.string().optional(),
  hikeId: z.string().optional(),
});
export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;
