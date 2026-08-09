import { z } from "zod";

export const guideVerificationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  idType: z.string().trim().min(2).max(50),
  idNumber: z.string().trim().min(2).max(50),
  experienceDescription: z.string().trim().min(20, "Describe your guiding experience in more detail").max(3000),
  certifications: z.array(z.string().trim().min(1)).max(20).default([]),
  documents: z.array(z.string().url()).max(10).default([]),
  emergencyContactName: z.string().trim().min(2).max(100),
  emergencyContactPhone: z.string().trim().min(6).max(20),
  languages: z.array(z.string().trim().min(1)).min(1, "Add at least one language").max(15),
  specialties: z.array(z.string().trim().min(1)).min(1, "Add at least one specialty").max(15),
});
export type GuideVerificationInput = z.infer<typeof guideVerificationSchema>;

export const verificationDecisionSchema = z.object({
  guideVerificationId: z.string().min(1),
  decision: z.enum(["VERIFIED", "REJECTED"]),
  reviewNote: z.string().trim().max(1000).optional(),
});
export type VerificationDecisionInput = z.infer<typeof verificationDecisionSchema>;

export const updateGuideProfileSchema = z.object({
  bio: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(100).optional(),
  experienceYears: z.coerce.number().int().min(0).max(80).optional(),
  languages: z.array(z.string().trim().min(1)).max(15).optional(),
  specialties: z.array(z.string().trim().min(1)).max(15).optional(),
  destinationsCovered: z.array(z.string().trim().min(1)).max(30).optional(),
  pricePerDay: z.coerce.number().int().min(0).max(10_000_000).optional(),
  gallery: z.array(z.string().url()).max(20).optional(),
});
export type UpdateGuideProfileInput = z.infer<typeof updateGuideProfileSchema>;

export const availabilitySchema = z.object({
  date: z.coerce.date(),
  isAvailable: z.boolean().default(true),
  note: z.string().trim().max(200).optional(),
});
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
