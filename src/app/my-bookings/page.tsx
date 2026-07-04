import { redirect } from "next/navigation";
import { BookingList } from "@/components/bookings/booking-list";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { SupabaseBookingRepository } from "@/data/repositories/supabase-booking.repository";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";
import { listMyBookings } from "@/use-cases/bookings/list-my-bookings";

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });

  // The proxy already guards this route; this is a defensive fallback and
  // gives us the student id for the query.
  if (!user) redirect("/login");

  const bookings = await listMyBookings(
    { bookingRepository: new SupabaseBookingRepository(supabase) },
    user.id,
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">My bookings</h1>
      <BookingList bookings={bookings} />
    </main>
  );
}
