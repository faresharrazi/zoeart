import { supabase, Database } from "./supabase";

type Artist = Database["public"]["Tables"]["artists"]["Row"];
type ArtistInsert = Database["public"]["Tables"]["artists"]["Insert"];
type ArtistUpdate = Database["public"]["Tables"]["artists"]["Update"];

type Artwork = Database["public"]["Tables"]["artworks"]["Row"];
type ArtworkInsert = Database["public"]["Tables"]["artworks"]["Insert"];
type ArtworkUpdate = Database["public"]["Tables"]["artworks"]["Update"];

type Exhibition = Database["public"]["Tables"]["exhibitions"]["Row"];
type ExhibitionInsert = Database["public"]["Tables"]["exhibitions"]["Insert"];
type ExhibitionUpdate = Database["public"]["Tables"]["exhibitions"]["Update"];

// Artist operations
export const artistService = {
  async getAll() {
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("is_visible", true)
      .order("name");

    if (error) throw error;
    return data;
  },

  async getAllForAdmin() {
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(artist: ArtistInsert) {
    const { data, error } = await supabase
      .from("artists")
      .insert(artist)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ArtistUpdate) {
    const { data, error } = await supabase
      .from("artists")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("artists").delete().eq("id", id);

    if (error) throw error;
  },
};

// Artwork operations
export const artworkService = {
  async getAll() {
    const { data, error } = await supabase
      .from("artworks")
      .select(
        `
        *,
        artists (
          id,
          name,
          specialty
        )
      `
      )
      .eq("is_visible", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAllForAdmin() {
    const { data, error } = await supabase
      .from("artworks")
      .select(
        `
        *,
        artists (
          id,
          name,
          specialty
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("artworks")
      .select(
        `
        *,
        artists (
          id,
          name,
          specialty,
          bio,
          education,
          exhibitions,
          profile_image,
          instagram,
          twitter,
          website,
          email
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from("artworks")
      .select(
        `
        *,
        artists (
          id,
          name,
          specialty,
          bio,
          education,
          exhibitions,
          profile_image,
          instagram,
          twitter,
          website,
          email
        )
      `
      )
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data;
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from("artworks")
      .select(
        `
        *,
        artists (
          id,
          name,
          specialty
        )
      `
      )
      .or(
        `title.ilike.%${query}%,description.ilike.%${query}%,artists.name.ilike.%${query}%`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async filterByCategory(category: string) {
    const { data, error } = await supabase
      .from("artworks")
      .select(
        `
        *,
        artists (
          id,
          name,
          specialty
        )
      `
      )
      .eq("medium", category)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(artwork: ArtworkInsert) {
    const { data, error } = await supabase
      .from("artworks")
      .insert(artwork)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ArtworkUpdate) {
    const { data, error } = await supabase
      .from("artworks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("artworks").delete().eq("id", id);

    if (error) throw error;
  },
};

// Exhibition operations
export const exhibitionService = {
  async getAll() {
    const { data, error } = await supabase
      .from("exhibitions")
      .select(
        `
        *,
        exhibition_artworks (
          artworks (
            id,
            title,
            image,
            artists (
              name
            )
          )
        )
      `
      )
      .eq("is_visible", true)
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAllForAdmin() {
    const { data, error } = await supabase
      .from("exhibitions")
      .select(
        `
        *,
        exhibition_artworks (
          artworks (
            id,
            title,
            image,
            artists (
              name
            )
          )
        )
      `
      )
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("exhibitions")
      .select(
        `
        *,
        exhibition_artworks (
          artworks (
            id,
            title,
            image,
            artists (
              name
            )
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByStatus(status: "current" | "upcoming" | "past") {
    const { data, error } = await supabase
      .from("exhibitions")
      .select(
        `
        *,
        exhibition_artworks (
          artworks (
            id,
            title,
            image,
            artists (
              name
            )
          )
        )
      `
      )
      .eq("status", status)
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(exhibition: ExhibitionInsert) {
    const { data, error } = await supabase
      .from("exhibitions")
      .insert(exhibition)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ExhibitionUpdate) {
    const { data, error } = await supabase
      .from("exhibitions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("exhibitions").delete().eq("id", id);

    if (error) throw error;
  },

  async addArtwork(exhibitionId: string, artworkId: string) {
    const { data, error } = await supabase
      .from("exhibition_artworks")
      .insert({
        exhibition_id: exhibitionId,
        artwork_id: artworkId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeArtwork(exhibitionId: string, artworkId: string) {
    const { error } = await supabase
      .from("exhibition_artworks")
      .delete()
      .eq("exhibition_id", exhibitionId)
      .eq("artwork_id", artworkId);

    if (error) throw error;
  },
};

// File upload operations
export const fileService = {
  async uploadImage(
    file: File,
    bucket: "artworks" | "artists" | "exhibitions"
  ) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${bucket}/${fileName}`;

      console.log("Uploading file:", filePath);

      const { data, error } = await supabase.storage
        .from("gallery-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("gallery-images").getPublicUrl(filePath);

      console.log("Upload successful:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  },

  async deleteImage(filePath: string) {
    try {
      const { error } = await supabase.storage
        .from("gallery-images")
        .remove([filePath]);

      if (error) {
        console.error("Delete error:", error);
        throw error;
      }
    } catch (error) {
      console.error("File delete error:", error);
      throw error;
    }
  },
};
