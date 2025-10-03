const API_BASE_URL = import.meta.env.PROD
  ? "/api"
  : "http://localhost:3001/api";

class ApiClient {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const cacheKey = `${options.method || "GET"}:${url}`;

    // Check cache for GET requests
    if (!options.method || options.method === "GET") {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data as T;
      }
    }

    // Add authentication header for admin endpoints
    const token = localStorage.getItem("adminToken");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (
      token &&
      (endpoint.includes("/admin/") || endpoint.includes("/files/"))
    ) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          const error = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));

          // Handle token expiration
          if (response.status === 401 && error.code === "TOKEN_EXPIRED") {
            // Clear expired token
            localStorage.removeItem("adminToken");
            // Redirect to login
            window.location.href = "/admin";
            throw new Error("Session expired. Please login again.");
          }

          // Retry on 500 errors (server errors)
          if (response.status >= 500 && attempt < retries) {
            console.log(
              `Server error (${response.status}), retrying... (attempt ${attempt}/${retries})`
            );
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
            continue;
          }

          throw new Error(error.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        // Cache GET requests
        if (!options.method || options.method === "GET") {
          this.cache.set(cacheKey, {
            data: data as unknown,
            timestamp: Date.now(),
          });
        }

        return data;
      } catch (error) {
        // If this is the last attempt or not a network error, throw
        if (attempt === retries || !(error instanceof TypeError)) {
          throw error;
        }

        // Network error, retry
        console.log(
          `Network error, retrying... (attempt ${attempt}/${retries})`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error("Max retries exceeded");
  }

  // Public operations
  async getExhibitions() {
    const data = await this.request<any[]>("/exhibitions");
    // Transform image URLs to full URLs
    return data.map((exhibition) => ({
      ...exhibition,
      featured_image: exhibition.featured_image
        ? exhibition.featured_image.startsWith("http")
          ? exhibition.featured_image
          : exhibition.featured_image.startsWith("/api/file/")
          ? `${API_BASE_URL}${exhibition.featured_image.replace(
              "/api/file/",
              "/files/"
            )}`
          : exhibition.featured_image.startsWith("/api/files/")
          ? `${API_BASE_URL}${exhibition.featured_image.replace(
              "/api/files/",
              "/files/"
            )}`
          : `${API_BASE_URL}/files/${exhibition.featured_image}`
        : null,
      gallery_images: Array.isArray(exhibition.gallery_images)
        ? exhibition.gallery_images.map((img: string) =>
            img.startsWith("http")
              ? img
              : img.startsWith("/api/file/")
              ? `${API_BASE_URL}${img.replace("/api/file/", "/files/")}`
              : img.startsWith("/api/files/")
              ? `${API_BASE_URL}${img.replace("/api/files/", "/files/")}`
              : `${API_BASE_URL}/files/${img}`
          )
        : [],
    }));
  }

  async getExhibition(id: number) {
    return this.request(`/exhibitions/${id}`);
  }

  async getArtists() {
    const data = await this.request<any[]>("/artists");
    // Transform image URLs to full URLs
    return data.map((artist) => ({
      ...artist,
      profile_image: artist.profile_image
        ? artist.profile_image.startsWith("http")
          ? artist.profile_image
          : artist.profile_image.startsWith("/api/file/")
          ? `${API_BASE_URL}${artist.profile_image.replace(
              "/api/file/",
              "/files/"
            )}`
          : artist.profile_image.startsWith("/api/files/")
          ? `${API_BASE_URL}${artist.profile_image.replace(
              "/api/files/",
              "/files/"
            )}`
          : `${API_BASE_URL}/files/${artist.profile_image}`
        : null,
    }));
  }

  async getArtist(id: number) {
    return this.request(`/artists/${id}`);
  }

  async getArtworks() {
    const data = await this.request<any[]>("/artworks");
    // Transform image URLs to full URLs
    return data.map((artwork) => ({
      ...artwork,
      images: Array.isArray(artwork.images)
        ? artwork.images.map((img: string) =>
            img.startsWith("http")
              ? img
              : img.startsWith("/api/file/")
              ? `${API_BASE_URL}${img.replace("/api/file/", "/files/")}`
              : img.startsWith("/api/files/")
              ? `${API_BASE_URL}${img.replace("/api/files/", "/files/")}`
              : `${API_BASE_URL}/files/${img}`
          )
        : [],
    }));
  }

  async getArtwork(id: number) {
    return this.request(`/artworks/${id}`);
  }

  // Admin operations for exhibitions
  async getAdminExhibitions() {
    const data = await this.request<any[]>("/admin/exhibitions");
    // Transform image URLs to full URLs
    return data.map((exhibition) => ({
      ...exhibition,
      featured_image: exhibition.featured_image
        ? exhibition.featured_image.startsWith("http")
          ? exhibition.featured_image
          : exhibition.featured_image.startsWith("/api/file/")
          ? `${API_BASE_URL}${exhibition.featured_image.replace(
              "/api/file/",
              "/files/"
            )}`
          : exhibition.featured_image.startsWith("/api/files/")
          ? `${API_BASE_URL}${exhibition.featured_image.replace(
              "/api/files/",
              "/files/"
            )}`
          : `${API_BASE_URL}/files/${exhibition.featured_image}`
        : null,
      gallery_images: Array.isArray(exhibition.gallery_images)
        ? exhibition.gallery_images.map((img: string) =>
            img.startsWith("http")
              ? img
              : img.startsWith("/api/file/")
              ? `${API_BASE_URL}${img.replace("/api/file/", "/files/")}`
              : img.startsWith("/api/files/")
              ? `${API_BASE_URL}${img.replace("/api/files/", "/files/")}`
              : `${API_BASE_URL}/files/${img}`
          )
        : [],
    }));
  }

  async createExhibition(data: any) {
    return this.request("/admin/exhibitions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateExhibition(id: number, data: any) {
    return this.request(`/admin/exhibitions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteExhibition(id: number) {
    return this.request(`/admin/exhibitions/${id}`, {
      method: "DELETE",
    });
  }

  async toggleExhibitionVisibility(id: number, isVisible: boolean) {
    return this.request(`/admin/exhibitions/${id}/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ is_visible: isVisible }),
    });
  }

  // Admin operations for artists
  async createArtist(data: any) {
    return this.request("/admin/artists", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateArtist(id: number, data: any) {
    return this.request(`/admin/artists/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteArtist(id: number) {
    return this.request(`/admin/artists/${id}`, {
      method: "DELETE",
    });
  }

  // Admin operations for artworks
  async createArtwork(data: any) {
    return this.request("/admin/artworks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateArtwork(id: number, data: any) {
    return this.request(`/admin/artworks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteArtwork(id: number) {
    return this.request(`/admin/artworks/${id}`, {
      method: "DELETE",
    });
  }

  // Newsletter subscription (frontend only)
  async subscribeToNewsletter(email: string, name?: string) {
    return this.request("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    });
  }

  // Admin newsletter operations
  async getNewsletterSubscribers() {
    return this.request("/admin/newsletter");
  }

  async deleteNewsletterSubscriber(id: number) {
    return this.request(`/admin/newsletter/${id}`, {
      method: "DELETE",
    });
  }

  // File upload operations
  async uploadFile(file: File, category: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const token = localStorage.getItem("adminToken");
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error("File upload failed");
    }

    return response.json();
  }

  // Image upload operations (Cloudinary-enabled)
  async uploadImage(file: File, category: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const token = localStorage.getItem("adminToken");
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    return response.json();
  }

  // Hero Images API (new separate table)
  async getHeroImages() {
    const timestamp = Date.now();
    const url = `${API_BASE_URL}/hero-images?t=${timestamp}`;
    console.log("🚀🚀🚀 apiClient.getHeroImages: Fetching from", url);
    console.log("🚀🚀🚀 apiClient.getHeroImages: API_BASE_URL is", API_BASE_URL);
    console.log("🚀🚀🚀 apiClient.getHeroImages: Timestamp", timestamp);
    
    try {
      console.log("🚀🚀🚀 apiClient.getHeroImages: About to make fetch request");
      const response = await fetch(url);
      console.log("🚀🚀🚀 apiClient.getHeroImages: Response status", response.status);
      console.log("🚀🚀🚀 apiClient.getHeroImages: Response ok", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("🚀🚀🚀 apiClient.getHeroImages: Error response", errorText);
        throw new Error(`Failed to fetch hero images: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log("🚀🚀🚀 apiClient.getHeroImages: Response data", data);
      console.log("🚀🚀🚀 apiClient.getHeroImages: Data length", data.data?.length);
      console.log("🚀🚀🚀 apiClient.getHeroImages: Success", data.success);
      return data;
    } catch (error) {
      console.error("🚀🚀🚀 apiClient.getHeroImages: Fetch error", error);
      throw error;
    }
  }

  async uploadHeroImage(imageData: {
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
    const token = localStorage.getItem("adminToken");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/hero-images/upload`, {
      method: "POST",
      headers,
      body: JSON.stringify(imageData),
    });

    if (!response.ok) {
      throw new Error("Hero image upload failed");
    }

    return response.json();
  }

  async updateHeroImage(id: number, data: { display_order?: number; is_active?: boolean }) {
    const token = localStorage.getItem("adminToken");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/hero-images/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Hero image update failed");
    }

    return response.json();
  }

  async deleteHeroImage(id: number) {
    const token = localStorage.getItem("adminToken");
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/hero-images/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error("Hero image deletion failed");
    }

    return response.json();
  }

  async bulkUploadHeroImages(images: Array<{
    cloudinary_url: string;
    cloudinary_public_id: string;
    original_name: string;
    file_size?: number;
    mime_type?: string;
    width?: number;
    height?: number;
    format?: string;
  }>) {
    const token = localStorage.getItem("adminToken");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/hero-images/bulk-upload`, {
      method: "POST",
      headers,
      body: JSON.stringify({ images }),
    });

    if (!response.ok) {
      throw new Error("Bulk hero image upload failed");
    }

    return response.json();
  }

  async getFiles(category?: string) {
    const url = category ? `/files?category=${category}` : "/files";
    return this.request(url);
  }

  async getHeroImages() {
    // Add cache-busting parameter to ensure fresh data
    const timestamp = Date.now();
    return this.request(`/files/hero-images?t=${timestamp}`);
  }

  async deleteFile(id: number) {
    return this.request(`/files/${id}`, {
      method: "DELETE",
    });
  }

  // Page content operations
  async getPageContent() {
    // Clear cache to ensure fresh data
    this.clearCacheEntry("/page-content");
    const data = await this.request("/page-content");
    console.log("API Client - getPageContent response:", data);
    return data;
  }

  // About blocks operations
  async getAboutBlocks() {
    return this.request("/about-blocks");
  }

  async getVisibleAboutBlocks() {
    return this.request("/about-blocks/visible");
  }

  async getAboutBlock(id: number) {
    return this.request(`/about-blocks/${id}`);
  }

  async createAboutBlock(data: any) {
    return this.request("/admin/about-blocks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAboutBlock(id: number, data: any) {
    return this.request(`/admin/about-blocks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async toggleAboutBlockVisibility(id: number, isVisible: boolean) {
    return this.request(`/admin/about-blocks/${id}/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ is_visible: isVisible }),
    });
  }

  async deleteAboutBlock(id: number) {
    return this.request(`/admin/about-blocks/${id}`, {
      method: "DELETE",
    });
  }

  async reorderAboutBlocks(blocks: Array<{ id: number; sort_order: number }>) {
    return this.request("/admin/about-blocks/reorder", {
      method: "PATCH",
      body: JSON.stringify({ blocks }),
    });
  }

  async updatePageContent(pageName: string, data: any) {
    // Convert isVisible to is_visible for backend compatibility
    const backendData = { ...data };
    if (data.isVisible !== undefined) {
      backendData.is_visible = data.isVisible;
      delete backendData.isVisible;
    }

    return this.request(`/admin/pages/${pageName}`, {
      method: "PUT",
      body: JSON.stringify(backendData),
    });
  }

  async updateContactInfo(data: any) {
    return this.request("/admin/pages/contact/info", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Working hours operations
  async getWorkingHours() {
    return this.request("/working-hours");
  }

  async getAdminWorkingHours() {
    return this.request("/admin/working-hours");
  }

  async updateWorkingHours(workingHours: any[]) {
    return this.request("/admin/working-hours", {
      method: "PUT",
      body: JSON.stringify({ workingHours }),
    });
  }

  async updateWorkingHour(id: number, data: any) {
    return this.request(`/admin/working-hours/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Home settings operations
  async updateHomeSettings(data: any) {
    return this.request("/admin/home-settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Admin user management operations
  async getUsers() {
    return this.request("/admin/user");
  }

  async updateUser(id: number, userData: any) {
    return this.request(`/admin/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  // Authentication
  async login(username: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  // Articles
  async getArticles() {
    return this.request("/articles");
  }

  async getArticle(id: number) {
    return this.request(`/articles/${id}`);
  }

  async getArticleByExhibition(exhibitionId: number) {
    return this.request(`/articles/exhibition/${exhibitionId}`);
  }

  // Admin Articles
  async getAdminArticles() {
    return this.request("/admin/articles");
  }

  async createArticle(articleData: {
    exhibition_id: number;
    title: string;
    content: string;
    featured_image?: string;
    media_files?: string[];
    author?: string;
    is_published?: boolean;
  }) {
    return this.request("/admin/articles", {
      method: "POST",
      body: JSON.stringify(articleData),
    });
  }

  async updateArticle(
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
    return this.request(`/admin/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(articleData),
    });
  }

  async deleteArticle(id: number) {
    return this.request(`/admin/articles/${id}`, {
      method: "DELETE",
    });
  }

  // Health check
  async healthCheck() {
    return this.request("/health");
  }

  // Clear cache (useful after mutations)
  clearCache() {
    this.cache.clear();
  }

  // Clear specific cache entry
  clearCacheEntry(endpoint: string, method: string = "GET") {
    const cacheKey = `${method}:${API_BASE_URL}${endpoint}`;
    this.cache.delete(cacheKey);
  }
}

export const apiClient = new ApiClient();
