import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { Trash2, Mail, Calendar, User } from "lucide-react";

interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  subscribed_at: string;
  status: "active" | "unsubscribed";
  source: string;
}

interface SubscriberCardProps {
  subscriber: Subscriber;
  onDelete: (id: number) => void;
}

const SubscriberCard = ({ subscriber, onDelete }: SubscriberCardProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.deleteNewsletterSubscriber(subscriber.id);
      onDelete(subscriber.id);
      toast({
        title: "Success",
        description: "Subscriber deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-gray-900 truncate">
              {subscriber.email}
            </p>
            <Badge
              variant={subscriber.status === "active" ? "default" : "secondary"}
            >
              {subscriber.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {subscriber.name && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate">{subscriber.name}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(subscriber.subscribed_at)}</span>
            </div>

            {subscriber.source && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {subscriber.source}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive" disabled={isDeleting}>
              <Trash2 className="w-4 h-4 mr-1" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{subscriber.email}"? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SubscriberCard;
