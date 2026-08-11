"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Dark hero section with a single ridge silhouette that drifts slightly on scroll. */
export function ParallaxHero({ children }: { children: ReactNode }) {
  const ridgeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let ticking = false;

    const paint = () => {
      const y = window.scrollY || 0;
      if (ridgeRef.current) ridgeRef.current.style.transform = `translate3d(0,${y * -0.05}px,0)`;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        paint();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    paint();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="top" className="relative flex min-h-[min(760px,100vh)] items-center overflow-hidden bg-forest-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0f1e21_0%,#1c3331_34%,#35513c_68%,#4d6742_100%)]" />
      <div className="absolute left-[66%] top-[30%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(224,168,104,.26),rgba(224,168,104,0)_62%)]" />
      <svg
        ref={ridgeRef}
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[46%] w-full"
      >
        <path d="M0 420 L0 250 L180 120 L330 230 L470 90 L640 250 L790 140 L960 260 L1120 130 L1290 240 L1440 160 L1440 420 Z" fill="#24402f" opacity=".9" />
        <path d="M0 420 L0 300 L200 210 L360 320 L520 200 L700 330 L880 240 L1060 340 L1240 250 L1440 320 L1440 420 Z" fill="#15291a" />
      </svg>
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(13,28,12,.86)_0%,rgba(13,28,12,.55)_46%,rgba(13,28,12,.2)_78%)]" />

      <div className="relative z-[3] mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 py-[clamp(120px,12vh,170px)] sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {children}
      </div>
    </section>
  );
}
