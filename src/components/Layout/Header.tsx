import { Bell, Menu, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { profile, signOut } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Shield className="h-8 w-8 text-primary" />

              <span className="ml-2 text-xl font-bold">
                SecureResponse
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium ${
                isActive("/")
                  ? "text-primary"
                  : "hover:text-primary"
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/incidents"
              className={`px-3 py-2 text-sm font-medium ${
                isActive("/incidents")
                  ? "text-primary"
                  : "hover:text-primary"
              }`}
            >
              Incidents
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* User Information */}
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-medium">
                {profile?.full_name || "User"}
              </span>

              <span className="text-xs text-muted-foreground capitalize">
                {profile?.role || "Employee"}
              </span>
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />

              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-security-high" />
            </Button>

            {/* Desktop Sign Out */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() =>
                setMobileMenuOpen(!mobileMenuOpen)
              }
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-3 pb-4">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium ${
                  isActive("/")
                    ? "text-primary"
                    : "hover:text-primary"
                }`}
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              >
                Dashboard
              </Link>

              <Link
                to="/incidents"
                className={`px-3 py-2 text-sm font-medium ${
                  isActive("/incidents")
                    ? "text-primary"
                    : "hover:text-primary"
                }`}
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              >
                Incidents
              </Link>

              {/* Mobile User Information */}
              <div className="border-t pt-3 mt-2 px-3">
                <p className="text-sm font-medium">
                  {profile?.full_name || "User"}
                </p>

                <p className="text-xs text-muted-foreground capitalize">
                  {profile?.role || "Employee"}
                </p>
              </div>

              {/* Mobile Sign Out */}
              <Button
                variant="outline"
                className="mt-2 flex items-center gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;