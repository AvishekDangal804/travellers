import { z } from "zod";

export const createBookingSchema = z
  .object({
    hikeId: z.string().optional(),
    guideProfileId: z.string().optional(),
    numberOfPeople: z.coerce.number().int().min(1).max(50),
    tripDate: z.coerce.date().optional(),
  })
  .refine((data) => Boolean(data.hikeId) !== Boolean(data.guideProfileId), {
    message: "A booking must reference exactly one hike or one guide",
    path: ["hikeId"],
  });
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const confirmPaymentSchema = z.object({
  bookingId: z.string().min(1),
});
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1),
});
