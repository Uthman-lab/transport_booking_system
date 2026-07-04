import type { Route } from "@/domain/route/route.entity";

// Row shape matching public.routes in the init schema migration.
export type RouteRow = {
  id: string;
  origin: string;
  destination: string;
};

export function toRouteEntity(row: RouteRow): Route {
  return {
    id: row.id,
    origin: row.origin,
    destination: row.destination,
  };
}
