import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ExhibitionCard from "@/components/ExhibitionCard";
import { getPageSettings } from "@/lib/pageSettings";

const exhibitions = [
  {
    id: 1,
    slug: "contemporary-visions-2024",
    title: "Contemporary Visions 2024",
    curator: "Dr. Sarah Chen",
    status: "Upcoming",
    dates: "March 15 - June 30, 2024",
    description:
      "A comprehensive survey of contemporary art featuring works that challenge conventional perspectives and explore new visual languages. This exhibition brings together six exceptional artists whose diverse practices reflect the complexity of our modern world.",
    artists: ["Elena Rodriguez", "Marcus Chen", "Sarah Williams"],
    artworks: 12,
    location: "Main Gallery, Floors 1-2",
    call_for_artists: true,
    cta_link: "https://forms.google.com/example1",
    featuredImage: "/artwork-abstract-1.jpg",
    galleryImages: [
      "/artwork-abstract-1.jpg",
      "/artwork-abstract-2.jpg",
      "/artwork-geometric-1.jpg",
      "/artwork-landscape-1.jpg",
      "/artwork-portrait-1.jpg",
      "/artwork-sculpture-1.jpg",
      "/gallery-hero.jpg",
      "/gallery-hero2.jpg",
      "/gallery-hero3.jpg",
      "/artist-alex-rivera.jpg",
      "/artist-david-thompson.jpg",
      "/artist-elena-rodriguez.jpg",
    ],
  },
  {
    id: 2,
    slug: "material-explorations",
    title: "Material Explorations",
    curator: "Alex Martinez",
    status: "Upcoming",
    dates: "July 15 - October 30, 2024",
    description:
      "An innovative exhibition examining how contemporary artists push the boundaries of traditional materials. From steel and glass installations to mixed media compositions, explore how material choices shape artistic expression.",
    artists: ["Alex Rivera", "David Thompson"],
    artworks: 8,
    location: "Sculpture Hall & Garden",
    call_for_artists: false,
    cta_link: "",
    featuredImage: "/artwork-sculpture-1.jpg",
    galleryImages: [
      "/artwork-sculpture-1.jpg",
      "/artwork-geometric-1.jpg",
      "/artwork-abstract-1.jpg",
      "/artwork-landscape-1.jpg",
      "/gallery-hero.jpg",
      "/gallery-hero2.jpg",
      "/artist-david-thompson.jpg",
      "/artist-alex-rivera.jpg",
    ],
  },
  {
    id: 3,
    slug: "intimate-reflections",
    title: "Intimate Reflections",
    curator: "Elena Rodriguez",
    status: "Upcoming",
    dates: "November 10, 2024 - February 15, 2025",
    description:
      "A focused exhibition of contemporary portraiture and personal narratives. These works invite viewers into moments of quiet contemplation and human connection, revealing the profound in the everyday.",
    artists: ["Sarah Williams", "Luna Park"],
    artworks: 6,
    location: "Gallery 3",
    call_for_artists: true,
    cta_link: "https://forms.google.com/example3",
    featuredImage: "/artwork-portrait-1.jpg",
    galleryImages: [
      "/artwork-portrait-1.jpg",
      "/artwork-abstract-2.jpg",
      "/artwork-landscape-1.jpg",
      "/artwork-sculpture-1.jpg",
      "/gallery-hero3.jpg",
      "/artist-elena-rodriguez.jpg",
      "/artist-luna-park.jpg",
      "/artist-sarah-williams.jpg",
    ],
  },
  {
    id: 4,
    slug: "abstract-futures",
    title: "Abstract Futures",
    curator: "Dr. Michael Torres",
    status: "Past",
    dates: "September 20 - December 15, 2023",
    description:
      "A groundbreaking exhibition that explored the evolution of abstract art in the digital age. Featured works that bridge traditional abstract expressionism with contemporary digital influences and new media approaches.",
    artists: ["Elena Rodriguez", "Marcus Chen", "David Thompson"],
    artworks: 15,
    location: "Main Gallery, All Floors",
    call_for_artists: false,
    cta_link: "",
    featuredImage: "/artwork-geometric-1.jpg",
    galleryImages: [
      "/artwork-geometric-1.jpg",
      "/artwork-abstract-1.jpg",
      "/artwork-abstract-2.jpg",
      "/artwork-landscape-1.jpg",
      "/artwork-portrait-1.jpg",
      "/artwork-sculpture-1.jpg",
      "/gallery-hero.jpg",
      "/gallery-hero2.jpg",
      "/gallery-hero3.jpg",
      "/artist-elena-rodriguez.jpg",
      "/artist-marcus-chen.jpg",
      "/artist-david-thompson.jpg",
    ],
  },
];

const Exhibitions = () => {
  const pageSettings = getPageSettings();
  const upcomingExhibitions = exhibitions.filter(
    (ex) => ex.status === "Upcoming"
  );
  const pastExhibitions = exhibitions.filter((ex) => ex.status === "Past");

  const handleExhibitionClick = (exhibitionSlug: string) => {
    window.location.href = `/exhibition/${exhibitionSlug}`;
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-hero relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/src/assets/gallery-hero2.jpg')` }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {pageSettings.exhibition.title}
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {pageSettings.exhibition.description}
            </p>
          </div>
        </div>
      </section>

      <div className="bg-theme-background py-20">
        <div className="container mx-auto px-6 space-y-16">
          {/* Upcoming Exhibitions */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-theme-text-primary">
              Upcoming Exhibitions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingExhibitions.map((exhibition) => (
                <ExhibitionCard
                  key={exhibition.id}
                  exhibition={exhibition}
                  onExhibitionClick={handleExhibitionClick}
                />
              ))}
            </div>
          </section>

          {/* Past Exhibitions */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-theme-text-primary">
              Past Exhibitions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastExhibitions.map((exhibition) => (
                <ExhibitionCard
                  key={exhibition.id}
                  exhibition={exhibition}
                  onExhibitionClick={handleExhibitionClick}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Exhibitions;
