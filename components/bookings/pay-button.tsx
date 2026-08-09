"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PayButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function pay() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/pay`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Payment failed.");
        setSubmitting(false);
        return;
      }
      toast.success("Payment successful — booking confirmed!");
      router.refresh();
    } catch {
      setSubmitting(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Button size="lg" className="w-full" onClick={pay} disabled={submitting}>
      {submitting ? "Processing payment…" : "Pay now (mock)"}
    </Button>
  );
}