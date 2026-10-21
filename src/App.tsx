import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingState } from "@/components/PageLayout";
import { PageDataProvider } from "@/contexts/PageDataContext";
import PageViewTracker from "@/components/PageViewTracker";
import Index from "./pages/Index";
import Artists from "./pages/Artists";
import Exhibitions from "./pages/Exhibitions";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Collection from "./pages/Collection";
import ArtworkDetail from "./pages/ArtworkDetail";
import ArtistDetail from "./pages/ArtistDetail";
import ExhibitionDetail from "./pages/ExhibitionDetail";
import NotFound from "./pages/NotFound";

// The admin panel (rich text editor, drag and drop...) is loaded only when
// someone opens /admin, so visitors don't download it.
const Admin = lazy(() => import("./pages/Admin"));

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <PageDataProvider>
        <PageViewTracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/exhibitions" element={<Exhibitions />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/artwork/:slug" element={<ArtworkDetail />} />
          <Route path="/artist/:slug" element={<ArtistDetail />} />
          <Route path="/exhibition/:slug" element={<ExhibitionDetail />} />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<LoadingState label="Loading admin…" />}>
                <Admin />
              </Suspense>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageDataProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
