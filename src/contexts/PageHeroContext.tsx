import { createContext, useContext, useState, ReactNode } from "react";

interface PageHeroContextType {
  heroBackgrounds: {
    home: string;
    exhibitions: string;
    artists: string;
    about: string;
    contact: string;
    collection: string;
  };
  setHeroBackground: (page: keyof PageHeroContextType['heroBackgrounds'], imageUrl: string) => void;
}

const PageHeroContext = createContext<PageHeroContextType | undefined>(
  undefined
);

export const usePageHero = () => {
  const context = useContext(PageHeroContext);
  if (!context) {
    throw new Error("usePageHero must be used within a PageHeroProvider");
  }
  return context;
};

interface PageHeroProviderProps {
  children: ReactNode;
}

export const PageHeroProvider = ({ children }: PageHeroProviderProps) => {
  const [heroBackgrounds, setHeroBackgrounds] = useState({
    home: "/src/assets/gallery-hero.jpg",
    exhibitions: "/src/assets/gallery-hero2.jpg",
    artists: "/src/assets/gallery-hero3.jpg",
    about: "/src/assets/artwork-abstract-1.jpg",
    contact: "/src/assets/artwork-landscape-1.jpg",
    collection: "/src/assets/artwork-portrait-1.jpg",
  });

  const setHeroBackground = (page: keyof typeof heroBackgrounds, imageUrl: string) => {
    setHeroBackgrounds(prev => ({
      ...prev,
      [page]: imageUrl
    }));
  };

  return (
    <PageHeroContext.Provider value={{ heroBackgrounds, setHeroBackground }}>
      {children}
    </PageHeroContext.Provider>
  );
};
