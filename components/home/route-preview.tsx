"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/shared/reveal";

// Illustrative sample route — the Hike model has no distance/elevation-gain/
// waypoint fields, so this section shows a representative trail preview
// rather than data tied to a specific real hike.
const WAYPOINTS = [
  { x: 60, y: 330, r: 7, delay: 600, fill: "#faf8f3", label: "Birethanti", labelY: 358, labelSize: 12 },
  { x: 240, y: 215, r: 6, delay: 900, fill: "#82b17c", label: "Tikhedhunga", labelY: 196, labelSize: 12 },
  { x: 380, y: 175, r: 6, delay: 1150, fill: "#82b17c", label: "Ghorepani", labelY: 205, labelSize: 12 },
  { x: 530, y: 96, r: 9, delay: 1400, fill: "#dcb389", label: "Poon Hill · 3 210 m", labelY: 70, labelSize: 13, ring: true },
];

export function RoutePreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const routePathRef = useRef<SVGPathElement>(null);
  const elevPathRef = useRef<SVGPathElement>(null);
  const [dotsVisible, setDotsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDotsVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (routePathRef.current) routePathRef.current.style.strokeDashoffset = "0";
        if (elevPathRef.current) elevPathRef.current.style.strokeDashoffset = "0";
        setDotsVisible(true);
        io.disconnect();
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="map" className="overflow-hidden bg-forest-950 py-24">
      <div ref={sectionRef} className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-[minmax(280px,1fr)_minmax(360px,1.35fr)] lg:px-8">
        <Reveal>
          <div className="text-xs font-semibold uppercase tracking-[.16em] text-forest-300">Trail map</div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">Ghorepani &amp; Poon Hill</h2>
          <p className="mt-3.5 max-w-md text-base leading-relaxed text-stone-300">
            Each trail page draws the route stage by stage, with the overnight stops and the elevation you&apos;ll gain between
            them. This is the four-day loop from Birethanti.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-7">
            <div>
              <dt className="text-[11px] uppercase tracking-[.14em] text-forest-300">Distance</dt>
              <dd className="mt-1.5 font-display text-2xl text-stone-50">42 km</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[.14em] text-forest-300">Ascent</dt>
              <dd className="mt-1.5 font-display text-2xl text-stone-50">2 340 m</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[.14em] text-forest-300">Nights</dt>
              <dd className="mt-1.5 font-display text-2xl text-stone-50">3 teahouse</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-3xl border border-forest-200/20 bg-[linear-gradient(160deg,#142b13,#0d1c0c)] p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,.9)]">
            <svg viewBox="0 0 620 380" className="block w-full h-auto" role="img" aria-label="Topographic route map from Ghorepani to Poon Hill">
              <g stroke="#3f7c37" fill="none" strokeWidth="1" opacity=".3">
                <path d="M20 300 C 130 250, 200 320, 300 270 S 470 210, 600 250" />
                <path d="M20 250 C 140 200, 210 275, 310 220 S 470 160, 600 200" />
                <path d="M40 200 C 150 155, 225 225, 320 170 S 465 115, 590 150" />
                <path d="M70 150 C 170 115, 245 175, 335 125 S 455 75, 560 105" />
                <path d="M120 105 C 200 80, 265 125, 345 85 S 440 45, 520 65" />
              </g>
              <path
                d="M60 330 C 150 300, 165 235, 240 215 S 340 235, 380 175 S 445 120, 530 96"
                fill="none"
                stroke="rgba(220,179,137,.18)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                ref={routePathRef}
                d="M60 330 C 150 300, 165 235, 240 215 S 340 235, 380 175 S 445 120, 530 96"
                fill="none"
                stroke="#dcb389"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="1"
                strokeDashoffset="1"
                pathLength={1}
                style={{ transition: "stroke-dashoffset 2.1s cubic-bezier(.4,0,.2,1)" }}
              />
              <g>
                {WAYPOINTS.map((w) => (
                  <g
                    key={w.label}
                    className="transition-all duration-500"
                    style={{
                      opacity: dotsVisible ? 1 : 0,
                      transform: dotsVisible ? "scale(1)" : "scale(.5)",
                      transitionDelay: dotsVisible ? `${w.delay}ms` : "0ms",
                      transformOrigin: `${w.x}px ${w.y}px`,
                      transitionTimingFunction: "cubic-bezier(.34,1.5,.64,1)",
                    }}
                  >
                    <circle cx={w.x} cy={w.y} r={w.r} fill={w.fill} />
                    {w.ring && <circle cx={w.x} cy={w.y} r={16} fill="none" stroke="rgba(220,179,137,.45)" />}
                    <text
                      x={w.x}
                      y={w.labelY}
                      textAnchor="middle"
                      fontFamily="Archivo, sans-serif"
                      fontSize={w.labelSize}
                      fontWeight={w.ring ? 600 : 400}
                      fill={w.ring ? "#faf8f3" : "#aecdaa"}
                    >
                      {w.label}
                    </text>
                  </g>
                ))}
              </g>
            </svg>
            <div className="mt-2 border-t border-forest-200/20 pt-4">
              <div className="mb-2.5 text-[11px] uppercase tracking-[.14em] text-forest-300">Elevation profile</div>
              <svg viewBox="0 0 620 90" preserveAspectRatio="none" className="block h-[70px] w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="tl-elev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3f7c37" stopOpacity=".55" />
                    <stop offset="100%" stopColor="#3f7c37" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 78 L60 70 L130 62 L200 46 L270 52 L340 30 L410 38 L480 16 L550 24 L620 10 L620 90 L0 90 Z" fill="url(#tl-elev)" />
                <path
                  ref={elevPathRef}
                  d="M0 78 L60 70 L130 62 L200 46 L270 52 L340 30 L410 38 L480 16 L550 24 L620 10"
                  fill="none"
                  stroke="#aecdaa"
                  strokeWidth="2"
                  strokeDasharray="1"
                  strokeDashoffset="1"
                  pathLength={1}
                  style={{ transition: "stroke-dashoffset 2.1s cubic-bezier(.4,0,.2,1)" }}
                />
              </svg>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
