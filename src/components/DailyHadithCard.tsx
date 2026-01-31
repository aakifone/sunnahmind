import { useEffect, useState } from "react";
import { fetchRelevantHadith } from "@/services/hadithApi";
import { defaultHadithEdition } from "@/services/contentDefaults";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, Share2, Volume2 } from "lucide-react";
import { useTranslate } from "@/hooks/useTranslate";
import { useSavedForLater } from "@/hooks/useSavedForLater";

interface DailyHadithState {
  date: string;
  text: string;
  reference: string;
  arabic?: string;
}

const DAILY_KEY = "sunnahmind-daily-hadith";
const themes = ["mercy", "patience", "gratitude", "prayer", "character", "hope"];

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const DailyHadithCard = () => {
  const { t } = useTranslate();
  const { saveForLater } = useSavedForLater();
  const [dailyHadith, setDailyHadith] = useState<DailyHadithState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem(DAILY_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as DailyHadithState;
      if (parsed.date === getTodayKey()) {
        setDailyHadith(parsed);
        return;
      }
    }

    const fetchDaily = async () => {
      setIsLoading(true);
      const theme = themes[new Date().getDate() % themes.length];
      const results = await fetchRelevantHadith(theme, defaultHadithEdition, 24, 1);
      const first = results[0];
      if (first?.text) {
        const payload = {
          date: getTodayKey(),
          text: first.text,
          reference: `${first.editionName} • ${t("Hadith")} ${first.hadithNumber ?? ""}`,
          arabic: first.arabic,
        };
        localStorage.setItem(DAILY_KEY, JSON.stringify(payload));
        setDailyHadith(payload);
      }
      setIsLoading(false);
    };

    fetchDaily();
  }, [t]);

  const handleRead = () => {
    if (!dailyHadith?.text) return;
    const utterance = new SpeechSynthesisUtterance(dailyHadith.text);
    speechSynthesis.speak(utterance);
  };

  const handleShare = async () => {
    if (!dailyHadith) return;
    const text = `${dailyHadith.text}\n\n${dailyHadith.reference}`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">
          {t("Daily Hadith")}
        </p>
        <h3 className="text-xl font-semibold mt-2">
          {t("A calm reflection for today")}
        </h3>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("Loading daily hadith...")}</p>
      ) : dailyHadith ? (
        <div className="space-y-3">
          {dailyHadith.arabic && (
            <p className="text-right text-lg font-arabic leading-loose">
              {dailyHadith.arabic}
            </p>
          )}
          <p className="text-sm text-foreground/90 leading-relaxed">“{dailyHadith.text}”</p>
          <p className="text-xs text-muted-foreground">{dailyHadith.reference}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("Daily hadith will appear when online.")}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleRead}>
          <Volume2 className="w-4 h-4 mr-2" />
          {t("Read aloud")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            dailyHadith &&
            saveForLater({
              type: "hadith",
              title: t("Daily Hadith"),
              content: dailyHadith.text,
              reference: dailyHadith.reference,
            })
          }
        >
          <BookmarkPlus className="w-4 h-4 mr-2" />
          {t("Save for later")}
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          {t("Share")}
        </Button>
      </div>
    </div>
  );
};

export default DailyHadithCard;
