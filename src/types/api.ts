// Shapes of the data returned by the API (see server/routes).

export type ExhibitionStatus = "upcoming" | "current" | "past";

export interface ArtistSummary {
  id: number;
  name: string;
  slug: string;
  specialty?: string;
  profile_image: string | null;
}

export interface Exhibition {
  id: number;
  title: string;
  slug: string;
  description: string;
  /** "YYYY-MM-DD" */
  start_date: string | null;
  end_date: string | null;
  location: string;
  curator: string;
  status: ExhibitionStatus;
  featured_image: string | null;
  gallery_images: string[];
  /** Artist / artwork ids (as strings) */
  assigned_artists: string[];
  assigned_artworks: string[];
  call_for_artists: boolean;
  cta_link: string;
  press_media_name: string;
  press_media_link: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  /** Visible assigned artists; only on single-exhibition responses */
  artists?: ArtistSummary[];
}

export interface Artist {
  id: number;
  name: string;
  slug: string;
  specialty: string;
  bio: string;
  profile_image: string | null;
  /** Platform name to handle or URL */
  social_media: Record<string, string>;
  assigned_artworks: string[];
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Artwork {
  id: number;
  title: string;
  slug: string;
  artist_id: number | null;
  artist_name: string;
  /** Empty when the artist is hidden from the public */
  artist_slug: string;
  year: number | null;
  medium: string;
  size: string;
  description: string;
  images: string[];
  featured_image: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  /** Only on single-artwork responses */
  artist?: ArtistSummary | null;
}

export interface Article {
  id: number;
  exhibition_id: number;
  title: string;
  content: string;
  featured_image?: string | null;
  media_files?: string[] | null;
  author?: string | null;
  published_at?: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  exhibition_title?: string | null;
  exhibition_slug?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  curator?: string | null;
}

export interface HeroImage {
  id: number;
  cloudinary_url: string;
  cloudinary_public_id: string;
  original_name: string;
  file_size?: number | null;
  mime_type?: string | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface AboutBlock {
  id: number;
  block_id: string;
  title: string;
  content: string;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WorkingHour {
  id: number | string;
  day: string;
  time_frame: string;
  is_active: boolean;
}

export interface PageEntry {
  page_name?: string;
  title: string;
  description: string;
  // Free-form settings saved by the page editors
  content: Record<string, unknown> & { description?: string };
  isVisible: boolean;
}

export interface ContactInfo {
  id: number;
  email: string;
  phone: string;
  instagram: string;
  address: string;
  updated_at: string;
}

export interface PageContentResponse {
  pages: Record<string, PageEntry>;
  /** {} when no contact info has been saved yet */
  contactInfo: ContactInfo | Record<string, never>;
}

export type UserRole = "admin" | "editor";

export interface SessionUser {
  id: number;
  username: string;
  role: UserRole;
}

export interface AdminUser extends SessionUser {
  email: string;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  name: string | null;
  status: "active" | "unsubscribed";
  source: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface UploadedImage {
  id: number | string;
  url: string;
  originalName?: string;
  filename?: string;
  fileSize?: number;
  mimeType?: string;
  source?: "cloudinary" | "database";
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
}

/** Fields accepted when creating or updating a record */
export type ExhibitionInput = Partial<
  Omit<Exhibition, "id" | "created_at" | "updated_at" | "artists">
>;
export type ArtistInput = Partial<
  Omit<Artist, "id" | "created_at" | "updated_at">
>;
export type ArtworkInput = Partial<
  Omit<
    Artwork,
    | "id"
    | "created_at"
    | "updated_at"
    | "artist"
    | "artist_name"
    | "artist_slug"
  >
>;

/** Fields edited in the page content forms (page text and contact details) */
export interface PageFormData {
  title?: string;
  description?: string;
  isVisible?: boolean;
  content?: Record<string, unknown>;
  email?: string;
  phone?: string;
  instagram?: string;
  address?: string;
}
