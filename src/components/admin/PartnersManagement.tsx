import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Handshake,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiClient, errorMessage, normalizeImageUrl } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import type { Partner } from "@/types/api";
import {
  AdminPage,
  ConfirmDelete,
  EmptyState,
  IconAction,
  ListPanel,
  ListRow,
  LoadingPanel,
  Panel,
  StatusBadge,
} from "./AdminUI";

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

/** Logos shown in the website footer under "In collaboration with". */
const PartnersManagement = () => {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<PartnerForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const fetchPartners = useCallback(async () => {
    try {
      setPartners(await apiClient.getAdminPartners());
    } catch (error) {
      toast({
        title: "Couldn't load the partners",
        description: errorMessage(error, "Please try again."),
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
        title: "Couldn't save the change",
        description: errorMessage(error, "Please try again."),
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
      setForm((current) =>
        current ? { ...current, logo_url: response.file.url } : current
      );
    } catch (error) {
      toast({
        title: "Couldn't upload the logo",
        description: errorMessage(error, "Please try again."),
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
        title: "Add a name and a logo",
        description: "A partner needs both to appear on the website.",
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
      form.id ? "Partner saved" : "Partner added"
    );
    setSaving(false);
    if (saved) setForm(null);
  };

  const move = (index: number, step: number) => {
    const ids = partners.map((p) => p.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + step, 0, moved);
    run(() => apiClient.reorderPartners(ids), "Order saved");
  };

  // The form opens above the list, so bring it into view
  const edit = (partner: Partner) => {
    setForm({
      id: partner.id,
      name: partner.name,
      website_url: partner.website_url || "",
      logo_url: partner.logo_url,
      is_visible: partner.is_visible !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visibleCount = partners.filter((p) => p.is_visible !== false).length;

  return (
    <AdminPage
      title="Partners"
      description="Logos shown at the bottom of every page under “In collaboration with”, in this order."
      actions={
        !form && (
          <Button onClick={() => setForm({ ...EMPTY_FORM })}>
            <Plus aria-hidden="true" />
            Add partner
          </Button>
        )
      }
    >
      {form && (
        <Panel
          title={form.id ? "Edit partner" : "New partner"}
          bodyClassName="p-5 sm:p-6"
        >
          <div className="grid gap-6 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <div className="space-y-2">
              <span className="text-sm font-medium text-ink">Logo</span>
              <div className="flex h-32 w-40 items-center justify-center rounded-lg border border-dashed bg-white p-3">
                {form.logo_url ? (
                  <img
                    src={normalizeImageUrl(form.logo_url)}
                    alt="Logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <ImageIcon className="size-6 text-mist" aria-hidden="true" />
                )}
              </div>
              <input
                ref={fileInput}
                id="partner-logo"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => handleLogoSelected(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-40"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <Upload aria-hidden="true" />
                )}
                {form.logo_url ? "Replace logo" : "Upload logo"}
              </Button>
              <p className="w-40 text-xs text-mist">
                A PNG with a transparent background works best. Max 4 MB.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="partner-name">
                  Name <span className="text-mist">(required)</span>
                </Label>
                <Input
                  id="partner-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Aegean Times International Media"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-website">Website</Label>
                <Input
                  id="partner-website"
                  value={form.website_url}
                  onChange={(e) =>
                    setForm({ ...form, website_url: e.target.value })
                  }
                  placeholder="https://…"
                />
                <p className="text-xs text-mist">
                  Optional. The logo links to it.
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                <Label htmlFor="partner-visible" className="cursor-pointer">
                  Show on the website
                </Label>
                <Switch
                  id="partner-visible"
                  checked={form.is_visible}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, is_visible: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t pt-5">
            <Button
              variant="ghost"
              onClick={() => setForm(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              {saving ? "Saving…" : form.id ? "Save changes" : "Add partner"}
            </Button>
          </div>
        </Panel>
      )}

      {loading ? (
        <LoadingPanel label="Loading partners…" />
      ) : partners.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No partners yet"
          description="The partners row is hidden on the website until you add one."
          action={
            !form && (
              <Button onClick={() => setForm({ ...EMPTY_FORM })}>
                <Plus aria-hidden="true" />
                Add partner
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-mist">
            {visibleCount} of {partners.length} shown on the website
          </p>
          <ListPanel>
            {partners.map((partner, index) => {
              const visible = partner.is_visible !== false;
              return (
                <ListRow
                  key={partner.id}
                  className="flex-wrap gap-y-2 sm:flex-nowrap"
                >
                  <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md border bg-white p-1.5">
                    <img
                      src={normalizeImageUrl(partner.logo_url)}
                      alt=""
                      className={cn(
                        "max-h-full max-w-full object-contain",
                        !visible && "opacity-40"
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <button
                        type="button"
                        onClick={() => edit(partner)}
                        className="min-w-0 truncate text-left text-sm font-medium text-ink hover:underline focus-visible:underline focus-visible:outline-none"
                      >
                        {partner.name}
                      </button>
                      {!visible && (
                        <StatusBadge tone="muted" icon={EyeOff}>
                          Hidden
                        </StatusBadge>
                      )}
                    </div>
                    {partner.website_url ? (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block truncate text-[13px] text-mist hover:text-ink hover:underline"
                      >
                        {partner.website_url.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <p className="mt-1 text-[13px] text-mist">No website</p>
                    )}
                  </div>
                  <div className="-mt-1 flex w-full shrink-0 items-center justify-end sm:mt-0 sm:w-auto">
                    <IconAction
                      label="Move up"
                      icon={ArrowUp}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    />
                    <IconAction
                      label="Move down"
                      icon={ArrowDown}
                      disabled={index === partners.length - 1}
                      onClick={() => move(index, 1)}
                    />
                    <IconAction
                      label={visible ? "Hide from website" : "Show on website"}
                      icon={visible ? EyeOff : Eye}
                      onClick={() =>
                        run(
                          () =>
                            apiClient.updatePartner(partner.id, {
                              is_visible: !visible,
                            }),
                          visible
                            ? `${partner.name} is now hidden`
                            : `${partner.name} is now on the website`
                        )
                      }
                    />
                    <IconAction
                      label="Edit"
                      icon={Pencil}
                      onClick={() => edit(partner)}
                    />
                    <ConfirmDelete
                      title={`Delete ${partner.name}?`}
                      description="The logo is removed from the website footer. To take it off for now, hide it instead."
                      onConfirm={() =>
                        run(
                          () => apiClient.deletePartner(partner.id),
                          "Partner deleted"
                        )
                      }
                    />
                  </div>
                </ListRow>
              );
            })}
          </ListPanel>
        </div>
      )}
    </AdminPage>
  );
};

export default PartnersManagement;
