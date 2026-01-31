import {
  ExternalLink,
  BookOpen,
  Copy,
  Volume2,
  BookmarkPlus,
  Image as ImageIcon,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import QuranCitation, { QuranCitationData } from "@/components/QuranCitation";
import { useTranslate } from "@/hooks/useTranslate";
import type { Citation } from "@/types/citations";
import { usePreferences } from "@/contexts/PreferencesContext";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  quranCitations?: QuranCitationData[];
  timestamp?: Date;
  onAction?: (action: MessageAction) => void;
}

export type MessageAction =
  | "copy"
  | "read"
  | "save"
  | "save-image"
  | "share-text"
  | "share-image"
  | "explain"
  | "explain-hadith"
  | "explain-quran";

const ChatMessage = ({
  role,
  content,
  citations,
  quranCitations,
  timestamp,
  onAction,
}: ChatMessageProps) => {
  const { t } = useTranslate();
  const { preferences } = usePreferences();

  if (role === "user") {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[80%] md:max-w-[70%]">
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-5 py-3 shadow-sm">
            <p className="text-sm leading-relaxed">{content}</p>
          </div>
          {timestamp && (
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-[85%] md:max-w-[75%] group">
        <div className="bg-gradient-to-br from-card to-card/80 border border-accent/30 rounded-2xl rounded-tl-sm px-6 py-5 shadow-lg hover:shadow-xl transition-shadow relative">
          <div className="absolute -top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-background/90 border border-border/60 rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
              <Button variant="ghost" size="icon" onClick={() => onAction?.("copy")}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onAction?.("read")}>
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onAction?.("save")}>
                <BookmarkPlus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onAction?.("save-image")}>
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onAction?.("share-text")}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onAction?.("share-image")}>
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onAction?.("explain")}>
                <Sparkles className="w-4 h-4" />
              </Button>
              {citations && citations.length > 0 && (
                <Button variant="ghost" size="icon" onClick={() => onAction?.("explain-hadith")}>
                  <BookOpen className="w-4 h-4" />
                </Button>
              )}
              {quranCitations && quranCitations.length > 0 && (
                <Button variant="ghost" size="icon" onClick={() => onAction?.("explain-quran")}>
                  <BookOpen className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="text-sm leading-relaxed mb-4 space-y-3">
            {content.split('\n\n').map((paragraph, idx) => {
              const isBismillah =
                paragraph.includes("بِسْ") &&
                paragraph.includes("الرَّحْمَن");
              return (
                <p
                  key={idx}
                  className={
                    isBismillah
                      ? "whitespace-pre-wrap text-center text-2xl md:text-3xl font-semibold tracking-wide leading-snug text-foreground"
                      : "whitespace-pre-wrap text-foreground/90"
                  }
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Hadith Citations Section */}
          {citations && citations.length > 0 && (
            <div className="border-t border-accent/20 pt-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                <BookOpen className="w-5 h-5" />
                {citations.length} {t("Verified Hadith Citation")}
                {citations.length > 1 ? "s" : ""}
              </div>

              {citations.map((citation, index) => (
                <div 
                  key={index}
                  className="border border-accent/30 rounded-xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5 hover:border-accent/50 transition-all shadow-sm hover:shadow-md"
                >
                  {/* Citation Header */}
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-bold shadow-sm">
                          {citation.collection}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {t("Hadith")} #{citation.hadithNumber}
                        </span>
                      </div>
                      {citation.narrator && (
                        <p className="text-xs text-muted-foreground font-medium">
                          {t("📖 Narrated by")} {citation.narrator}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 hover:bg-accent/20 hover:text-accent transition-all duration-200 hover:scale-110"
                      asChild
                    >
                      <a 
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                  <div className="px-4 pb-4 space-y-3">
                    {preferences.hadithDisplayFormat !== "english-only" && citation.arabic && (
                      <p className="text-right text-base font-arabic leading-loose text-foreground/90">
                        {citation.arabic}
                      </p>
                    )}
                    {preferences.hadithDisplayFormat !== "arabic-only" && citation.translation && (
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {citation.translation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quran Citations Section */}
          {quranCitations && quranCitations.length > 0 && (
            <div className="border-t border-emerald-500/20 pt-5 mt-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider">
                <BookOpen className="w-5 h-5" />
                {quranCitations.length} {t("Quran Verse")}
                {quranCitations.length > 1 ? "s" : ""}
              </div>

              {quranCitations.map((citation, index) => (
                <QuranCitation key={index} citation={citation} />
              ))}
            </div>
          )}

          {/* Context/Notes */}
          <div className="mt-5 pt-4 border-t border-accent/20">
            <p className="text-xs text-foreground/70 leading-relaxed bg-accent/5 p-3 rounded-lg">
              💡{" "}
              <span className="font-semibold text-accent">
                {t("Important:")}
              </span>{" "}
              {t(
                "These authentic sources are from sunnah.com and quran.com. For personal religious rulings (fatwas), please consult qualified Islamic scholars.",
              )}
            </p>
          </div>
        </div>

        {timestamp && (
          <p className="text-xs text-muted-foreground mt-2">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
