import { Instagram, MapPin, Phone, Mail } from "lucide-react";
const logoFooter = "/logo/Aether_art_space_footer_logo.png";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";

const Footer = () => {
  const { homeSettings, contactInfo, loading } = usePageDataFromDB();

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <footer className="bg-white text-gray-900 py-16 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white text-gray-900 py-16 border-t border-gray-200">
      <div className="container mx-auto px-6">
        {/* Check if there's contact info to determine layout */}
        {contactInfo?.email ||
        contactInfo?.phone ||
        contactInfo?.instagram ||
        contactInfo?.address ? (
          <>
            {/* Mobile Logo Section - Only show when contact info exists */}
            <div className="md:hidden text-center mb-12 px-4">
              <img
                src={logoFooter}
                alt="Aether Art Space"
                className="h-40 sm:h-44 w-auto object-contain mx-auto"
              />
            </div>
            {/* Three-column layout when contact info exists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center md:text-left">
                {/* Desktop Logo */}
                <div className="hidden md:block mb-6">
                  <img
                    src={logoFooter}
                    alt="Aether Art Space"
                    className="h-32 w-auto object-contain"
                  />
                </div>
                {homeSettings?.footerDescription && (
                  <p className="text-gray-600 leading-relaxed max-w-md mb-6 whitespace-pre-line">
                    {homeSettings.footerDescription}
                  </p>
                )}
                {homeSettings?.galleryHours && (
                  <div className="mt-6">
                    <p className="text-gray-900 font-bold text-lg mb-2">
                      Gallery Hours
                    </p>
                    <p className="text-gray-600 text-sm whitespace-pre-line">
                      {homeSettings.galleryHours}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-center md:text-left">
                <h4 className="text-xl font-bold mb-6 text-gray-900">
                  Contact
                </h4>
                <div className="space-y-6">
                  {contactInfo?.email && (
                    <div className="flex items-center justify-center md:justify-start space-x-3">
                      <Mail className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      <p className="text-gray-600">{contactInfo.email}</p>
                    </div>
                  )}
                  {contactInfo?.phone && (
                    <div className="flex items-center justify-center md:justify-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      <p className="text-gray-600">{contactInfo.phone}</p>
                    </div>
                  )}
                  {contactInfo?.instagram && (
                    <div className="flex items-center justify-center md:justify-start space-x-3">
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
                  )}
                  {contactInfo?.address && (
                    <div className="flex items-start justify-center md:justify-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-600 text-sm whitespace-pre-line">
                          {contactInfo.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <h4 className="text-xl font-bold mb-6 text-gray-900">
                  Collaborators
                </h4>
                {/* Desktop/Tablet: Horizontal alignment with bigger logos */}
                <div className="hidden md:flex flex-wrap items-center justify-center gap-8">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <div key={num} className="flex items-center justify-center">
                      <img
                        src={`/collaborators/${num}.${
                          num === 5 || num === 6 ? "jpeg" : "png"
                        }`}
                        alt={`Collaborator ${num}`}
                        className="max-h-20 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-200"
                      />
                    </div>
                  ))}
                </div>

                {/* Mobile: 3-column grid with centered last logo */}
                <div className="md:hidden grid grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <div
                      key={num}
                      className={`flex items-center justify-center ${
                        num === 7 ? "col-start-2" : ""
                      }`}
                    >
                      <img
                        src={`/collaborators/${num}.${
                          num === 5 || num === 6 ? "jpeg" : "png"
                        }`}
                        alt={`Collaborator ${num}`}
                        className="max-h-20 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Centered layout when no contact info */
          <div className="flex flex-col items-center text-center space-y-12">
            {/* Logo - Bigger when no contact info */}
            <div>
              <img
                src={logoFooter}
                alt="Aether Art Space"
                className="h-48 w-auto object-contain mx-auto"
              />
            </div>

            {/* Footer description and gallery hours - centered */}
            {(homeSettings?.footerDescription ||
              homeSettings?.galleryHours) && (
              <div className="max-w-2xl">
                {homeSettings?.footerDescription && (
                  <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line text-lg">
                    {homeSettings.footerDescription}
                  </p>
                )}
                {homeSettings?.galleryHours && (
                  <div>
                    <p className="text-gray-900 font-bold text-xl mb-3">
                      Gallery Hours
                    </p>
                    <p className="text-gray-600 whitespace-pre-line">
                      {homeSettings.galleryHours}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Collaborators - Centered and bigger */}
            <div className="w-full">
              <h4 className="text-2xl font-bold mb-8 text-gray-900">
                Collaborators
              </h4>
              {/* Desktop/Tablet: Horizontal alignment with more spacing */}
              <div className="hidden md:flex flex-wrap items-center justify-center gap-12">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <div key={num} className="flex items-center justify-center">
                    <img
                      src={`/collaborators/${num}.${
                        num === 5 || num === 6 ? "jpeg" : "png"
                      }`}
                      alt={`Collaborator ${num}`}
                      className="max-h-24 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-200"
                    />
                  </div>
                ))}
              </div>

              {/* Mobile: 3-column grid with centered last logo */}
              <div className="md:hidden grid grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <div
                    key={num}
                    className={`flex items-center justify-center ${
                      num === 7 ? "col-start-2" : ""
                    }`}
                  >
                    <img
                      src={`/collaborators/${num}.${
                        num === 5 || num === 6 ? "jpeg" : "png"
                      }`}
                      alt={`Collaborator ${num}`}
                      className="max-h-24 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
