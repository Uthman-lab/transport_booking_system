import { cn } from "@/components/ui/utils";

export type BadgeTone = "neutral" | "green" | "gold" | "maroon";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-accent text-muted",
  green: "bg-primary/10 text-primary",
  gold: "bg-gold-soft text-gold-strong",
  maroon: "bg-maroon-soft text-brand-maroon",
};

// Small status/metadata pill. `gold` for prices, `green`/`maroon` for
// availability and warnings — puts the unused crest colours to work.
export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
