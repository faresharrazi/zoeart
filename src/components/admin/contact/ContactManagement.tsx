import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPage, FormSection } from "../AdminUI";
import ContactDetailsForm from "./ContactDetailsForm";
import OpeningHoursEditor from "./OpeningHoursEditor";

/** Contact details and opening hours, shown in the footer and on /contact. */
const ContactManagement = () => (
  <AdminPage
    title="Contact & hours"
    description="Shown in the website footer and on the Contact page."
    actions={
      <Button variant="outline" asChild>
        <a href="/contact" target="_blank" rel="noopener noreferrer">
          <ExternalLink aria-hidden="true" />
          View contact page
        </a>
      </Button>
    }
  >
    <div className="space-y-10 pt-2">
      <FormSection
        title="Contact details"
        description="How visitors reach the gallery. Remove a detail to hide it from the website."
      >
        <ContactDetailsForm />
      </FormSection>
      <FormSection
        title="Opening hours"
        description="Each row is one line on the website. Switch a row off to hide it without deleting it, and use the arrows to change the order."
      >
        <OpeningHoursEditor />
      </FormSection>
    </div>
  </AdminPage>
);

export default ContactManagement;
