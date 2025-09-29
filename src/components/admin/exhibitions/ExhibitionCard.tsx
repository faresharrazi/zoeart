import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  User,
} from "lucide-react";

interface Exhibition {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  curator: string;
  status: "upcoming" | "past";
  featuredImage?: string;
  galleryImages: string[];
  assignedArtists: string[];
  assignedArtworks: string[];
  callForArtists?: boolean;
  ctaLink?: string;
  isVisible?: boolean;
}

interface ExhibitionCardProps {
  exhibition: Exhibition;
  onEdit: (exhibition: Exhibition) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
}

const ExhibitionCard = ({
  exhibition,
  onEdit,
  onDelete,
  onToggleVisibility,
}: ExhibitionCardProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.deleteExhibition(parseInt(exhibition.id));
      onDelete(exhibition.id);
      toast({
        title: "Success",
        description: "Exhibition deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting exhibition:", error);
      toast({
        title: "Error",
        description: "Failed to delete exhibition",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      await apiClient.toggleExhibitionVisibility(
        parseInt(exhibition.id),
        !exhibition.isVisible
      );
      onToggleVisibility(exhibition.id, !exhibition.isVisible);
      toast({
        title: "Success",
        description: `Exhibition ${
          !exhibition.isVisible ? "shown" : "hidden"
        } successfully`,
      });
    } catch (error) {
      console.error("Error toggling exhibition visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update exhibition visibility",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">
              {exhibition.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={
                  exhibition.status === "upcoming" ? "default" : "secondary"
                }
              >
                {exhibition.status}
              </Badge>
              <Badge variant={exhibition.isVisible ? "default" : "outline"}>
                {exhibition.isVisible ? "Visible" : "Hidden"}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {exhibition.featuredImage && (
          <div className="aspect-[3/4] w-full overflow-hidden rounded-lg">
            <img
              src={exhibition.featuredImage}
              alt={exhibition.title}
              className="h-full w-full object-contain"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(exhibition.startDate)} -{" "}
              {formatDate(exhibition.endDate)}
            </span>
          </div>

          {exhibition.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{exhibition.location}</span>
            </div>
          )}

          {exhibition.curator && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span className="line-clamp-1">{exhibition.curator}</span>
            </div>
          )}
        </div>

        {exhibition.description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {exhibition.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleVisibility}
            >
              {exhibition.isVisible ? (
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
              onClick={() => onEdit(exhibition)}
            >
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
                <AlertDialogTitle>Delete Exhibition</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{exhibition.title}"? This
                  action cannot be undone.
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

export default ExhibitionCard;
