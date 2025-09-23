import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Instagram } from "lucide-react";

const Contact = () => {
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
              Stay <span className="text-white">Connected</span>
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Subscribe to our newsletter for the latest exhibitions, artist
              features, and exclusive gallery events. Be the first to know about
              new collections and special openings.
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
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-palette-medium-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Email
                    </h3>
                    <p className="text-muted-foreground">
                      info@aetherartspace.com
                    </p>
                    <p className="text-muted-foreground">
                      exhibitions@aetherartspace.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-palette-medium-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Phone
                    </h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-muted-foreground">+1 (555) 987-6543</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                    <Instagram className="w-6 h-6 text-palette-medium-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Instagram
                    </h3>
                    <p className="text-muted-foreground">@aetherartspace</p>
                    <p className="text-muted-foreground">
                      Follow us for daily art updates
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-palette-medium-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Address
                    </h3>
                    <p className="text-muted-foreground">
                      123 Art District
                      <br />
                      Creative City, CC 12345
                      <br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-palette-medium-blue/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-palette-medium-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Hours
                    </h3>
                    <p className="text-muted-foreground">
                      Tuesday - Saturday: 10:00 AM - 6:00 PM
                      <br />
                      Sunday: 12:00 PM - 5:00 PM
                      <br />
                      Monday: Closed
                    </p>
                  </div>
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
