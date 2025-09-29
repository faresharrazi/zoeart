// Page visibility and content management
export interface PageSettings {
  exhibition: {
    title: string;
    description: string;
    isVisible: boolean;
  };
  artists: {
    title: string;
    description: string;
    isVisible: boolean;
  };
  gallery: {
    title: string;
    description: string;
    isVisible: boolean;
  };
  about: {
    title: string;
    description: string;
    isVisible: boolean;
    blocks: {
      id: string;
      title: string;
      content: string;
      isVisible: boolean;
    }[];
  };
  contact: {
    title: string;
    description: string;
    isVisible: boolean;
  };
}

export interface ContactInfo {
  email: string;
  phone: string;
  instagram: string;
  address: string;
}

export interface HomeSettings {
  title: string;
  description: string;
  heroImages: string[];
  heroImageIds: number[];
}

// Initialize from localStorage if available, otherwise use defaults
const getStoredData = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Default page settings - in a real app, this would come from a database
export const defaultPageSettings: PageSettings = {
  exhibition: {
    title: "Gallery Exhibitions",
    description:
      "Discover our curated exhibitions that showcase the finest in contemporary art. From solo presentations to thematic group shows, each exhibition offers a unique journey through artistic vision.",
    isVisible: true,
  },
  artists: {
    title: "Featured Artists",
    description:
      "Meet the visionary artists whose works define our contemporary collection. Each brings a unique perspective and mastery of their craft to create pieces that inspire and provoke.",
    isVisible: true,
  },
  gallery: {
    title: "Complete Collection",
    description:
      "Explore our entire collection of contemporary artworks. Use the search and filter tools to discover pieces that speak to you.",
    isVisible: true,
  },
  about: {
    title: "About Aether Art Space",
    description:
      "A contemporary art gallery dedicated to showcasing extraordinary works from emerging and established artists around the world.",
    isVisible: true,
    blocks: [
      {
        id: "block1",
        title: "Our Mission",
        content:
          "To create a bridge between artists and art lovers, fostering dialogue and appreciation for contemporary artistic expression. We believe in the power of art to transform perspectives and enrich lives.",
        isVisible: true,
      },
      {
        id: "block2",
        title: "Our History",
        content:
          "Founded in 2020, Aether Art Space has been at the forefront of contemporary art, showcasing innovative works that challenge and inspire. Our carefully curated collection features works from both emerging and established artists.",
        isVisible: true,
      },
      {
        id: "block3",
        title: "Our Vision",
        content:
          "To be a leading contemporary art space that promotes artistic innovation and cultural dialogue. We envision a world where art serves as a universal language that connects people across cultures and generations.",
        isVisible: true,
      },
    ],
  },
  contact: {
    title: "Stay Connected",
    description:
      "Subscribe to our newsletter for the latest exhibitions, artist features, and exclusive gallery events. Be the first to know about new collections and special openings.",
    isVisible: true,
  },
};

export const defaultContactInfo: ContactInfo = {
  email: "info@aetherartspace.com",
  phone: "(555) 123-4567",
  instagram: "@aetherartspace",
  address: "123 Art Street, Cultural District, New York, NY 10001",
};

export const defaultHomeSettings: HomeSettings = {
  title: "Explore the Art of Tomorrow",
  description:
    "Discover extraordinary works from emerging and established artists. Experience art that challenges, inspires, and transforms.",
  heroImages: [
    "https://via.placeholder.com/1920x1080/393E46/FFFFFF?text=Aether+Art+Space",
    "https://via.placeholder.com/1920x1080/393E46/FFFFFF?text=Contemporary+Art",
    "https://via.placeholder.com/1920x1080/393E46/FFFFFF?text=Gallery+Space",
  ],
  heroImageIds: [],
};

// Simple in-memory storage for demo purposes
// In a real app, this would be stored in a database
let pageSettings: PageSettings = getStoredData(
  "pageSettings",
  defaultPageSettings
);
let contactInfo: ContactInfo = getStoredData("contactInfo", defaultContactInfo);
let homeSettings: HomeSettings = getStoredData(
  "homeSettings",
  defaultHomeSettings
);

export const getPageSettings = (): PageSettings => pageSettings;
export const getContactInfo = (): ContactInfo => contactInfo;
export const getHomeSettings = (): HomeSettings => homeSettings;

export const updatePageSettings = (
  newSettings: Partial<PageSettings>
): void => {
  pageSettings = { ...pageSettings, ...newSettings };
  localStorage.setItem("pageSettings", JSON.stringify(pageSettings));
  window.dispatchEvent(new CustomEvent("pageDataUpdated"));
};

export const updateContactInfo = (
  newContactInfo: Partial<ContactInfo>
): void => {
  contactInfo = { ...contactInfo, ...newContactInfo };
  localStorage.setItem("contactInfo", JSON.stringify(contactInfo));
  window.dispatchEvent(new CustomEvent("pageDataUpdated"));
};

export const updateHomeSettings = (
  newHomeSettings: Partial<HomeSettings>
): void => {
  console.log("Service: Updating home settings", newHomeSettings);
  homeSettings = { ...homeSettings, ...newHomeSettings };
  console.log("Service: New home settings", homeSettings);

  // Save to localStorage
  localStorage.setItem("homeSettings", JSON.stringify(homeSettings));

  // Trigger a custom event to notify components
  window.dispatchEvent(new CustomEvent("pageDataUpdated"));
};

// Force update Exhibition and Contact pages to be visible
export const ensureCorePagesVisible = (): void => {
  const currentPageSettings = getPageSettings();

  // Force Exhibition and Contact to be visible
  const updatedSettings = {
    ...currentPageSettings,
    exhibition: { ...currentPageSettings.exhibition, isVisible: true },
    contact: { ...currentPageSettings.contact, isVisible: true },
  };

  pageSettings = updatedSettings;
  localStorage.setItem("pageSettings", JSON.stringify(pageSettings));
  window.dispatchEvent(new CustomEvent("pageDataUpdated"));

  console.log("Service: Forced Exhibition and Contact pages to be visible");
};

// Helper functions to check page visibility
export const isPageVisible = (pageName: keyof PageSettings): boolean => {
  return pageSettings[pageName].isVisible;
};

export const getVisiblePages = (): (keyof PageSettings)[] => {
  return Object.keys(pageSettings).filter(
    (pageName) => pageSettings[pageName as keyof PageSettings].isVisible
  ) as (keyof PageSettings)[];
};
