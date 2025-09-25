import { useState, useEffect } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("adminToken");
    const userData = localStorage.getItem("adminUser");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (token: string, userData: any) => {
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
