import { useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { formatDateRange } from "@/lib/dates";
import {
  AdminPage,
  ConfirmDelete,
  EmptyState,
  IconAction,
  IconLink,
  ListPanel,
  ListRow,
  ResultCount,
  SearchField,
  StatStrip,
  StatusBadge,
  Thumb,
  type Tone,
} from "../AdminUI";

interface Exhibition {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  curator: string;
  status: "upcoming" | "current" | "past";
  featuredImage?: string;
  galleryImages: string[];
  assignedArtists: string[];
  assignedArtworks: string[];
  callForArtists?: boolean;
  ctaLink?: string;
  isVisible?: boolean;
}

interface ExhibitionListProps {
  exhibitions: Exhibition[];
  onEdit: (exhibition: Exhibition) => void;
  onAdd: () => void;
  onRefresh: () => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
}

const STATUS: Record<Exhibition["status"], { label: string; tone: Tone }> = {
  current: { label: "On view", tone: "success" },
  upcoming: { label: "Upcoming", tone: "info" },
  past: { label: "Past", tone: "neutral" },
};

const ExhibitionList = ({
  exhibitions,
  onEdit,
  onAdd,
  onRefresh,
  onToggleVisibility,
}: ExhibitionListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");

  const handleDelete = async (exhibition: Exhibition) => {
    try {
      await apiClient.deleteExhibition(parseInt(exhibition.id));
      onRefresh();
      toast({ title: `“${exhibition.title}” deleted` });
    } catch (error) {
      console.error("Error deleting exhibition:", error);
      toast({
        title: "Couldn't delete the exhibition",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async (exhibition: Exhibition) => {
    const isVisible = !exhibition.isVisible;
    try {
      await apiClient.toggleExhibitionVisibility(
        parseInt(exhibition.id),
        isVisible
      );
      onToggleVisibility(exhibition.id, isVisible);
      toast({
        title: isVisible
          ? `“${exhibition.title}” is now on the website`
          : `“${exhibition.title}” is now hidden`,
      });
    } catch (error) {
      console.error("Error toggling exhibition visibility:", error);
      toast({
        title: "Couldn't change the visibility",
        variant: "destructive",
      });
    }
  };

  const search = searchTerm.toLowerCase();
  const filteredExhibitions = exhibitions.filter((exhibition) => {
    const matchesSearch = [
      exhibition.title,
      exhibition.description,
      exhibition.location,
      exhibition.curator,
    ].some((text) => text.toLowerCase().includes(search));

    const matchesStatus =
      statusFilter === "all" || exhibition.status === statusFilter;

    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "visible" && exhibition.isVisible) ||
      (visibilityFilter === "hidden" && !exhibition.isVisible);

    return matchesSearch && matchesStatus && matchesVisibility;
  });

  const count = (status: Exhibition["status"]) =>
    exhibitions.filter((e) => e.status === status).length;
  const filtered =
    searchTerm !== "" || statusFilter !== "all" || visibilityFilter !== "all";

  return (
    <AdminPage
      title="Exhibitions"
      description="Shown on the Exhibitions page, and on the home page while upcoming or on view."
      actions={
        <Button onClick={onAdd}>
          <Plus aria-hidden="true" />
          New exhibition
        </Button>
      }
    >
      <StatStrip
        items={[
          { label: "On view now", value: count("current") },
          { label: "Upcoming", value: count("upcoming") },
          { label: "Past", value: count("past") },
          {
            label: "Hidden",
            value: exhibitions.filter((e) => !e.isVisible).length,
          },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchField
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search exhibitions"
        />
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white sm:w-40" aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              <SelectItem value="current">On view</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="bg-white sm:w-40" aria-label="Visibility">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any visibility</SelectItem>
              <SelectItem value="visible">Shown</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <ResultCount
          shown={filteredExhibitions.length}
          total={exhibitions.length}
          noun="exhibitions"
          onClear={
            filtered
              ? () => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setVisibilityFilter("all");
                }
              : undefined
          }
        />

        {filteredExhibitions.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={
              exhibitions.length === 0
                ? "No exhibitions yet"
                : "No exhibitions match"
            }
            description={
              exhibitions.length === 0
                ? "Create the first one to show it on the website."
                : "Try another search or filter."
            }
            action={
              exhibitions.length === 0 && (
                <Button onClick={onAdd}>
                  <Plus aria-hidden="true" />
                  New exhibition
                </Button>
              )
            }
          />
        ) : (
          <ListPanel>
            {filteredExhibitions.map((exhibition) => {
              const status = STATUS[exhibition.status];
              const details = [
                formatDateRange(exhibition.startDate, exhibition.endDate),
                exhibition.location,
              ].filter(Boolean);
              return (
                <ListRow key={exhibition.id}>
                  <Thumb src={exhibition.featuredImage} shape="poster" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <button
                        type="button"
                        onClick={() => onEdit(exhibition)}
                        className="min-w-0 truncate text-left text-sm font-medium text-ink hover:underline focus-visible:underline focus-visible:outline-none"
                      >
                        {exhibition.title}
                      </button>
                      <StatusBadge tone={status.tone}>
                        {status.label}
                      </StatusBadge>
                      {!exhibition.isVisible && (
                        <StatusBadge tone="muted" icon={EyeOff}>
                          Hidden
                        </StatusBadge>
                      )}
                    </div>
                    {details.length > 0 && (
                      <p className="mt-1 truncate text-[13px] text-mist">
                        {details.join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center">
                    {exhibition.isVisible && (
                      <span className="hidden sm:inline-flex">
                        <IconLink
                          label="View on website"
                          icon={ExternalLink}
                          href={`/exhibition/${exhibition.slug}`}
                        />
                      </span>
                    )}
                    <IconAction
                      label={
                        exhibition.isVisible
                          ? "Hide from website"
                          : "Show on website"
                      }
                      icon={exhibition.isVisible ? EyeOff : Eye}
                      onClick={() => handleToggleVisibility(exhibition)}
                    />
                    <IconAction
                      label="Edit"
                      icon={Pencil}
                      onClick={() => onEdit(exhibition)}
                    />
                    <ConfirmDelete
                      title="Delete this exhibition?"
                      description={
                        <>
                          “{exhibition.title}” will be removed from the website
                          and the admin. This can't be undone.
                        </>
                      }
                      onConfirm={() => handleDelete(exhibition)}
                    />
                  </div>
                </ListRow>
              );
            })}
          </ListPanel>
        )}
      </div>
    </AdminPage>
  );
};

export default ExhibitionList;
