import { useCallback } from "react";

export const useArtistData = () => {
  const transformArtistData = useCallback(
    (artist: any) => ({
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
    (artists: any[]) => artists.map(transformArtistData),
    [transformArtistData]
  );

  return {
    transformArtistData,
    transformArtistsData,
  };
};
