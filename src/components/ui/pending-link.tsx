"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/components/ui/utils";

type PendingLinkProps = Omit<
  React.ComponentPropsWithoutRef<typeof Link>,
  "onClick"
> & {
  onNavigate?: () => void;
  showSpinner?: boolean;
};

export function PendingLink({
  href,
  children,
  className,
  onNavigate,
  showSpinner = true,
  ...props
}: PendingLinkProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const hrefString = typeof href === "string" ? href : href.pathname ?? "";

  return (
    <Link
      href={href}
      aria-busy={pending || undefined}
      className={cn(
        pending && "pointer-events-none opacity-70",
        className,
      )}
      onClick={(event) => {
        event.preventDefault();
        onNavigate?.();
        startTransition(() => {
          router.push(hrefString);
        });
      }}
      {...props}
    >
      {pending && showSpinner ? (
        <Spinner className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" />
      ) : null}
      {children}
    </Link>
  );
}
