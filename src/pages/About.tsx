import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
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
              About <span className="text-white">Aether Art Space</span>
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              A contemporary art gallery dedicated to showcasing extraordinary
              works from emerging and established artists around the world.
            </p>
          </div>
        </div>
      </section>

      <div className="bg-gallery-light-grey py-20">
        <div className="container mx-auto px-6">
          {/* Mission Statement */}
          <section className="mb-16">
            <Card className="shadow-elegant">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-6 text-foreground">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                  Zωή Art Gallery exists to bridge the gap between artists and
                  art lovers, creating a space where contemporary art can be
                  experienced, understood, and celebrated. We believe that art
                  has the power to transform perspectives, spark conversations,
                  and enrich lives. Our mission is to present thought-provoking
                  exhibitions that challenge conventions while making
                  contemporary art accessible to all.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* History & Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card className="shadow-elegant">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Our History
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Founded in 2018, Zωή Art Gallery began as a passion project to
                  create a space where contemporary artists could showcase their
                  work in an environment that honors both traditional
                  craftsmanship and modern innovation.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Located in the heart of Athens, we have presented over 50
                  exhibitions, representing more than 200 artists from around
                  the globe. Our commitment to artistic excellence and
                  curatorial integrity has made us a respected voice in the
                  contemporary art world.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Our Vision
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We envision a future where art transcends boundaries and
                  connects people across cultures, backgrounds, and beliefs. Our
                  gallery serves as a catalyst for meaningful dialogue about the
                  issues that shape our world.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Through carefully curated exhibitions, educational programs,
                  and community engagement, we strive to make contemporary art a
                  vital part of public discourse and personal growth.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gallery Space */}
          <section className="mb-16">
            <Card className="shadow-elegant">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-foreground">
                  The Gallery Space
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gallery-charcoal mb-2">
                      Main Gallery
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Our 3,000 sq ft main exhibition space features soaring
                      ceilings and natural lighting, providing the perfect
                      backdrop for large-scale installations and paintings.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gallery-charcoal mb-2">
                      Intimate Galleries
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Three smaller gallery spaces offer more intimate viewing
                      experiences for delicate works, photography, and solo
                      exhibitions requiring focused attention.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gallery-charcoal mb-2">
                      Sculpture Garden
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Our outdoor sculpture garden provides a unique environment
                      for three-dimensional works and installations that
                      interact with natural elements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
