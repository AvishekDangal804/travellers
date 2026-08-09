"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarInput } from "@/components/shared/rating";
import type { ReviewTargetType } from "@/types/enums";

export function ReviewForm({
  targetType,
  targetUserId,
  hikeId,
}: {
  targetType: ReviewTargetType;
  targetUserId?: string;
  hikeId?: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetUserId, hikeId, rating, comment }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Could not submit your review.");
        setSubmitting(false);
        return;
      }
      toast.success("Thanks for your review!");
      setComment("");
      setSubmitting(false);
      router.refresh();
    } catch {
      setSubmitting(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border border-stone-200 p-4">
      <StarInput value={rating} onChange={setRating} />
      <Textarea
        rows={3}
        placeholder="Share details of your experience…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        minLength={5}
      />
      <Button type="submit" size="sm" disabled={submitting} className="self-end">
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}