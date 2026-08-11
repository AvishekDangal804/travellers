// Client-side "routing" for the single-page app: panels are switched via the
// `view`/`id`/`then`/`thenId` query params on `/` instead of real navigation,
// so they stay shareable/back-button-friendly without being separate routes.

export type PanelView =
  | "hike"
  | "destination"
  | "guide"
  | "profile"
  | "booking"
  | "bookings-list"
  | "favorites"
  | "create-hike"
  | "book-guide"
  | "login"
  | "register"
  | "dashboard"
  | "guide-dashboard";

export type PanelState =
  | { view: "hike"; id: string }
  | { view: "destination"; id: string } // id = slug
  | { view: "guide"; id: string } // id = username
  | { view: "profile"; id: string } // id = username
  | { view: "booking"; id: string }
  | { view: "bookings-list" }
  | { view: "favorites" }
  | { view: "create-hike" }
  | { view: "book-guide"; id: string } // id = guideProfileId
  | { view: "login"; then?: PanelState }
  | { view: "register"; then?: PanelState }
  | { view: "dashboard" }
  | { view: "guide-dashboard" };

interface PanelRouter {
  push: (href: string, options?: { scroll?: boolean }) => void;
  replace: (href: string, options?: { scroll?: boolean }) => void;
}

export function buildPanelUrl(state: PanelState): string {
  const params = new URLSearchParams();
  params.set("view", state.view);
  if ("id" in state) params.set("id", state.id);
  if ((state.view === "login" || state.view === "register") && state.then) {
    params.set("then", state.then.view);
    if ("id" in state.then) params.set("thenId", state.then.id);
  }
  return `?${params.toString()}`;
}

export function openPanel(router: PanelRouter, state: PanelState) {
  router.push(buildPanelUrl(state), { scroll: false });
}

export function closePanel(router: PanelRouter, pathname: string) {
  router.replace(pathname, { scroll: false });
}

/** Parses the current search params into a PanelState, or null if no panel is open. */
export function readPanelState(searchParams: URLSearchParams): PanelState | null {
  const view = searchParams.get("view") as PanelView | null;
  if (!view) return null;
  const id = searchParams.get("id") ?? "";

  if (view === "login" || view === "register") {
    const thenView = searchParams.get("then") as PanelView | null;
    const thenId = searchParams.get("thenId") ?? "";
    const then = thenView ? readPanelState(new URLSearchParams({ view: thenView, id: thenId })) : undefined;
    return { view, then: then ?? undefined } as PanelState;
  }

  return { view, id } as PanelState;
}
