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

  if (!origin || !destination) {
    return err(new Error("Origin and destination are required."));
  }
  if (origin.toLowerCase() === destination.toLowerCase()) {
    return err(new Error("Origin and destination must be different."));
  }

  try {
    return ok(await routeRepository.create({ origin, destination }));
  } catch (cause) {
    return err(new Error("Could not create the route.", { cause }));
  }
}
