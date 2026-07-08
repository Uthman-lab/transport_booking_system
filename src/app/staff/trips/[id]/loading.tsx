import { Skeleton } from "@/components/ui/skeleton";

export default function StaffTripDetailLoading() {
  return (
    <section className="mt-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-6 w-64" />
      <Skeleton className="mt-2 h-4 w-48" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    </section>
  );
}
