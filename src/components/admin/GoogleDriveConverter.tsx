import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GoogleDriveConverter = () => {
  const [inputUrl, setInputUrl] = useState("");
  const [directDownloadUrl, setDirectDownloadUrl] = useState("");
  const [fileId, setFileId] = useState("");
  const { toast } = useToast();

  const extractFileId = (url: string): string | null => {
    // Handle various Google Drive URL formats
    const patterns = [
      // Standard sharing URL: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      // Alternative format: https://drive.google.com/open?id=FILE_ID
      /[?&]id=([a-zA-Z0-9_-]+)/,
      // Direct link format: https://drive.google.com/uc?export=download&id=FILE_ID
      /[?&]id=([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  const generateDirectDownloadUrl = () => {
    if (!inputUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Google Drive URL",
        variant: "destructive",
      });
      return;
    }

    const extractedFileId = extractFileId(inputUrl);
    
    if (!extractedFileId) {
      toast({
        title: "Error",
        description: "Could not extract file ID from the URL. Please check the format.",
        variant: "destructive",
      });
      return;
    }

    const directUrl = `https://drive.google.com/uc?export=download&id=${extractedFileId}`;
    
    setFileId(extractedFileId);
    setDirectDownloadUrl(directUrl);
    
    toast({
      title: "Success",
      description: "Direct download URL generated successfully!",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "URL copied to clipboard",
    });
  };

  const testDownload = () => {
    if (directDownloadUrl) {
      window.open(directDownloadUrl, "_blank");
    }
  };

  const clearAll = () => {
    setInputUrl("");
    setDirectDownloadUrl("");
    setFileId("");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Google Drive Direct Download Converter
        </CardTitle>
        <p className="text-sm text-gray-600">
          Convert Google Drive sharing links to direct download links for use in press releases and other content.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="input-url">Google Drive Sharing URL</Label>
            <Input
              id="input-url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste any Google Drive sharing link here
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateDirectDownloadUrl} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Generate Direct Download Link
            </Button>
            <Button variant="outline" onClick={clearAll}>
              Clear
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {directDownloadUrl && (
          <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800">Generated Direct Download URL</h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">File ID</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={fileId}
                    readOnly
                    className="bg-gray-50 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(fileId)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Direct Download URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={directDownloadUrl}
                    readOnly
                    className="bg-gray-50 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(directDownloadUrl)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testDownload}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
              <strong>Usage:</strong> Use this direct download URL in your press release fields or anywhere you need a direct file download link.
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-2">
          <h4 className="font-semibold">Supported URL Formats:</h4>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><code className="bg-gray-100 px-1 rounded">https://drive.google.com/file/d/FILE_ID/view?usp=sharing</code></li>
            <li><code className="bg-gray-100 px-1 rounded">https://drive.google.com/open?id=FILE_ID</code></li>
            <li><code className="bg-gray-100 px-1 rounded">https://drive.google.com/uc?export=download&id=FILE_ID</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleDriveConverter;
