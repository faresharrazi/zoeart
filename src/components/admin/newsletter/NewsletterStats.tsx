import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Loader2 } from "lucide-react";

interface NewsletterStatsProps {
  onRefresh: () => void;
  onExport: () => void;
  refreshing: boolean;
}

const NewsletterStats = ({
  onRefresh,
  onExport,
  refreshing,
}: NewsletterStatsProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
      <div className="flex items-center gap-2">
        <Button
          onClick={onRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default NewsletterStats;
