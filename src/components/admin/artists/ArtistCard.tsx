import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { Edit, Trash2, Eye, EyeOff, User } from "lucide-react";

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

interface ArtistCardProps {
  artist: Artist;
  onEdit: (artist: Artist) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
}

const ArtistCard = ({
  artist,
  onEdit,
  onDelete,
  onToggleVisibility,
}: ArtistCardProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.deleteArtist(parseInt(artist.id));
      onDelete(artist.id);
      toast({
        title: "Success",
        description: "Artist deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting artist:", error);
      toast({
        title: "Error",
        description: "Failed to delete artist",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      await apiClient.updateArtist(parseInt(artist.id), {
        is_visible: !artist.isVisible,
      });
      onToggleVisibility(artist.id, !artist.isVisible);
      toast({
        title: "Success",
        description: `Artist ${
          !artist.isVisible ? "shown" : "hidden"
        } successfully`,
      });
    } catch (error) {
      console.error("Error toggling artist visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update artist visibility",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={artist.profileImage} alt={artist.name} />
              <AvatarFallback>{getInitials(artist.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">
                {artist.name}
              </CardTitle>
              {artist.specialty && (
                <p className="text-sm text-gray-600 line-clamp-1">
                  {artist.specialty}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={artist.isVisible ? "default" : "secondary"}>
              {artist.isVisible ? "Visible" : "Hidden"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {artist.bio && (
          <p className="text-sm text-gray-600 line-clamp-3">{artist.bio}</p>
        )}

        {artist.socialMedia && Object.keys(artist.socialMedia).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Social Media</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(artist.socialMedia).map(([platform, handle]) => (
                <Badge key={platform} variant="outline" className="text-xs">
                  {platform}: {handle}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleVisibility}
            >
              {artist.isVisible ? (
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

            <Button size="sm" variant="outline" onClick={() => onEdit(artist)}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" disabled={isDeleting}>
                <Trash2 className="w-4 h-4 mr-1" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Artist</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{artist.name}"? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtistCard;
