import { cn } from "@/components/ui/utils";

type ContainerProps = {
  /** `wide` for lists/dashboards, `prose` for reading width, `narrow` for forms. */
  width?: "wide" | "prose" | "narrow";
  className?: string;
  children: React.ReactNode;
};

const WIDTHS = {
  wide: "max-w-6xl",
  prose: "max-w-3xl",
  narrow: "max-w-md",
} as const;

// Centered, responsively-padded page column. Replaces the ad-hoc
// `mx-auto max-w-3xl px-6` sprinkled across pages so widths stay consistent.
export function Container({ width = "wide", className, children }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-6", WIDTHS[width], className)}>
      {children}
    </div>
  );
}
