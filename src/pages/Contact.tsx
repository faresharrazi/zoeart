import NewsletterForm from "@/components/NewsletterForm";
import { Container, PageHeader, PageLayout } from "@/components/PageLayout";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useSeo } from "@/hooks/useSeo";
import { instagramUrl, mapsUrl } from "@/lib/contact";

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h2 className="eyebrow text-mist mb-6">{children}</h2>
);

const detailLink =
  "text-lg md:text-xl text-ink border-b border-ink/20 pb-0.5 transition-colors hover:border-ink break-words";

const Contact = () => {
  const { pageData, contactInfo, openingHours } = usePageDataFromDB();
  useSeo({ title: "Contact", description: pageData.contact?.description });

  const details = [
    contactInfo?.email && {
      label: "Email",
      node: (
        <a href={`mailto:${contactInfo.email}`} className={detailLink}>
          {contactInfo.email}
        </a>
      ),
    },
    contactInfo?.phone && {
      label: "Phone",
      node: (
        <a
          href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}
          className={detailLink}
        >
          {contactInfo.phone}
        </a>
      ),
    },
    contactInfo?.instagram && {
      label: "Instagram",
      node: (
        <a
          href={instagramUrl(contactInfo.instagram)}
          target="_blank"
          rel="noopener noreferrer"
          className={detailLink}
        >
          @{contactInfo.instagram.replace(/^@/, "")}
        </a>
      ),
    },
    contactInfo?.address && {
      label: "Address",
      node: (
        <a
          href={mapsUrl(contactInfo.address)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${detailLink} whitespace-pre-line`}
        >
          {contactInfo.address}
        </a>
      ),
    },
  ].filter(Boolean) as { label: string; node: React.ReactNode }[];

  return (
    <PageLayout>
      <PageHeader
        title={pageData.contact?.title?.trim() || "Contact"}
        description={
          pageData.contact?.description && (
            <p className="whitespace-pre-line">
              {pageData.contact.description}
            </p>
          )
        }
      />

      <Container className="pb-16 md:pb-20">
        <div className="grid gap-16 border-t border-line pt-14 md:grid-cols-2 md:gap-20">
          <div className="space-y-14">
            {details.length > 0 && (
              <section>
                <SectionLabel>Get in touch</SectionLabel>
                <dl className="space-y-6">
                  {details.map((item) => (
                    <div key={item.label}>
                      <dt className="text-sm text-mist mb-1">{item.label}</dt>
                      <dd>{item.node}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {openingHours.length > 0 && (
              <section>
                <SectionLabel>Opening hours</SectionLabel>
                <dl className="border-t border-line max-w-md">
                  {openingHours.map((row) => (
                    <div
                      key={row.id ?? row.day}
                      className="flex justify-between gap-6 border-b border-line py-3"
                    >
                      <dt>{row.day}</dt>
                      <dd className="text-right text-stone whitespace-pre-line">
                        {row.time_frame}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>

          <section aria-labelledby="newsletter-title">
            <h2
              id="newsletter-title"
              className="font-display text-3xl md:text-4xl leading-tight mb-4"
            >
              Newsletter
            </h2>
            <p className="text-stone mb-10 max-w-md">
              New exhibitions, openings and artist news, a few times a year.
            </p>
            <NewsletterForm withName />
          </section>
        </div>
      </Container>
    </PageLayout>
  );
};

export default Contact;
