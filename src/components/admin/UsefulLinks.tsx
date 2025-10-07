import { ExternalLink, Image, FileImage } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GoogleDriveConverter from "./GoogleDriveConverter";

const UsefulLinks = () => {
  const links = [
    {
      title: "Compress JPEG Images",
      description: "Reduce the file size of your JPEG images while maintaining quality",
      url: "https://compressjpeg.com/",
      icon: Image,
      category: "Image Optimization"
    },
    {
      title: "Convert PNG to JPG",
      description: "Convert PNG images to JPEG format with proper compression",
      url: "https://png2jpg.com/",
      icon: FileImage,
      category: "Image Optimization"
    }
  ];

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-theme-text-primary mb-2">
          Useful Links
        </h1>
        <p className="text-theme-text-muted">
          Quick access to helpful tools for image optimization and file management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((link, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-theme-primary/10 rounded-lg">
                  <link.icon className="w-5 h-5 text-theme-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <p className="text-sm text-theme-text-muted font-normal">
                    {link.category}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-theme-text-muted text-sm mb-4">
                {link.description}
              </p>
              <Button
                onClick={() => openLink(link.url)}
                className="w-full"
                variant="outline"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Link
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Google Drive Converter */}
      <div className="mt-8">
        <GoogleDriveConverter />
      </div>

      <div className="mt-8 p-4 bg-theme-surface rounded-lg border border-theme-border">
        <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
          💡 Tips for Image Optimization
        </h3>
        <ul className="text-sm text-theme-text-muted space-y-1">
          <li>• Use JPEG format for photographs and complex images</li>
          <li>• Compress images before uploading to reduce loading times</li>
          <li>• Convert PNG to JPG when transparency isn't needed</li>
          <li>• Aim for file sizes under 1MB for web use</li>
        </ul>
      </div>
    </div>
  );
};

export default UsefulLinks;
