import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AdminLoginProps {
  onLogin: (token: string, user: any) => void;
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
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.user));

        onLogin(data.token, data.user);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.username}!`,
        });
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-background">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-theme-text-primary">
            Admin Login
          </CardTitle>
          <p className="text-theme-text-muted">
            Sign in to access the admin panel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-theme-text-primary mb-2"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
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
                className="block text-sm font-medium text-theme-text-primary mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
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
            <p className="text-xs text-center text-theme-text-muted mt-4">
              Default credentials: admin / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
