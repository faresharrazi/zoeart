import { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { IconAction, IconLink, Panel } from "./AdminUI";

const extractFileId = (url: string): string | null => {
  const patterns = [
    // Sharing link: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    // https://drive.google.com/open?id=FILE_ID and
    // https://drive.google.com/uc?export=download&id=FILE_ID
    /[?&]id=([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
};

const FORMATS = [
  "https://drive.google.com/file/d/FILE_ID/view?usp=sharing",
  "https://drive.google.com/open?id=FILE_ID",
  "https://drive.google.com/uc?export=download&id=FILE_ID",
];

/** Turns a Google Drive sharing link into a direct download link. */
const GoogleDriveConverter = () => {
  const [inputUrl, setInputUrl] = useState("");
  const [directDownloadUrl, setDirectDownloadUrl] = useState("");
  const [fileId, setFileId] = useState("");
  const { toast } = useToast();

  const generateDirectDownloadUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      toast({
        title: "Paste a Google Drive link first",
        variant: "destructive",
      });
      return;
    }

    const extractedFileId = extractFileId(inputUrl);
    if (!extractedFileId) {
      toast({
        title: "This doesn't look like a Google Drive link",
        description: "Check the link against the formats listed below.",
        variant: "destructive",
      });
      return;
    }

    setFileId(extractedFileId);
    setDirectDownloadUrl(
      `https://drive.google.com/uc?export=download&id=${extractedFileId}`
    );
    toast({ title: "Download link created" });
  };

  const copyToClipboard = (text: string, what: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast({ title: `${what} copied` }))
      .catch(() =>
        toast({
          title: "Couldn't copy",
          description: "Select the text and copy it by hand.",
          variant: "destructive",
        })
      );
  };

  const clearAll = () => {
    setInputUrl("");
    setDirectDownloadUrl("");
    setFileId("");
  };

  return (
    <Panel
      title="Google Drive download link"
      description="Turn a Google Drive sharing link into a direct download link, for press releases and other files."
      bodyClassName="space-y-5"
    >
      <form onSubmit={generateDirectDownloadUrl} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="drive-url">Sharing link</Label>
          <Input
            id="drive-url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/…/view?usp=sharing"
            aria-describedby="drive-url-hint"
          />
          <p id="drive-url-hint" className="text-xs text-mist">
            In Google Drive: Share → Copy link, then paste it here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Create download link</Button>
          {(inputUrl || directDownloadUrl) && (
            <Button type="button" variant="ghost" onClick={clearAll}>
              Clear
            </Button>
          )}
        </div>
      </form>

      {directDownloadUrl && (
        <div className="space-y-4 rounded-lg bg-secondary p-4">
          <div className="space-y-2">
            <Label htmlFor="drive-download">Download link</Label>
            <div className="flex items-center gap-1">
              <Input
                id="drive-download"
                value={directDownloadUrl}
                readOnly
                onFocus={(e) => e.target.select()}
                className="bg-white font-mono text-[13px]"
              />
              <IconAction
                label="Copy download link"
                icon={Copy}
                onClick={() =>
                  copyToClipboard(directDownloadUrl, "Download link")
                }
              />
              <IconLink
                label="Test the download"
                icon={ExternalLink}
                href={directDownloadUrl}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="drive-file-id">File ID</Label>
            <div className="flex items-center gap-1">
              <Input
                id="drive-file-id"
                value={fileId}
                readOnly
                onFocus={(e) => e.target.select()}
                className="bg-white font-mono text-[13px]"
              />
              <IconAction
                label="Copy file ID"
                icon={Copy}
                onClick={() => copyToClipboard(fileId, "File ID")}
              />
              <span className="size-8 shrink-0" aria-hidden="true" />
            </div>
          </div>
          <p className="text-xs text-stone">
            Paste the download link in an exhibition's press release field, or
            anywhere a file should download directly.
          </p>
        </div>
      )}

      <details className="group text-sm">
        <summary className="cursor-pointer text-mist hover:text-ink">
          Supported link formats
        </summary>
        <ul className="mt-3 space-y-1.5">
          {FORMATS.map((format) => (
            <li key={format}>
              <code className="break-all rounded bg-secondary px-1.5 py-0.5 text-[12px] text-stone">
                {format}
              </code>
            </li>
          ))}
        </ul>
      </details>
    </Panel>
  );
};

export default GoogleDriveConverter;
