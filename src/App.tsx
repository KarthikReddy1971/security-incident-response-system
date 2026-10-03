import { useEffect } from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import IncidentDetails from "./pages/IncidentDetails";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

import IncidentList from "./components/Incidents/IncidentList";
import IncidentForm from "./components/Incidents/IncidentForm";
import Header from "./components/Layout/Header";

import { useAuth } from "./context/AuthContext";

// ============================================================
// PROTECTED ROUTE
// ============================================================

const ProtectedRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};

// ============================================================
// PUBLIC LOGIN ROUTE
// ============================================================

const PublicLoginRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
};

// ============================================================
// INCIDENTS PAGE
// ============================================================

const IncidentsPage = () => (
  <div className="flex min-h-screen flex-col">
    <Header />

    <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        <IncidentList />
      </div>
    </main>
  </div>
);

// ============================================================
// NEW INCIDENT PAGE
// ============================================================

const NewIncidentPage = () => (
  <div className="flex min-h-screen flex-col">
    <Header />

    <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">
          Report Security Incident
        </h1>

        <IncidentForm />
      </div>
    </main>
  </div>
);

// ============================================================
// APP
// ============================================================

const App = () => {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Sonner />

          <Routes>
            {/* ==================================================
                AUTHENTICATION
            ================================================== */}

            <Route
              path="/login"
              element={<PublicLoginRoute />}
            />

            {/* ==================================================
                PROTECTED ROUTES
            ================================================== */}

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />

            <Route
              path="/incidents"
              element={
                <ProtectedRoute>
                  <IncidentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/incidents/new"
              element={
                <ProtectedRoute>
                  <NewIncidentPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/incidents/:id"
              element={
                <ProtectedRoute>
                  <IncidentDetails />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                404
            ================================================== */}

            <Route
              path="*"
              element={<NotFound />}
            />
          </Routes>
        </QueryClientProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
};

export default App;