import { Instagram, Phone, Mail } from "lucide-react";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { instagramUrl } from "@/lib/contact";
import { imageUrl } from "@/lib/images";
import type { Partner } from "@/types/api";

const logoFooter = "/logo/logo-footer.png";

// Partner logos are managed in the admin panel (Partners)
const Collaborators = ({
  partners,
  large = false,
}: {
  partners: Partner[];
  large?: boolean;
}) => (
  <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 max-w-md lg:max-w-none mx-auto">
    {partners.map((partner) => {
      const logo = (
        <img
          src={imageUrl(partner.logo_url, { width: 240, height: 240 })}
          alt={partner.name}
          title={partner.name}
          loading="lazy"
          width={240}
          height={240}
          className={`${
            large ? "h-28" : "h-24"
          } w-auto object-contain grayscale opacity-70 transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-105`}
        />
      );
      return (
        <li key={partner.id}>
          {partner.website_url ? (
            <a
              href={partner.website_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {logo}
            </a>
          ) : (
            logo
          )}
        </li>
      );
    })}
  </ul>
);

const FooterLink = ({
  icon: Icon,
  href,
  external = false,
  children,
}: {
  icon: typeof Mail;
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) => (
  <li className="flex items-start justify-center md:justify-start space-x-3 group">
    <Icon
      className="w-5 h-5 mt-0.5 text-gray-500 group-hover:text-gray-700 transition-colors duration-200 flex-shrink-0"
      aria-hidden="true"
    />
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className="text-gray-600 hover:text-gray-900 transition-colors duration-200 whitespace-pre-line"
    >
      {children}
    </a>
  </li>
);

const Footer = () => {
  const { contactInfo, partners, loading } = usePageDataFromDB();

  const hasContactInfo = Boolean(
    contactInfo?.email || contactInfo?.phone || contactInfo?.instagram
  );

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 text-gray-900 py-20 border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-6">
        {loading ? null : hasContactInfo && contactInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center md:text-left">
              <img
                src={logoFooter}
                alt="Aether Art Space"
                className="h-40 sm:h-44 md:h-32 w-auto object-contain mx-auto md:mx-0"
              />
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-xl mb-6 text-gray-900 font-medium">
                Contact Information
              </h2>
              <ul className="space-y-5">
                {contactInfo.email && (
                  <FooterLink icon={Mail} href={`mailto:${contactInfo.email}`}>
                    {contactInfo.email}
                  </FooterLink>
                )}
                {contactInfo.phone && (
                  <FooterLink icon={Phone} href={`tel:${contactInfo.phone}`}>
                    {contactInfo.phone}
                  </FooterLink>
                )}
                {contactInfo.instagram && (
                  <FooterLink
                    icon={Instagram}
                    href={instagramUrl(contactInfo.instagram)}
                    external
                  >
                    {contactInfo.instagram}
                  </FooterLink>
                )}
              </ul>
            </div>

            {partners.length > 0 && (
              <div className="text-center">
                <h2 className="text-xl mb-6 text-gray-900">Collaboration</h2>
                <Collaborators partners={partners} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-12">
            <img
              src={logoFooter}
              alt="Aether Art Space"
              className="h-48 w-auto object-contain mx-auto"
            />
            {partners.length > 0 && (
              <div className="w-full">
                <h2 className="text-2xl mb-10 text-gray-900">Collaboration</h2>
                <Collaborators partners={partners} large />
              </div>
            )}
          </div>
        )}

        <div className="border-t border-gray-200 mt-16 pt-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Aether Art Space. All rights
              reserved.
            </p>
            <p className="text-gray-400 text-xs">
              Crafted with passion for contemporary art
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
