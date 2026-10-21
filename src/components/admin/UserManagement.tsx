import { useEffect, useState } from "react";
import { Loader2, Pencil, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiClient, errorMessage } from "@/lib/apiClient";
import type { AdminUser } from "@/types/api";
import {
  AdminPage,
  EmptyState,
  FormSection,
  IconAction,
  ListPanel,
  ListRow,
  LoadingPanel,
  StatusBadge,
} from "./AdminUI";

const EMPTY_FORM = {
  username: "",
  email: "",
  password: "",
  currentPassword: "",
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    apiClient
      .getUsers()
      .then(setUsers)
      .catch((error) => {
        console.error("UserManagement: Error fetching users:", error);
        toast({ title: "Couldn't load the users", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({ ...EMPTY_FORM, username: user.username, email: user.email });
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData(EMPTY_FORM);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    try {
      const updateData: Parameters<typeof apiClient.updateUser>[1] = {
        username: formData.username,
        email: formData.email,
      };

      // The password changes only when a new one is typed
      if (formData.password) {
        updateData.password = formData.password;
        updateData.currentPassword = formData.currentPassword;
      }

      await apiClient.updateUser(editingUser.id, updateData);

      setUsers((list) =>
        list.map((user) =>
          user.id === editingUser.id
            ? { ...user, username: formData.username, email: formData.email }
            : user
        )
      );
      toast({ title: "User saved" });
      handleCancel();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Couldn't save the user",
        description: errorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const set =
    (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((data) => ({ ...data, [field]: e.target.value }));

  if (editingUser) {
    return (
      <form onSubmit={handleSave}>
        <AdminPage
          title={`Edit ${editingUser.username}`}
          description="Change the sign-in details for this account."
          onBack={handleCancel}
          backLabel="Back to admin users"
          actions={
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                )}
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </>
          }
        >
          <div className="space-y-10 pt-2">
            <FormSection
              title="Account"
              description="The username is used to sign in."
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="user-username">Username</Label>
                  <Input
                    id="user-username"
                    autoComplete="username"
                    value={formData.username}
                    onChange={set("username")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={set("email")}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Password"
              description="Leave both fields empty to keep the current password."
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="user-current-password">
                    Current password
                  </Label>
                  <Input
                    id="user-current-password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.currentPassword}
                    onChange={set("currentPassword")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-new-password">New password</Label>
                  <Input
                    id="user-new-password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={set("password")}
                  />
                </div>
              </div>
            </FormSection>
          </div>
        </AdminPage>
      </form>
    );
  }

  return (
    <AdminPage
      title="Admin users"
      description="The accounts that can sign in to this admin."
    >
      {loading ? (
        <LoadingPanel label="Loading users…" />
      ) : users.length === 0 ? (
        <EmptyState icon={UserCog} title="No admin users found" />
      ) : (
        <ListPanel>
          {users.map((user) => (
            <ListRow key={user.id}>
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold uppercase text-stone"
                aria-hidden="true"
              >
                {user.username.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(user)}
                    className="min-w-0 truncate text-left text-sm font-medium text-ink hover:underline focus-visible:underline focus-visible:outline-none"
                  >
                    {user.username}
                  </button>
                  <StatusBadge tone="neutral" className="capitalize">
                    {user.role}
                  </StatusBadge>
                </div>
                <p className="mt-1 truncate text-[13px] text-mist">
                  {[user.email, `Added ${formatDate(user.created_at)}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <IconAction
                label="Edit"
                icon={Pencil}
                onClick={() => handleEdit(user)}
              />
            </ListRow>
          ))}
        </ListPanel>
      )}
    </AdminPage>
  );
};

export default UserManagement;
