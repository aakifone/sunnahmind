import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ExternalLink, BookOpen } from "lucide-react";
import MushafIcon from "@/components/icons/MushafIcon";

interface HadithItem {
  collection: string;
  number: string;
  text: string;
  url?: string;
}

interface QuranItem {
  surah: number;
  ayah: number;
  text: string;
  translation: string;
}

interface BatchDisplayProps {
  hadiths: HadithItem[];
  quranVerses: QuranItem[];
  isLoading: boolean;
}

export const BatchDisplay = ({
  hadiths,
  quranVerses,
  isLoading,
}: BatchDisplayProps) => {
  if (isLoading) {
    return (
      <div className="w-full p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Gathering authentic sources...</p>
        </div>
      </div>
    );
  }

  if (hadiths.length === 0 && quranVerses.length === 0) {
    return null;
  }

  return (
    <div className="w-full my-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hadiths Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-lg">Hadiths ({hadiths.length})</h3>
          </div>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {hadiths.map((hadith, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-xl",
                    "bg-card border border-border/50",
                    "hover:shadow-md transition-shadow"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                      {hadith.collection} #{hadith.number}
                    </span>
                    {hadith.url && (
                      <a
                        href={hadith.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-accent transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {hadith.text}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Quran Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MushafIcon className="w-5 h-5 text-emerald-600" size={20} />
            <h3 className="font-semibold text-lg">Quran Verses ({quranVerses.length})</h3>
          </div>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {quranVerses.map((verse, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-xl",
                    "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
                    "dark:from-emerald-950/30 dark:to-emerald-900/20",
                    "border border-emerald-200/50 dark:border-emerald-800/30",
                    "hover:shadow-md transition-shadow"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded-full">
                      Surah {verse.surah}:{verse.ayah}
                    </span>
                  </div>
                  <p
                    className="text-right text-lg mb-3 leading-loose font-arabic"
                    dir="rtl"
                  >
                    {verse.text}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {verse.translation}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-xl text-center">
        <p className="text-sm text-muted-foreground">
          ✨ Feel free to continue the chat with the AI
        </p>
      </div>
    </div>
  );
};

export default BatchDisplay;
