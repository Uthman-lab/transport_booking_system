import { Skeleton } from "@/components/ui/skeleton";

export default function BookingDetailLoading() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Skeleton className="h-4 w-32" />
      <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-6 h-10 w-40" />
      </div>
    </main>
  );
}
