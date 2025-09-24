import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { usePageData } from "@/hooks/usePageData";

const About = () => {
  const { pageSettings } = usePageData();

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-hero relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/src/assets/artwork-abstract-1.jpg')`,
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {pageSettings.about.title}
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {pageSettings.about.description}
            </p>
          </div>
        </div>
      </section>

      <div className="bg-gallery-light-grey py-20">
        <div className="container mx-auto px-6">
          {/* Dynamic Content Blocks */}
          {pageSettings.about.blocks.map(
            (block) =>
              block.isVisible && (
                <section key={block.id} className="mb-16">
                  <Card className="shadow-elegant">
                    <CardContent className="p-12 text-center">
                      <h2 className="text-3xl font-bold mb-6 text-foreground">
                        {block.title}
                      </h2>
                      <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                        {block.content}
                      </p>
                    </CardContent>
                  </Card>
                </section>
              )
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
