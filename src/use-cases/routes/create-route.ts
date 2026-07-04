import type { Route } from "@/domain/route/route.entity";
import type { NewRouteInput, RouteRepository } from "@/domain/route/route.repository";
import { err, ok, type Result } from "@/domain/shared/result";

export type CreateRouteDeps = {
  routeRepository: RouteRepository;
};

export async function createRoute(
  { routeRepository }: CreateRouteDeps,
  input: NewRouteInput,
): Promise<Result<Route, Error>> {
  const origin = input.origin.trim();
  const destination = input.destination.trim();

  // Only guard against blank endpoints — a route needs both. Anything else
  // (including loop routes where origin === destination) is allowed: admins can
  // add whatever routes they want.
  if (!origin || !destination) {
    return err(new Error("Origin and destination are required."));
  }

  try {
    return ok(await routeRepository.create({ origin, destination }));
  } catch (cause) {
    return err(new Error("Could not create the route.", { cause }));
  }
}
