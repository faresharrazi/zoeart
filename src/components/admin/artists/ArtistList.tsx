import { useState } from "react";
import { ExternalLink, Eye, EyeOff, Pencil, Plus, Users } from "lucide-react";
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
  StatusBadge,
  Thumb,
} from "../AdminUI";

interface Artist {
  id: string;
  name: string;
  slug: string;
  specialty: string;
  bio: string;
  profileImage: string;
  socialMedia: Record<string, string>;
  assignedArtworks: string[];
  isVisible: boolean;
}

interface ArtistListProps {
  artists: Artist[];
  onEdit: (artist: Artist) => void;
  onAdd: () => void;
  onRefresh: () => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/** Profile photo, or the artist's initials when there is none. */
const ArtistAvatar = ({ artist }: { artist: Artist }) =>
  artist.profileImage ? (
    <Thumb src={artist.profileImage} shape="round" />
  ) : (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-mist"
      aria-hidden="true"
    >
      {initials(artist.name)}
    </span>
  );

const ArtistList = ({
  artists,
  onEdit,
  onAdd,
  onRefresh,
  onToggleVisibility,
}: ArtistListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");

  const handleDelete = async (artist: Artist) => {
    try {
      await apiClient.deleteArtist(parseInt(artist.id));
      onRefresh();
      toast({ title: `${artist.name} deleted` });
    } catch (error) {
      console.error("Error deleting artist:", error);
      toast({ title: "Couldn't delete the artist", variant: "destructive" });
    }
  };

  const handleToggleVisibility = async (artist: Artist) => {
    const isVisible = !artist.isVisible;
    try {
      await apiClient.updateArtist(parseInt(artist.id), {
        is_visible: isVisible,
      });
      onToggleVisibility(artist.id, isVisible);
      toast({
        title: isVisible
          ? `${artist.name} is now on the website`
          : `${artist.name} is now hidden`,
      });
    } catch (error) {
      console.error("Error toggling artist visibility:", error);
      toast({
        title: "Couldn't change the visibility",
        variant: "destructive",
      });
    }
  };

  const search = searchTerm.toLowerCase();
  const filteredArtists = artists.filter((artist) => {
    const matchesSearch = [artist.name, artist.specialty, artist.bio].some(
      (text) => text.toLowerCase().includes(search)
    );

    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "visible" && artist.isVisible) ||
      (visibilityFilter === "hidden" && !artist.isVisible);

    const matchesSpecialty =
      specialtyFilter === "all" ||
      artist.specialty.toLowerCase().includes(specialtyFilter.toLowerCase());

    return matchesSearch && matchesVisibility && matchesSpecialty;
  });

  const specialties = [
    ...new Set(artists.map((a) => a.specialty).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));
  const filtered =
    searchTerm !== "" ||
    visibilityFilter !== "all" ||
    specialtyFilter !== "all";

  return (
    <AdminPage
      title="Artists"
      description="The artists shown on the Artists page, each with their own profile."
      actions={
        <Button onClick={onAdd}>
          <Plus aria-hidden="true" />
          New artist
        </Button>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchField
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search artists"
        />
        <div className="grid grid-cols-2 gap-3 sm:flex">
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
          {specialties.length > 0 && (
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger
                className="bg-white sm:w-44"
                aria-label="Specialty"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any specialty</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <ResultCount
          shown={filteredArtists.length}
          total={artists.length}
          noun="artists"
          onClear={
            filtered
              ? () => {
                  setSearchTerm("");
                  setVisibilityFilter("all");
                  setSpecialtyFilter("all");
                }
              : undefined
          }
        />

        {filteredArtists.length === 0 ? (
          <EmptyState
            icon={Users}
            title={artists.length === 0 ? "No artists yet" : "No artists match"}
            description={
              artists.length === 0
                ? "Add the first artist to show them on the website."
                : "Try another search or filter."
            }
            action={
              artists.length === 0 && (
                <Button onClick={onAdd}>
                  <Plus aria-hidden="true" />
                  New artist
                </Button>
              )
            }
          />
        ) : (
          <ListPanel>
            {filteredArtists.map((artist) => {
              const detail = artist.specialty || artist.bio;
              return (
                <ListRow key={artist.id}>
                  <ArtistAvatar artist={artist} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <button
                        type="button"
                        onClick={() => onEdit(artist)}
                        className="min-w-0 truncate text-left text-sm font-medium text-ink hover:underline focus-visible:underline focus-visible:outline-none"
                      >
                        {artist.name}
                      </button>
                      {!artist.isVisible && (
                        <StatusBadge tone="muted" icon={EyeOff}>
                          Hidden
                        </StatusBadge>
                      )}
                    </div>
                    {detail && (
                      <p className="mt-1 truncate text-[13px] text-mist">
                        {detail}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center">
                    {artist.isVisible && artist.slug && (
                      <span className="hidden sm:inline-flex">
                        <IconLink
                          label="View on website"
                          icon={ExternalLink}
                          href={`/artist/${artist.slug}`}
                        />
                      </span>
                    )}
                    <IconAction
                      label={
                        artist.isVisible
                          ? "Hide from website"
                          : "Show on website"
                      }
                      icon={artist.isVisible ? EyeOff : Eye}
                      onClick={() => handleToggleVisibility(artist)}
                    />
                    <IconAction
                      label="Edit"
                      icon={Pencil}
                      onClick={() => onEdit(artist)}
                    />
                    <ConfirmDelete
                      title="Delete this artist?"
                      description={
                        <>
                          {artist.name} will be removed from the website and the
                          admin. This can't be undone.
                        </>
                      }
                      onConfirm={() => handleDelete(artist)}
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

export default ArtistList;
