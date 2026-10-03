import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type Incident = {
  id: string;
  incident_number: number;
  title: string;
  description: string;
  type:
    | "phishing"
    | "malware"
    | "unauthorized_access"
    | "data_breach"
    | "ransomware"
    | "other";
  severity: "low" | "medium" | "high" | "critical";
  status:
    | "reported"
    | "investigating"
    | "contained"
    | "resolved"
    | "closed";
  reported_by: string;
  assigned_to: string | null;
  source: string | null;
  location: string | null;
  detected_at: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export function useIncidents() {
  return useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select(`
          id,
          incident_number,
          title,
          description,
          type,
          severity,
          status,
          reported_by,
          assigned_to,
          source,
          location,
          detected_at,
          created_at,
          updated_at,
          resolved_at
        `)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      return data as Incident[];
    },
  });
}