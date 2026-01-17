import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Trash2, BookOpen } from "lucide-react";
import { SavedHadith } from "@/types/commands";
import { useTranslate } from "@/hooks/useTranslate";

interface FavoritesSectionProps {
  favorites: SavedHadith[];
  onRemove: (id: string) => void;
  onSelect: (hadith: SavedHadith) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export const FavoritesSection = ({
  favorites,
  onRemove,
  onSelect,
  isExpanded,
  onToggle,
}: FavoritesSectionProps) => {
  const { t } = useTranslate();
  return (
    <div className="border-t border-border">
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 rounded-none h-12"
        onClick={onToggle}
      >
        <Heart className={cn("w-4 h-4", favorites.length > 0 && "fill-accent text-accent")} />
        <span>{t("Favorites")}</span>
        {favorites.length > 0 && (
          <span className="ml-auto text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
            {favorites.length}
          </span>
        )}
      </Button>

      {isExpanded && (
        <div className="px-2 pb-2">
          {favorites.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>{t("No saved hadiths yet")}</p>
              <p className="text-xs mt-1">{t("Use /save to add favorites")}</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {favorites.map((hadith) => (
                  <div
                    key={hadith.id}
                    className={cn(
                      "p-3 rounded-lg",
                      "bg-muted/50 hover:bg-muted",
                      "transition-colors cursor-pointer",
                      "group relative"
                    )}
                    onClick={() => onSelect(hadith)}
                  >
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-accent mb-1">
                          {hadith.reference}
                        </p>
                        <p className="text-sm line-clamp-2 text-foreground/80">
                          {hadith.english}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(hadith.id);
                      }}
                      className={cn(
                        "absolute top-2 right-2",
                        "w-6 h-6 rounded-full",
                        "flex items-center justify-center",
                        "bg-destructive/10 text-destructive",
                        "opacity-0 group-hover:opacity-100",
                        "transition-opacity"
                      )}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;
