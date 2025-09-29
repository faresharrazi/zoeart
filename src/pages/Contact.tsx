import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Instagram, Clock } from "lucide-react";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useWorkingHours } from "@/hooks/useWorkingHours";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { Toaster } from "@/components/ui/toaster";

const Contact = () => {
  const { pageData, contactInfo, loading } = usePageDataFromDB();
  const { workingHours, loading: workingHoursLoading } = useWorkingHours();
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
      const data = await apiClient.subscribeToNewsletter(
        newsletterData.email,
        newsletterData.name
      );

      if ((data as any).success) {
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
    } catch (error: unknown) {
      console.error("Newsletter subscription error:", error);

      // Handle specific error cases
      if (error instanceof Error && error.message.includes("already subscribed")) {
        toast({
          title: "Already Subscribed",
          description: "This email is already subscribed to our newsletter.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Error subscribing to newsletter. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Show loading state while data is being fetched
  if (loading || workingHoursLoading) {
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
            <h1 className="text-4xl md:text-6xl  mb-6 text-white drop-shadow-lg">
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
                    <CardTitle className="text-2xl  text-foreground">
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
                          className="block text-sm  text-foreground mb-2"
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
                          className="block text-sm  text-foreground mb-2"
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
                        className="w-full  py-3"
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
                    <h2 className="text-3xl  text-foreground mb-6">
                      Contact Information
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {contactInfo?.email && (
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                          <Mail className="w-6 h-6 text-palette-medium-blue" />
                        </div>
                        <a 
                          href={`mailto:${contactInfo.email}`}
                          className="text-muted-foreground hover:text-palette-medium-blue transition-colors cursor-pointer"
                        >
                          {contactInfo.email}
                        </a>
                      </div>
                    )}

                    {contactInfo?.phone && (
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                          <Phone className="w-6 h-6 text-palette-medium-blue" />
                        </div>
                        <a 
                          href={`tel:${contactInfo.phone}`}
                          className="text-muted-foreground hover:text-palette-medium-blue transition-colors cursor-pointer"
                        >
                          {contactInfo.phone}
                        </a>
                      </div>
                    )}

                    {contactInfo?.instagram && (
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                          <Instagram className="w-6 h-6 text-palette-medium-blue" />
                        </div>
                        <a 
                          href={`https://instagram.com/${contactInfo.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-palette-medium-blue transition-colors cursor-pointer"
                        >
                          {contactInfo.instagram}
                        </a>
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

                    {/* Working Hours Section */}
                    {workingHours && workingHours.length > 0 && (
                      <div className="mt-8">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-palette-medium-blue" />
                          </div>
                          <h3 className="text-xl font-semibold text-foreground">Working Hours</h3>
                        </div>
                        <div className="space-y-2 ml-16">
                          {workingHours.map((hour) => (
                            <div key={hour.id} className="flex justify-between items-center">
                              <span className="font-medium text-foreground">{hour.day}</span>
                              <span className="text-muted-foreground">{hour.time_frame}</span>
                            </div>
                          ))}
                        </div>
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
                    <CardTitle className="text-2xl  text-foreground">
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
                          className="block text-sm  text-foreground mb-2"
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
                          className="block text-sm  text-foreground mb-2"
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
                        className="w-full  py-3"
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
