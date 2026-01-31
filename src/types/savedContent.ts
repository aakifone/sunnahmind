export type SavedContentType = "hadith" | "quran" | "article" | "ai" | "adhkar" | "ilm" | "name";

export type SavedContentList = "favorites" | "later";

export interface SavedContentItem {
  id: string;
  type: SavedContentType;
  title: string;
  content: string;
  source?: string;
  language?: string;
  savedAt: string;
  list: SavedContentList;
}
