import type { Route } from "./route.entity";

export type NewRouteInput = {
  origin: string;
  destination: string;
};

export interface RouteRepository {
  listAll(): Promise<Route[]>;
  create(input: NewRouteInput): Promise<Route>;
}
