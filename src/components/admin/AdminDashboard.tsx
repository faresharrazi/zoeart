import { useEffect, type ComponentType } from "react";
import { useSearchParams } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import type { SectionId } from "./adminSections";
import ArtworkManagement from "./artworks/ArtworkManagement";
import ArtistManagement from "./artists/ArtistManagement";
import ExhibitionManagement from "./exhibitions/ExhibitionManagement";
import ArticlesManagement from "./articles/ArticlesManagement";
import NewsletterManagement from "./newsletter/NewsletterManagement";
import PageContentManagement from "./page-content/PageContentManagement";
import ContactManagement from "./contact/ContactManagement";
import UserManagement from "./UserManagement";
import UsefulLinks from "./UsefulLinks";
import PartnersManagement from "./PartnersManagement";
import AnalyticsDashboard from "./analytics/AnalyticsDashboard";
import type { SessionUser } from "@/types/api";

const SECTIONS: Record<SectionId, ComponentType> = {
  analytics: AnalyticsDashboard,
  exhibitions: ExhibitionManagement,
  articles: ArticlesManagement,
  artists: ArtistManagement,
  artworks: ArtworkManagement,
  pages: PageContentManagement,
  contact: ContactManagement,
  partners: PartnersManagement,
  newsletter: NewsletterManagement,
  users: UserManagement,
  links: UsefulLinks,
};

const isSection = (id: string | null): id is SectionId =>
  id !== null && id in SECTIONS;

interface AdminDashboardProps {
  onLogout: () => void;
  user: SessionUser | null;
}

/** Admin shell; the open section is kept in the URL (?section=artists). */
const AdminDashboard = ({ onLogout, user }: AdminDashboardProps) => {
  const [params] = useSearchParams();
  const requested = params.get("section");
  const active: SectionId = isSection(requested) ? requested : "analytics";
  const Section = SECTIONS[active];

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) onLogout();
  }, [onLogout]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [active]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <AdminSidebar active={active} user={user} onLogout={onLogout} />
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Section key={active} />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
