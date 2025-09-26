import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Image,
  Upload,
  X,
} from "lucide-react";
import MediaSelector from "./MediaSelector";
import FeaturedImageSelector from "./FeaturedImageSelector";
import { apiClient } from "@/lib/apiClient";

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
  galleryImages: string[]; // multiple gallery images
  assignedArtists: string[]; // artist IDs
  assignedArtworks: string[]; // artwork IDs
  callForArtists?: boolean; // enable/disable CTA button
  ctaLink?: string; // link for the CTA button
  isVisible?: boolean; // visibility on frontend
}

// Data will be fetched from database

const ExhibitionManagement = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Exhibition>>({});
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exhibitionsData, artistsData, artworksData] = await Promise.all([
          apiClient.getExhibitions(),
          apiClient.getArtists(),
          apiClient.getArtworks(),
        ]);

        // Transform exhibitions data to match interface
        const transformedExhibitions = exhibitionsData.map(
          (exhibition: any) => ({
            id: exhibition.id.toString(),
            title: exhibition.title,
            description: exhibition.description || "",
            startDate: exhibition.start_date,
            endDate: exhibition.end_date,
            location: exhibition.location || "",
            curator: exhibition.curator || "",
            status: exhibition.status,
            featuredImage: exhibition.featured_image
              ? exhibition.featured_image.startsWith("/api/file/")
                ? exhibition.featured_image
                : exhibition.featured_image.startsWith("blob:")
                ? `/api/file/${exhibition.featured_image.split("/").pop()}`
                : exhibition.featured_image && exhibition.featured_image !== "undefined"
                ? `/api/file/${exhibition.featured_image}`
                : ""
              : "",
            galleryImages: (exhibition.gallery_images || [])
              .map((img) =>
                typeof img === "string" && img.startsWith("/api/file/")
                  ? img
                  : typeof img === "string" && img.startsWith("blob:")
                  ? `/api/file/${img.split("/").pop()}`
                  : typeof img === "string" && img && img !== "undefined"
                  ? `/api/file/${img}`
                  : null
              )
              .filter((img) => img !== null),
            assignedArtists: exhibition.assigned_artists || [],
            assignedArtworks: exhibition.assigned_artworks || [],
            callForArtists: exhibition.call_for_artists || false,
            ctaLink: exhibition.cta_link || "",
            isVisible: exhibition.is_visible !== false, // Convert to boolean
          })
        );

        setExhibitions(transformedExhibitions);
        setArtists(artistsData);
        setArtworks(artworksData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load exhibitions data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleEdit = (exhibition: Exhibition) => {
    setFormData(exhibition);
    setEditingId(exhibition.id);
    setIsEditing(true);
  };

  const handleAdd = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
      curator: "",
      status: "upcoming",
      featuredImage: "",
      galleryImages: [],
      assignedArtists: [],
      assignedArtworks: [],
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (
      !formData.title ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.status
    ) {
      toast({
        title: "Error",
        description:
          "Title, Start Date, End Date, and Status are required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate slug from title if not provided
      const slug =
        formData.slug ||
        formData.title
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") ||
        "";

      const exhibitionData = {
        title: formData.title,
        slug: slug,
        description: formData.description || "",
        start_date: formData.startDate
          ? new Date(formData.startDate).toISOString().split("T")[0]
          : "",
        end_date: formData.endDate
          ? new Date(formData.endDate).toISOString().split("T")[0]
          : "",
        location: formData.location || "",
        curator: formData.curator || "",
        status: formData.status,
        featured_image: formData.featuredImage || "",
        gallery_images: JSON.stringify(formData.galleryImages || []),
        assigned_artists: JSON.stringify(formData.assignedArtists || []),
        assigned_artworks: JSON.stringify(formData.assignedArtworks || []),
        call_for_artists: formData.callForArtists || false,
        cta_link: formData.ctaLink || "",
      };

      if (editingId) {
        // Update existing exhibition
        await apiClient.updateExhibition(parseInt(editingId), exhibitionData);
        toast({
          title: "Success",
          description: "Exhibition updated successfully",
        });
      } else {
        // Add new exhibition
        await apiClient.createExhibition(exhibitionData);
        toast({
          title: "Success",
          description: "New exhibition added successfully",
        });
      }

      // Refresh data from database
      const [exhibitionsData, artistsData, artworksData] = await Promise.all([
        apiClient.getExhibitions(),
        apiClient.getArtists(),
        apiClient.getArtworks(),
      ]);

      // Transform exhibitions data to match interface
      const transformedExhibitions = exhibitionsData.map((exhibition: any) => ({
        id: exhibition.id.toString(),
        title: exhibition.title,
        slug: exhibition.slug,
        description: exhibition.description || "",
        startDate: exhibition.start_date,
        endDate: exhibition.end_date,
        location: exhibition.location || "",
        curator: exhibition.curator || "",
        status: exhibition.status,
        featuredImage: exhibition.featured_image || "",
        galleryImages: exhibition.gallery_images || [],
        assignedArtists: exhibition.assigned_artists || [],
        assignedArtworks: exhibition.assigned_artworks || [],
        callForArtists: exhibition.call_for_artists || false,
        ctaLink: exhibition.cta_link || "",
      }));

      setExhibitions(transformedExhibitions);
      setArtists(artistsData);
      setArtworks(artworksData);

      setIsEditing(false);
      setFormData({});
    } catch (error) {
      console.error("Error saving exhibition:", error);
      toast({
        title: "Error",
        description: "Failed to save exhibition",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteExhibition(parseInt(id));
      setExhibitions(exhibitions.filter((exhibition) => exhibition.id !== id));
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
    }
  };

  const toggleVisibility = async (exhibition: Exhibition) => {
    try {
      const newVisibility = !exhibition.isVisible;

      await apiClient.toggleExhibitionVisibility(
        parseInt(exhibition.id),
        newVisibility
      );

      toast({
        title: "Success",
        description: `Exhibition ${
          newVisibility ? "shown" : "hidden"
        } on frontend`,
      });

      // Update local state
      setExhibitions((prev) =>
        prev.map((ex) =>
          ex.id === exhibition.id ? { ...ex, isVisible: newVisibility } : ex
        )
      );
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update exhibition visibility",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "past":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper functions for image management
  const handleImageUpload = async (file: File) => {
    try {
      const response = await apiClient.uploadFile(file, "exhibition");
      return `/api/file/${response.id}`;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleGalleryImageUpload = async (file: File) => {
    try {
      const imageUrl = await handleImageUpload(file);
      setFormData({
        ...formData,
        galleryImages: [...(formData.galleryImages || []), imageUrl],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const handleBulkGalleryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadPromises = Array.from(files).map((file) =>
        handleImageUpload(file)
      );
      const imageUrls = await Promise.all(uploadPromises);

      setFormData({
        ...formData,
        galleryImages: [...(formData.galleryImages || []), ...imageUrls],
      });

      // Reset the input
      e.target.value = "";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload some images",
        variant: "destructive",
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    const newImages =
      formData.galleryImages?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, galleryImages: newImages });
  };

  // Helper functions for assignments
  const toggleArtistAssignment = (artistId: string) => {
    const currentArtists = formData.assignedArtists || [];
    const newArtists = currentArtists.includes(artistId)
      ? currentArtists.filter((id) => id !== artistId)
      : [...currentArtists, artistId];
    setFormData({ ...formData, assignedArtists: newArtists });
  };

  const toggleArtworkAssignment = (artworkId: string) => {
    const currentArtworks = formData.assignedArtworks || [];
    const newArtworks = currentArtworks.includes(artworkId)
      ? currentArtworks.filter((id) => id !== artworkId)
      : [...currentArtworks, artworkId];
    setFormData({ ...formData, assignedArtworks: newArtworks });
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl ">
            {editingId ? "Edit Exhibition" : "Add New Exhibition"}
          </h2>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm  mb-2">Title *</label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter exhibition title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm  mb-2">Slug *</label>
                <Input
                  value={formData.slug || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="exhibition-url-slug"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly version of the title (auto-generated if empty)
                </p>
              </div>

              <div>
                <label className="block text-sm  mb-2">Start Date *</label>
                <Input
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm  mb-2">End Date *</label>
                <Input
                  type="date"
                  value={formData.endDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm  mb-2">Status *</label>
                <Select
                  value={formData.status || ""}
                  onValueChange={(value: "upcoming" | "past") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm  mb-2">Location</label>
                <Input
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Main Gallery, First Floor"
                />
              </div>

              <div>
                <label className="block text-sm  mb-2">Curator</label>
                <Input
                  value={formData.curator || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, curator: e.target.value })
                  }
                  placeholder="Enter curator name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm  mb-2">Description</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter exhibition description..."
                rows={4}
              />
            </div>

            {/* Call for Artists Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="callForArtists"
                  checked={formData.callForArtists || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      callForArtists: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <label htmlFor="callForArtists" className="text-sm ">
                  Open Call for Artists
                </label>
              </div>

              {formData.callForArtists && (
                <div>
                  <label className="block text-sm  mb-2">
                    CTA Link (Google Form, etc.)
                  </label>
                  <Input
                    value={formData.ctaLink || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, ctaLink: e.target.value })
                    }
                    placeholder="https://forms.google.com/..."
                    type="url"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This link will be used for the "Join as an Artist" button
                  </p>
                </div>
              )}
            </div>

            {/* Gallery Images Section */}
            <div>
              <label className="block text-sm  mb-2">Gallery Images</label>
              <div className="space-y-4">
                {/* Upload new images */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBulkGalleryImageUpload}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <label
                    htmlFor="gallery-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload gallery images (multiple files supported)
                    </span>
                  </label>
                </div>

                {/* Display uploaded images */}
                {formData.galleryImages &&
                  formData.galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.galleryImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() =>
                              setFormData({ ...formData, featuredImage: image })
                            }
                            className={`absolute bottom-1 left-1 px-2 py-1 text-xs rounded ${
                              formData.featuredImage === image
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-700"
                            }`}
                          >
                            {formData.featuredImage === image
                              ? "Featured"
                              : "Set Featured"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Artist Assignment Section */}
            <div>
              <label className="block text-sm  mb-2">Assign Artists</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {artists.map((artist) => (
                  <label
                    key={artist.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        formData.assignedArtists?.includes(artist.id) || false
                      }
                      onChange={() => toggleArtistAssignment(artist.id)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {artist.name} ({artist.specialty})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Artwork Assignment Section */}
            <div>
              <label className="block text-sm  mb-2">Assign Artworks</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {artworks.map((artwork) => (
                  <label
                    key={artwork.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        formData.assignedArtworks?.includes(artwork.id) || false
                      }
                      onChange={() => toggleArtworkAssignment(artwork.id)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {artwork.title} by {artwork.artist}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} className="">
              {editingId ? "Update Exhibition" : "Add Exhibition"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl ">Exhibition Management</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">Loading exhibitions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl ">Exhibition Management</h2>
        <Button onClick={handleAdd} className="">
          <Plus className="w-4 h-4 mr-2" />
          Add Exhibition
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exhibitions.map((exhibition) => (
          <Card key={exhibition.id}>
            <div className="aspect-video overflow-hidden relative">
              {exhibition.featuredImage ? (
                <img
                  src={exhibition.featuredImage}
                  alt={exhibition.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Image className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">No Featured Image</p>
                  </div>
                </div>
              )}

              {/* Picture Count Badge */}
              {exhibition.galleryImages &&
                exhibition.galleryImages.length > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-black/70 text-white hover:bg-black/80">
                      <Image className="w-3 h-3 mr-1" />
                      {exhibition.galleryImages.length}
                    </Badge>
                  </div>
                )}

              {/* Visibility Badge */}
              <div className="absolute top-2 left-2">
                <Badge
                  className={
                    exhibition.isVisible
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }
                >
                  {exhibition.isVisible ? "Visible" : "Hidden"}
                </Badge>
              </div>

              {/* CTA Badge */}
              {exhibition.callForArtists && (
                <div className="absolute bottom-2 right-2">
                  <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                    CTA Active
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl ">{exhibition.title}</h3>
                <Badge className={getStatusColor(exhibition.status)}>
                  {exhibition.status}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(exhibition.startDate)} -{" "}
                  {formatDate(exhibition.endDate)}
                </div>

                {exhibition.location && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Location:</strong> {exhibition.location}
                  </p>
                )}

                {exhibition.curator && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Curator:</strong> {exhibition.curator}
                  </p>
                )}

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {exhibition.description}
                </p>

                <p className="text-sm text-muted-foreground">
                  <strong>Gallery Images:</strong>{" "}
                  {exhibition.galleryImages?.length || 0} image(s)
                </p>

                <p className="text-sm text-muted-foreground">
                  <strong>Assigned Artists:</strong>{" "}
                  {exhibition.assignedArtists?.length || 0} artist(s)
                </p>

                <p className="text-sm text-muted-foreground">
                  <strong>Assigned Artworks:</strong>{" "}
                  {exhibition.assignedArtworks?.length || 0} piece(s)
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(`/exhibition/${exhibition.slug}`, "_blank")
                  }
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(exhibition)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={exhibition.isVisible ? "outline" : "secondary"}
                  onClick={() => toggleVisibility(exhibition)}
                  className={
                    exhibition.isVisible
                      ? "text-green-600 hover:text-green-700"
                      : "text-red-600 hover:text-red-700"
                  }
                >
                  {exhibition.isVisible ? "Hide" : "Show"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Exhibition</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <strong>{exhibition.title}</strong>? This action cannot
                        be undone and will remove all associated data including
                        images and gallery content.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(exhibition.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Exhibition
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {exhibitions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Calendar className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg  mb-2">No exhibitions yet</h3>
            <p className="text-sm">
              Get started by adding your first exhibition.
            </p>
          </div>
        </div>
      )}

      {showMediaSelector && (
        <MediaSelector
          selectedImage={formData.featuredImage}
          onSelect={(imageUrl) => {
            setFormData({ ...formData, featuredImage: imageUrl });
            setShowMediaSelector(false);
          }}
          onClose={() => setShowMediaSelector(false)}
          type="exhibition"
        />
      )}
    </div>
  );
};

export default ExhibitionManagement;
