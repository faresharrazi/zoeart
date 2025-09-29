import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import WorkingHoursManagement from "../WorkingHoursManagement";
import { Edit, Save, X, Mail, Phone, MapPin, Instagram } from "lucide-react";

interface ContactPageEditorProps {
  pageData: any;
  contactInfo: any;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  formData: any;
  setFormData: (data: any) => void;
  onRefresh: () => void;
}

const ContactPageEditor = ({
  pageData,
  contactInfo,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  formData,
  setFormData,
  onRefresh,
}: ContactPageEditorProps) => {
  const { toast } = useToast();
  const [editingContactInfo, setEditingContactInfo] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    email: "",
    phone: "",
    instagram: "",
    address: "",
  });

  const handleContactInfoEdit = () => {
    setContactFormData({
      email: contactInfo?.email || "",
      phone: contactInfo?.phone || "",
      instagram: contactInfo?.instagram || "",
      address: contactInfo?.address || "",
    });
    setEditingContactInfo(true);
  };

  const handleContactInfoSave = async () => {
    try {
      await apiClient.updateContactInfo(contactFormData);
      await onRefresh();
      setEditingContactInfo(false);
      toast({
        title: "Success",
        description: "Contact information updated successfully",
      });
    } catch (error) {
      console.error("Error updating contact info:", error);
      toast({
        title: "Error",
        description: "Failed to update contact information",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Content Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Contact Page
              <Badge variant={pageData?.isVisible ? "default" : "secondary"}>
                {pageData?.isVisible ? "Visible" : "Hidden"}
              </Badge>
            </CardTitle>
            {!isEditing && (
              <Button onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Content
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact-title">Page Title</Label>
                <Input
                  id="contact-title"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter page title"
                />
              </div>

              <div>
                <Label htmlFor="contact-description">Page Description</Label>
                <Textarea
                  id="contact-description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter page description"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={onSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Title</h3>
                <p className="text-gray-600">{pageData?.title || "Not set"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Description</h3>
                <p className="text-gray-600">
                  {pageData?.description || "Not set"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </CardTitle>
            {!editingContactInfo && (
              <Button onClick={handleContactInfoEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Contact Info
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingContactInfo ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactFormData.email}
                  onChange={(e) =>
                    setContactFormData({
                      ...contactFormData,
                      email: e.target.value,
                    })
                  }
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  value={contactFormData.phone}
                  onChange={(e) =>
                    setContactFormData({
                      ...contactFormData,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="contact-instagram">Instagram</Label>
                <Input
                  id="contact-instagram"
                  value={contactFormData.instagram}
                  onChange={(e) =>
                    setContactFormData({
                      ...contactFormData,
                      instagram: e.target.value,
                    })
                  }
                  placeholder="Enter Instagram handle"
                />
              </div>

              <div>
                <Label htmlFor="contact-address">Address</Label>
                <Textarea
                  id="contact-address"
                  value={contactFormData.address}
                  onChange={(e) =>
                    setContactFormData({
                      ...contactFormData,
                      address: e.target.value,
                    })
                  }
                  placeholder="Enter address"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleContactInfoSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Contact Info
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingContactInfo(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="text-gray-600">
                    {contactInfo?.email || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="font-medium">Phone</h4>
                  <p className="text-gray-600">
                    {contactInfo?.phone || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Instagram className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="font-medium">Instagram</h4>
                  <p className="text-gray-600">
                    {contactInfo?.instagram || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="font-medium">Address</h4>
                  <p className="text-gray-600">
                    {contactInfo?.address || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Working Hours Management */}
      <WorkingHoursManagement />
    </div>
  );
};

export default ContactPageEditor;
