import { Container } from "@/components/ui/container";
import { TripCardSkeleton } from "@/components/ui/skeleton";

export default function TripsLoading() {
  return (
    <main className="flex-1 py-12">
      <Container>
        <div className="h-9 w-56 animate-pulse rounded-md bg-surface-2" />
        <div className="mt-2 h-5 w-80 animate-pulse rounded-md bg-surface-2" />
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index}>
              <TripCardSkeleton />
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
