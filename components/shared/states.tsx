import { AlertTriangle, Compass, Loader2, LucideIcon, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16 text-stone-500", className)} role="status">
      <Loader2 className="h-6 w-6 animate-spin text-forest-600" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Compass,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center", className)}>
      <div className="rounded-full bg-forest-100 p-3">
        <Icon className="h-6 w-6 text-forest-700" aria-hidden />
      </div>
      <h3 className="font-display text-lg font-semibold text-forest-950">{title}</h3>
      {description && <p className="max-w-sm text-sm text-stone-600">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger-100 bg-danger-100/40 px-6 py-16 text-center", className)}>
      <div className="rounded-full bg-danger-100 p-3">
        <AlertTriangle className="h-6 w-6 text-danger-500" aria-hidden />
      </div>
      <h3 className="font-display text-lg font-semibold text-forest-950">{title}</h3>
      <p className="max-w-sm text-sm text-stone-600">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function UnauthorizedState({ description = "Sign in to continue." }: { description?: string }) {
  return (
    <EmptyState
      icon={ShieldAlert}
      title="Sign in required"
      description={description}
      action={
        <Button asChild size="sm">
          <a href="/login">Sign in</a>
        </Button>
      }
    />
  );
}
