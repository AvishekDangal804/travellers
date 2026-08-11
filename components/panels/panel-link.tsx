"use client";

import type { MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { openPanel, type PanelState } from "@/lib/panel-nav";

type LinkableView = Extract<PanelState, { id: string }>["view"];

/** Opens another panel in place, instead of a full navigation, for links inside a panel. */
export function PanelLink({
  view,
  id,
  className,
  children,
}: {
  view: LinkableView;
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    openPanel(router, { view, id } as PanelState);
  };
  return (
    <a href="#" onClick={onClick} className={className}>
      {children}
    </a>
  );
}
