// Layered gradient + mountain-silhouette art standing in for a photo on each
// destination card, matching the redesign's illustrated look. Cycled by index
// rather than tied to specific place names, since destinations are real DB rows.
const VARIANTS = [
  { gradient: "linear-gradient(to bottom, #22333d 0%, #3a5560 58%, #4c6a6a 100%)" },
  { gradient: "linear-gradient(to bottom, #2e2418 0%, #6b4c2a 62%, #8a6435 100%)" },
  { gradient: "linear-gradient(to bottom, #121d26 0%, #24384a 55%, #3a5566 100%)" },
  { gradient: "linear-gradient(to bottom, #24301f 0%, #6d5b32 60%, #a07c44 100%)" },
  { gradient: "linear-gradient(to bottom, #1a2a1d 0%, #33472f 55%, #55704a 100%)" },
  { gradient: "linear-gradient(to bottom, #16262a 0%, #2f4a49 58%, #4e6d63 100%)" },
];

// Real trek photography for the destinations that have a curated shot; any
// destination not listed here (or added later) falls back to DestinationArt.
const PHOTOS: Record<string, { src: string; alt: string }> = {
  "everest-base-camp": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/View_of_Everest_Base_Camp_Trek.jpg?width=1000",
    alt: "Trekking route towards Everest Base Camp in the Khumbu region",
  },
  "annapurna-base-camp": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Annapurna(abc).jpg?width=1000",
    alt: "Annapurna Sanctuary seen from Annapurna Base Camp",
  },
  "langtang-valley": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Morning_in_Langtang.jpg?width=1000",
    alt: "Morning light over the Langtang valley in Rasuwa, Nepal",
  },
  "poon-hill": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Sunrise_Poonhill.jpg?width=1000",
    alt: "Sunrise over the Annapurna range seen from Poon Hill above Ghorepani",
  },
  "khopra-danda": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Annapurna_South_from_Khopra_Danda.jpg?width=1000",
    alt: "Annapurna South seen from the ridge at Khopra Danda",
  },
  "kanchenjunga-base-camp": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mt_Kangchenjunga_and_Kumbhakarna_01.jpg?width=1000",
    alt: "Kangchenjunga and Kumbhakarna seen from the Kanchenjunga Conservation Area in Taplejung",
  },
};

export function destinationPhoto(slug: string) {
  return PHOTOS[slug] ?? null;
}

export function DestinationArt({ index }: { index: number }) {
  const variant = VARIANTS[index % VARIANTS.length];
  return (
    <div className="absolute inset-0" style={{ background: variant.gradient }}>
      <svg viewBox="0 0 900 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true" className="absolute inset-0 h-full w-full">
        <path d="M0 700 L0 380 L140 250 L260 360 L400 200 L560 370 L700 260 L820 350 L900 290 L900 700 Z" fill="#0d1c0c" opacity=".32" />
        <path d="M0 700 L0 500 L180 420 L320 500 L480 400 L640 500 L800 430 L900 480 L900 700 Z" fill="#0d1c0c" opacity=".62" />
      </svg>
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,28,12,.72),rgba(13,28,12,0)_55%)]" />
    </div>
  );
}
