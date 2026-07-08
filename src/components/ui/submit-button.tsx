"use client";

import { useFormStatus } from "react-dom";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type SubmitButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  size = "md",
  className,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || props.disabled}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {pending ? <Spinner className="h-4 w-4" /> : null}
      {pending ? (pendingText ?? `${children}…`) : children}
    </button>
  );
}
