import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslate } from "@/hooks/useTranslate";
import type { QuranCitationData } from "@/types/citations";

interface QuranCitationProps {
  citation: QuranCitationData;
}

const QuranCitation = ({ citation }: QuranCitationProps) => {
  const { t } = useTranslate();

  return (
    <div className="border border-emerald-500/30 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-sm">
              {t("Quran")}
            </span>
            <span className="text-xs font-bold text-foreground">
              {t("Surah")} {citation.surahNumber}:{citation.ayahNumber}
            </span>
          </div>

          {citation.arabicText && (
            <p className="text-lg text-foreground font-arabic leading-loose text-right bg-background/30 p-3 rounded-lg" dir="rtl">
              {citation.arabicText}
            </p>
          )}

          {citation.translation && (
            <p className="text-sm text-foreground/90 leading-relaxed bg-background/30 p-3 rounded-lg">
              {citation.translation}
            </p>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <span className="font-semibold text-foreground">{t("Edition")}:</span> {citation.editionName}
            </p>
            <p>
              <span className="font-semibold text-foreground">{t("Source")}:</span> {citation.source}
            </p>
            <p>
              <span className="font-semibold text-foreground">{t("Endpoint")}:</span> {citation.endpoint}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all duration-200 hover:scale-110"
          asChild
        >
          <a href={citation.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>

      <div className="px-4 pb-4">
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          {t("View on Quran.com")}
        </a>
      </div>
    </div>
  );
};

export default QuranCitation;
