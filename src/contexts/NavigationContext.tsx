import { createContext, useContext, useState, ReactNode } from "react";

interface NavigationContextType {
  backgroundImage: string;
  setBackgroundImage: (imageUrl: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const [backgroundImage, setBackgroundImage] = useState(
    "/src/assets/gallery-hero.jpg"
  );

  return (
    <NavigationContext.Provider value={{ backgroundImage, setBackgroundImage }}>
      {children}
    </NavigationContext.Provider>
  );
};
