import { cn } from "@/components/ui/utils";

// Decorative brand scene for the landing hero: a campus bus setting off down a
// tree-lined road at golden hour, in the crest palette (green + gold + maroon).
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 420"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="A campus shuttle bus setting off down a tree-lined road"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b876c" />
          <stop offset="0.6" stopColor="#3d664e" />
          <stop offset="1" stopColor="#2c4a39" />
        </linearGradient>
        <linearGradient id="hero-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#243a2c" />
          <stop offset="1" stopColor="#1a2c20" />
        </linearGradient>
      </defs>

      <rect width="600" height="420" rx="24" fill="url(#hero-sky)" />

      {/* Sun glow */}
      <circle cx="470" cy="120" r="70" fill="#d9a520" opacity="0.25" />
      <circle cx="470" cy="120" r="44" fill="#d9a520" opacity="0.45" />
      <circle cx="470" cy="120" r="24" fill="#f0c757" opacity="0.9" />

      {/* Distant campus skyline */}
      <g opacity="0.7">
        <rect x="60" y="150" width="46" height="120" rx="3" fill="#2c4a39" />
        <rect x="112" y="120" width="60" height="150" rx="3" fill="#274232" />
        <rect x="132" y="96" width="20" height="30" fill="#274232" />
        <rect x="182" y="168" width="40" height="102" rx="3" fill="#2c4a39" />
      </g>
      {/* Lit windows */}
      {[[124, 138], [144, 138], [124, 164], [144, 164], [72, 170], [196, 186]].map(
        ([x, y], i) => (
          <rect key={i} x={x} y={y} width="8" height="12" rx="1" fill="#d9a520" opacity="0.85" />
        ),
      )}

      {/* Ground */}
      <rect x="0" y="270" width="600" height="150" fill="#31543f" />
      <rect x="0" y="270" width="600" height="150" fill="url(#hero-road)" opacity="0" />

      {/* Road sweeping to the horizon */}
      <path d="M250 270 L286 270 L360 420 L150 420 Z" fill="url(#hero-road)" />
      {[[271, 286], [263, 316], [252, 352], [238, 396]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="10" height="18" rx="2" fill="#d9a520" opacity="0.8" />
      ))}

      {/* Roadside trees */}
      {[
        [40, 300, 1.2], [96, 288, 0.9], [520, 296, 1.15], [566, 284, 0.85],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <rect x="-3" y="20" width="6" height="26" fill="#20321a" />
          <circle cx="0" cy="12" r="18" fill="#2f5a2f" />
          <circle cx="-10" cy="20" r="12" fill="#356534" />
          <circle cx="12" cy="18" r="13" fill="#2b512b" />
        </g>
      ))}

      {/* The bus, front-and-centre */}
      <g transform="translate(340 300)">
        <rect x="0" y="0" width="150" height="70" rx="14" fill="#7a1c2e" />
        <rect x="0" y="10" width="150" height="14" fill="#8f2436" opacity="0.6" />
        {/* Windows */}
        {[12, 46, 80, 114].map((x) => (
          <rect key={x} x={x} y={16} width="26" height="22" rx="4" fill="#cfe0d4" />
        ))}
        {/* Destination sign */}
        <rect x="46" y="-2" width="58" height="6" rx="3" fill="#d9a520" />
        {/* Door */}
        <rect x="126" y="30" width="18" height="34" rx="2" fill="#5c1522" />
        {/* Headlight */}
        <circle cx="150" cy="52" r="4" fill="#f0c757" />
        {/* Wheels */}
        <circle cx="34" cy="72" r="12" fill="#171717" />
        <circle cx="34" cy="72" r="5" fill="#3f3f46" />
        <circle cx="116" cy="72" r="12" fill="#171717" />
        <circle cx="116" cy="72" r="5" fill="#3f3f46" />
      </g>
    </svg>
  );
}
