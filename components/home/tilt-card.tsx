"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Wraps a card so it tilts toward the cursor on hover — perspective on the outer div, rotation on the inner. */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transition = "transform .12s linear, box-shadow .45s ease";
    card.style.transform = `rotateY(${(px * 9).toFixed(2)}deg) rotateX(${(-py * 9).toFixed(2)}deg) translate3d(0,-6px,0) scale(1.015)`;
    card.style.boxShadow = "0 30px 50px -30px rgba(44,37,26,.65)";
  };

  const onMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = "transform .55s cubic-bezier(.22,.8,.3,1), box-shadow .45s ease";
    card.style.transform = "none";
    card.style.boxShadow = "";
  };

  return (
    <div style={{ perspective: "1100px" }} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <div ref={cardRef} className={cn("[transform-style:preserve-3d]", className)}>
        {children}
      </div>
    </div>
  );
}
