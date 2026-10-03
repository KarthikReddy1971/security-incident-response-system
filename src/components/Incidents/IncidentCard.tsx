import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Clock,
  Eye,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Incident } from "@/hooks/use-incidents";

interface IncidentCardProps {
  incident: Incident;
}

const IncidentCard = ({ incident }: IncidentCardProps) => {
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

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg">
            {incident.title}
          </CardTitle>

          {getSeverityBadge(incident.severity)}
        </div>

        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <AlertTriangle className="h-3 w-3 mr-1" />

          <span className="capitalize">
            {incident.type.replace("_", " ")}
          </span>

          <span className="mx-2">•</span>

          {getStatusBadge(incident.status)}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm line-clamp-2 mb-3">
          {incident.description}
        </p>

        <div className="flex flex-col space-y-2 text-sm">
          {/* Incident Number */}
          <div className="flex items-center">
            <span className="text-muted-foreground">
              Incident:
            </span>

            <span className="ml-1 font-medium">
              #{incident.incident_number}
            </span>
          </div>

          {/* Reported By */}
          <div className="flex items-center">
            <User className="h-3 w-3 mr-2 text-muted-foreground" />

            <span className="text-muted-foreground">
              Reported by:
            </span>

            <span className="ml-1 font-medium">
              {incident.reported_by
                ? incident.reported_by.slice(0, 8)
                : "Unknown"}
            </span>
          </div>

          {/* Assigned To */}
          {incident.assigned_to && (
            <div className="flex items-center">
              <User className="h-3 w-3 mr-2 text-muted-foreground" />

              <span className="text-muted-foreground">
                Assigned to:
              </span>

              <span className="ml-1 font-medium">
                {incident.assigned_to.slice(0, 8)}
              </span>
            </div>
          )}

          {/* Created Time */}
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-2 text-muted-foreground" />

            <span className="text-muted-foreground">
              Reported:
            </span>

            <span className="ml-1 font-medium">
              {formatDistanceToNow(
                new Date(incident.created_at),
                {
                  addSuffix: true,
                }
              )}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          asChild
        >
          <Link to={`/incidents/${incident.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IncidentCard;