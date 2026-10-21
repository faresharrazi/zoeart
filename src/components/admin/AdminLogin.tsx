import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, ApiError } from "@/lib/apiClient";
import type { SessionUser } from "@/types/api";

interface AdminLoginProps {
  onLogin: (token: string, user: SessionUser) => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiClient.login(username, password);
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      onLogin(data.token, data.user);
    } catch (error) {
      // 401 bad credentials, 429 too many attempts, 400 missing fields
      setError(
        error instanceof ApiError && error.status < 500
          ? error.message
          : "The server is temporarily unavailable. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-canvas px-4">
      <div className="m-auto w-full max-w-sm py-12">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src="/logo/logo-menu.png"
            alt=""
            width={245}
            height={144}
            className="h-9 w-auto"
          />
          <p className="mt-4 text-[13px] font-medium tracking-[0.24em] text-ink">
            AETHER ART SPACE
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-[0_1px_2px_hsl(var(--ink)/0.04)] sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-mist">
            Manage exhibitions, artists and the website.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-md bg-[hsl(0_70%_96%)] px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm">
          <a href="/" className="text-mist hover:text-ink">
            ← Back to the website
          </a>
        </p>
      </div>
    </main>
  );
};

export default AdminLogin;
