// Random Adventure compatibility scoring.
//
// This is a transparent, rule-based weighted score — NOT a machine-learning
// or "AI" recommendation. It is intentionally structured as a pure function
// over two comparable preference records so a smarter recommender (e.g. one
// that learns from accepted/declined invites) can be swapped in later
// without touching call sites.

import { EXPERIENCE_LEVELS, type Difficulty, type ExperienceLevel } from "@/types/enums";

export interface MatchCandidate {
  id: string;
  destinationId: string | null;
  preferredDate: Date;
  difficulty: Difficulty;
  experienceLevel: ExperienceLevel;
  ageRangeMin: number | null;
  ageRangeMax: number | null;
  interests: string[];
}

export interface MatchScoreBreakdown {
  destination: number;
  date: number;
  difficulty: number;
  experience: number;
  interests: number;
  total: number;
}

const WEIGHTS = {
  destination: 40,
  date: 25,
  difficulty: 15,
  experience: 10,
  interests: 10,
} as const;

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function experienceDistance(a: ExperienceLevel, b: ExperienceLevel) {
  return Math.abs(EXPERIENCE_LEVELS.indexOf(a) - EXPERIENCE_LEVELS.indexOf(b));
}

export function scoreMatch(a: MatchCandidate, b: MatchCandidate): MatchScoreBreakdown {
  const destination =
    a.destinationId && b.destinationId && a.destinationId === b.destinationId ? WEIGHTS.destination : 0;

  const date = sameDay(a.preferredDate, b.preferredDate) ? WEIGHTS.date : 0;

  const difficulty = a.difficulty === b.difficulty ? WEIGHTS.difficulty : 0;

  const expDistance = experienceDistance(a.experienceLevel, b.experienceLevel);
  const experience = expDistance === 0 ? WEIGHTS.experience : expDistance === 1 ? WEIGHTS.experience / 2 : 0;

  const aInterests = new Set(a.interests.map((i) => i.toLowerCase()));
  const bInterests = new Set(b.interests.map((i) => i.toLowerCase()));
  const shared = [...aInterests].filter((i) => bInterests.has(i));
  const interestUnion = new Set([...aInterests, ...bInterests]).size;
  const interests = interestUnion === 0 ? 0 : Math.round((shared.length / interestUnion) * WEIGHTS.interests);

  const total = Math.round(destination + date + difficulty + experience + interests);

  return { destination, date, difficulty, experience, interests, total };
}

export interface RankedMatch<T extends MatchCandidate> {
  candidate: T;
  score: MatchScoreBreakdown;
}

/** Ranks candidates against `me`, highest compatibility first. */
export function rankMatches<T extends MatchCandidate>(me: MatchCandidate, candidates: T[]): RankedMatch<T>[] {
  return candidates
    .map((candidate) => ({ candidate, score: scoreMatch(me, candidate) }))
    .sort((a, b) => b.score.total - a.score.total);
}
