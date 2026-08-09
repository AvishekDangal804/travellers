import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  size = "sm",
  className,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-medium text-forest-900", className)}>
      <Star className={cn(iconSize, "fill-earth-500 text-earth-500")} aria-hidden />
      <span>{value > 0 ? value.toFixed(1) : "New"}</span>
      {typeof count === "number" && <span className="text-stone-500 font-normal">({count})</span>}
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          className="p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 rounded"
        >
          <Star className={cn("h-7 w-7 transition-colors", star <= value ? "fill-earth-500 text-earth-500" : "text-stone-300")} />
        </button>
      ))}
    </div>
  );
}
