"use client";

import { useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PendingLink } from "@/components/ui/pending-link";

// Hamburger menu for the signed-in nav on small screens. The desktop nav lives
// in SiteHeader and is hidden below `md`; this takes over there.
export function MobileMenu({
  admin,
  staff,
  fullName,
}: {
  admin: boolean;
  staff: boolean;
  fullName: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input text-foreground transition-colors hover:bg-accent"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <>
          {/* Click-away backdrop. */}
          <div className="fixed inset-0 z-40" onClick={close} aria-hidden="true" />
          <div className="absolute right-0 top-12 z-50 w-56 rounded-card border border-card-border bg-card p-2 shadow-md">
            <p className="truncate px-3 py-2 text-sm text-muted">{fullName}</p>
            <div className="my-1 h-px bg-card-border" />
            <MobileLink href="/trips" onClick={close}>
              Trips
            </MobileLink>
            <MobileLink href="/my-bookings" onClick={close}>
              My bookings
            </MobileLink>
            {staff && (
              <>
                <MobileLink href="/staff/trips" onClick={close}>
                  Boarding
                </MobileLink>
                <MobileLink href="/staff/check-in" onClick={close}>
                  Scan
                </MobileLink>
              </>
            )}
            {admin && (
              <MobileLink href="/admin/trips" onClick={close}>
                Admin
              </MobileLink>
            )}
            <div className="my-1 h-px bg-card-border" />
            <div className="px-1 py-1">
              <SignOutButton />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <PendingLink
      href={href}
      showSpinner={false}
      onNavigate={onClick}
      className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
    >
      {children}
    </PendingLink>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
