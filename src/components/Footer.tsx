import { Instagram, MapPin, Phone, Mail } from "lucide-react";
import logoFooter from "@/assets/logo/Aether_art_space_footer_logo.png";
import {
  getHomeSettings,
  getContactInfo,
  isPageVisible,
} from "@/lib/pageSettings";

const Footer = () => {
  const homeSettings = getHomeSettings();
  const contactInfo = getContactInfo();

  return (
    <footer className="bg-white text-gray-900 py-16 border-t border-gray-200">
      <div className="container mx-auto px-6">
        {/* Mobile Logo Section */}
        <div className="md:hidden text-center mb-12 px-4">
          <img
            src={logoFooter}
            alt="Aether Art Space"
            className="h-40 sm:h-44 w-auto object-contain mx-auto"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            {/* Desktop Logo */}
            <div className="hidden md:block mb-4">
              <img
                src={logoFooter}
                alt="Aether Art Space"
                className="h-32 w-auto object-contain"
              />
            </div>
            <p className="text-gray-600 leading-relaxed max-w-md mb-6 whitespace-pre-line">
              {homeSettings.footerDescription}
            </p>
            <div className="mt-6">
              <p className="text-gray-900 font-bold text-lg mb-2">
                Gallery Hours
              </p>
              <p className="text-gray-600 text-sm whitespace-pre-line">
                {homeSettings.galleryHours}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-4 text-gray-900">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {isPageVisible("exhibition") && (
                <li>
                  <a
                    href="/exhibitions"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                  >
                    Current Exhibitions
                  </a>
                </li>
              )}
              {isPageVisible("artists") && (
                <li>
                  <a
                    href="/artists"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                  >
                    Featured Artists
                  </a>
                </li>
              )}
              {isPageVisible("gallery") && (
                <li>
                  <a
                    href="/collection"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                  >
                    Complete Collection
                  </a>
                </li>
              )}
              {isPageVisible("about") && (
                <li>
                  <a
                    href="/about"
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                  >
                    About Gallery
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-4 text-gray-900">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <p className="text-gray-600">{contactInfo.email}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <p className="text-gray-600">{contactInfo.phone}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Instagram className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <a
                  href={`https://instagram.com/${contactInfo.instagram.replace(
                    "@",
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                >
                  {contactInfo.instagram}
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-sm whitespace-pre-line">
                    {contactInfo.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-gray-600">
            © 2025 Aether Art Space. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
