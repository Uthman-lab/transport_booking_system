"use client";

import { usePathname } from "next/navigation";
import { AdminNavLink } from "@/components/layout/pending-nav-links";

const TABS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/trips", label: "Trips" },
  { href: "/admin/routes", label: "Routes" },
  { href: "/admin/users", label: "Users" },
  // Boarding roster lives in the staff area (admins are staff too).
  { href: "/staff/trips", label: "Boarding" },
];

// Pill tab bar for the admin sections, with the active tab highlighted.
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="inline-flex gap-1 rounded-full border border-card-border bg-card p-1 text-sm">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <AdminNavLink key={tab.href} href={tab.href} active={active}>
            {tab.label}
          </AdminNavLink>
        );
      })}
    </nav>
  );
}
