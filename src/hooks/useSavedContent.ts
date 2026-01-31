import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { SavedContentItem, SavedContentList, SavedContentType } from "@/types/savedContent";

const STORAGE_KEY = "sunnahmind-saved-content";

const loadItems = (): SavedContentItem[] => {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as SavedContentItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const useSavedContent = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<SavedContentItem[]>(loadItems);

  const persist = (next: SavedContentItem[]) => {
    setItems(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addItem = useCallback(
    (
      payload: Omit<SavedContentItem, "id" | "savedAt">,
      options?: { silent?: boolean },
    ) => {
      const newItem: SavedContentItem = {
        ...payload,
        id: `${payload.type}-${Date.now()}`,
        savedAt: new Date().toISOString(),
      };

      setItems((prev) => {
        const exists = prev.some(
          (item) =>
            item.title === payload.title &&
            item.content === payload.content &&
            item.type === payload.type &&
            item.list === payload.list,
        );

        if (exists) {
          if (!options?.silent) {
            toast({
              title: "Already saved",
              description: "This item is already in your list.",
            });
          }
          return prev;
        }

        const next = [newItem, ...prev];
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

        if (!options?.silent) {
          toast({
            title: payload.list === "favorites" ? "Saved to favorites" : "Saved for later",
            description: payload.title,
          });
        }
        return next;
      });
    },
    [toast],
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((item) => item.id !== id);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const clearList = useCallback((list: SavedContentList) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.list !== list);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getByList = useCallback(
    (list: SavedContentList, type?: SavedContentType) =>
      items.filter((item) => item.list === list && (!type || item.type === type)),
    [items],
  );

  return {
    items,
    addItem,
    removeItem,
    clearList,
    getByList,
  };
};

export default useSavedContent;
