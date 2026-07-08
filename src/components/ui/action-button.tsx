"use client";

import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pending?: boolean;
  pendingText?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ActionButton({
  children,
  pending = false,
  pendingText,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: ActionButtonProps) {
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {pending ? <Spinner className="h-4 w-4" /> : null}
      {pending ? (pendingText ?? `${children}…`) : children}
    </button>
  );
}
