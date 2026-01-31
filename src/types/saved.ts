export type SavedItemType =
  | "ai-response"
  | "hadith"
  | "quran"
  | "article"
  | "adhkaar"
  | "name"
  | "family-tree"
  | "wallpaper";

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  content: string;
  reference?: string;
  metadata?: Record<string, string>;
  savedAt: string;
}
