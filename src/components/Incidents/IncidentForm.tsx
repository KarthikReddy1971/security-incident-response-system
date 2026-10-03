import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

const IncidentForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [severity, setSeverity] = useState("");
  const [affectedSystems, setAffectedSystems] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title || !description || !type || !severity) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get currently logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in before reporting an incident.",
          variant: "destructive",
        });

        navigate("/login");
        return;
      }

      // Insert incident into Supabase
      const { data, error } = await supabase
        .from("incidents")
        .insert({
          title: title.trim(),
          description: description.trim(),
          type,
          severity,
          status: "reported",
          reported_by: user.id,
          source: "web",
          location: affectedSystems.trim() || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log("Incident created:", data);

      // Refresh incident-related queries
      await queryClient.invalidateQueries({
        queryKey: ["incidents"],
      });

      toast({
        title: "Success",
        description: `Incident #${data.incident_number} reported successfully.`,
      });

      // Navigate to incidents page
      navigate("/incidents");
    } catch (error) {
      console.error("Error creating incident:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to report the incident.";

      toast({
        title: "Failed to Report Incident",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Report New Security Incident</CardTitle>
          <CardDescription>
            Provide details about the security incident you're reporting.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Incident Title <span className="text-red-500">*</span>
            </Label>

            <Input
              id="title"
              placeholder="Brief description of the incident"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Detailed Description <span className="text-red-500">*</span>
            </Label>

            <Textarea
              id="description"
              placeholder="Provide detailed information about what happened"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incident-type">
                Incident Type <span className="text-red-500">*</span>
              </Label>

              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="incident-type">
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="phishing">Phishing</SelectItem>
                  <SelectItem value="malware">Malware</SelectItem>
                  <SelectItem value="unauthorized_access">
                    Unauthorized Access
                  </SelectItem>
                  <SelectItem value="data_breach">
                    Data Breach
                  </SelectItem>
                  <SelectItem value="ransomware">
                    Ransomware
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">
                Severity <span className="text-red-500">*</span>
              </Label>

              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity level" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="affected-systems">
              Affected Systems
            </Label>

            <Input
              id="affected-systems"
              placeholder="Systems, applications or assets affected"
              value={affectedSystems}
              onChange={(e) => setAffectedSystems(e.target.value)}
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 mr-2 flex-shrink-0" />

            <p className="text-sm text-amber-800 dark:text-amber-300">
              This incident will be reported to the security team for
              investigation. Provide as much detail as possible.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/incidents")}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Report Incident"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default IncidentForm;