import { cn } from "@/components/ui/utils";

type CardProps = {
  /** Adds a hover lift + border highlight; use for clickable cards. */
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
};

// Elevated surface: rounded, bordered, sits above the cooler page `--surface`.
export function Card({ interactive = false, className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-card-border bg-card shadow-sm",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
