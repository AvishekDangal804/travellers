"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

export function BookGuideForm({ guideProfileId, pricePerDay }: { guideProfileId: string; pricePerDay: number }) {
  const router = useRouter();
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [tripDate, setTripDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideProfileId, numberOfPeople, tripDate: tripDate || undefined }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Could not start this booking.");
        setSubmitting(false);
        return;
      }
      router.push(`/bookings/${body.id}`);
    } catch {
      setSubmitting(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tripDate">Trip date (optional)</Label>
        <Input id="tripDate" type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="numberOfPeople">Number of people</Label>
        <Input
          id="numberOfPeople"
          type="number"
          min={1}
          max={50}
          value={numberOfPeople}
          onChange={(e) => setNumberOfPeople(Math.max(1, Number(e.target.value)))}
        />
      </div>
      <div className="flex items-center justify-between rounded-xl bg-stone-100 px-4 py-3">
        <span className="text-sm text-stone-600">Estimated total</span>
        <span className="font-display text-lg font-semibold text-forest-950">{formatCurrency(pricePerDay * numberOfPeople)}</span>
      </div>
      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Starting booking…" : "Continue to payment"}
      </Button>
    </form>
  );
}