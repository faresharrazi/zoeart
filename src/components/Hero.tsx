import { Button } from "@/components/ui/button";
import heroImage from "@/assets/gallery-hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-75"></div>
      </div>

      <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Explore the Art of
          <span className="block text-gallery-gold">Tomorrow</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
          Discover extraordinary works from emerging and established artists.
          Experience art that challenges, inspires, and transforms.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-gallery-gold hover:bg-gallery-gold/90 text-foreground font-semibold px-8 py-3 text-lg transition-smooth"
            onClick={() => (window.location.href = "/#recent-exhibitions")}
          >
            View Exhibitions
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/80 text-white bg-white/10 hover:bg-white hover:text-foreground backdrop-blur-sm transition-smooth px-8 py-3 text-lg"
            onClick={() => (window.location.href = "/contact")}
          >
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
