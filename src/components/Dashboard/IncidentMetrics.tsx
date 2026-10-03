import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useIncidents } from "@/hooks/use-incidents";

const IncidentMetrics = () => {
  const {
    data: incidents = [],
    isLoading,
    error,
  } = useIncidents();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item}>
            <CardContent className="pt-6">
              <div className="h-28 animate-pulse rounded-lg bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="pt-6 text-center text-red-500">
          Failed to load incident metrics.
        </CardContent>
      </Card>
    );
  }

  const totalIncidents = incidents.length;

  const openIncidents = incidents.filter((incident) =>
    ["reported", "investigating", "contained"].includes(
      incident.status
    )
  ).length;

  const criticalIncidents = incidents.filter(
    (incident) => incident.severity === "critical"
  ).length;

  const thirtyDaysAgo =
    Date.now() - 30 * 24 * 60 * 60 * 1000;

  const resolvedLast30Days = incidents.filter(
    (incident) =>
      incident.status === "resolved" &&
      new Date(
        incident.resolved_at ?? incident.updated_at
      ).getTime() >= thirtyDaysAgo
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="stat-card bg-blue-50 dark:bg-blue-900/20">
            <Clock className="h-8 w-8 text-primary mb-2" />

            <div className="stat-value text-primary">
              {totalIncidents}
            </div>

            <div className="stat-label">
              Total Incidents
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="stat-card bg-amber-50 dark:bg-amber-900/20">
            <AlertTriangle className="h-8 w-8 text-security-medium mb-2" />

            <div className="stat-value text-security-medium">
              {openIncidents}
            </div>

            <div className="stat-label">
              Open Incidents
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="stat-card bg-red-50 dark:bg-red-900/20">
            <ShieldAlert className="h-8 w-8 text-security-high mb-2" />

            <div className="stat-value text-security-high">
              {criticalIncidents}
            </div>

            <div className="stat-label">
              Critical Incidents
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="stat-card bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-8 w-8 text-security-low mb-2" />

            <div className="stat-value text-security-low">
              {resolvedLast30Days}
            </div>

            <div className="stat-label">
              Resolved (30 days)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentMetrics;