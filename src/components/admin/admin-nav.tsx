"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/utils";

const TABS = [
  { href: "/admin/trips", label: "Trips" },
  { href: "/admin/routes", label: "Routes" },
  { href: "/admin/users", label: "Users" },
];

// Pill tab bar for the admin sections, with the active tab highlighted.
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="inline-flex gap-1 rounded-full border border-card-border bg-card p-1 text-sm">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-1.5 font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
