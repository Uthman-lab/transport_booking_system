import Image from "next/image";
import {
  DestinationScene,
  sceneFor,
} from "@/components/graphics/destination-scene";
import { cn } from "@/components/ui/utils";

// ── Photo drop-in slot ───────────────────────────────────────────────────────
// Register a real photo per destination here and it takes over automatically;
// with no entry, the on-brand SVG scene is used as the fallback. To add one:
//   1. drop a file at  public/img/destinations/<slug>.jpg   (slug = lowercased,
//      spaces → "-", e.g. "City Center" → "city-center")
//   2. add a line below, e.g.  "city-center": "/img/destinations/city-center.jpg"
// Curated Unsplash/Pexels shots are ideal; keyword-random sources are not.
const PHOTOS: Record<string, string> = {
  // "city-center": "/img/destinations/city-center.jpg",
  // "airport": "/img/destinations/airport.jpg",
  // "mega-mall": "/img/destinations/mega-mall.jpg",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Fills its (positioned, sized) parent like a cover image. Renders a real photo
// when one is registered, otherwise the illustrated scene.
export function DestinationMedia({
  destination,
  className,
}: {
  destination: string;
  className?: string;
}) {
  const photo = PHOTOS[slugify(destination)];

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {photo ? (
        <Image
          src={photo}
          alt={`View of ${destination}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      ) : (
        <DestinationScene variant={sceneFor(destination)} />
      )}
      {/* Bottom scrim so overlaid text stays legible on any image/scene. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
    </div>
  );
}
