"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { closePanel, readPanelState, type PanelState } from "@/lib/panel-nav";
import { RequireAuth } from "@/components/panels/require-auth";
import { HikePanel } from "@/components/panels/hike-panel";
import { DestinationPanel } from "@/components/panels/destination-panel";
import { GuidePanel } from "@/components/panels/guide-panel";
import { ProfilePanel } from "@/components/panels/profile-panel";
import { BookingPanel } from "@/components/panels/booking-panel";
import { BookingsListPanel } from "@/components/panels/bookings-list-panel";
import { FavoritesPanel } from "@/components/panels/favorites-panel";
import { CreateHikePanel } from "@/components/panels/create-hike-panel";
import { BookGuidePanel } from "@/components/panels/book-guide-panel";
import { LoginPanel } from "@/components/panels/login-panel";
import { RegisterPanel } from "@/components/panels/register-panel";
import { DashboardPanel } from "@/components/panels/dashboard-panel";
import { GuideDashboardPanel } from "@/components/panels/guide-dashboard-panel";

// Renders whichever panel the `view`/`id`/`then`/`thenId` query params request,
// on top of the page, instead of navigating to a separate route.
function PanelHostInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = readPanelState(searchParams);

  if (!state) return null;

  const onOpenChange = (open: boolean) => {
    if (!open) closePanel(router, pathname);
  };

  const size = state.view === "login" || state.view === "register" ? "default" : "full";

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent size={size}>{renderPanel(state)}</DialogContent>
    </Dialog>
  );
}

function renderPanel(state: PanelState) {
  switch (state.view) {
    case "hike":
      return <HikePanel id={state.id} />;
    case "destination":
      return <DestinationPanel id={state.id} />;
    case "guide":
      return <GuidePanel id={state.id} />;
    case "profile":
      return <ProfilePanel id={state.id} />;
    case "booking":
      return (
        <RequireAuth then={state}>
          <BookingPanel id={state.id} />
        </RequireAuth>
      );
    case "bookings-list":
      return (
        <RequireAuth then={state}>
          <BookingsListPanel />
        </RequireAuth>
      );
    case "favorites":
      return (
        <RequireAuth then={state}>
          <FavoritesPanel />
        </RequireAuth>
      );
    case "create-hike":
      return (
        <RequireAuth then={state}>
          <CreateHikePanel />
        </RequireAuth>
      );
    case "book-guide":
      return (
        <RequireAuth then={state}>
          <BookGuidePanel id={state.id} />
        </RequireAuth>
      );
    case "login":
      return <LoginPanel then={state.then} />;
    case "register":
      return <RegisterPanel then={state.then} />;
    case "dashboard":
      return (
        <RequireAuth then={state}>
          <DashboardPanel />
        </RequireAuth>
      );
    case "guide-dashboard":
      return (
        <RequireAuth role="GUIDE" then={state}>
          <GuideDashboardPanel />
        </RequireAuth>
      );
    default:
      return null;
  }
}

export function PanelHost() {
  return (
    <Suspense fallback={null}>
      <PanelHostInner />
    </Suspense>
  );
}
