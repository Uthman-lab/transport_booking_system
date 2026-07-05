// Admin analytics for demand, occupancy, and revenue. All monetary values are
// in GHS; "sold" seats and revenue count confirmed bookings only.

// A single day in the booking/revenue trend. `date` is an ISO calendar date
// (YYYY-MM-DD, UTC) so it is stable to render without timezone drift.
export type DailyPoint = {
  date: string;
  bookings: number;
  revenueGhs: number;
};

// Aggregated performance of one route across all its (non-cancelled) trips.
export type RouteMetric = {
  routeId: string;
  origin: string;
  destination: string;
  trips: number;
  capacity: number;
  seatsSold: number;
  revenueGhs: number;
  waitlistWaiting: number;
};

export type AdminDashboard = {
  totalRevenueGhs: number;
  seatsSold: number;
  capacity: number;
  totalTrips: number;
  activeTrips: number;
  waitlistWaiting: number;
  routes: RouteMetric[];
  daily: DailyPoint[];
};

// Fraction of offered seats that have been sold, in [0, 1]. Pure rule so the
// UI never divides by zero: an empty schedule reads as 0% occupancy.
export function occupancyRate(seatsSold: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(seatsSold / capacity, 1);
}

// Peak point in a trend, used to scale bar heights. Returns 0 for an empty or
// all-zero series so callers can guard division themselves.
export function peakRevenue(daily: DailyPoint[]): number {
  return daily.reduce((max, point) => Math.max(max, point.revenueGhs), 0);
}

// An empty dashboard — used when the RPC returns no data (e.g. a non-admin
// caller gets null). Keeps the UI total-safe instead of crashing on undefined.
export function emptyDashboard(): AdminDashboard {
  return {
    totalRevenueGhs: 0,
    seatsSold: 0,
    capacity: 0,
    totalTrips: 0,
    activeTrips: 0,
    waitlistWaiting: 0,
    routes: [],
    daily: [],
  };
}
