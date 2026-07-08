import { Skeleton } from "@/components/ui/skeleton";

export default function StaffTripsLoading() {
  return (
    <section className="mt-6">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="mt-2 h-4 w-72" />
      <ul className="mt-4 divide-y divide-card-border rounded-xl border border-card-border bg-card">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className="px-4 py-3">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="mt-2 h-3 w-40" />
          </li>
        ))}
      </ul>
    </section>
  );
}
