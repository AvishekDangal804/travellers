"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { BookGuideForm } from "@/components/bookings/book-guide-form";
import { usePanelFetch } from "@/components/panels/use-panel-fetch";
import { initials, formatCurrency } from "@/lib/utils";

interface GuideForBooking {
  id: string;
  pricePerDay: number;
  verificationStatus: string;
  user: { name: string; username: string; image: string | null };
}

export function BookGuidePanel({ id }: { id: string }) {
  const { data: guide, loading, error, reload } = usePanelFetch<GuideForBooking>(`/api/book/guide/${id}`);

  if (loading) return <LoadingState label="Loading guide…" />;
  if (error || !guide) return <ErrorState title="Couldn't load this guide" description={error ?? undefined} onRetry={reload} />;

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Book {guide.user.name}</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-stone-600">Review the details below, then continue to a mock payment.</p>

      <Card className="mt-6">
        <CardContent className="flex items-center gap-3 pt-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src={guide.user.image ?? undefined} alt={guide.user.name} />
            <AvatarFallback>{initials(guide.user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-forest-950">{guide.user.name}</p>
            <p className="text-sm text-stone-500">{formatCurrency(guide.pricePerDay)} / day</p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 pb-6">
        <BookGuideForm guideProfileId={guide.id} pricePerDay={guide.pricePerDay} />
      </div>
    </div>
  );
}
