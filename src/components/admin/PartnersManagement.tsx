import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Edit,
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiClient, errorMessage, normalizeImageUrl } from "@/lib/apiClient";
import type { Partner } from "@/types/api";

interface PartnerForm {
  id?: number;
  name: string;
  website_url: string;
  logo_url: string;
  is_visible: boolean;
}

const EMPTY_FORM: PartnerForm = {
  name: "",
  website_url: "",
  logo_url: "",
  is_visible: true,
};

const MAX_LOGO_SIZE = 4 * 1024 * 1024; // matches the server upload limit

/** Logos shown in the website footer under "Collaboration". */
const PartnersManagement = () => {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<PartnerForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState<Partner | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const fetchPartners = useCallback(async () => {
    try {
      setPartners(await apiClient.getAdminPartners());
    } catch (error) {
      toast({
        title: "Error",
        description: errorMessage(error, "Failed to load partners"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      await fetchPartners();
      toast({ title: success });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: errorMessage(error, "Something went wrong"),
        variant: "destructive",
      });
      return false;
    }
  };

  const handleLogoSelected = async (file: File | undefined) => {
    if (!file || !form) return;
    if (file.size > MAX_LOGO_SIZE) {
      toast({
        title: "Logo too large",
        description: "Please use an image under 4 MB.",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    try {
      const response = await apiClient.uploadImage(file, "partner");
      setForm({ ...form, logo_url: response.file.url });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: errorMessage(error, "Could not upload the logo"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form) return;
    if (!form.name.trim() || !form.logo_url) {
      toast({
        title: "Missing information",
        description: "A partner needs a name and a logo.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const data = {
      name: form.name,
      logo_url: form.logo_url,
      website_url: form.website_url,
      is_visible: form.is_visible,
    };
    const saved = await run(
      () =>
        form.id
          ? apiClient.updatePartner(form.id, data)
          : apiClient.createPartner(data),
      form.id ? "Partner updated" : "Partner added"
    );
    setSaving(false);
    if (saved) setForm(null);
  };

  const move = (index: number, step: number) => {
    const ids = partners.map((p) => p.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + step, 0, moved);
    run(() => apiClient.reorderPartners(ids), "Order updated");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-theme-text-primary">
            Partners
          </h1>
          <p className="text-theme-text-muted">
            Logos shown in the website footer under “Collaboration”.
          </p>
        </div>
        {!form && (
          <Button onClick={() => setForm({ ...EMPTY_FORM })}>
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Add partner
          </Button>
        )}
      </div>

      {form && (
        <Card>
          <CardHeader>
            <CardTitle>{form.id ? "Edit partner" : "Add partner"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="partner-name">Name *</Label>
                <Input
                  id="partner-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Aegean Times International Media"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-website">Website (optional)</Label>
                <Input
                  id="partner-website"
                  value={form.website_url}
                  onChange={(e) =>
                    setForm({ ...form, website_url: e.target.value })
                  }
                  placeholder="https://…"
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Logo *</span>
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-28 h-28 rounded-md border border-dashed border-theme-border flex items-center justify-center bg-white">
                  {form.logo_url ? (
                    <img
                      src={normalizeImageUrl(form.logo_url)}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-xs text-theme-text-muted">
                      No logo yet
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    ref={fileInput}
                    id="partner-logo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                    className="sr-only"
                    onChange={(e) => handleLogoSelected(e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileInput.current?.click()}
                  >
                    {uploading ? (
                      <Loader2
                        className="w-4 h-4 mr-2 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                    )}
                    {form.logo_url ? "Replace logo" : "Upload logo"}
                  </Button>
                  <p className="text-xs text-theme-text-muted">
                    PNG with a transparent background works best. Max 4 MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="partner-visible"
                checked={form.is_visible}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_visible: checked })
                }
              />
              <Label htmlFor="partner-visible">Show on the website</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || uploading}>
                <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setForm(null)}>
                <X className="w-4 h-4 mr-2" aria-hidden="true" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12" role="status">
          <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading partners</span>
        </div>
      ) : partners.length === 0 ? (
        <p className="text-theme-text-muted">
          No partners yet. The “Collaboration” section is hidden until you add
          one.
        </p>
      ) : (
        <ul className="space-y-3">
          {partners.map((partner, index) => (
            <li key={partner.id}>
              <Card>
                <CardContent className="p-4 flex flex-wrap items-center gap-4">
                  <img
                    src={normalizeImageUrl(partner.logo_url)}
                    alt=""
                    className={`w-16 h-16 object-contain ${
                      partner.is_visible ? "" : "opacity-40"
                    }`}
                  />
                  <div className="flex-1 min-w-[12rem]">
                    <p className="font-medium">{partner.name}</p>
                    {partner.website_url ? (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-theme-text-muted hover:underline inline-flex items-center gap-1"
                      >
                        {partner.website_url.replace(/^https?:\/\//, "")}
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    ) : (
                      <p className="text-sm text-theme-text-muted">
                        No website
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={partner.is_visible !== false}
                      onCheckedChange={(checked) =>
                        run(
                          () =>
                            apiClient.updatePartner(partner.id, {
                              is_visible: checked,
                            }),
                          checked ? "Partner shown" : "Partner hidden"
                        )
                      }
                      aria-label={`Show ${partner.name} on the website`}
                    />
                    <span className="text-sm text-theme-text-muted w-14">
                      {partner.is_visible ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      aria-label={`Move ${partner.name} up`}
                    >
                      <ArrowUp className="w-4 h-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === partners.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label={`Move ${partner.name} down`}
                    >
                      <ArrowDown className="w-4 h-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setForm({
                          id: partner.id,
                          name: partner.name,
                          website_url: partner.website_url || "",
                          logo_url: partner.logo_url,
                          is_visible: partner.is_visible !== false,
                        })
                      }
                      aria-label={`Edit ${partner.name}`}
                    >
                      <Edit className="w-4 h-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setToDelete(partner)}
                      aria-label={`Delete ${partner.name}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The logo is removed from the website footer. To hide it for now
              instead, use the visibility switch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                toDelete &&
                run(
                  () => apiClient.deletePartner(toDelete.id),
                  "Partner deleted"
                ).then(() => setToDelete(null))
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PartnersManagement;
