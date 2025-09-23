import { Button } from "@/components/ui/button";
import HeroImageSlider from "@/components/HeroImageSlider";
import heroImage from "@/assets/gallery-hero.jpg";
import heroImage2 from "@/assets/gallery-hero2.jpg";
import heroImage3 from "@/assets/gallery-hero3.jpg";

// Mock data for hero images - in a real app, this would come from your admin panel
const heroImages = [heroImage, heroImage2, heroImage3];

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroImageSlider images={heroImages} interval={2000} />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Text overlay background */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white drop-shadow-lg">
            Explore the Art of
            <span className="block text-white">Tomorrow</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/95 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Discover extraordinary works from emerging and established artists.
            Experience art that challenges, inspires, and transforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="default"
              className="font-semibold px-8 py-3 text-lg shadow-lg"
              onClick={() => (window.location.href = "/exhibitions")}
            >
              Exhibitions
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white bg-transparent hover:bg-white hover:text-theme-primary backdrop-blur-sm px-8 py-3 text-lg shadow-lg"
              onClick={() => (window.location.href = "/contact")}
            >
              Contact
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
