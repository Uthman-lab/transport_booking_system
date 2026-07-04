import { cn } from "@/components/ui/utils";

export type SceneVariant = "city" | "airport" | "mall" | "road";

// Map a free-text destination name to one of the illustrated scenes.
export function sceneFor(destination: string): SceneVariant {
  const d = destination.toLowerCase();
  if (d.includes("airport") || d.includes("terminal")) return "airport";
  if (d.includes("mall") || d.includes("market") || d.includes("shop")) return "mall";
  if (d.includes("city") || d.includes("center") || d.includes("centre") || d.includes("town"))
    return "city";
  return "road";
}

// Original, on-brand vector scenes in the crest palette (green sky, gold
// accents). Zero licensing risk and always available — no network, no CDN.
// `preserveAspectRatio="slice"` makes them behave like a cover photo.
export function DestinationScene({
  variant,
  className,
}: {
  variant: SceneVariant;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4d7860" />
          <stop offset="1" stopColor="#2f5040" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#sky-${variant})`} />
      {/* Soft sun/glow */}
      <circle cx="320" cy="62" r="34" fill="#d9a520" opacity="0.35" />
      <circle cx="320" cy="62" r="20" fill="#d9a520" opacity="0.55" />
      {variant === "city" && <CityScene />}
      {variant === "airport" && <AirportScene />}
      {variant === "mall" && <MallScene />}
      {variant === "road" && <RoadScene />}
    </svg>
  );
}

function CityScene() {
  return (
    <g>
      <rect x="30" y="120" width="42" height="120" fill="#26402f" />
      <rect x="84" y="88" width="52" height="152" fill="#1f3527" />
      <rect x="148" y="140" width="40" height="100" fill="#2b4735" />
      <rect x="200" y="70" width="58" height="170" fill="#1c3123" />
      <rect x="270" y="128" width="46" height="112" fill="#26402f" />
      <rect x="326" y="150" width="44" height="90" fill="#1f3527" />
      {/* Gold-lit windows */}
      {[
        [96, 100], [116, 100], [96, 124], [116, 124], [96, 148], [116, 148],
        [212, 84], [234, 84], [212, 110], [234, 110], [212, 136], [234, 136],
        [40, 136], [56, 136], [282, 144], [298, 144],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="8" height="12" rx="1" fill="#d9a520" opacity="0.85" />
      ))}
    </g>
  );
}

function AirportScene() {
  return (
    <g>
      {/* Terminal */}
      <rect x="20" y="164" width="360" height="76" fill="#1f3527" />
      <rect x="20" y="156" width="360" height="10" rx="4" fill="#2b4735" />
      <path d="M20 164 Q120 138 260 164 Z" fill="#26402f" opacity="0.6" />
      {/* Plane taking off */}
      <g transform="rotate(-18 200 96)">
        <path d="M150 96 L250 88 L268 96 L250 104 Z" fill="#eef1ee" />
        <path d="M214 90 L236 66 L242 70 L226 92 Z" fill="#cfd8d2" />
        <path d="M214 102 L236 126 L242 122 L226 100 Z" fill="#cfd8d2" />
        <circle cx="252" cy="96" r="3" fill="#d9a520" />
      </g>
      {/* Runway lights */}
      {[40, 90, 140, 190, 240, 290, 340].map((x) => (
        <rect key={x} x={x} y={226} width="18" height="4" rx="2" fill="#d9a520" opacity="0.8" />
      ))}
    </g>
  );
}

function MallScene() {
  return (
    <g>
      {/* Storefront block */}
      <rect x="40" y="96" width="320" height="144" rx="6" fill="#1f3527" />
      {/* Awning */}
      <path d="M40 128 h320 v14 l-16 10 -16 -10 -16 10 -16 -10 -16 10 -16 -10 -16 10 -16 -10 -16 10 -16 -10 -16 10 -16 -10 -16 10 -16 -10 -16 10 -16 -10 -16 10 z" fill="#d9a520" opacity="0.85" />
      {/* Windows / display */}
      {[60, 132, 204, 276].map((x) => (
        <rect key={x} x={x} y={168} width="60" height="54" rx="3" fill="#4d7860" opacity="0.7" />
      ))}
      {/* Door */}
      <rect x="182" y="180" width="36" height="60" rx="2" fill="#26402f" />
    </g>
  );
}

function RoadScene() {
  return (
    <g>
      {/* Hills */}
      <path d="M0 200 Q100 150 200 190 T400 180 V240 H0 Z" fill="#26402f" />
      {/* Road */}
      <path d="M150 240 L184 150 L216 150 L250 240 Z" fill="#1c3123" />
      {[
        [198, 160], [199, 186], [200, 214],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="4" height="14" rx="1" fill="#d9a520" opacity="0.85" />
      ))}
      {/* Bus */}
      <g transform="translate(150 120)">
        <rect x="0" y="0" width="70" height="30" rx="6" fill="#7a1c2e" />
        <rect x="8" y="6" width="14" height="10" rx="2" fill="#eef1ee" />
        <rect x="28" y="6" width="14" height="10" rx="2" fill="#eef1ee" />
        <rect x="48" y="6" width="14" height="10" rx="2" fill="#eef1ee" />
        <circle cx="16" cy="32" r="6" fill="#171717" />
        <circle cx="54" cy="32" r="6" fill="#171717" />
      </g>
    </g>
  );
}
