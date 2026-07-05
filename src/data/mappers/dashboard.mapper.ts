import type {
  AdminDashboard,
  DailyPoint,
  RouteMetric,
} from "@/domain/dashboard/dashboard.entity";
import { emptyDashboard } from "@/domain/dashboard/dashboard.entity";

// Shape of the jsonb returned by get_admin_dashboard. Keys are camelCase (built
// by jsonb_build_object); numeric aggregates may arrive as JS numbers, so every
// field is coerced with Number() to be safe against string encodings.
export type DashboardRow = {
  summary: {
    totalRevenueGhs: number;
    seatsSold: number;
    capacity: number;
    totalTrips: number;
    activeTrips: number;
    waitlistWaiting: number;
  };
  routes: Array<{
    routeId: string;
    origin: string;
    destination: string;
    trips: number;
    capacity: number;
    seatsSold: number;
    revenueGhs: number;
    waitlistWaiting: number;
  }>;
  daily: Array<{
    date: string;
    bookings: number;
    revenueGhs: number;
  }>;
};

function toRouteMetric(row: DashboardRow["routes"][number]): RouteMetric {
  return {
    routeId: row.routeId,
    origin: row.origin,
    destination: row.destination,
    trips: Number(row.trips),
    capacity: Number(row.capacity),
    seatsSold: Number(row.seatsSold),
    revenueGhs: Number(row.revenueGhs),
    waitlistWaiting: Number(row.waitlistWaiting),
  };
}

function toDailyPoint(row: DashboardRow["daily"][number]): DailyPoint {
  return {
    date: row.date,
    bookings: Number(row.bookings),
    revenueGhs: Number(row.revenueGhs),
  };
}

// The RPC returns null for a non-admin caller; fall back to an empty dashboard.
export function toAdminDashboard(row: DashboardRow | null): AdminDashboard {
  if (!row) return emptyDashboard();

  return {
    totalRevenueGhs: Number(row.summary.totalRevenueGhs),
    seatsSold: Number(row.summary.seatsSold),
    capacity: Number(row.summary.capacity),
    totalTrips: Number(row.summary.totalTrips),
    activeTrips: Number(row.summary.activeTrips),
    waitlistWaiting: Number(row.summary.waitlistWaiting),
    routes: (row.routes ?? []).map(toRouteMetric),
    daily: (row.daily ?? []).map(toDailyPoint),
  };
}
