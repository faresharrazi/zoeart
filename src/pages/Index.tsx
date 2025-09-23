import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import RecentExhibitions from "@/components/RecentExhibitions";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <RecentExhibitions />
      <Footer />
    </div>
  );
};

export default Index;
