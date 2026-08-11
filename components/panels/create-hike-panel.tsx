"use client";

import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { CreateHikeForm } from "@/components/hikes/create-hike-form";
import { usePanelFetch } from "@/components/panels/use-panel-fetch";

interface DestinationOption {
  id: string;
  name: string;
  region: string;
}

export function CreateHikePanel() {
  const { data, loading, error, reload } = usePanelFetch<{ items: DestinationOption[] }>("/api/destinations?pageSize=50");

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Host a hike</DialogTitle>
        <DialogDescription>Organize a group hike and find fellow trekkers to join you.</DialogDescription>
      </DialogHeader>

      {loading && <LoadingState label="Loading destinations…" />}
      {!loading && (error || !data) && <ErrorState title="Couldn't load destinations" description={error ?? undefined} onRetry={reload} />}
      {!loading && data && (
        <div className="pb-6">
          <CreateHikeForm destinations={data.items} />
        </div>
      )}
    </div>
  );
}
