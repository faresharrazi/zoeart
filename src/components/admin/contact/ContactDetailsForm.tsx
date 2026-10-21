import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { apiClient, ApiError } from "@/lib/apiClient";
import { instagramHandle } from "@/lib/contact";

const FIELDS = [
  {
    name: "email",
    label: "Email",
    type: "email",
    maxLength: 100,
    placeholder: "hello@example.com",
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    maxLength: 20,
    placeholder: "+30 210 000 0000",
  },
  {
    name: "instagram",
    label: "Instagram",
    type: "text",
    maxLength: 100,
    placeholder: "aetherartspace",
    hint: "The account name, or paste the profile link.",
  },
  {
    name: "address",
    label: "Address",
    type: "textarea",
    maxLength: 300,
    placeholder: "Street and number, postcode, city",
    hint: "Shown with a link to Google Maps.",
  },
] as const;

type Field = (typeof FIELDS)[number]["name"];
type Values = Record<Field, string>;

const EMPTY: Values = { email: "", phone: "", instagram: "", address: "" };

/** Email, phone, Instagram and address; an empty field is hidden on the site. */
const ContactDetailsForm = () => {
  const { contactInfo, refreshPageData } = usePageDataFromDB();
  const { toast } = useToast();
  const [saved, setSaved] = useState<Values>(EMPTY);
  const [values, setValues] = useState<Values>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const current = {
      email: contactInfo?.email || "",
      phone: contactInfo?.phone || "",
      instagram: contactInfo?.instagram || "",
      address: contactInfo?.address || "",
    };
    setSaved(current);
    setValues(current);
  }, [contactInfo]);

  const dirty = FIELDS.some(({ name }) => values[name] !== saved[name]);
  const set = (name: Field, value: string) =>
    setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      email: values.email.trim(),
      phone: values.phone.trim(),
      instagram: instagramHandle(values.instagram),
      address: values.address.trim(),
    };
    try {
      await apiClient.updateContactInfo(data);
      setSaved(data);
      setValues(data);
      await refreshPageData();
      toast({ title: "Contact details saved" });
    } catch (error) {
      toast({
        title: "Couldn't save the contact details",
        description:
          error instanceof ApiError && error.status === 400
            ? error.message
            : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {FIELDS.map((field) => {
        const id = `contact-${field.name}`;
        const hintId = `${id}-hint`;
        const common = {
          id,
          name: field.name,
          value: values[field.name],
          maxLength: field.maxLength,
          placeholder: field.placeholder,
          "aria-describedby": "hint" in field ? hintId : undefined,
          onChange: (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => set(field.name, e.target.value),
        };
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={id}>{field.label}</Label>
              {values[field.name] && (
                <button
                  type="button"
                  onClick={() => set(field.name, "")}
                  className="text-xs font-medium text-mist hover:text-destructive"
                  aria-label={`Remove ${field.label.toLowerCase()}`}
                >
                  Remove
                </button>
              )}
            </div>
            {field.type === "textarea" ? (
              <Textarea {...common} rows={3} />
            ) : (
              <Input {...common} type={field.type} />
            )}
            {"hint" in field && (
              <p id={hintId} className="text-xs text-mist">
                {field.hint}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-end gap-2 border-t pt-5">
        {dirty && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setValues(saved)}
            disabled={saving}
          >
            Discard
          </Button>
        )}
        <Button type="submit" disabled={!dirty || saving}>
          {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
          {saving ? "Saving…" : "Save details"}
        </Button>
      </div>
    </form>
  );
};

export default ContactDetailsForm;
