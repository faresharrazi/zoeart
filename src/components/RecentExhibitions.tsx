import ExhibitionCard from "@/components/ExhibitionCard";

// Mock data for exhibitions - in a real app, this would come from your database
const upcomingExhibitions = [
  {
    id: 1,
    slug: "contemporary-visions-2024",
    title: "Contemporary Visions 2024",
    curator: "Dr. Sarah Chen",
    startDate: "2024-03-15",
    endDate: "2024-05-15",
    dates: "March 15 - May 15, 2024",
    location: "Main Gallery",
    description:
      "A comprehensive survey of contemporary art featuring works that challenge conventional perspectives and explore new visual languages. This exhibition brings together six exceptional artists whose diverse practices reflect the complexity of our modern world.",
    featuredImage: "/artwork-abstract-1.jpg",
    status: "upcoming",
    call_for_artists: true,
    cta_link: "https://forms.google.com/example1",
  },
  {
    id: 2,
    slug: "digital-realms",
    title: "Digital Realms",
    curator: "Alex Martinez",
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    dates: "April 1 - June 30, 2024",
    location: "Digital Gallery",
    description:
      "A groundbreaking exhibition featuring digital art, interactive installations, and virtual reality experiences that push the boundaries of traditional art.",
    featuredImage: "/artwork-geometric-1.jpg",
    status: "upcoming",
    call_for_artists: false,
    cta_link: "",
  },
  {
    id: 3,
    slug: "natures-canvas",
    title: "Nature's Canvas",
    curator: "Elena Rodriguez",
    startDate: "2024-05-10",
    endDate: "2024-07-10",
    dates: "May 10 - July 10, 2024",
    location: "Garden Pavilion",
    description:
      "Celebrating the intersection of art and nature through environmental installations, sustainable materials, and eco-conscious artistic practices.",
    featuredImage: "/artwork-landscape-1.jpg",
    status: "upcoming",
    call_for_artists: true,
    cta_link: "https://forms.google.com/example2",
  },
];

const RecentExhibitions = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleExhibitionClick = (exhibitionSlug: string) => {
    window.location.href = `/exhibition/${exhibitionSlug}`;
  };

  return (
    <section id="recent-exhibitions" className="py-20 bg-theme-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-theme-text-primary">
            Upcoming{" "}
            <span className="text-theme-text-primary">Exhibitions</span>
          </h2>
          <p className="text-xl text-theme-text-muted max-w-3xl mx-auto leading-relaxed">
            Discover our upcoming exhibitions featuring contemporary artists and
            innovative artistic expressions. Join us for these exciting
            showcases of creativity and vision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingExhibitions.map((exhibition) => (
            <ExhibitionCard
              key={exhibition.id}
              exhibition={exhibition}
              onExhibitionClick={handleExhibitionClick}
            />
          ))}
        </div>

        <div className="text-center mt-16">
          <a
            href="/exhibitions"
            className="inline-block bg-theme-primary text-theme-primary-text hover:bg-theme-primary-hover transition-smooth px-8 py-3 text-lg font-semibold"
          >
            View All Exhibitions
          </a>
        </div>
      </div>
    </section>
  );
};

export default RecentExhibitions;
