import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { apiClient } from "@/lib/apiClient";
import { DEFAULT_SLIDE_SECONDS, slideSeconds } from "@/lib/slideshow";

const CHOICES = [2, 3, 4, 5, 6, 8, 10, 15];

/** How long each home page photo stays before the next; saved on change. */
const SlideshowSpeed = () => {
  const { homeSettings, refreshPageData } = usePageDataFromDB();
  const { toast } = useToast();
  const saved = slideSeconds(homeSettings?.slideSeconds);
  const [value, setValue] = useState(saved);
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(saved), [saved]);

  const save = async (seconds: number) => {
    setValue(seconds);
    setSaving(true);
    try {
      await apiClient.updatePageContent("home", {
        content: { slideSeconds: seconds },
      });
      await refreshPageData();
      toast({ title: `Photos now change every ${seconds} seconds` });
    } catch {
      setValue(saved);
      toast({ title: "Couldn't save the speed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // A value set some other way still shows in the list
  const choices = CHOICES.includes(value)
    ? CHOICES
    : [...CHOICES, value].sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Label htmlFor="slide-seconds">Change photo every</Label>
        <p className="mt-1 text-xs text-mist">
          The photos fade from one to the next on their own. Fewer seconds is
          faster.
        </p>
      </div>
      <Select
        value={String(value)}
        onValueChange={(v) => save(Number(v))}
        disabled={saving}
      >
        <SelectTrigger id="slide-seconds" className="w-full bg-white sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {choices.map((seconds) => (
            <SelectItem key={seconds} value={String(seconds)}>
              {seconds} seconds
              {seconds === DEFAULT_SLIDE_SECONDS ? " (default)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SlideshowSpeed;
