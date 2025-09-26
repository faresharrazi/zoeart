import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Shield, Calendar, Save } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    currentPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("UserManagement: Fetching users...");
        const data = await apiClient.getUsers();
        console.log("UserManagement: Received users data:", data);
        setUsers(data);
      } catch (error) {
        console.error("UserManagement: Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      currentPassword: "",
    });
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      currentPassword: "",
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      const updateData: any = {
        username: formData.username,
        email: formData.email,
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
        updateData.currentPassword = formData.currentPassword;
      }

      console.log("UserManagement: Updating user with data:", updateData);
      await apiClient.updateUser(editingUser.id, updateData);

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === editingUser.id
            ? { ...user, username: formData.username, email: formData.email }
            : user
        )
      );

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      handleCancel();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
          <span className="ml-2 text-theme-text-muted">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl  mb-2 text-theme-text-primary">
          User Management
        </h2>
        <p className="text-theme-text-muted">
          Manage admin user accounts and credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User List */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-theme-text-primary">
              Admin Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-theme-border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-theme-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <p className=" text-theme-text-primary">
                        {user.username}
                      </p>
                      <p className="text-sm text-theme-text-muted">
                        {user.email}
                      </p>
                      <p className="text-xs text-theme-text-muted">
                        Role: {user.role} • Created:{" "}
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleEdit(user)}
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        {editingUser && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-theme-text-primary">
                Edit {editingUser.username}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-theme-text-primary">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-theme-text-primary">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="currentPassword"
                    className="text-theme-text-primary"
                  >
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                  />
                  <p className="text-xs text-theme-text-muted mt-1">
                    Required only if changing password
                  </p>
                </div>

                <div>
                  <Label htmlFor="password" className="text-theme-text-primary">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter new password (leave empty to keep current)"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
