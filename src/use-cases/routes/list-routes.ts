import type { Route } from "@/domain/route/route.entity";
import type { RouteRepository } from "@/domain/route/route.repository";

export type ListRoutesDeps = {
  routeRepository: RouteRepository;
};

export async function listRoutes({
  routeRepository,
}: ListRoutesDeps): Promise<Route[]> {
  return routeRepository.listAll();
}
