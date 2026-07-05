import { CheckInScanner } from "@/components/staff/check-in-scanner";

export default function StaffCheckInPage() {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">Boarding check-in</h2>
      <p className="mt-1 text-sm text-muted">
        Scan a passenger&apos;s ticket QR, or type the ticket code, to mark them
        boarded. Each ticket can only be checked in once.
      </p>

      <CheckInScanner />
    </section>
  );
}
