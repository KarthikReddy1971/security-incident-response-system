import Header from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import IncidentMetrics from "@/components/Dashboard/IncidentMetrics";
import RecentIncidents from "@/components/Dashboard/RecentIncidents";
import { Link } from "react-router-dom";
import { Plus, BarChart3, PieChart } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useIncidents } from "@/hooks/use-incidents";

const Index = () => {
  const {
    data: incidents = [],
    isLoading,
  } = useIncidents();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">

          {/* Page Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Security Dashboard
              </h1>

              <p className="text-muted-foreground">
                Monitor and respond to security incidents across your organization
              </p>
            </div>

            <Button asChild>
              <Link to="/incidents/new">
                <Plus className="h-4 w-4 mr-2" />
                Report Incident
              </Link>
            </Button>
          </div>

          <div className="space-y-8">

            {/* Incident Metrics */}
            <IncidentMetrics />

            <div className="grid md:grid-cols-3 gap-6">

              {/* Recent Incidents */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">

                    <div>
                      <CardTitle>
                        Recent Incidents
                      </CardTitle>

                      <CardDescription>
                        Latest security incidents reported
                      </CardDescription>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to="/incidents">
                        View All
                      </Link>
                    </Button>

                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <RecentIncidents />
                </CardContent>
              </Card>


              {/* Incident Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Incident Analytics
                  </CardTitle>

                  <CardDescription>
                    Security incident metrics
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-8">

                    {/* Incidents By Type */}
                    <div className="space-y-4">

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          Incidents by Type
                        </div>

                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </div>


                      {/* Loading */}
                      {isLoading && (
                        <div className="text-sm text-muted-foreground">
                          Loading analytics...
                        </div>
                      )}


                      {/* No Data */}
                      {!isLoading && incidents.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                          No incident data available.
                        </div>
                      )}


                      {/* Dynamic Incident Types */}
                      {!isLoading && incidents.length > 0 && (
                        <div className="space-y-4">

                          {[
                            ["phishing", "Phishing"],
                            ["malware", "Malware"],
                            [
                              "unauthorized_access",
                              "Unauthorized Access",
                            ],
                            ["data_breach", "Data Breach"],
                            ["ransomware", "Ransomware"],
                            ["other", "Other"],
                          ].map(([type, label]) => {

                            const count = incidents.filter(
                              (incident) =>
                                incident.type === type
                            ).length;

                            const percentage = Math.round(
                              (count / incidents.length) * 100
                            );

                            // Don't display incident types
                            // that have zero incidents.
                            if (count === 0) {
                              return null;
                            }

                            return (
                              <div
                                key={type}
                                className="space-y-2"
                              >

                                <div className="flex items-center justify-between">

                                  <div className="text-xs">
                                    {label}
                                  </div>

                                  <div className="text-xs">
                                    {percentage}%
                                  </div>

                                </div>

                                <div className="h-2 w-full rounded-full bg-secondary">

                                  <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{
                                      width: `${percentage}%`,
                                    }}
                                  />

                                </div>

                              </div>
                            );
                          })}

                        </div>
                      )}

                    </div>


                    {/* Response Time */}
                    <div className="space-y-4">

                      <div className="flex items-center justify-between">

                        <div className="text-sm font-medium">
                          Response Time
                        </div>

                        <PieChart className="h-4 w-4 text-muted-foreground" />

                      </div>


                      <div className="grid grid-cols-2 gap-4">

                        <div className="rounded-lg p-3 bg-muted">

                          <div className="text-2xl font-bold">
                            3.5h
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Average response
                          </div>

                        </div>


                        <div className="rounded-lg p-3 bg-muted">

                          <div className="text-2xl font-bold">
                            1.2h
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Critical response
                          </div>

                        </div>

                      </div>

                    </div>

                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>


      {/* Footer */}
      <footer className="border-t py-6">

        <div className="container mx-auto px-4">

          <p className="text-center text-sm text-muted-foreground">
            © 2025 SecureResponse. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
};

export default Index;