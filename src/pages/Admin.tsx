import { useState, useEffect } from "react";
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
      <div className="min-h-screen flex items-center justify-center bg-theme-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary mx-auto"></div>
          <p className="mt-2 text-theme-text-muted">Loading...</p>
        </div>
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
