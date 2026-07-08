"use client";

import { PendingLink } from "@/components/ui/pending-link";
import { cn } from "@/components/ui/utils";

const linkClass =
  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors";

export function BookingActionLink({
  href,
  variant,
  children,
}: {
  href: string;
  variant: "primary" | "outline";
  children: React.ReactNode;
}) {
  return (
    <PendingLink
      href={href}
      showSpinner={false}
      className={cn(
        linkClass,
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:bg-primary-hover"
          : "border border-card-border hover:bg-card",
      )}
    >
      {children}
    </PendingLink>
  );
}
