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
      if (
        error instanceof Error &&
        error.message.includes("already subscribed")
      ) {
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
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      Get In Touch
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      Visit our gallery or reach out for exhibition details, collaborations, and artist inquiries.
                    </p>
                  </div>

                  {/* Contact Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information Card */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-palette-medium-blue to-blue-600 rounded-xl flex items-center justify-center mr-4">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Contact Us</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {contactInfo?.email && (
                          <div className="group">
                            <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200">
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <Mail className="w-5 h-5 text-blue-600" />
                              </div>
                              <a 
                                href={`mailto:${contactInfo.email}`}
                                className="text-foreground hover:text-blue-600 transition-colors font-medium"
                              >
                                {contactInfo.email}
                              </a>
                            </div>
                          </div>
                        )}

                        {contactInfo?.phone && (
                          <div className="group">
                            <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200">
                              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                <Phone className="w-5 h-5 text-green-600" />
                              </div>
                              <a 
                                href={`tel:${contactInfo.phone}`}
                                className="text-foreground hover:text-green-600 transition-colors font-medium"
                              >
                                {contactInfo.phone}
                              </a>
                            </div>
                          </div>
                        )}

                        {contactInfo?.instagram && (
                          <div className="group">
                            <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200">
                              <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                                <Instagram className="w-5 h-5 text-pink-600" />
                              </div>
                              <a 
                                href={`https://instagram.com/${contactInfo.instagram.replace("@", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground hover:text-pink-600 transition-colors font-medium"
                              >
                                {contactInfo.instagram}
                              </a>
                            </div>
                          </div>
                        )}

                        {contactInfo?.address && (
                          <div className="group">
                            <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200">
                              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                <MapPin className="w-5 h-5 text-purple-600" />
                              </div>
                              <a 
                                href="https://maps.google.com/?q=Mark.+Mpostsari+7+Glyfada+16675"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground hover:text-purple-600 transition-colors font-medium whitespace-pre-line"
                              >
                                {contactInfo.address}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Working Hours Card */}
                    {workingHours && workingHours.length > 0 && (
                      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100">
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                            <Clock className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground">Gallery Hours</h3>
                        </div>
                        
                        <div className="space-y-3">
                          {workingHours.map((hour, index) => (
                            <div
                              key={hour.id}
                              className={`flex justify-between items-center p-4 rounded-xl transition-all duration-200 ${
                                index % 2 === 0 
                                  ? 'bg-white shadow-sm hover:shadow-md' 
                                  : 'bg-gray-50 hover:bg-white hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  hour.time_frame.toLowerCase().includes('closed') 
                                    ? 'bg-red-400' 
                                    : 'bg-green-400'
                                }`}></div>
                                <span className="font-semibold text-foreground">
                                  {hour.day}
                                </span>
                              </div>
                              <span className={`font-medium px-3 py-1 rounded-full text-sm ${
                                hour.time_frame.toLowerCase().includes('closed')
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {hour.time_frame}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="text-blue-800 text-sm font-medium text-center">
                            💡 We welcome conversations that spark new artistic connections
                          </p>
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
