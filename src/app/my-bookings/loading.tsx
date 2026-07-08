import { BookingRowSkeleton } from "@/components/ui/skeleton";

export default function MyBookingsLoading() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="h-8 w-40 animate-pulse rounded-md bg-surface-2" />
      <ul className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index}>
            <BookingRowSkeleton />
          </li>
        ))}
      </ul>
    </main>
  );
}
