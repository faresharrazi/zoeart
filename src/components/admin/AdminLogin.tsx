import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/apiClient";
import type { SessionUser } from "@/types/api";

interface AdminLoginProps {
  onLogin: (token: string, user: SessionUser) => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiClient.login(username, password);

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));

      onLogin(data.token, data.user);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.username}!`,
      });
    } catch (error) {
      // 401 bad credentials, 429 too many attempts, 400 missing fields
      const errorMessage =
        error instanceof ApiError && error.status < 500
          ? error.message
          : "Server is temporarily unavailable. Please try again.";

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-theme-background">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold leading-none tracking-tight text-theme-text-primary">
            Admin Login
          </h1>
          <p className="text-theme-text-muted">
            Sign in to access the admin panel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm  text-theme-text-primary mb-2"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm  text-theme-text-primary mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminLogin;
