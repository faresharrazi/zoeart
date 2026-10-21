import { Link } from "react-router-dom";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { instagramUrl, mapsUrl } from "@/lib/contact";
import { imageUrl } from "@/lib/images";

const FooterHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="eyebrow text-mist mb-4">{children}</h2>
);

const linkClass = "hover:underline underline-offset-4 decoration-1";

/**
 * Contact details, opening hours and partner logos, all set in the admin.
 * Centered on phones and tablets, in columns on desktop.
 */
const Footer = () => {
  const { contactInfo, openingHours, partners, homeSettings } =
    usePageDataFromDB();

  const contactItems = [
    contactInfo?.email && {
      key: "email",
      node: (
        <a href={`mailto:${contactInfo.email}`} className={linkClass}>
          {contactInfo.email}
        </a>
      ),
    },
    contactInfo?.phone && {
      key: "phone",
      node: (
        <a
          href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}
          className={linkClass}
        >
          {contactInfo.phone}
        </a>
      ),
    },
    contactInfo?.instagram && {
      key: "instagram",
      node: (
        <a
          href={instagramUrl(contactInfo.instagram)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Instagram · @{contactInfo.instagram.replace(/^@/, "")}
        </a>
      ),
    },
    contactInfo?.address && {
      key: "address",
      node: (
        <a
          href={mapsUrl(contactInfo.address)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClass} whitespace-pre-line`}
        >
          {contactInfo.address}
        </a>
      ),
    },
  ].filter(Boolean) as { key: string; node: React.ReactNode }[];

  return (
    <footer className="border-t border-line bg-paper text-ink">
      <div className="mx-auto max-w-[1360px] px-6 md:px-10 pt-12 pb-8 lg:pt-14">
        <div className="grid gap-10 text-center lg:grid-cols-12 lg:gap-12 lg:text-left">
          <div className="flex flex-col items-center gap-4 lg:col-span-4 lg:items-start">
            <Link to="/" aria-label="Aether Art Space, home">
              <img
                src="/logo/logo-menu.png"
                alt=""
                width={245}
                height={144}
                className="h-9 w-auto"
              />
            </Link>
            {homeSettings?.description && (
              <p className="max-w-xs text-sm leading-relaxed text-stone">
                {homeSettings.description.split("\n")[0]}
              </p>
            )}
          </div>

          {contactItems.length > 0 && (
            <div className="lg:col-span-4">
              <FooterHeading>Contact</FooterHeading>
              <ul className="space-y-2 text-sm">
                {contactItems.map((item) => (
                  <li key={item.key}>{item.node}</li>
                ))}
              </ul>
            </div>
          )}

          {openingHours.length > 0 && (
            <div className="lg:col-span-4">
              <FooterHeading>Opening hours</FooterHeading>
              <dl className="mx-auto max-w-xs space-y-2 text-sm lg:mx-0">
                {openingHours.map((row) => (
                  <div
                    key={row.id ?? row.day}
                    className="flex justify-between gap-4"
                  >
                    <dt className="text-stone">{row.day}</dt>
                    <dd className="text-right whitespace-pre-line">
                      {row.time_frame}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {partners.length > 0 && (
          <div className="mt-10 border-t border-line pt-8 flex flex-col items-center gap-5 lg:flex-row lg:gap-10">
            <h2 className="eyebrow text-mist shrink-0">
              In collaboration with
            </h2>
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:justify-start">
              {partners.map((partner) => {
                const logo = (
                  <img
                    src={imageUrl(partner.logo_url, {
                      width: 200,
                      height: 200,
                    })}
                    alt={partner.name}
                    title={partner.name}
                    loading="lazy"
                    className="h-11 w-auto object-contain grayscale opacity-75 transition hover:grayscale-0 hover:opacity-100 md:h-12"
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
          </div>
        )}

        <p className="mt-8 text-center text-xs text-mist lg:text-left">
          © {new Date().getFullYear()} Aether Art Space
        </p>
      </div>
    </footer>
  );
};

export default Footer;
