"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Live countdown to a hold's expiry. When it hits zero, the hold is gone and we
// prompt the student to pick a seat again on the trip page.
export function HoldCountdown({
  expiresAt,
  tripId,
}: {
  expiresAt: Date;
  tripId: string;
}) {
  const target = expiresAt.getTime();
  const [remaining, setRemaining] = useState(() => target - Date.now());

  useEffect(() => {
    const interval = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (remaining <= 0) {
    return (
      <p className="text-sm font-medium text-red-600 dark:text-red-400">
        Your hold has expired.{" "}
        <Link href={`/trips/${tripId}`} className="text-link underline">
          Pick a seat again
        </Link>
        .
      </p>
    );
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <p className="text-sm text-muted" aria-live="polite">
      Hold expires in{" "}
      <span className="font-medium text-foreground">
        {minutes}:{String(seconds).padStart(2, "0")}
      </span>
    </p>
  );
}
