import { ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuranCitation from "@/components/QuranCitation";
import { useTranslate } from "@/hooks/useTranslate";
import type { HadithCitationData, QuranCitationData } from "@/types/citations";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  citations?: HadithCitationData[];
  quranCitations?: QuranCitationData[];
  hadithStatus?: "loading" | "ready" | "empty" | "error";
  quranStatus?: "loading" | "ready" | "empty" | "error";
  hadithError?: string;
  quranError?: string;
  onRetryHadith?: () => void;
  onRetryQuran?: () => void;
  timestamp?: Date;
}

const ChatMessage = ({
  role,
  content,
  citations,
  quranCitations,
  hadithStatus,
  quranStatus,
  hadithError,
  quranError,
  onRetryHadith,
  onRetryQuran,
  timestamp,
}: ChatMessageProps) => {
  const { t } = useTranslate();

  if (role === "user") {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[80%] md:max-w-[70%]">
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-5 py-3 shadow-sm">
            <p className="text-sm leading-relaxed">{content}</p>
          </div>
          {timestamp && (
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>
    );
  }

  const renderHadithStatus = () => {
    if (hadithStatus === "loading") {
      return (
        <div className="text-xs text-muted-foreground">{t("Loading hadith sources...")}</div>
      );
    }

    if (hadithStatus === "error") {
      return (
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <span>{hadithError || t("Unable to load hadith sources.")}</span>
          {onRetryHadith && (
            <Button variant="outline" size="sm" onClick={onRetryHadith} className="w-fit">
              {t("Retry")}
            </Button>
          )}
        </div>
      );
    }

    if (hadithStatus === "empty") {
      return <div className="text-xs text-muted-foreground">{t("No relevant hadith found.")}</div>;
    }

    return null;
  };

  const renderQuranStatus = () => {
    if (quranStatus === "loading") {
      return (
        <div className="text-xs text-muted-foreground">{t("Loading Quran sources...")}</div>
      );
    }

    if (quranStatus === "error") {
      return (
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <span>{quranError || t("Unable to load Quran sources.")}</span>
          {onRetryQuran && (
            <Button variant="outline" size="sm" onClick={onRetryQuran} className="w-fit">
              {t("Retry")}
            </Button>
          )}
        </div>
      );
    }

    if (quranStatus === "empty") {
      return <div className="text-xs text-muted-foreground">{t("No relevant Quran verses found.")}</div>;
    }

    return null;
  };

  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-[85%] md:max-w-[75%]">
        <div className="bg-gradient-to-br from-card to-card/80 border border-accent/30 rounded-2xl rounded-tl-sm px-6 py-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-sm leading-relaxed mb-4 space-y-3">
            {content.split("\n\n").map((paragraph, idx) => (
              <p key={idx} className="whitespace-pre-wrap text-foreground/90">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Hadith Citations Section */}
          {(citations && citations.length > 0) || hadithStatus ? (
            <div className="border-t border-accent/20 pt-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                <BookOpen className="w-5 h-5" />
                {citations?.length || 0} {t("Verified Hadith Citation")}
                {(citations?.length || 0) > 1 ? "s" : ""}
              </div>

              {renderHadithStatus()}

              {citations?.map((citation, index) => (
                <div
                  key={index}
                  className="border border-accent/30 rounded-xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5 hover:border-accent/50 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-bold shadow-sm">
                          {citation.editionName}
                        </span>
                        {citation.hadithNumber && (
                          <span className="text-xs font-bold text-foreground">
                            {t("Hadith")} #{citation.hadithNumber}
                          </span>
                        )}
                      </div>
                      {(citation.section || citation.book) && (
                        <p className="text-xs text-muted-foreground font-medium">
                          {citation.section ? `${t("Section")}: ${citation.section}` : ""}
                          {citation.section && citation.book ? " • " : ""}
                          {citation.book ? `${t("Book")}: ${citation.book}` : ""}
                        </p>
                      )}
                      {citation.text && (
                        <p className="text-sm text-foreground/90 leading-relaxed bg-background/30 p-3 rounded-lg">
                          {citation.text}
                        </p>
                      )}
                      {citation.arabicText && (
                        <p className="text-lg text-foreground font-arabic leading-loose text-right bg-background/30 p-3 rounded-lg" dir="rtl">
                          {citation.arabicText}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          <span className="font-semibold text-foreground">{t("Source")}:</span> {citation.source}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">{t("Endpoint")}:</span> {citation.endpoint}
                        </p>
                      </div>
                      {citation.sunnahLink && (
                        <a
                          href={citation.sunnahLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-accent hover:text-accent/80"
                        >
                          {t("View on Sunnah.com")}
                        </a>
                      )}
                    </div>

                    {citation.sunnahLink && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 hover:bg-accent/20 hover:text-accent transition-all duration-200 hover:scale-110"
                        asChild
                      >
                        <a href={citation.sunnahLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Quran Citations Section */}
          {(quranCitations && quranCitations.length > 0) || quranStatus ? (
            <div className="border-t border-emerald-500/20 pt-5 mt-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider">
                <BookOpen className="w-5 h-5" />
                {quranCitations?.length || 0} {t("Quran Verse")}
                {(quranCitations?.length || 0) > 1 ? "s" : ""}
              </div>

              {renderQuranStatus()}

              {quranCitations?.map((citation, index) => (
                <QuranCitation key={index} citation={citation} />
              ))}
            </div>
          ) : null}

          <div className="mt-5 pt-4 border-t border-accent/20">
            <p className="text-xs text-foreground/70 leading-relaxed bg-accent/5 p-3 rounded-lg">
              💡{" "}
              <span className="font-semibold text-accent">{t("Important:")}</span>{" "}
              {t(
                "These citations are sourced from the fawazahmed0 hadith-api and quran-api. For personal religious rulings (fatwas), please consult qualified Islamic scholars.",
              )}
            </p>
          </div>
        </div>

        {timestamp && (
          <p className="text-xs text-muted-foreground mt-2">
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
