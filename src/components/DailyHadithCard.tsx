import { RefreshCw, Volume2, Share2, BookmarkPlus, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDailyHadith } from "@/hooks/useDailyHadith";
import { useTranslate } from "@/hooks/useTranslate";
import { useSavedContent } from "@/hooks/useSavedContent";
import { saveOfflineItem } from "@/lib/offlineStore";
import { createShareableImage, downloadDataUrl } from "@/lib/shareUtils";

interface DailyHadithCardProps {
  editionName?: string;
}

const DailyHadithCard = ({ editionName }: DailyHadithCardProps) => {
  const { dailyHadith, status, refreshDailyHadith } = useDailyHadith(editionName);
  const { addItem } = useSavedContent();
  const { t } = useTranslate();

  const handleReadAloud = () => {
    if (!dailyHadith?.text) return;
    const utterance = new SpeechSynthesisUtterance(dailyHadith.text);
    speechSynthesis.speak(utterance);
  };

  const handleSave = () => {
    if (!dailyHadith?.text) return;
    addItem({
      type: "hadith",
      title: t("Daily Hadith"),
      content: dailyHadith.text,
      source: dailyHadith.sunnahUrl ?? dailyHadith.sourceUrl,
      list: "favorites",
    });
    saveOfflineItem("hadith", dailyHadith);
  };

  const handleShareText = async () => {
    if (!dailyHadith?.text) return;
    const shareText = `${t("Daily Hadith")}:\n${dailyHadith.text}`;
    if (navigator.share) {
      await navigator.share({ title: t("Daily Hadith"), text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  const handleSaveImage = async () => {
    if (!dailyHadith?.text) return;
    const dataUrl = await createShareableImage({
      title: t("Daily Hadith"),
      body: dailyHadith.text,
    });
    downloadDataUrl(dataUrl, "sunnahmind-daily-hadith.png");
  };

  return (
    <div className="rounded-2xl border border-accent/20 bg-card/70 p-6 shadow-elegant">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-accent font-semibold">
            {t("Daily Hadith")}
          </p>
          <h3 className="text-xl font-semibold mt-2">{t("Reflect with today’s guidance")}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={refreshDailyHadith}
          className="text-muted-foreground hover:text-accent"
          disabled={status === "loading"}
        >
          <RefreshCw className={status === "loading" ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
        </Button>
      </div>
      <div className="mt-4 rounded-xl border border-border/40 bg-background/70 p-4 text-sm text-foreground/90">
        {dailyHadith?.text
          ? dailyHadith.text
          : status === "loading"
            ? t("Loading today’s hadith...")
            : t("Unable to load a daily hadith right now.")}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={handleReadAloud} className="gap-2">
          <Volume2 className="w-4 h-4" />
          {t("Read aloud")}
        </Button>
        <Button size="sm" variant="outline" onClick={handleSave} className="gap-2">
          <BookmarkPlus className="w-4 h-4" />
          {t("Save")}
        </Button>
        <Button size="sm" variant="outline" onClick={handleSaveImage} className="gap-2">
          <Image className="w-4 h-4" />
          {t("Save image")}
        </Button>
        <Button size="sm" variant="outline" onClick={handleShareText} className="gap-2">
          <Share2 className="w-4 h-4" />
          {t("Share")}
        </Button>
      </div>
    </div>
  );
};

export default DailyHadithCard;
