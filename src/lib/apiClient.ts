// In development Vite proxies /api to the Express server (see vite.config.ts).
const API_BASE_URL = "/api";

// Images are stored either as full Cloudinary URLs or as references to files
// kept in Postgres (/api/file/<id>, /api/files/<id> or a bare id).
export const normalizeImageUrl = (value: unknown): string => {
  if (typeof value !== "string" || !value) return "";
  if (value.startsWith("http")) return value;
  if (value.startsWith("/api/file/")) {
    return `${API_BASE_URL}/files/${value.slice("/api/file/".length)}`;
  }
  if (value.startsWith("/api/files/")) return value;
  return `${API_BASE_URL}/files/${value}`;
};

const normalizeArtist = (artist: any) => ({
  ...artist,
  profile_image: normalizeImageUrl(artist.profile_image) || null,
});

const normalizeExhibition = (exhibition: any) => ({
  ...exhibition,
  featured_image: normalizeImageUrl(exhibition.featured_image) || null,
  gallery_images: Array.isArray(exhibition.gallery_images)
    ? exhibition.gallery_images.map(normalizeImageUrl).filter(Boolean)
    : [],
  artists: Array.isArray(exhibition.artists)
    ? exhibition.artists.map(normalizeArtist)
    : undefined,
});

const normalizeArtwork = (artwork: any) => ({
  ...artwork,
  images: Array.isArray(artwork.images)
    ? artwork.images.map(normalizeImageUrl).filter(Boolean)
    : [],
  featured_image: normalizeImageUrl(artwork.featured_image) || null,
});

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
    }

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
    const attempts = isRead ? retries : 1;
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

  private send<T = any>(endpoint: string, method: string, body?: unknown) {
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
    const data = await this.request<any[]>("/exhibitions");
    return data.map(normalizeExhibition);
  }

  async getExhibition(idOrSlug: number | string) {
    const data = await this.request<any>(
      `/exhibitions/${encodeURIComponent(idOrSlug)}`
    );
    return normalizeExhibition(data);
  }

  async getAdminExhibitions() {
    const data = await this.request<any[]>("/admin/exhibitions");
    return data.map(normalizeExhibition);
  }

  createExhibition(data: any) {
    return this.send("/admin/exhibitions", "POST", data);
  }

  updateExhibition(id: number, data: any) {
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
    const data = await this.request<any[]>("/artists");
    return data.map(normalizeArtist);
  }

  async getArtist(idOrSlug: number | string) {
    const data = await this.request<any>(
      `/artists/${encodeURIComponent(idOrSlug)}`
    );
    return normalizeArtist(data);
  }

  async getAdminArtists() {
    const data = await this.request<any[]>("/admin/artists");
    return data.map(normalizeArtist);
  }

  createArtist(data: any) {
    return this.send("/admin/artists", "POST", data);
  }

  updateArtist(id: number, data: any) {
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
    const data = await this.request<any[]>(`/artworks${query}`);
    return data.map(normalizeArtwork);
  }

  async getArtwork(idOrSlug: number | string) {
    const data = await this.request<any>(
      `/artworks/${encodeURIComponent(idOrSlug)}`
    );
    return {
      ...normalizeArtwork(data),
      artist: data.artist ? normalizeArtist(data.artist) : null,
    };
  }

  async getAdminArtworks() {
    const data = await this.request<any[]>("/admin/artworks");
    return data.map(normalizeArtwork);
  }

  createArtwork(data: any) {
    return this.send("/admin/artworks", "POST", data);
  }

  updateArtwork(id: number, data: any) {
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
    return this.request<any[]>("/admin/newsletter");
  }

  deleteNewsletterSubscriber(id: number) {
    return this.send(`/admin/newsletter/${id}`, "DELETE");
  }

  // Uploads (Cloudinary when configured on the server)
  uploadImage(file: File, category: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    return this.send<any>("/admin/images/upload", "POST", formData);
  }

  // Used by the rich text editor
  uploadFile(file: File, category: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    return this.send<any>("/admin/files/upload", "POST", formData);
  }

  // Hero images (home page slider)
  getHeroImages() {
    return this.request<{ success: boolean; data: any[] }>("/hero-images");
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
    return this.send("/admin/hero-images/upload", "POST", imageData);
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
    return this.request<any>("/page-content");
  }

  updatePageContent(pageName: string, data: any) {
    // The API expects is_visible
    const backendData = { ...data };
    if (data.isVisible !== undefined) {
      backendData.is_visible = data.isVisible;
      delete backendData.isVisible;
    }
    return this.send(`/admin/pages/${pageName}`, "PUT", backendData);
  }

  updateContactInfo(data: any) {
    return this.send("/admin/pages/contact/info", "PUT", data);
  }

  // About blocks
  getAboutBlocks() {
    return this.request<{ success: boolean; data: any[] }>("/about-blocks");
  }

  getAdminAboutBlocks() {
    return this.request<{ success: boolean; data: any[] }>(
      "/admin/about-blocks"
    );
  }

  createAboutBlock(data: any) {
    return this.send("/admin/about-blocks", "POST", data);
  }

  updateAboutBlock(id: number, data: any) {
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

  // Opening hours
  getWorkingHours() {
    return this.request<any[]>("/working-hours");
  }

  getAdminWorkingHours() {
    return this.request<any[]>("/admin/working-hours");
  }

  updateWorkingHours(workingHours: any[]) {
    return this.send("/admin/working-hours", "PUT", { workingHours });
  }

  // Admin users
  getUsers() {
    return this.request<any[]>("/admin/user");
  }

  updateUser(id: number, userData: any) {
    return this.send(`/admin/user/${id}`, "PUT", userData);
  }

  // Authentication
  verifySession() {
    return this.request<{ success: boolean; user: unknown }>("/auth/verify", {
      cache: "no-store",
    });
  }

  login(username: string, password: string) {
    return this.send<any>("/auth/login", "POST", { username, password });
  }

  // Articles
  getArticleByExhibition(exhibitionId: number) {
    return this.request<{ success: boolean; data: any }>(
      `/articles/exhibition/${exhibitionId}`
    );
  }

  getAdminArticles() {
    return this.request<{ success: boolean; data: any[] }>("/admin/articles");
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
    return this.send("/admin/articles", "POST", articleData);
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
    return this.send(`/admin/articles/${id}`, "PUT", articleData);
  }

  deleteArticle(id: number) {
    return this.send(`/admin/articles/${id}`, "DELETE");
  }

  clearCache() {
    this.cache.clear();
  }
}

export const apiClient = new ApiClient();
