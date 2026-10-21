import { PageHeader, PageLayout } from "@/components/PageLayout";
import NewsletterForm from "@/components/NewsletterForm";
import OpeningHours from "@/components/OpeningHours";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useWorkingHours } from "@/hooks/useWorkingHours";
import { instagramUrl, mapsUrl } from "@/lib/contact";

const cardClass =
  "bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 w-full h-full flex flex-col";

const CardHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center mb-6">
    <div className="w-12 h-12 bg-theme-primary rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
      <Mail className="w-6 h-6 text-white" aria-hidden="true" />
    </div>
    <h2 className="text-xl font-bold text-foreground">{children}</h2>
  </div>
);

const ContactLink = ({
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
  <li>
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200"
    >
      <span className="w-10 h-10 bg-theme-primary/10 rounded-lg flex items-center justify-center group-hover:bg-theme-primary/20 transition-colors flex-shrink-0">
        <Icon className="w-5 h-5 text-theme-primary" aria-hidden="true" />
      </span>
      <span className="text-foreground group-hover:text-theme-primary transition-colors font-medium break-words whitespace-pre-line">
        {children}
      </span>
    </a>
  </li>
);

const Contact = () => {
  const { pageData, contactInfo } = usePageDataFromDB();
  const { workingHours } = useWorkingHours();

  const hasContactInfo = Boolean(
    contactInfo?.email ||
    contactInfo?.phone ||
    contactInfo?.instagram ||
    contactInfo?.address
  );

  return (
    <PageLayout>
      <PageHeader
        title={pageData.contact?.title || "Contact Us"}
        description={
          <p>
            {pageData.contact?.description ||
              pageData.contact?.content?.description ||
              "Get in touch with us"}
          </p>
        }
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div
            className={
              hasContactInfo
                ? "grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
                : "max-w-md mx-auto"
            }
          >
            <div className={cardClass}>
              <CardHeading>Subscribe to our newsletter</CardHeading>
              {!hasContactInfo && (
                <p className="text-muted-foreground mb-6">
                  Get exclusive updates about new exhibitions, artist
                  spotlights, and special events.
                </p>
              )}
              <NewsletterForm />
            </div>

            {hasContactInfo && contactInfo && (
              <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className={cardClass}>
                  <CardHeading>Contact Us</CardHeading>
                  <ul className="space-y-4">
                    {contactInfo.email && (
                      <ContactLink
                        icon={Mail}
                        href={`mailto:${contactInfo.email}`}
                      >
                        {contactInfo.email}
                      </ContactLink>
                    )}
                    {contactInfo.phone && (
                      <ContactLink
                        icon={Phone}
                        href={`tel:${contactInfo.phone}`}
                      >
                        {contactInfo.phone}
                      </ContactLink>
                    )}
                    {contactInfo.instagram && (
                      <ContactLink
                        icon={Instagram}
                        href={instagramUrl(contactInfo.instagram)}
                        external
                      >
                        {contactInfo.instagram}
                      </ContactLink>
                    )}
                    {contactInfo.address && (
                      <ContactLink
                        icon={MapPin}
                        href={mapsUrl(contactInfo.address)}
                        external
                      >
                        {contactInfo.address}
                      </ContactLink>
                    )}
                  </ul>
                </div>

                {workingHours.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 w-full h-full flex flex-col">
                    <h2 className="text-xl font-bold text-center text-gray-900 mb-6">
                      Gallery Hours
                    </h2>
                    <OpeningHours hours={workingHours} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Contact;
