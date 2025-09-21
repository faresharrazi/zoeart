const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Zωή Art</h3>
            <p className="text-gray-300 leading-relaxed max-w-md">
              A contemporary art gallery dedicated to showcasing extraordinary
              works from emerging and established artists. Visit us to
              experience art that challenges, inspires, and transforms.
            </p>
            <div className="mt-6">
              <p className="text-gallery-gold font-semibold">Gallery Hours</p>
              <p className="text-gray-300 text-sm mt-1">
                Tuesday - Sunday: 10am - 6pm
                <br />
                Closed Mondays
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/exhibitions"
                  className="text-gray-300 hover:text-gallery-gold transition-smooth"
                >
                  Current Exhibitions
                </a>
              </li>
              <li>
                <a
                  href="/artists"
                  className="text-gray-300 hover:text-gallery-gold transition-smooth"
                >
                  Featured Artists
                </a>
              </li>
              <li>
                <a
                  href="/collection"
                  className="text-gray-300 hover:text-gallery-gold transition-smooth"
                >
                  Complete Collection
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-300 hover:text-gallery-gold transition-smooth"
                >
                  About Gallery
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-300">
              <p>
                123 Art District
                <br />
                Athens, Greece 10554
              </p>
              <p>+30 210 123 4567</p>
              <p>hello@zoeart.gr</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Zωή Art Gallery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
