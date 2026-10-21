import { useCallback } from "react";
import type { Artist } from "@/types/api";

export const useArtistData = () => {
  const transformArtistData = useCallback(
    (artist: Artist) => ({
      id: artist.id.toString(),
      name: artist.name,
      slug: artist.slug,
      specialty: artist.specialty || "",
      bio: artist.bio || "",
      profileImage: artist.profile_image || "",
      socialMedia: artist.social_media || {},
      assignedArtworks: artist.assigned_artworks || [],
      isVisible: artist.is_visible !== false,
    }),
    []
  );

  const transformArtistsData = useCallback(
    (artists: Artist[]) => artists.map(transformArtistData),
    [transformArtistData]
  );

  return {
    transformArtistData,
    transformArtistsData,
  };
};
