import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  subscribed_at: string;
  status: "active" | "unsubscribed";
  source: string;
}

interface SubscriberListProps {
  subscribers: Subscriber[];
  onDelete: (id: number) => void;
}

const SubscriberList = ({ subscribers, onDelete }: SubscriberListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((subscriber) => {
      const matchesSearch =
        subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subscriber.name &&
          subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [subscribers, searchTerm]);

  const handleDelete = async (id: number) => {
    try {
      await apiClient.deleteNewsletterSubscriber(id);
      onDelete(id);
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
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search subscribers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Simple Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Subscribed
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSubscribers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  {subscribers.length === 0
                    ? "No subscribers yet"
                    : "No subscribers found matching your search"}
                </td>
              </tr>
            ) : (
              filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {subscriber.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {subscriber.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(subscriber.subscribed_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(subscriber.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Results Summary */}
      <p className="text-sm text-gray-600">
        Showing {filteredSubscribers.length} of {subscribers.length} subscribers
      </p>
    </div>
  );
};

export default SubscriberList;
