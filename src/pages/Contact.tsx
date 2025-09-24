import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import { getPageSettings, getContactInfo } from "@/lib/pageSettings";

const Contact = () => {
  const pageSettings = getPageSettings();
  const contactInfo = getContactInfo();

  const [newsletterData, setNewsletterData] = useState({
    email: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewsletterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription here
    console.log("Newsletter subscription:", newsletterData);
    // Reset form
    setNewsletterData({
      email: "",
    });
    alert("Thank you for subscribing to our newsletter!");
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-hero relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/src/assets/artwork-landscape-1.jpg')`,
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              {pageSettings.contact.title}
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {pageSettings.contact.description}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Newsletter Subscription */}
            <div>
              <Card className="border-2 border-palette-medium-blue/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Newsletter Subscription
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Get exclusive updates about new exhibitions, artist
                    spotlights, and special events.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNewsletterSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={newsletterData.email}
                        onChange={handleInputChange}
                        className="border-palette-medium-blue/30 focus:border-palette-medium-blue"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="default"
                      className="w-full font-semibold py-3"
                    >
                      Subscribe to Newsletter
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Contact Information
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  We're here to help and answer any questions you might have. We
                  look forward to hearing from you!
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-palette-medium-blue" />
                  </div>
                  <p className="text-muted-foreground">{contactInfo.email}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-palette-medium-blue" />
                  </div>
                  <p className="text-muted-foreground">{contactInfo.phone}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                    <Instagram className="w-6 h-6 text-palette-medium-blue" />
                  </div>
                  <p className="text-muted-foreground">
                    {contactInfo.instagram}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-palette-medium-blue" />
                  </div>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {contactInfo.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
