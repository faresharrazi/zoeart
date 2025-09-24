import { useState, useEffect } from "react";
import {
  getPageSettings,
  getContactInfo,
  getHomeSettings,
} from "@/lib/pageSettings";

// Simple hook that reads from localStorage and updates when it changes
export const usePageData = () => {
  const [pageSettings, setPageSettings] = useState(getPageSettings());
  const [contactInfo, setContactInfo] = useState(getContactInfo());
  const [homeSettings, setHomeSettings] = useState(getHomeSettings());

  useEffect(() => {
    const handleStorageChange = () => {
      // Re-read data from service when localStorage changes
      setPageSettings(getPageSettings());
      setContactInfo(getContactInfo());
      setHomeSettings(getHomeSettings());
    };

    // Listen for custom events
    window.addEventListener("pageDataUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("pageDataUpdated", handleStorageChange);
    };
  }, []);

  return { pageSettings, contactInfo, homeSettings };
};
