import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import IncidentCard from "./IncidentCard";
import { Link } from "react-router-dom";
import { useIncidents } from "@/hooks/use-incidents";

const IncidentList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: incidents = [], isLoading, error } = useIncidents();

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        incident.title.toLowerCase().includes(query) ||
        incident.description.toLowerCase().includes(query) ||
        incident.incident_number.toString().includes(query);

      const matchesSeverity =
        filterSeverity === "all"
          ? true
          : incident.severity === filterSeverity;

      const matchesStatus =
        filterStatus === "all"
          ? true
          : incident.status === filterStatus;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidents, searchQuery, filterSeverity, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          All Incidents
        </h2>

        <Button asChild>
          <Link to="/incidents/new">
            <Plus className="h-4 w-4 mr-2" />
            New Incident
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-[1fr_200px_200px]">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search incidents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select
          value={filterSeverity}
          onValueChange={setFilterSeverity}
        >
          <SelectTrigger id="severity">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>

          <SelectContent position="popper">
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterStatus}
          onValueChange={setFilterStatus}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent position="popper">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="reported">Reported</SelectItem>
            <SelectItem value="investigating">
              Investigating
            </SelectItem>
            <SelectItem value="contained">Contained</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Loading incidents...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="py-12 text-center">
          <p className="text-destructive">
            Failed to load incidents.
          </p>

          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error
              ? error.message
              : "Something went wrong."}
          </p>
        </div>
      )}

      {/* Incidents */}
      {!isLoading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">
                {incidents.length === 0
                  ? "No incidents have been reported yet."
                  : "No incidents found matching your search criteria."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IncidentList;