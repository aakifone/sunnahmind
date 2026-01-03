// Slash command types and definitions

export interface SlashCommand {
  id: string;
  name: string;
  description: string;
  icon: string;
  availableInEmptyState: boolean;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'batch',
    name: 'batch',
    description: 'Get a batch of 10-20 Hadiths and Quran verses side by side',
    icon: 'Layers',
    availableInEmptyState: true,
  },
  {
    id: 'context',
    name: 'context',
    description: 'Historical or situational background of a Hadith',
    icon: 'History',
    availableInEmptyState: true,
  },
  {
    id: 'daily',
    name: 'daily',
    description: 'Get a reflective Hadith of the Day',
    icon: 'Sun',
    availableInEmptyState: true,
  },
  {
    id: 'explain',
    name: 'explain',
    description: 'Simple educational explanation of a Hadith',
    icon: 'BookOpen',
    availableInEmptyState: true,
  },
  {
    id: 'save',
    name: 'save',
    description: 'Save the current Hadith to your favorites',
    icon: 'Heart',
    availableInEmptyState: false,
  },
  {
    id: 'share',
    name: 'share',
    description: 'Generate a shareable Hadith image',
    icon: 'Share2',
    availableInEmptyState: false,
  },
  {
    id: 'topic',
    name: 'topic',
    description: 'Browse Hadiths by topic like Patience, Salah, Parents',
    icon: 'Tags',
    availableInEmptyState: true,
  },
];

export interface SavedHadith {
  id: string;
  arabic?: string;
  english: string;
  reference: string;
  collection?: string;
  savedAt: Date;
}

export type ActiveCommand = SlashCommand['id'] | null;
