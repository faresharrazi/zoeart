import type {
  AboutBlock,
  AnalyticsRange,
  AnalyticsSummary,
  AdminUser,
  Article,
  Artist,
  ArtistInput,
  ArtistSummary,
  Artwork,
  ArtworkInput,
  ContactInfo,
  Exhibition,
  ExhibitionInput,
  HeroImage,
  NewsletterSubscriber,
  PageContentResponse,
  Partner,
  SessionUser,
  UploadedImage,
} from "@/types/api";

// In development Vite proxies /api to the Express server (see vite.config.ts).
const API_BASE_URL = "/api";

// Images are stored as full Cloudinary URLs, as references to files kept in
// Postgres (/api/file/<id>, /api/files/<id> or a bare id), or as paths to
// files in public/.
export const normalizeImageUrl = (value: unknown): string => {
  if (typeof value !== "string" || !value) return "";
  if (value.startsWith("http")) return value;
  if (value.startsWith("/api/file/")) {
    return `${API_BASE_URL}/files/${value.slice("/api/file/".length)}`;
  }
  // Other site paths (e.g. /collaborators/1.webp in public/) are used as is
  if (value.startsWith("/")) return value;
  return `${API_BASE_URL}/files/${value}`;
};

const normalizeArtist = <T extends Pick<ArtistSummary, "profile_image">>(
  artist: T
): T => ({
  ...artist,
  profile_image: normalizeImageUrl(artist.profile_image) || null,
});

const normalizeExhibition = (exhibition: Exhibition): Exhibition => ({
  ...exhibition,
  featured_image: normalizeImageUrl(exhibition.featured_image) || null,
  gallery_images: Array.isArray(exhibition.gallery_images)
    ? exhibition.gallery_images.map(normalizeImageUrl).filter(Boolean)
    : [],
  artists: Array.isArray(exhibition.artists)
    ? exhibition.artists.map(normalizeArtist)
    : undefined,
});

const normalizeArtwork = (artwork: Artwork): Artwork => ({
  ...artwork,
  images: Array.isArray(artwork.images)
    ? artwork.images.map(normalizeImageUrl).filter(Boolean)
    : [],
  featured_image: normalizeImageUrl(artwork.featured_image) || null,
});

/** The message of a thrown error, or `fallback` for anything else. */
export const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

class ApiClient {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  // Reads already on their way, so components asking for the same data at
  // the same time share one request
  private inFlight = new Map<string, Promise<unknown>>();

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = options.method || "GET";
    const isRead = method === "GET";

    if (isRead) {
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data as T;
      }
      const pending = this.inFlight.get(url);
      if (pending) return pending as Promise<T>;
      const promise = this.fetchWithRetries<T>(url, options, true, retries);
      this.inFlight.set(url, promise);
      return promise.finally(() => this.inFlight.delete(url));
    }

    return this.fetchWithRetries<T>(url, options, false, 1);
  }

  private async fetchWithRetries<T>(
    url: string,
    options: RequestInit,
    isRead: boolean,
    attempts: number
  ): Promise<T> {
    // Send the admin token whenever we have one; public endpoints ignore it.
    const token = localStorage.getItem("adminToken");
    const headers: Record<string, string> = {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Only reads are retried: repeating a write could apply it twice.
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
          const error = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));

          // Expired or revoked login: sign out and go back to the login form
          if (
            response.status === 401 &&
            (error.code === "TOKEN_EXPIRED" || error.code === "INVALID_TOKEN")
          ) {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
            window.location.href = "/admin";
            throw new ApiError("Session expired. Please login again.", 401);
          }

          if (response.status >= 500 && attempt < attempts) {
            await new Promise((resolve) =>
              setTimeout(resolve, 500 * 2 ** attempt)
            );
            continue;
          }

          throw new ApiError(
            error.error || `HTTP ${response.status}`,
            response.status
          );
        }

        const data = await response.json();

        if (isRead) {
          this.cache.set(url, { data, timestamp: Date.now() });
        } else {
          // Any change can affect any list; start fresh.
          this.cache.clear();
        }

        return data;
      } catch (error) {
        // Retry network failures (TypeError from fetch) on reads only
        if (attempt === attempts || !(error instanceof TypeError)) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
      }
    }

    throw new Error("Max retries exceeded");
  }

  private send<T = unknown>(endpoint: string, method: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method,
      body:
        body instanceof FormData || body === undefined
          ? (body as FormData | undefined)
          : JSON.stringify(body),
    });
  }

  // Exhibitions
  async getExhibitions() {
    const data = await this.request<Exhibition[]>("/exhibitions");
    return data.map(normalizeExhibition);
  }

  async getExhibition(idOrSlug: number | string) {
    const data = await this.request<Exhibition>(
      `/exhibitions/${encodeURIComponent(idOrSlug)}`
    );
    return normalizeExhibition(data);
  }

  async getAdminExhibitions() {
    const data = await this.request<Exhibition[]>("/admin/exhibitions");
    return data.map(normalizeExhibition);
  }

  createExhibition(data: ExhibitionInput) {
    return this.send("/admin/exhibitions", "POST", data);
  }

  updateExhibition(id: number, data: ExhibitionInput) {
    return this.send(`/admin/exhibitions/${id}`, "PUT", data);
  }

  deleteExhibition(id: number) {
    return this.send(`/admin/exhibitions/${id}`, "DELETE");
  }

  toggleExhibitionVisibility(id: number, isVisible: boolean) {
    return this.send(`/admin/exhibitions/${id}/visibility`, "PATCH", {
      is_visible: isVisible,
    });
  }

  // Artists
  async getArtists() {
    const data = await this.request<Artist[]>("/artists");
    return data.map(normalizeArtist);
  }

  async getArtist(idOrSlug: number | string) {
    const data = await this.request<Artist>(
      `/artists/${encodeURIComponent(idOrSlug)}`
    );
    return normalizeArtist(data);
  }

  async getAdminArtists() {
    const data = await this.request<Artist[]>("/admin/artists");
    return data.map(normalizeArtist);
  }

  createArtist(data: ArtistInput) {
    return this.send("/admin/artists", "POST", data);
  }

  updateArtist(id: number, data: ArtistInput) {
    return this.send(`/admin/artists/${id}`, "PUT", data);
  }

  deleteArtist(id: number) {
    return this.send(`/admin/artists/${id}`, "DELETE");
  }

  // Artworks
  async getArtworks(filter: { artist?: number | string } = {}) {
    const query = filter.artist
      ? `?artist=${encodeURIComponent(filter.artist)}`
      : "";
    const data = await this.request<Artwork[]>(`/artworks${query}`);
    return data.map(normalizeArtwork);
  }

  async getArtwork(idOrSlug: number | string) {
    const data = await this.request<Artwork>(
      `/artworks/${encodeURIComponent(idOrSlug)}`
    );
    return {
      ...normalizeArtwork(data),
      artist: data.artist ? normalizeArtist(data.artist) : null,
    };
  }

  async getAdminArtworks() {
    const data = await this.request<Artwork[]>("/admin/artworks");
    return data.map(normalizeArtwork);
  }

  createArtwork(data: ArtworkInput) {
    return this.send("/admin/artworks", "POST", data);
  }

  updateArtwork(id: number, data: ArtworkInput) {
    return this.send(`/admin/artworks/${id}`, "PUT", data);
  }

  deleteArtwork(id: number) {
    return this.send(`/admin/artworks/${id}`, "DELETE");
  }

  // Newsletter
  subscribeToNewsletter(email: string, name?: string) {
    return this.send("/newsletter/subscribe", "POST", { email, name });
  }

  getNewsletterSubscribers() {
    return this.request<NewsletterSubscriber[]>("/admin/newsletter");
  }

  deleteNewsletterSubscriber(id: number) {
    return this.send(`/admin/newsletter/${id}`, "DELETE");
  }

  // Uploads (Cloudinary when configured on the server)
  uploadImage(file: File, category: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    return this.send<{ success: boolean; file: UploadedImage }>(
      "/admin/images/upload",
      "POST",
      formData
    );
  }

  // Used by the rich text editor
  uploadFile(file: File, category: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    return this.send<{ success: boolean; file: UploadedImage }>(
      "/admin/files/upload",
      "POST",
      formData
    );
  }

  // Hero images (home page slider)
  getHeroImages() {
    return this.request<{ success: boolean; data: HeroImage[] }>(
      "/hero-images"
    );
  }

  uploadHeroImage(imageData: {
    cloudinary_url: string;
    cloudinary_public_id: string;
    original_name: string;
    file_size?: number;
    mime_type?: string;
    width?: number;
    height?: number;
    format?: string;
    display_order?: number;
  }) {
    return this.send<{ success: boolean; data: HeroImage }>(
      "/admin/hero-images/upload",
      "POST",
      imageData
    );
  }

  updateHeroImage(
    id: number,
    data: { display_order?: number; is_active?: boolean }
  ) {
    return this.send(`/admin/hero-images/${id}`, "PUT", data);
  }

  deleteHeroImage(id: number) {
    return this.send(`/admin/hero-images/${id}`, "DELETE");
  }

  // Page content
  getPageContent() {
    return this.request<PageContentResponse>("/page-content");
  }

  updatePageContent(
    pageName: string,
    data: {
      title?: string;
      description?: string;
      content?: Record<string, unknown>;
      isVisible?: boolean;
    }
  ) {
    // The API expects is_visible
    const backendData: Record<string, unknown> = { ...data };
    if (data.isVisible !== undefined) {
      backendData.is_visible = data.isVisible;
      delete backendData.isVisible;
    }
    return this.send(`/admin/pages/${pageName}`, "PUT", backendData);
  }

  updateContactInfo(data: Partial<Omit<ContactInfo, "id" | "updated_at">>) {
    return this.send("/admin/pages/contact/info", "PUT", data);
  }

  // About blocks
  getAboutBlocks() {
    return this.request<{ success: boolean; data: AboutBlock[] }>(
      "/about-blocks"
    );
  }

  getAdminAboutBlocks() {
    return this.request<{ success: boolean; data: AboutBlock[] }>(
      "/admin/about-blocks"
    );
  }

  createAboutBlock(
    data: Pick<AboutBlock, "title" | "content"> & Partial<AboutBlock>
  ) {
    return this.send("/admin/about-blocks", "POST", data);
  }

  updateAboutBlock(id: number, data: Partial<AboutBlock>) {
    return this.send(`/admin/about-blocks/${id}`, "PUT", data);
  }

  toggleAboutBlockVisibility(id: number, isVisible: boolean) {
    return this.send(`/admin/about-blocks/${id}/visibility`, "PATCH", {
      is_visible: isVisible,
    });
  }

  deleteAboutBlock(id: number) {
    return this.send(`/admin/about-blocks/${id}`, "DELETE");
  }

  reorderAboutBlocks(blocks: Array<{ id: number; sort_order: number }>) {
    return this.send("/admin/about-blocks/reorder", "PATCH", { blocks });
  }

  // Partners (footer logos)
  getAdminPartners() {
    return this.request<Partner[]>("/admin/partners");
  }

  createPartner(data: Pick<Partner, "name" | "logo_url"> & Partial<Partner>) {
    return this.send<Partner>("/admin/partners", "POST", data);
  }

  updatePartner(id: number, data: Partial<Partner>) {
    return this.send<Partner>(`/admin/partners/${id}`, "PUT", data);
  }

  deletePartner(id: number) {
    return this.send(`/admin/partners/${id}`, "DELETE");
  }

  reorderPartners(ids: number[]) {
    return this.send("/admin/partners/reorder", "PATCH", { ids });
  }

  // Analytics
  /** Records a page view (see src/components/PageViewTracker.tsx) */
  trackPageView(data: { path: string; referrer?: string; utm_source?: string }) {
    return fetch(`${API_BASE_URL}/analytics/pageview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(() => undefined);
  }

  getAnalytics(range: AnalyticsRange) {
    return this.request<AnalyticsSummary>(`/admin/analytics?range=${range}`, {
      cache: "no-store",
    });
  }

  // Admin users
  getUsers() {
    return this.request<AdminUser[]>("/admin/user");
  }

  updateUser(
    id: number,
    userData: {
      username: string;
      email: string;
      password?: string;
      currentPassword?: string;
    }
  ) {
    return this.send(`/admin/user/${id}`, "PUT", userData);
  }

  // Authentication
  verifySession() {
    return this.request<{ success: boolean; user: SessionUser }>(
      "/auth/verify",
      {
        cache: "no-store",
      }
    );
  }

  login(username: string, password: string) {
    return this.send<{ success: boolean; token: string; user: SessionUser }>(
      "/auth/login",
      "POST",
      { username, password }
    );
  }

  // Articles
  getArticleByExhibition(exhibitionId: number) {
    return this.request<{ success: boolean; data: Article }>(
      `/articles/exhibition/${exhibitionId}`
    );
  }

  getAdminArticles() {
    return this.request<{ success: boolean; data: Article[] }>(
      "/admin/articles"
    );
  }

  createArticle(articleData: {
    exhibition_id: number;
    title: string;
    content: string;
    featured_image?: string;
    media_files?: string[];
    author?: string;
    is_published?: boolean;
  }) {
    return this.send<{ success: boolean; data: Article; message: string }>(
      "/admin/articles",
      "POST",
      articleData
    );
  }

  updateArticle(
    id: number,
    articleData: {
      title?: string;
      content?: string;
      featured_image?: string;
      media_files?: string[];
      author?: string;
      is_published?: boolean;
    }
  ) {
    return this.send<{ success: boolean; data: Article; message: string }>(
      `/admin/articles/${id}`,
      "PUT",
      articleData
    );
  }

  deleteArticle(id: number) {
    return this.send<{ success: boolean; message: string }>(
      `/admin/articles/${id}`,
      "DELETE"
    );
  }

  clearCache() {
    this.cache.clear();
  }
}

export const apiClient = new ApiClient();
