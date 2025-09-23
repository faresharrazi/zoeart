import { Instagram, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-theme-primary text-theme-text-on-dark py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-3xl font-bold mb-4 text-white">
              Aether Art Space
            </h3>
            <p className="text-theme-text-muted leading-relaxed max-w-md mb-6">
              A contemporary art space dedicated to showcasing extraordinary
              works from emerging and established artists. Visit us to
              experience art that challenges, inspires, and transforms.
            </p>
            <div className="mt-6">
              <p className="text-white font-bold text-lg mb-2">Gallery Hours</p>
              <p className="text-theme-text-muted text-sm">
                Tuesday - Sunday: 10am - 6pm
                <br />
                Closed Mondays
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/exhibitions"
                  className="text-theme-text-muted hover:text-white transition-colors duration-200 font-medium"
                >
                  Current Exhibitions
                </a>
              </li>
              <li>
                <a
                  href="/artists"
                  className="text-theme-text-muted hover:text-white transition-colors duration-200 font-medium"
                >
                  Featured Artists
                </a>
              </li>
              <li>
                <a
                  href="/collection"
                  className="text-theme-text-muted hover:text-white transition-colors duration-200 font-medium"
                >
                  Complete Collection
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-theme-text-muted hover:text-white transition-colors duration-200 font-medium"
                >
                  About Gallery
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-4 text-white">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-white flex-shrink-0" />
                <p className="text-theme-text-muted">info@aetherartspace.com</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-white flex-shrink-0" />
                <p className="text-theme-text-muted">+30 210 123 4567</p>
              </div>
              <div className="flex items-center space-x-3">
                <Instagram className="w-5 h-5 text-white flex-shrink-0" />
                <a
                  href="https://instagram.com/aetherartspace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-theme-text-muted hover:text-white transition-colors duration-200 font-medium"
                >
                  @aetherartspace
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-theme-text-muted text-sm">
                    123 Art District
                    <br />
                    Athens, Greece 10554
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-theme-border mt-12 pt-8 text-center">
          <p className="text-theme-text-muted">
            © 2025 Aether Art Space. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
