// Fixed, decorative page background shared by every route. Sits behind all
// content (-z-10) so transparent page sections reveal it while opaque cards
// stay readable. Pure SVG + CSS gradients — no external image, adapts to
// light/dark via `currentColor` and the brand tokens.
export function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* Brand-colour glows, softened to a wash. */}
      <div
        className="absolute -left-48 -top-48 h-[34rem] w-[34rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brand-green), transparent 70%)" }}
      />
      <div
        className="absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brand-gold), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-48 left-1/4 h-[30rem] w-[30rem] rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brand-maroon), transparent 70%)" }}
      />

      {/* Faint route-dot grid, tinted to the current foreground so it reads in
          both themes. */}
      <svg className="absolute inset-0 h-full w-full text-foreground opacity-[0.04]">
        <defs>
          <pattern
            id="route-dots"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#route-dots)" />
      </svg>
    </div>
  );
}
