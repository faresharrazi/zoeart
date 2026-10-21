import { useMemo, useState } from "react";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import type { NewsletterSubscriber } from "@/types/api";
import {
  ConfirmDelete,
  EmptyState,
  ResultCount,
  SearchField,
  StatusBadge,
} from "../AdminUI";

interface SubscriberListProps {
  subscribers: NewsletterSubscriber[];
  onDelete: (id: number) => void;
}

const joined = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const SubscriberList = ({ subscribers, onDelete }: SubscriberListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubscribers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return subscribers.filter(
      (subscriber) =>
        subscriber.email.toLowerCase().includes(search) ||
        subscriber.name?.toLowerCase().includes(search)
    );
  }, [subscribers, searchTerm]);

  const handleDelete = async (subscriber: NewsletterSubscriber) => {
    try {
      await apiClient.deleteNewsletterSubscriber(subscriber.id);
      onDelete(subscriber.id);
      toast({ title: `${subscriber.email} removed` });
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast({
        title: "Couldn't remove the subscriber",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <SearchField
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search by name or email"
      />

      <div className="space-y-3">
        <ResultCount
          shown={filteredSubscribers.length}
          total={subscribers.length}
          noun="subscribers"
          onClear={searchTerm ? () => setSearchTerm("") : undefined}
        />

        {filteredSubscribers.length === 0 ? (
          <EmptyState
            icon={Mail}
            title={
              subscribers.length === 0
                ? "No subscribers yet"
                : "No subscribers match"
            }
            description={
              subscribers.length === 0
                ? "People who sign up with the form on the website appear here."
                : "Try another name or email."
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-[0_1px_2px_hsl(var(--ink)/0.04)]">
            <table className="w-full table-fixed text-sm">
              <thead className="border-b bg-[hsl(45_20%_98.5%)] text-left text-xs text-mist">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium sm:px-5">
                    Subscriber
                  </th>
                  <th
                    scope="col"
                    className="hidden w-36 px-4 py-2.5 font-medium sm:table-cell"
                  >
                    Joined
                  </th>
                  <th scope="col" className="w-14 px-4 py-2.5 sm:w-16">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="transition-colors hover:bg-[hsl(45_20%_98.5%)]"
                  >
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-medium text-ink">
                          {subscriber.email}
                        </span>
                        {subscriber.status === "unsubscribed" && (
                          <StatusBadge tone="muted">Unsubscribed</StatusBadge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-mist">
                        {subscriber.name || "No name given"}
                        <span className="sm:hidden">
                          {" · "}
                          {joined(subscriber.subscribed_at)}
                        </span>
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-mist sm:table-cell">
                      {joined(subscriber.subscribed_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ConfirmDelete
                        title="Remove this subscriber?"
                        description={
                          <>
                            {subscriber.email} will no longer receive the
                            newsletter. This can't be undone.
                          </>
                        }
                        confirmLabel="Remove"
                        onConfirm={() => handleDelete(subscriber)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriberList;
