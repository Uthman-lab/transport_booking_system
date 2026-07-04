// Tiny className joiner. Keeps the UI kit dependency-free (no clsx/tailwind-merge).
// Falsy values are dropped so `cn("a", cond && "b")` reads naturally.
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
