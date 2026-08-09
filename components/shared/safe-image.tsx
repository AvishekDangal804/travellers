"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { FALLBACK_IMAGE } from "@/lib/images";

/** next/image wrapper that swaps to a local placeholder if the remote image fails to load, so a dead URL never breaks the layout. */
export function SafeImage({ src, fallback = FALLBACK_IMAGE, alt, ...props }: ImageProps & { fallback?: string }) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <Image
      {...props}
      alt={alt}
      src={currentSrc}
      onError={() => setCurrentSrc(fallback)}
    />
  );
}
