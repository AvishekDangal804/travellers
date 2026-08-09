// Centralized image registry.
//
// Every remote image URL used anywhere in the app should be produced by a
// helper in this file — never inline a URL in a component. That keeps a
// single swap point for when real Nepal trekking photography (via
// Cloudinary/S3, see NEXT_PUBLIC_IMAGE_CDN_BASE in .env.example) replaces
// these development placeholders.
//
// Dev fallback: picsum.photos (seeded, so the same key always returns the
// same image) needs no API key and is reliable for local development.
// Avatars use pravatar.cc, a similar no-key seeded face-photo service.

const PICSUM_BASE = "https://picsum.photos/seed";
const AVATAR_BASE = "https://i.pravatar.cc/300?img";

export function destinationHero(slug: string, w = 1600, h = 900) {
  return `${PICSUM_BASE}/${slug}-hero/${w}/${h}`;
}

export function destinationGallery(slug: string, count = 6, w = 1200, h = 800) {
  return Array.from({ length: count }, (_, i) => `${PICSUM_BASE}/${slug}-gallery-${i + 1}/${w}/${h}`);
}

export function hikeImage(seed: string, w = 1200, h = 800) {
  return `${PICSUM_BASE}/hike-${seed}/${w}/${h}`;
}

function hashToRange(seed: string, max: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % max) + 1;
}

/** Deterministic "photo of a person" avatar — same seed always returns the same face. */
export function avatarUrl(seed: string) {
  return `${AVATAR_BASE}=${hashToRange(seed, 70)}`;
}

export const FALLBACK_IMAGE = "/images/fallback-mountain.svg";
export const FALLBACK_AVATAR = "/images/fallback-avatar.svg";
