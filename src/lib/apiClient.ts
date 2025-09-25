const API_BASE_URL = import.meta.env.PROD
  ? "/api"
  : "http://localhost:3001/api";

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Add authentication header for admin endpoints
    const token = localStorage.getItem("adminToken");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (
      token &&
      (endpoint.includes("/admin/") || endpoint.includes("/files/"))
    ) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Public operations
  async getExhibitions() {
    return this.request("/exhibitions");
  }

  async getExhibition(id: number) {
    return this.request(`/exhibitions/${id}`);
  }

  async getArtists() {
    return this.request("/artists");
  }

  async getArtist(id: number) {
    return this.request(`/artists/${id}`);
  }

  async getArtworks() {
    return this.request("/artworks");
  }

  async getArtwork(id: number) {
    return this.request(`/artworks/${id}`);
  }

  // Admin operations for exhibitions
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
  async subscribeToNewsletter(email: string) {
    return this.request("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
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

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error("File upload failed");
    }

    return response.json();
  }

  async getFiles(category?: string) {
    const url = category ? `/files?category=${category}` : "/files";
    return this.request(url);
  }

  async getHeroImages() {
    return this.request("/hero-images");
  }

  async deleteFile(id: number) {
    return this.request(`/files/${id}`, {
      method: "DELETE",
    });
  }

  // Page content operations
  async getPageContent() {
    return this.request("/page-content");
  }

  async updatePageContent(pageName: string, data: any) {
    return this.request(`/admin/page-content/${pageName}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateContactInfo(data: any) {
    return this.request("/contact-info", {
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

  // Health check
  async healthCheck() {
    return this.request("/health");
  }
}

export const apiClient = new ApiClient();
