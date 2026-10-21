import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { apiClient, ApiError } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import type { OpeningHour } from "@/types/api";
import { IconAction } from "../AdminUI";

interface Row {
  key: string;
  day: string;
  time_frame: string;
  is_active: boolean;
}

let nextKey = 0;
const toRow = (hour: Partial<OpeningHour> = {}): Row => ({
  key: `row-${nextKey++}`,
  day: hour.day ?? "",
  time_frame: hour.time_frame ?? "",
  is_active: hour.is_active !== false,
});

const sameRows = (a: Row[], b: Row[]) =>
  a.length === b.length &&
  a.every(
    (row, i) =>
      row.day === b[i].day &&
      row.time_frame === b[i].time_frame &&
      row.is_active === b[i].is_active
  );

/**
 * The opening hours as a list of lines ("Tuesday – Saturday" / "11:00 – 19:00")
 * that can be added, edited, reordered, hidden or removed, then saved at once.
 */
const OpeningHoursEditor = () => {
  const { refreshPageData } = usePageDataFromDB();
  const { toast } = useToast();
  const [saved, setSaved] = useState<Row[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    apiClient
      .getAdminOpeningHours()
      .then((hours) => {
        const loaded = hours.map(toRow);
        setSaved(loaded);
        setRows(loaded);
      })
      .catch(() =>
        toast({
          title: "Couldn't load the opening hours",
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  }, [toast]);

  const dirty = !sameRows(rows, saved);
  const update = (key: string, change: Partial<Row>) =>
    setRows((list) =>
      list.map((row) => (row.key === key ? { ...row, ...change } : row))
    );
  const move = (index: number, by: -1 | 1) =>
    setRows((list) => {
      const next = [...list];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });

  const handleSave = async () => {
    // Rows left completely empty are dropped; half-filled ones must be fixed
    const filled = rows.filter((r) => r.day.trim() || r.time_frame.trim());
    if (filled.some((r) => !r.day.trim() || !r.time_frame.trim())) {
      setShowErrors(true);
      toast({
        title: "Some rows are incomplete",
        description: "Fill in both the day and the hours, or remove the row.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const result = await apiClient.saveOpeningHours(
        filled.map(({ day, time_frame, is_active }) => ({
          day: day.trim(),
          time_frame: time_frame.trim(),
          is_active,
        }))
      );
      const loaded = result.map(toRow);
      setSaved(loaded);
      setRows(loaded);
      setShowErrors(false);
      await refreshPageData();
      toast({ title: "Opening hours saved" });
    } catch (error) {
      toast({
        title: "Couldn't save the opening hours",
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

  if (loading) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-mist">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading opening hours…
      </p>
    );
  }

  const shown = rows.filter((r) => r.is_active && r.day && r.time_frame);

  return (
    <div className="space-y-5">
      {rows.length === 0 ? (
        <p className="rounded-lg bg-secondary px-4 py-6 text-center text-sm text-mist">
          No opening hours. The section is hidden on the website.
        </p>
      ) : (
        <div>
          <div
            className="hidden gap-3 pb-2 text-xs font-medium text-mist sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_9.5rem]"
            aria-hidden="true"
          >
            <span>Day or days</span>
            <span>Hours</span>
            <span>Shown</span>
          </div>
          <ol className="space-y-3 sm:space-y-2">
            {rows.map((row, index) => {
              const n = index + 1;
              const missing = (value: string) =>
                showErrors &&
                !value.trim() &&
                Boolean(row.day.trim() || row.time_frame.trim());
              return (
                <li
                  key={row.key}
                  className={cn(
                    "grid gap-2 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_9.5rem] sm:items-center sm:gap-3 sm:border-0 sm:p-0",
                    !row.is_active && "[&_input]:text-mist"
                  )}
                >
                  <Input
                    aria-label={`Day, row ${n}`}
                    value={row.day}
                    maxLength={60}
                    placeholder="e.g. Tuesday – Saturday"
                    aria-invalid={missing(row.day) || undefined}
                    onChange={(e) => update(row.key, { day: e.target.value })}
                    className={cn(missing(row.day) && "border-destructive")}
                  />
                  <Input
                    aria-label={`Hours, row ${n}`}
                    value={row.time_frame}
                    maxLength={120}
                    placeholder="e.g. 11:00 – 19:00 or Closed"
                    aria-invalid={missing(row.time_frame) || undefined}
                    onChange={(e) =>
                      update(row.key, { time_frame: e.target.value })
                    }
                    className={cn(
                      missing(row.time_frame) && "border-destructive"
                    )}
                  />
                  <div className="flex items-center gap-0.5">
                    <label className="mr-auto flex items-center gap-2.5 text-sm text-stone sm:mr-2">
                      <Switch
                        checked={row.is_active}
                        onCheckedChange={(checked) =>
                          update(row.key, { is_active: checked })
                        }
                        aria-label={`Show row ${n} on the website`}
                      />
                      <span className="sm:hidden" aria-hidden="true">
                        {row.is_active ? "Shown" : "Hidden"}
                      </span>
                    </label>
                    <IconAction
                      label="Move up"
                      icon={ArrowUp}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    />
                    <IconAction
                      label="Move down"
                      icon={ArrowDown}
                      disabled={index === rows.length - 1}
                      onClick={() => move(index, 1)}
                    />
                    <IconAction
                      label="Remove row"
                      icon={Trash2}
                      tone="danger"
                      onClick={() =>
                        setRows((list) => list.filter((r) => r.key !== row.key))
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRows((list) => [...list, toRow()])}
      >
        <Plus aria-hidden="true" />
        Add row
      </Button>

      {shown.length > 0 && (
        <div className="rounded-lg bg-secondary px-4 py-4">
          <p className="mb-3 text-xs font-medium text-mist">On the website</p>
          <dl className="grid max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
            {shown.map((row) => (
              <div key={row.key} className="contents">
                <dt className="text-stone">{row.day}</dt>
                <dd className="text-ink">{row.time_frame}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t pt-5">
        {dirty && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setRows(saved);
              setShowErrors(false);
            }}
            disabled={saving}
          >
            Discard
          </Button>
        )}
        <Button type="button" onClick={handleSave} disabled={!dirty || saving}>
          {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
          {saving ? "Saving…" : "Save hours"}
        </Button>
      </div>
    </div>
  );
};

export default OpeningHoursEditor;
