"use client";

import { usePathname } from "next/navigation";
import { PendingLink } from "@/components/ui/pending-link";
import { cn } from "@/components/ui/utils";

// The Admin link covers every /admin page; staff links cover their subtrees.
export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/admin/trips") return pathname.startsWith("/admin");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SiteNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = isNavLinkActive(pathname, href);

  return (
    <PendingLink
      href={href}
      showSpinner={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "font-medium transition-colors",
        active
          ? "text-primary underline decoration-2 underline-offset-8"
          : "text-muted hover:text-foreground",
      )}
    >
      {children}
    </PendingLink>
  );
}

export function SiteNavLinks({
  admin,
  staff,
}: {
  admin: boolean;
  staff: boolean;
}) {
  return (
    <>
      <SiteNavLink href="/trips">Trips</SiteNavLink>
      <SiteNavLink href="/my-bookings">My bookings</SiteNavLink>
      {staff ? (
        <>
          <SiteNavLink href="/staff/trips">Boarding</SiteNavLink>
          <SiteNavLink href="/staff/check-in">Scan</SiteNavLink>
        </>
      ) : null}
      {admin ? <SiteNavLink href="/admin/trips">Admin</SiteNavLink> : null}
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
