import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-forest-100 text-forest-800",
        earth: "bg-earth-100 text-earth-700",
        outline: "border border-stone-300 text-forest-800",
        success: "bg-forest-600 text-stone-50",
        warning: "bg-earth-500 text-stone-50",
        danger: "bg-danger-100 text-danger-500",
        sky: "bg-sky-200 text-sky-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
