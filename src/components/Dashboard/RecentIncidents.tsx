import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { formatDistanceToNow } from "date-fns";
import { EyeIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { useIncidents } from "@/hooks/use-incidents";

const RecentIncidents = () => {
  const {
    data: incidents = [],
    isLoading,
    error,
  } = useIncidents();

  const recentIncidents = incidents.slice(0, 5);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <Badge className="security-badge-critical">
            Critical
          </Badge>
        );

      case "high":
        return (
          <Badge className="security-badge-high">
            High
          </Badge>
        );

      case "medium":
        return (
          <Badge className="security-badge-medium">
            Medium
          </Badge>
        );

      case "low":
        return (
          <Badge className="security-badge-low">
            Low
          </Badge>
        );

      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reported":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            Reported
          </Badge>
        );

      case "investigating":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          >
            Investigating
          </Badge>
        );

      case "contained":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          >
            Contained
          </Badge>
        );

      case "resolved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            Resolved
          </Badge>
        );

      case "closed":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          >
            Closed
          </Badge>
        );

      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading incidents...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load incidents.
      </div>
    );
  }

  if (recentIncidents.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No incidents have been reported yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reported</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {recentIncidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="font-medium">
                INC-
                {String(incident.incident_number).padStart(
                  6,
                  "0"
                )}
              </TableCell>

              <TableCell>
                {incident.title}
              </TableCell>

              <TableCell className="capitalize">
                {incident.type.replace("_", " ")}
              </TableCell>

              <TableCell>
                {getSeverityBadge(incident.severity)}
              </TableCell>

              <TableCell>
                {getStatusBadge(incident.status)}
              </TableCell>

              <TableCell>
                {formatDistanceToNow(
                  new Date(incident.created_at),
                  {
                    addSuffix: true,
                  }
                )}
              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link
                    to={`/incidents/${incident.id}`}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentIncidents;