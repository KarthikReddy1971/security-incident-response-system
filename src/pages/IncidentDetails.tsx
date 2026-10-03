import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  Shield,
  MessageSquare,
  Send,
  Save,
  Pencil,
  Trash2,
  X,
  Activity,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  FilePlus,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type Incident = {
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

type Analyst = {
  id: string;
  full_name: string;
  email: string;
  role: "analyst" | "admin";
};

type IncidentComment = {
  id: string;
  incident_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type CommentProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type IncidentEvent = {
  id: string;
  incident_id: string;
  user_id: string;
  event_type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type IncidentAsset = {
  asset_id: string;
  name: string;
  asset_type: string;
  hostname: string | null;
  ip_address: string | null;
  description: string | null;
  is_active: boolean;
  impact_description: string | null;
};

const severityStyles: Record<Incident["severity"], string> = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

const statusStyles: Record<Incident["status"], string> = {
  reported: "bg-blue-100 text-blue-700 border-blue-200",
  investigating: "bg-purple-100 text-purple-700 border-purple-200",
  contained: "bg-orange-100 text-orange-700 border-orange-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
};

const formatLabel = (value: string) => {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (value: string | null) => {
  if (!value) return "Not available";

  return new Date(value).toLocaleString();
};

const getEventIcon = (eventType: string) => {
  switch (eventType.toLowerCase()) {
    case "incident_created":
      return <FilePlus className="h-4 w-4" />;

    case "status_changed":
      return <Activity className="h-4 w-4" />;

    case "severity_changed":
      return <AlertTriangle className="h-4 w-4" />;

    case "assigned":
      return <UserPlus className="h-4 w-4" />;

    case "comment_added":
      return <MessageSquare className="h-4 w-4" />;

    case "resolved":
      return <CheckCircle className="h-4 w-4" />;

    default:
      return <Activity className="h-4 w-4" />;
  }
};

export default function IncidentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] =
    useState<Incident | null>(null);

  const [selectedStatus, setSelectedStatus] =
    useState<Incident["status"]>("reported");

  const [selectedSeverity, setSelectedSeverity] =
    useState<Incident["severity"]>("low");

  const [selectedAssignee, setSelectedAssignee] =
    useState("");

  const [analysts, setAnalysts] =
    useState<Analyst[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  // --------------------------------------------------
  // CURRENT USER
  // --------------------------------------------------



  // --------------------------------------------------
  // COMMENTS
  // --------------------------------------------------

  const [comments, setComments] =
    useState<IncidentComment[]>([]);

  const [commentProfiles, setCommentProfiles] =
    useState<Record<string, CommentProfile>>({});

  const [newComment, setNewComment] =
    useState("");

  const [commentLoading, setCommentLoading] =
    useState(false);

  const [commentSubmitting, setCommentSubmitting] =
    useState(false);

  const [commentError, setCommentError] =
    useState("");

  const [editingCommentId, setEditingCommentId] =
    useState<string | null>(null);

  const [editingCommentText, setEditingCommentText] =
    useState("");

  const [commentActionLoading, setCommentActionLoading] =
    useState<string | null>(null);

  // --------------------------------------------------
  // EVENTS
  // --------------------------------------------------

  const [events, setEvents] =
    useState<IncidentEvent[]>([]);

  const [eventLoading, setEventLoading] =
    useState(false);

  const [incidentAssets, setIncidentAssets] =
    useState<IncidentAsset[]>([]);

  // --------------------------------------------------
  // GET CURRENT USER
  // --------------------------------------------------

  const { user, profile } = useAuth();

  const currentUserId = user?.id ?? null;
  const userRole = profile?.role ?? "employee";

  const canInvestigate =
    userRole === "analyst" || userRole === "admin";

  const canAssign = userRole === "admin";

  const canComment =
    userRole === "analyst" || userRole === "admin";

  // --------------------------------------------------
  // LOAD INCIDENT
  // --------------------------------------------------

  useEffect(() => {
    if (!id) return;

    const loadIncident = async () => {
      setIsLoading(true);
      setError("");

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
        .eq("id", id)
        .single();

      if (error) {
        console.error(
          "Error loading incident:",
          error
        );

        setError(error.message);
        setIsLoading(false);
        return;
      }

      setIncident(data as Incident);

      setSelectedStatus(data.status);
      setSelectedSeverity(data.severity);
      setSelectedAssignee(
        data.assigned_to || ""
      );

      setIsLoading(false);
    };

    loadIncident();
  }, [id]);

  // --------------------------------------------------
  // LOAD ANALYSTS / ADMINS
  // --------------------------------------------------

  useEffect(() => {
    const loadAnalysts = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, role"
        )
        .in("role", [
          "analyst",
          "admin",
        ])
        .eq("is_active", true)
        .order("full_name", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Error loading analysts:",
          error
        );
        return;
      }

      setAnalysts(
        (data || []) as Analyst[]
      );
    };

    loadAnalysts();
  }, []);

  // --------------------------------------------------
  // LOAD COMMENTS
  // --------------------------------------------------

  useEffect(() => {
    if (!id) return;

    const loadComments = async () => {
      setCommentLoading(true);
      setCommentError("");

      const { data, error } = await supabase
        .from("incident_comments")
        .select(`
          id,
          incident_id,
          user_id,
          content,
          created_at,
          updated_at
        `)
        .eq("incident_id", id)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Error loading comments:",
          error
        );

        setCommentError(error.message);
        setCommentLoading(false);
        return;
      }

      const loadedComments =
        (data || []) as IncidentComment[];

      setComments(loadedComments);

      const userIds = [
        ...new Set(
          loadedComments.map(
            (comment) =>
              comment.user_id
          )
        ),
      ];

      if (userIds.length > 0) {
        const {
          data: profiles,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, full_name, email, avatar_url"
          )
          .in("id", userIds);

        if (profileError) {
          console.error(
            "Error loading comment profiles:",
            profileError
          );
        } else {
          const profileMap: Record<
            string,
            CommentProfile
          > = {};

          (profiles || []).forEach(
            (profile) => {
              profileMap[profile.id] =
                profile as CommentProfile;
            }
          );

          setCommentProfiles(
            profileMap
          );
        }
      }

      setCommentLoading(false);
    };

    loadComments();
  }, [id]);

  // --------------------------------------------------
  // LOAD EVENTS
  // --------------------------------------------------

  useEffect(() => {
    if (!id) return;

    const loadEvents = async () => {
      setEventLoading(true);

      const { data, error } =
        await supabase
          .from("incident_events")
          .select(`
            id,
            incident_id,
            user_id,
            event_type,
            description,
            metadata,
            created_at
          `)
          .eq("incident_id", id)
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        console.error(
          "Error loading events:",
          error
        );

        setEventLoading(false);
        return;
      }

      setEvents(
        (data || []) as IncidentEvent[]
      );

      setEventLoading(false);
    };

    loadEvents();
  }, [id]);

  // --------------------------------------------------
  // LOAD AFFECTED ASSETS
  // --------------------------------------------------

  useEffect(() => {
    if (!id) return;

    const loadAssets = async () => {
      const { data, error } = await supabase
        .from("incident_assets")
        .select(`
          asset_id,
          impact_description,
          assets (
            name,
            asset_type,
            hostname,
            ip_address,
            description,
            is_active
          )
        `)
        .eq("incident_id", id);

      if (error) {
        console.error("Error loading incident assets:", error);
        return;
      }

      const loadedAssets = (data || []).map((item: any) => ({
        asset_id: item.asset_id,
        impact_description: item.impact_description,
        ...item.assets,
      })) as IncidentAsset[];

      setIncidentAssets(loadedAssets);
    };

    loadAssets();
  }, [id]);

  // --------------------------------------------------
  // CREATE EVENT
  // --------------------------------------------------

  const createEvent = async (
    eventType: string,
    description: string,
    metadata: Record<string, unknown> = {}
  ) => {
    if (!incident || !currentUserId) {
      return;
    }

    const { data, error } =
      await supabase
        .from("incident_events")
        .insert({
          incident_id: incident.id,
          user_id: currentUserId,
          event_type: eventType,
          description,
          metadata,
        })
        .select(`
          id,
          incident_id,
          user_id,
          event_type,
          description,
          metadata,
          created_at
        `)
        .single();

    if (error) {
      console.error(
        "Error creating incident event:",
        error
      );

      return;
    }

    if (data) {
      setEvents((current) => [
        data as IncidentEvent,
        ...current,
      ]);
    }
  };

  // --------------------------------------------------
  // SAVE INCIDENT CHANGES
  // --------------------------------------------------

  const handleSaveChanges = async () => {
    if (!incident || !canInvestigate) return;

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    const oldStatus = incident.status;
    const oldSeverity = incident.severity;
    const oldAssignee = incident.assigned_to;

    const { data, error } =
      await supabase
        .from("incidents")
        .update({
          status: selectedStatus,
          severity: selectedSeverity,
          assigned_to: canAssign
            ? selectedAssignee || null
            : incident.assigned_to,
        })
        .eq("id", incident.id)
        .select()
        .single();

    if (error) {
      console.error(
        "Error updating incident:",
        error
      );

      setError(error.message);
      setIsSaving(false);
      return;
    }

    setIncident(data as Incident);

    setSelectedStatus(data.status);
    setSelectedSeverity(data.severity);
    setSelectedAssignee(
      data.assigned_to || ""
    );

    // Status changed
    if (oldStatus !== selectedStatus) {
      await createEvent(
        "status_changed",
        `Status changed from ${formatLabel(
          oldStatus
        )} to ${formatLabel(
          selectedStatus
        )}.`,
        {
          old_status: oldStatus,
          new_status: selectedStatus,
        }
      );
    }

    // Severity changed
    if (oldSeverity !== selectedSeverity) {
      await createEvent(
        "severity_changed",
        `Severity changed from ${formatLabel(
          oldSeverity
        )} to ${formatLabel(
          selectedSeverity
        )}.`,
        {
          old_severity: oldSeverity,
          new_severity: selectedSeverity,
        }
      );
    }

    // Assignment changed
    if (
      canAssign &&
      oldAssignee !== (selectedAssignee || null)
    ) {

      const assignedAnalyst =
        analysts.find(
          (analyst) =>
            analyst.id ===
            selectedAssignee
        );

      if (selectedAssignee) {
        await createEvent(
          "assigned",
          `Incident assigned to ${
            assignedAnalyst?.full_name ||
            assignedAnalyst?.email ||
            "a user"
          }.`,
          {
            old_assignee:
              oldAssignee,
            new_assignee:
              selectedAssignee,
          }
        );
      } else {
        await createEvent(
          "assigned",
          "Incident assignment was removed.",
          {
            old_assignee:
              oldAssignee,
            new_assignee: null,
          }
        );
      }
    }

    // Resolved event
    if (
      oldStatus !== "resolved" &&
      selectedStatus === "resolved"
    ) {
      await createEvent(
        "resolved",
        "Incident was marked as resolved."
      );
    }

    setSuccessMessage(
      "Incident updated successfully."
    );

    setIsSaving(false);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // --------------------------------------------------
  // ADD COMMENT
  // --------------------------------------------------

  const handleAddComment = async () => {
    if (
      !canComment ||
      !id ||
      !newComment.trim()
    ) {
      return;
    }

    setCommentSubmitting(true);
    setCommentError("");

    try {
      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You must be logged in to add a comment."
        );
      }

      const { data, error } =
        await supabase
          .from("incident_comments")
          .insert({
            incident_id: id,
            user_id: user.id,
            content:
              newComment.trim(),
          })
          .select(`
            id,
            incident_id,
            user_id,
            content,
            created_at,
            updated_at
          `)
          .single();

      if (error) {
        throw error;
      }

      const newCommentData =
        data as IncidentComment;

      setComments((current) => [
        ...current,
        newCommentData,
      ]);

      if (!commentProfiles[user.id]) {
        const { data: profile } =
          await supabase
            .from("profiles")
            .select(
              "id, full_name, email, avatar_url"
            )
            .eq("id", user.id)
            .single();

        if (profile) {
          setCommentProfiles(
            (current) => ({
              ...current,
              [user.id]:
                profile as CommentProfile,
            })
          );
        }
      }

      await createEvent(
        "comment_added",
        "A new comment was added to the incident."
      );

      setNewComment("");
    } catch (error) {
      console.error(
        "Error adding comment:",
        error
      );

      setCommentError(
        error instanceof Error
          ? error.message
          : "Failed to add comment."
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  // --------------------------------------------------
  // EDIT COMMENT
  // --------------------------------------------------

  const handleStartEdit = (
    comment: IncidentComment
  ) => {
    if (!canComment) return;

    setEditingCommentId(
      comment.id
    );

    setEditingCommentText(
      comment.content
    );

    setCommentError("");
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleSaveComment = async (
    commentId: string
  ) => {
    if (
      !canComment ||
      !editingCommentText.trim()
    ) {
      setCommentError(
        "Comment cannot be empty."
      );
      return;
    }

    setCommentActionLoading(
      commentId
    );

    setCommentError("");

    try {
      const { data, error } =
        await supabase
          .from("incident_comments")
          .update({
            content:
              editingCommentText.trim(),
          })
          .eq("id", commentId)
          .select(`
            id,
            incident_id,
            user_id,
            content,
            created_at,
            updated_at
          `)
          .single();

      if (error) {
        throw error;
      }

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? (data as IncidentComment)
            : comment
        )
      );

      setEditingCommentId(null);
      setEditingCommentText("");

      await createEvent(
        "comment_updated",
        "An incident comment was updated."
      );
    } catch (error) {
      console.error(
        "Error updating comment:",
        error
      );

      setCommentError(
        error instanceof Error
          ? error.message
          : "Failed to update comment."
      );
    } finally {
      setCommentActionLoading(null);
    }
  };

  // --------------------------------------------------
  // DELETE COMMENT
  // --------------------------------------------------

  const handleDeleteComment = async (
    commentId: string
  ) => {
    if (!canComment) return;

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this comment?"
      );

    if (!confirmed) return;

    setCommentActionLoading(
      commentId
    );

    setCommentError("");

    try {
      const { error } =
        await supabase
          .from("incident_comments")
          .delete()
          .eq("id", commentId);

      if (error) {
        throw error;
      }

      setComments((current) =>
        current.filter(
          (comment) =>
            comment.id !== commentId
        )
      );

      await createEvent(
        "comment_deleted",
        "An incident comment was deleted."
      );
    } catch (error) {
      console.error(
        "Error deleting comment:",
        error
      );

      setCommentError(
        error instanceof Error
          ? error.message
          : "Failed to delete comment."
      );
    } finally {
      setCommentActionLoading(null);
    }
  };

  // --------------------------------------------------
  // COMMENT AUTHOR
  // --------------------------------------------------

  const getCommentAuthor = (
    userId: string
  ) => {
    const profile =
      commentProfiles[userId];

    if (!profile) {
      return {
        name: "User",
        email: "",
      };
    }

    return {
      name:
        profile.full_name?.trim() ||
        profile.email ||
        "User",

      email:
        profile.email || "",
    };
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />

          <p className="text-sm text-muted-foreground">
            Loading incident...
          </p>

        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error || !incident) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">

        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">

          <h2 className="mb-2 text-lg font-semibold text-destructive">
            Unable to load incident
          </h2>

          <p className="mb-4 text-sm text-muted-foreground">
            {error ||
              "Incident not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/incidents")
            }
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Back to Incidents
          </button>

        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">

      {/* BACK */}
      <Link
        to="/incidents"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Incidents
      </Link>

      {/* HEADER */}
      <div className="mb-6">

        <div className="mb-2 flex flex-wrap items-center gap-2">

          <span className="font-mono text-sm text-muted-foreground">
            INC-
            {String(
              incident.incident_number
            ).padStart(4, "0")}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              severityStyles[
                incident.severity
              ]
            }`}
          >
            {formatLabel(
              incident.severity
            )}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              statusStyles[
                incident.status
              ]
            }`}
          >
            {formatLabel(
              incident.status
            )}
          </span>

        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          {incident.title}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {formatLabel(
            incident.type
          )}
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          Viewing as{" "}
          <span className="font-medium capitalize">
            {userRole}
          </span>
        </p>

      </div>

      {/* SUCCESS */}
      {successMessage && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* GRID */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* MAIN */}
        <div className="space-y-6 lg:col-span-2">

          {/* DESCRIPTION */}
          <div className="rounded-lg border bg-card p-6">

            <div className="mb-4 flex items-center gap-2">

              <Shield className="h-5 w-5 text-primary" />

              <h2 className="text-lg font-semibold">
                Incident Description
              </h2>

            </div>

            <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
              {incident.description ||
                "No description provided."}
            </p>

          </div>

          {/* INCIDENT INFORMATION */}
          <div className="rounded-lg border bg-card p-6">

            <h2 className="mb-5 text-lg font-semibold">
              Incident Information
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Incident Type
                </p>

                <p className="text-sm font-medium">
                  {formatLabel(
                    incident.type
                  )}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Source
                </p>

                <p className="text-sm font-medium">
                  {incident.source ||
                    "Not specified"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Reported By
                </p>

                <p className="font-mono text-sm">
                  {incident.reported_by.slice(
                    0,
                    8
                  )}
                  ...
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Assigned To
                </p>

                <p className="font-mono text-sm">
                  {incident.assigned_to
                    ? `${incident.assigned_to.slice(
                        0,
                        8
                      )}...`
                    : "Unassigned"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Location
                </p>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />

                  <p className="text-sm">
                    {incident.location ||
                      "Not specified"}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Detected At
                </p>

                <p className="text-sm">
                  {formatDate(
                    incident.detected_at
                  )}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Created At
                </p>

                <p className="text-sm">
                  {formatDate(
                    incident.created_at
                  )}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Last Updated
                </p>

                <p className="text-sm">
                  {formatDate(
                    incident.updated_at
                  )}
                </p>
              </div>

            </div>
          </div>

          {/* AFFECTED ASSETS */}
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Affected Assets</h2>
              <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                {incidentAssets.length}
              </span>
            </div>

            {incidentAssets.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No affected assets linked to this incident.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {incidentAssets.map((asset) => (
                  <div key={asset.asset_id} className="rounded-md border p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">{formatLabel(asset.asset_type)}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-xs ${asset.is_active ? "border-green-200 bg-green-100 text-green-700" : "border-gray-200 bg-gray-100 text-gray-600"}`}>
                        {asset.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      <p><span className="text-muted-foreground">Hostname: </span>{asset.hostname || "Not specified"}</p>
                      <p><span className="text-muted-foreground">IP: </span>{asset.ip_address || "Not specified"}</p>
                    </div>
                    {asset.impact_description && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Impact:</span>{" "}{asset.impact_description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COMMENTS */}
          <div className="rounded-lg border bg-card p-6">

            <div className="mb-5 flex items-center gap-2">

              <MessageSquare className="h-5 w-5 text-primary" />

              <h2 className="text-lg font-semibold">
                Incident Comments
              </h2>

              <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                {comments.length}
              </span>

            </div>

            {/* ADD COMMENT */}
            {canComment ? (
              <div className="mb-6">

                <textarea
                  value={newComment}
                  onChange={(event) =>
                    setNewComment(
                      event.target.value
                    )
                  }
                  placeholder="Write a comment about this incident..."
                  className="min-h-[110px] w-full resize-y rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="mt-3 flex justify-end">

                  <button
                    type="button"
                    onClick={handleAddComment}
                    disabled={
                      commentSubmitting ||
                      !newComment.trim()
                    }
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />

                    {commentSubmitting
                      ? "Adding..."
                      : "Add Comment"}
                  </button>

                </div>

              </div>
            ) : (
              <div className="mb-6 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Employees can view incident comments and activity, but investigation comments are restricted to analysts and administrators.
              </div>
            )}

            {commentError && (
              <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {commentError}
              </div>
            )}

            {/* COMMENT LIST */}
            {commentLoading ? (
              <div className="flex justify-center py-8">

                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />

              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">

                <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                <p className="text-sm font-medium">
                  No comments yet
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {comments.map(
                  (comment) => {

                    const author =
                      getCommentAuthor(
                        comment.user_id
                      );

                    const isOwnComment =
                      currentUserId ===
                      comment.user_id;

                    const isEditing =
                      editingCommentId ===
                      comment.id;

                    const isActionLoading =
                      commentActionLoading ===
                      comment.id;

                    return (
                      <div
                        key={comment.id}
                        className="rounded-md border p-4"
                      >

                        {/* COMMENT HEADER */}
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">

                              <span className="text-sm font-semibold text-primary">
                                {author.name
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </span>

                            </div>

                            <div>

                              <p className="text-sm font-medium">
                                {author.name}
                              </p>

                              {author.email && (
                                <p className="text-xs text-muted-foreground">
                                  {author.email}
                                </p>
                              )}

                            </div>

                          </div>

                          <div className="flex items-center gap-2">

                            <span className="text-xs text-muted-foreground">
                              {formatDate(
                                comment.created_at
                              )}
                            </span>

                            {canComment &&
                              isOwnComment &&
                              !isEditing && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStartEdit(
                                        comment
                                      )
                                    }
                                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteComment(
                                        comment.id
                                      )
                                    }
                                    disabled={
                                      isActionLoading
                                    }
                                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}

                          </div>

                        </div>

                        {/* EDIT */}
                        {isEditing ? (
                          <div>

                            <textarea
                              value={
                                editingCommentText
                              }
                              onChange={(event) =>
                                setEditingCommentText(
                                  event.target
                                    .value
                                )
                              }
                              className="min-h-[100px] w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                            />

                            <div className="mt-3 flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={
                                  handleCancelEdit
                                }
                                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveComment(
                                    comment.id
                                  )
                                }
                                disabled={
                                  isActionLoading ||
                                  !editingCommentText.trim()
                                }
                                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                              >
                                <Save className="h-4 w-4" />

                                {isActionLoading
                                  ? "Saving..."
                                  : "Save"}
                              </button>

                            </div>

                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                            {comment.content}
                          </p>
                        )}

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

          {/* EVENT TIMELINE */}
          <div className="rounded-lg border bg-card p-6">

            <div className="mb-6 flex items-center gap-2">

              <Activity className="h-5 w-5 text-primary" />

              <h2 className="text-lg font-semibold">
                Incident Activity
              </h2>

              <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                {events.length}
              </span>

            </div>

            {eventLoading ? (
              <div className="flex justify-center py-8">

                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />

              </div>
            ) : events.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">

                <Activity className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                <p className="text-sm font-medium">
                  No activity recorded yet
                </p>

              </div>
            ) : (
              <div className="relative">

                {/* Timeline Line */}
                <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

                <div className="space-y-6">

                  {events.map(
                    (event) => (
                      <div
                        key={event.id}
                        className="relative flex gap-4"
                      >

                        {/* ICON */}
                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background text-primary">
                          {getEventIcon(
                            event.event_type
                          )}
                        </div>

                        {/* CONTENT */}
                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-sm font-semibold">
                              {formatLabel(
                                event.event_type
                              )}
                            </p>

                            <span className="text-xs text-muted-foreground">
                              {formatDate(
                                event.created_at
                              )}
                            </span>

                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {event.description}
                          </p>

                          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                            User:{" "}
                            {event.user_id.slice(
                              0,
                              8
                            )}
                            ...
                          </p>

                        </div>

                      </div>
                    )
                  )}

                </div>
              </div>
            )}

          </div>

        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">

          {/* UPDATE INCIDENT */}
          {canInvestigate ? (
            <div className="rounded-lg border bg-card p-6">

              <div className="mb-5 flex items-center gap-2">

                <Save className="h-5 w-5 text-primary" />

                <h2 className="text-lg font-semibold">
                  Update Incident
                </h2>

              </div>

              {/* STATUS */}
              <div className="mb-5">

                <label
                  htmlFor="incident-status"
                  className="mb-2 block text-sm font-medium"
                >
                  Status
                </label>

                <select
                  id="incident-status"
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(
                      event.target
                        .value as Incident["status"]
                    )
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="reported">Reported</option>
                  <option value="investigating">Investigating</option>
                  <option value="contained">Contained</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

              </div>

              {/* SEVERITY */}
              <div className="mb-5">

                <label
                  htmlFor="incident-severity"
                  className="mb-2 block text-sm font-medium"
                >
                  Severity
                </label>

                <select
                  id="incident-severity"
                  value={selectedSeverity}
                  onChange={(event) =>
                    setSelectedSeverity(
                      event.target
                        .value as Incident["severity"]
                    )
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>

              </div>

              {/* ASSIGNMENT - ADMIN ONLY */}
              {canAssign && (
                <div className="mb-5">

                  <label
                    htmlFor="incident-assignee"
                    className="mb-2 block text-sm font-medium"
                  >
                    Assign To
                  </label>

                  <select
                    id="incident-assignee"
                    value={selectedAssignee}
                    onChange={(event) =>
                      setSelectedAssignee(
                        event.target.value
                      )
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Unassigned</option>

                    {analysts.map(
                      (analyst) => (
                        <option
                          key={analyst.id}
                          value={analyst.id}
                        >
                          {analyst.full_name ||
                            analyst.email}
                          {" — "}
                          {formatLabel(
                            analyst.role
                          )}
                        </option>
                      )
                    )}

                  </select>

                </div>
              )}

              {!canAssign && (
                <div className="mb-5 rounded-md border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    Assignment is managed by administrators.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />

                {isSaving
                  ? "Saving Changes..."
                  : "Save Changes"}
              </button>

            </div>
          ) : (
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />

                <h2 className="text-lg font-semibold">
                  Incident Status
                </h2>
              </div>

              <p className="text-sm text-muted-foreground">
                Employees can view incident details, status, activity, and comments. Investigation and status changes are handled by analysts and administrators.
              </p>

              <div className="mt-4 rounded-md border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current Status
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {formatLabel(incident.status)}
                </p>
              </div>
            </div>
          )}

          {/* BASIC TIMELINE */}
          <div className="rounded-lg border bg-card p-6">

            <h2 className="mb-5 text-lg font-semibold">
              Incident Timeline
            </h2>

            <div className="space-y-5">

              <div className="flex gap-3">

                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />

                <div>

                  <p className="text-sm font-medium">
                    Incident Created
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(
                      incident.created_at
                    )}
                  </p>

                </div>
              </div>

              <div className="flex gap-3">

                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-muted-foreground" />

                <div>

                  <p className="text-sm font-medium">
                    Last Updated
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(
                      incident.updated_at
                    )}
                  </p>

                </div>
              </div>

              {incident.resolved_at && (
                <div className="flex gap-3">

                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />

                  <div>

                    <p className="text-sm font-medium">
                      Incident Resolved
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(
                        incident.resolved_at
                      )}
                    </p>

                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}