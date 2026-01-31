import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { SavedItem } from "@/types/saved";

const SAVED_FOR_LATER_KEY = "sunnahmind-saved-for-later";

const parseSavedItems = () => {
  try {
    const stored = localStorage.getItem(SAVED_FOR_LATER_KEY);
    return stored ? (JSON.parse(stored) as SavedItem[]) : [];
  } catch {
    return [];
  }
};

export const useSavedForLater = () => {
  const { toast } = useToast();
  const [savedItems, setSavedItems] = useState<SavedItem[]>(parseSavedItems);

  const persist = (items: SavedItem[]) => {
    localStorage.setItem(SAVED_FOR_LATER_KEY, JSON.stringify(items));
  };

  const saveForLater = useCallback(
    (item: Omit<SavedItem, "id" | "savedAt">) => {
      const newItem: SavedItem = {
        ...item,
        id: `saved-${Date.now()}`,
        savedAt: new Date().toISOString(),
      };

      setSavedItems((prev) => {
        const updated = [newItem, ...prev];
        persist(updated);
        toast({
          title: "Saved for Later",
          description: "This item is ready in your reflection list.",
        });
        return updated;
      });
    },
    [toast],
  );

  const removeSavedItem = useCallback(
    (id: string) => {
      setSavedItems((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        persist(updated);
        toast({
          title: "Removed",
          description: "This item has been removed from Saved for Later.",
        });
        return updated;
      });
    },
    [toast],
  );

  const clearSavedItems = useCallback(() => {
    setSavedItems([]);
    persist([]);
    toast({
      title: "Cleared",
      description: "Saved for Later list cleared.",
    });
  }, [toast]);

  return {
    savedItems,
    saveForLater,
    removeSavedItem,
    clearSavedItems,
  };
};

export default useSavedForLater;
