import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const Contact = () => {
  const { pageData, contactInfo, loading } = usePageDataFromDB();
  const { toast } = useToast();

  const [newsletterData, setNewsletterData] = useState({
    name: "",
    email: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewsletterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newsletterData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success!",
          description: "Thank you for subscribing to our newsletter!",
        });
        // Reset form
        setNewsletterData({
          name: "",
          email: "",
        });
      } else {
        toast({
          title: "Error",
          description: "Error subscribing to newsletter. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Error",
        description: "Error subscribing to newsletter. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#0f0f0f] relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto my-24">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              {pageData.contact?.title || "Contact Us"}
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {pageData.contact?.description ||
                pageData.contact?.content?.description ||
                "Get in touch with us"}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          {/* Check if there's contact info to determine layout */}
          {contactInfo?.email ||
          contactInfo?.phone ||
          contactInfo?.instagram ||
          contactInfo?.address ? (
            /* Two-column layout when contact info exists */
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
                    <form
                      onSubmit={handleNewsletterSubmit}
                      className="space-y-6"
                    >
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Full Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={newsletterData.name}
                          onChange={handleInputChange}
                          className="border-palette-medium-blue/30 focus:border-palette-medium-blue"
                          placeholder="Your full name"
                        />
                      </div>

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

              {/* Contact Information - Only show if there's contact data */}
              {(contactInfo?.email ||
                contactInfo?.phone ||
                contactInfo?.instagram ||
                contactInfo?.address) && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-6">
                      Contact Information
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {contactInfo?.email && (
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                          <Mail className="w-6 h-6 text-palette-medium-blue" />
                        </div>
                        <p className="text-muted-foreground">
                          {contactInfo.email}
                        </p>
                      </div>
                    )}

                    {contactInfo?.phone && (
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                          <Phone className="w-6 h-6 text-palette-medium-blue" />
                        </div>
                        <p className="text-muted-foreground">
                          {contactInfo.phone}
                        </p>
                      </div>
                    )}

                    {contactInfo?.instagram && (
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                          <Instagram className="w-6 h-6 text-palette-medium-blue" />
                        </div>
                        <p className="text-muted-foreground">
                          {contactInfo.instagram}
                        </p>
                      </div>
                    )}

                    {contactInfo?.address && (
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-palette-medium-blue" />
                        </div>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {contactInfo.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Centered layout when no contact info */
            <div className="flex justify-center">
              <div className="w-full max-w-md">
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
                    <form
                      onSubmit={handleNewsletterSubmit}
                      className="space-y-6"
                    >
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Full Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={newsletterData.name}
                          onChange={handleInputChange}
                          className="border-palette-medium-blue/30 focus:border-palette-medium-blue"
                          placeholder="Your full name"
                        />
                      </div>

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
            </div>
          )}
        </div>
      </section>

      <Footer />
      <Toaster />
    </div>
  );
};

export default Contact;
