import type { SupabaseClient } from "@supabase/supabase-js";
import { toRouteEntity, type RouteRow } from "@/data/mappers/route.mapper";
import type { Route } from "@/domain/route/route.entity";
import type { NewRouteInput, RouteRepository } from "@/domain/route/route.repository";

const ROUTE_SELECT = "id, origin, destination";

export class SupabaseRouteRepository implements RouteRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listAll(): Promise<Route[]> {
    const { data, error } = await this.supabase
      .from("routes")
      .select(ROUTE_SELECT)
      .order("origin", { ascending: true })
      .returns<RouteRow[]>();

    if (error) throw error;
    return (data ?? []).map(toRouteEntity);
  }

  async create(input: NewRouteInput): Promise<Route> {
    // RLS ("routes are insertable by admin") authorizes this at the DB.
    const { data, error } = await this.supabase
      .from("routes")
      .insert({ origin: input.origin, destination: input.destination })
      .select(ROUTE_SELECT)
      .single<RouteRow>();

    if (error) throw error;
    return toRouteEntity(data);
  }
}
