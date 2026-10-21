import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";

/**
 * Records a page view on every navigation, for the admin's Analytics
 * section. No cookies are set. Admin pages, and visits by someone logged in
 * to the admin, are not counted.
 */
const PageViewTracker = () => {
  const { pathname } = useLocation();
  const isFirstView = useRef(true);

  useEffect(() => {
    const firstView = isFirstView.current;
    isFirstView.current = false;

    let loggedIn = false;
    try {
      loggedIn = Boolean(localStorage.getItem("adminToken"));
    } catch {
      // storage unavailable: count the visit
    }
    if (pathname.startsWith("/admin") || loggedIn) return;

    apiClient.trackPageView({
      path: pathname,
      // Only the page that brought the visitor to the site counts as a source
      referrer: firstView ? document.referrer : undefined,
      // Read once per page: filter changes (?q=…) are not new page views
      utm_source:
        new URLSearchParams(window.location.search).get("utm_source") ||
        undefined,
    });
  }, [pathname]);

  return null;
};

export default PageViewTracker;
