"use client";

import { PendingLink } from "@/components/ui/pending-link";
import { cn } from "@/components/ui/utils";

const navLinkClass =
  "font-medium text-muted transition-colors hover:text-foreground";

export function SiteNavLinks({
  admin,
  staff,
}: {
  admin: boolean;
  staff: boolean;
}) {
  return (
    <>
      <PendingLink href="/trips" showSpinner={false} className={navLinkClass}>
        Trips
      </PendingLink>
      <PendingLink href="/my-bookings" showSpinner={false} className={navLinkClass}>
        My bookings
      </PendingLink>
      {staff ? (
        <>
          <PendingLink href="/staff/trips" showSpinner={false} className={navLinkClass}>
            Boarding
          </PendingLink>
          <PendingLink href="/staff/check-in" showSpinner={false} className={navLinkClass}>
            Scan
          </PendingLink>
        </>
      ) : null}
      {admin ? (
        <PendingLink href="/admin/trips" showSpinner={false} className={navLinkClass}>
          Admin
        </PendingLink>
      ) : null}
    </>
  );
}

export function AdminNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <PendingLink
      href={href}
      showSpinner={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full px-4 py-1.5 font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted hover:text-foreground",
      )}
    >
      {children}
    </PendingLink>
  );
}
