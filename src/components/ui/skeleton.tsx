import { cn } from "@/components/ui/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-surface-2", className)}
    />
  );
}

export function TripCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card border border-card-border bg-card">
      <Skeleton className="h-36 rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-auto flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function BookingRowSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-card-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-9 w-24" />
    </div>
  );
}

export function AdminPanelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
