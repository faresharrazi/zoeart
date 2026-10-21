import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { apiClient } from "@/lib/apiClient";
import { useSeo } from "@/hooks/useSeo";
import type { SessionUser } from "@/types/api";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  useSeo({ title: "Admin", noIndex: true });

  useEffect(() => {
    // Restore a previous login only if the server still accepts the token
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLoading(false);
      return;
    }

    apiClient
      .verifySession()
      .then(({ user }) => {
        localStorage.setItem("adminUser", JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (token: string, userData: SessionUser) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center gap-3 bg-theme-background text-sm text-mist"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <AdminDashboard onLogout={handleLogout} user={user} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </>
  );
};

export default Admin;
