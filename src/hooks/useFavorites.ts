import { useState, useCallback } from "react";
import { SavedHadith } from "@/types/commands";
import { useToast } from "@/hooks/use-toast";

const FAVORITES_KEY = "sunnahmind-favorites";

export const useFavorites = () => {
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<SavedHadith[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveFavorite = useCallback(
    (hadith: Omit<SavedHadith, "id" | "savedAt">) => {
      const newFavorite: SavedHadith = {
        ...hadith,
        id: `fav-${Date.now()}`,
        savedAt: new Date(),
      };

      setFavorites((prev) => {
        // Check if already saved
        const exists = prev.some(
          (f) => f.english === hadith.english && f.reference === hadith.reference
        );

        if (exists) {
          toast({
            title: "Already Saved",
            description: "This hadith is already in your favorites",
          });
          return prev;
        }

        const updated = [newFavorite, ...prev];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));

        toast({
          title: "Saved to Favorites",
          description: "Hadith has been added to your favorites",
        });

        return updated;
      });
    },
    [toast]
  );

  const removeFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const updated = prev.filter((f) => f.id !== id);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));

        toast({
          title: "Removed",
          description: "Hadith removed from favorites",
        });

        return updated;
      });
    },
    [toast]
  );

  const isFavorite = useCallback(
    (english: string, reference: string) => {
      return favorites.some(
        (f) => f.english === english && f.reference === reference
      );
    },
    [favorites]
  );

  return {
    favorites,
    saveFavorite,
    removeFavorite,
    isFavorite,
  };
};

export default useFavorites;
