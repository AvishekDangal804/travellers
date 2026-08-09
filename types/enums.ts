// Central "enum-like" string unions shared by the Prisma schema (stored as
// String columns for SQLite/Postgres portability), Zod validators, and the
// UI. Keep this file as the single source of truth for these values.

export const ROLES = ["HIKER", "GUIDE", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "SUSPENDED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const EXPERIENCE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const DIFFICULTIES = ["EASY", "MODERATE", "CHALLENGING", "STRENUOUS"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const GUIDE_VERIFICATION_STATUSES = ["PENDING", "VERIFIED", "REJECTED"] as const;
export type GuideVerificationStatus = (typeof GUIDE_VERIFICATION_STATUSES)[number];

export const HIKE_STATUSES = ["UPCOMING", "FULL", "COMPLETED", "CANCELLED"] as const;
export type HikeStatus = (typeof HIKE_STATUSES)[number];

export const HIKE_PARTICIPANT_STATUSES = ["JOINED", "WAITLISTED", "LEFT"] as const;
export type HikeParticipantStatus = (typeof HIKE_PARTICIPANT_STATUSES)[number];

export const ADVENTURE_MATCH_STATUSES = ["ACTIVE", "CLOSED"] as const;
export type AdventureMatchStatus = (typeof ADVENTURE_MATCH_STATUSES)[number];

export const ADVENTURE_GROUP_STATUSES = ["FORMING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export type AdventureGroupStatus = (typeof ADVENTURE_GROUP_STATUSES)[number];

export const GROUP_MEMBER_ROLES = ["ORGANIZER", "MEMBER"] as const;
export type GroupMemberRole = (typeof GROUP_MEMBER_ROLES)[number];

export const GROUP_MEMBER_STATUSES = ["INVITED", "ACCEPTED", "DECLINED"] as const;
export type GroupMemberStatus = (typeof GROUP_MEMBER_STATUSES)[number];

export const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "REFUNDED"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_PROVIDERS = ["MOCK", "KHALTI", "ESEWA"] as const;
export type PaymentProviderName = (typeof PAYMENT_PROVIDERS)[number];

export const REVIEW_TARGET_TYPES = ["GUIDE", "HIKER", "TRIP"] as const;
export type ReviewTargetType = (typeof REVIEW_TARGET_TYPES)[number];

export const FAVORITE_TYPES = ["DESTINATION", "GUIDE", "HIKE"] as const;
export type FavoriteType = (typeof FAVORITE_TYPES)[number];

export const NOTIFICATION_TYPES = [
  "NEW_MESSAGE",
  "HIKE_INVITATION",
  "INVITATION_ACCEPTED",
  "BOOKING_CONFIRMED",
  "BOOKING_CANCELLED",
  "NEW_REVIEW",
  "GUIDE_VERIFICATION_RESULT",
  "ADVENTURE_MATCH",
  "HIKE_REMINDER",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const REPORT_TARGET_TYPES = ["USER", "HIKE", "GUIDE", "REVIEW"] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_CATEGORIES = [
  "HARASSMENT",
  "FAKE_PROFILE",
  "UNSAFE_BEHAVIOR",
  "SCAM",
  "INAPPROPRIATE_CONTENT",
  "OTHER",
] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_STATUSES = ["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const CONVERSATION_TYPES = ["DIRECT", "GROUP", "GUIDE"] as const;
export type ConversationType = (typeof CONVERSATION_TYPES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: "Easy",
  MODERATE: "Moderate",
  CHALLENGING: "Challenging",
  STRENUOUS: "Strenuous",
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};
