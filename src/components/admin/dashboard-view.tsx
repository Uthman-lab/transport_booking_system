import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  occupancyRate,
  peakRevenue,
  type AdminDashboard,
  type RouteMetric,
} from "@/domain/dashboard/dashboard.entity";

function formatGhs(amount: number): string {
  return `GHS ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

// Short weekday/day label for a YYYY-MM-DD date, rendered without timezone
// drift by pinning to UTC noon.
function formatDayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </Card>
  );
}

function RevenueTrend({ daily }: { daily: AdminDashboard["daily"] }) {
  const peak = peakRevenue(daily);
  const totalBookings = daily.reduce((sum, point) => sum + point.bookings, 0);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Revenue &amp; demand · last 14 days</h3>
        <Badge tone="neutral">{totalBookings} bookings</Badge>
      </div>

      {peak === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No confirmed bookings in the last 14 days.
        </p>
      ) : (
        <div className="mt-6 flex h-40 items-end gap-1.5">
          {daily.map((point) => (
            <div
              key={point.date}
              className="group flex flex-1 flex-col items-center gap-1.5"
              title={`${point.date} · ${formatGhs(point.revenueGhs)} · ${point.bookings} bookings`}
            >
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-primary/80 transition-colors group-hover:bg-primary"
                  style={{ height: `${Math.max((point.revenueGhs / peak) * 100, point.revenueGhs > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="text-[10px] leading-none text-muted">
                {formatDayLabel(point.date)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function RouteRow({ route }: { route: RouteMetric }) {
  const rate = occupancyRate(route.seatsSold, route.capacity);

  return (
    <tr className="border-t border-card-border">
      <td className="py-3 pr-4">
        <p className="font-medium">
          {route.origin} → {route.destination}
        </p>
        <p className="text-xs text-muted">
          {route.trips} {route.trips === 1 ? "trip" : "trips"}
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-accent">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${rate * 100}%` }}
            />
          </div>
          <span className="tabular-nums text-sm">{formatPercent(rate)}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted">
          {route.seatsSold}/{route.capacity} seats
        </p>
      </td>
      <td className="px-4 py-3 text-right tabular-nums font-medium">
        {formatGhs(route.revenueGhs)}
      </td>
      <td className="py-3 pl-4 text-right">
        {route.waitlistWaiting > 0 ? (
          <Badge tone="maroon">{route.waitlistWaiting} waiting</Badge>
        ) : (
          <span className="text-sm text-muted">—</span>
        )}
      </td>
    </tr>
  );
}

export function DashboardView({ dashboard }: { dashboard: AdminDashboard }) {
  const overallOccupancy = occupancyRate(dashboard.seatsSold, dashboard.capacity);

  if (dashboard.totalTrips === 0) {
    return (
      <p className="mt-6 text-muted">
        No trips scheduled yet. Analytics will appear once trips and bookings
        exist.
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="Revenue (confirmed)"
          value={formatGhs(dashboard.totalRevenueGhs)}
          hint={`${dashboard.seatsSold} seats sold`}
        />
        <Kpi
          label="Occupancy"
          value={formatPercent(overallOccupancy)}
          hint={`${dashboard.seatsSold}/${dashboard.capacity} seats offered`}
        />
        <Kpi
          label="Active trips"
          value={String(dashboard.activeTrips)}
          hint={`of ${dashboard.totalTrips} total`}
        />
        <Kpi
          label="Unmet demand"
          value={String(dashboard.waitlistWaiting)}
          hint="students on waitlists"
        />
      </div>

      <RevenueTrend daily={dashboard.daily} />

      <Card className="p-5">
        <h3 className="font-semibold">Route performance</h3>
        {dashboard.routes.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No routes yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-4 font-medium">Route</th>
                  <th className="px-4 pb-2 font-medium">Occupancy</th>
                  <th className="px-4 pb-2 text-right font-medium">Revenue</th>
                  <th className="pb-2 pl-4 text-right font-medium">Demand</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.routes.map((route) => (
                  <RouteRow key={route.routeId} route={route} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
