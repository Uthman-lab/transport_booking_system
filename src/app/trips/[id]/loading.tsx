import { Skeleton } from "@/components/ui/skeleton";

export default function TripDetailLoading() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-4 h-8 w-72" />
      <Skeleton className="mt-2 h-4 w-96" />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {Array.from({ length: 24 }).map((_, index) => (
            <Skeleton key={index} className="h-11" />
          ))}
        </div>
        <Skeleton className="mt-4 h-10 w-48" />
      </div>
    </main>
  );
}
