import { useMemo, useState } from "react";
import {
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
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

interface Artwork {
  id: string;
  title: string;
  slug: string;
  artist_id: number;
  artist_name: string;
  year: number;
  medium: string;
  size: string;
  description: string;
  images: string[];
  featured_image?: string;
  isVisible: boolean;
}

interface ArtworkListProps {
  artworks: Artwork[];
  onEdit: (artwork: Artwork) => void;
  onAdd: () => void;
  onRefresh: () => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
}

const ArtworkList = ({
  artworks,
  onEdit,
  onAdd,
  onDelete,
  onToggleVisibility,
}: ArtworkListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [artistFilter, setArtistFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const filteredArtworks = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return artworks.filter((artwork) => {
      const matchesSearch = [
        artwork.title,
        artwork.artist_name,
        artwork.medium,
        artwork.description,
      ].some((text) => text.toLowerCase().includes(search));

      const matchesArtist =
        artistFilter === "all" || artwork.artist_id.toString() === artistFilter;

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "visible" && artwork.isVisible) ||
        (visibilityFilter === "hidden" && !artwork.isVisible);

      const matchesYear =
        yearFilter === "all" || artwork.year.toString() === yearFilter;

      return matchesSearch && matchesArtist && matchesVisibility && matchesYear;
    });
  }, [artworks, searchTerm, artistFilter, visibilityFilter, yearFilter]);

  const availableArtists = useMemo(() => {
    const uniqueArtists = new Map<number, { id: number; name: string }>();
    artworks.forEach((artwork) => {
      if (!uniqueArtists.has(artwork.artist_id)) {
        uniqueArtists.set(artwork.artist_id, {
          id: artwork.artist_id,
          name: artwork.artist_name,
        });
      }
    });
    return Array.from(uniqueArtists.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [artworks]);

  const availableYears = useMemo(
    () => [...new Set(artworks.map((a) => a.year))].sort((a, b) => b - a),
    [artworks]
  );

  const handleDelete = async (artwork: Artwork) => {
    try {
      await apiClient.deleteArtwork(parseInt(artwork.id));
      onDelete(artwork.id);
      toast({ title: `“${artwork.title}” deleted` });
    } catch (error) {
      console.error("Error deleting artwork:", error);
      toast({ title: "Couldn't delete the artwork", variant: "destructive" });
    }
  };

  const handleToggleVisibility = async (artwork: Artwork) => {
    const isVisible = !artwork.isVisible;
    try {
      await apiClient.updateArtwork(parseInt(artwork.id), {
        is_visible: isVisible,
      });
      onToggleVisibility(artwork.id, isVisible);
      toast({
        title: isVisible
          ? `“${artwork.title}” is now on the website`
          : `“${artwork.title}” is now hidden`,
      });
    } catch (error) {
      console.error("Error updating artwork visibility:", error);
      toast({
        title: "Couldn't change the visibility",
        variant: "destructive",
      });
    }
  };

  const filtered =
    searchTerm !== "" ||
    artistFilter !== "all" ||
    visibilityFilter !== "all" ||
    yearFilter !== "all";

  return (
    <AdminPage
      title="Artworks"
      description="The works shown in the Collection and on each artist's page."
      actions={
        <Button onClick={onAdd}>
          <Plus aria-hidden="true" />
          New artwork
        </Button>
      }
    >
      <div className="flex flex-col gap-3 md:flex-row">
        <SearchField
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search artworks"
        />
        <div className="grid grid-cols-2 gap-3 md:flex">
          <Select value={artistFilter} onValueChange={setArtistFilter}>
            <SelectTrigger
              className="col-span-2 bg-white md:w-44"
              aria-label="Artist"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any artist</SelectItem>
              {availableArtists.map((artist) => (
                <SelectItem key={artist.id} value={artist.id.toString()}>
                  {artist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="bg-white md:w-32" aria-label="Year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any year</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="bg-white md:w-40" aria-label="Visibility">
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
          shown={filteredArtworks.length}
          total={artworks.length}
          noun="artworks"
          onClear={
            filtered
              ? () => {
                  setSearchTerm("");
                  setArtistFilter("all");
                  setVisibilityFilter("all");
                  setYearFilter("all");
                }
              : undefined
          }
        />

        {filteredArtworks.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title={
              artworks.length === 0 ? "No artworks yet" : "No artworks match"
            }
            description={
              artworks.length === 0
                ? "Add the first artwork to start the collection."
                : "Try another search or filter."
            }
            action={
              artworks.length === 0 && (
                <Button onClick={onAdd}>
                  <Plus aria-hidden="true" />
                  New artwork
                </Button>
              )
            }
          />
        ) : (
          <ListPanel>
            {filteredArtworks.map((artwork) => {
              const details = [
                artwork.artist_name,
                artwork.year,
                artwork.medium,
              ].filter(Boolean);
              return (
                <ListRow key={artwork.id}>
                  <Thumb
                    src={artwork.featured_image || artwork.images?.[0]}
                    shape="square"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <button
                        type="button"
                        onClick={() => onEdit(artwork)}
                        className="min-w-0 truncate text-left text-sm font-medium text-ink hover:underline focus-visible:underline focus-visible:outline-none"
                      >
                        {artwork.title}
                      </button>
                      {!artwork.isVisible && (
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
                    {artwork.isVisible && artwork.slug && (
                      <span className="hidden sm:inline-flex">
                        <IconLink
                          label="View on website"
                          icon={ExternalLink}
                          href={`/artwork/${artwork.slug}`}
                        />
                      </span>
                    )}
                    <IconAction
                      label={
                        artwork.isVisible
                          ? "Hide from website"
                          : "Show on website"
                      }
                      icon={artwork.isVisible ? EyeOff : Eye}
                      onClick={() => handleToggleVisibility(artwork)}
                    />
                    <IconAction
                      label="Edit"
                      icon={Pencil}
                      onClick={() => onEdit(artwork)}
                    />
                    <ConfirmDelete
                      title="Delete this artwork?"
                      description={
                        <>
                          “{artwork.title}” by {artwork.artist_name} will be
                          removed from the website and the admin. This can't be
                          undone.
                        </>
                      }
                      onConfirm={() => handleDelete(artwork)}
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

export default ArtworkList;
