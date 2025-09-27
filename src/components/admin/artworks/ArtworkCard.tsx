import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { Edit, Trash2, Eye, EyeOff, Image } from "lucide-react";

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

interface ArtworkCardProps {
  artwork: Artwork;
  onEdit: (artwork: Artwork) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
}

const ArtworkCard = ({
  artwork,
  onEdit,
  onDelete,
  onToggleVisibility,
}: ArtworkCardProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.deleteArtwork(parseInt(artwork.id));
      onDelete(artwork.id);
      toast({
        title: "Success",
        description: "Artwork deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting artwork:", error);
      toast({
        title: "Error",
        description: "Failed to delete artwork",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      await apiClient.updateArtwork(parseInt(artwork.id), {
        is_visible: !artwork.isVisible,
      });
      onToggleVisibility(artwork.id, !artwork.isVisible);
      toast({
        title: "Success",
        description: `Artwork ${
          !artwork.isVisible ? "shown" : "hidden"
        } successfully`,
      });
    } catch (error) {
      console.error("Error toggling artwork visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update artwork visibility",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden h-fit">
      <div className="aspect-square overflow-hidden">
        {artwork.featured_image ? (
          <img
            src={artwork.featured_image}
            alt={artwork.title}
            className="w-full h-full object-cover"
          />
        ) : artwork.images &&
        Array.isArray(artwork.images) &&
        artwork.images.length > 0 ? (
          <img
            src={artwork.images[0]}
            alt={artwork.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Image className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-lg font-semibold line-clamp-1">
              {artwork.title}
            </h3>
            <Badge variant={artwork.isVisible ? "default" : "secondary"}>
              {artwork.isVisible ? "Visible" : "Hidden"}
            </Badge>
          </div>
          <p className="text-gray-600 mb-1 line-clamp-1">
            {artwork.artist_name}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            {artwork.year} • {artwork.medium}
          </p>
          <p className="text-sm text-gray-500 line-clamp-1">{artwork.size}</p>
        </div>

        {artwork.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {artwork.description}
          </p>
        )}

        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleVisibility}
            className="flex-1"
          >
            {artwork.isVisible ? (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                Hide
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Show
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(artwork)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" disabled={isDeleting}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{" "}
                  <strong>{artwork.title}</strong> by{" "}
                  <strong>{artwork.artist_name}</strong>? This action cannot be
                  undone and will remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete Artwork"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtworkCard;
