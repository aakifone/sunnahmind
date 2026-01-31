import { useMemo } from "react";
import Header from "@/components/Header";
import { allahNames } from "@/data/allahNames";
import { useTranslate } from "@/hooks/useTranslate";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, Volume2 } from "lucide-react";
import { useSavedContent } from "@/hooks/useSavedContent";

const getDailyIndex = () => {
  const today = new Date();
  const dayOfYear =
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(today.getFullYear(), 0, 0)) /
    86400000;
  return dayOfYear % allahNames.length;
};

const AllahNames = () => {
  const { t } = useTranslate();
  const { addItem } = useSavedContent();
  const dailyName = useMemo(() => allahNames[getDailyIndex()], []);

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar";
    speechSynthesis.speak(utterance);
  };

  const reflection = (meaning: string) =>
    t(`Reflect on how Allah's attribute of ${meaning.toLowerCase()} can shape your day.`);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{t("Allah’s 99 Names")}</h1>
            <p className="text-muted-foreground">
              {t("Arabic with harakat, transliteration, meaning, and gentle reflection.")}
            </p>
          </div>

          <div className="rounded-2xl border border-accent/20 bg-card p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-accent font-semibold">
              {t("Daily Name")}
            </p>
            <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-2xl font-semibold">{dailyName.arabic}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {dailyName.transliteration} — {dailyName.meaning}
                </p>
                <p className="text-sm mt-2 text-foreground/80">
                  {reflection(dailyName.meaning)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => playAudio(dailyName.arabic)}>
                  <Volume2 className="w-4 h-4 mr-2" />
                  {t("Pronounce")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addItem({
                      type: "name",
                      title: dailyName.transliteration,
                      content: `${dailyName.arabic} — ${dailyName.meaning}`,
                      list: "favorites",
                    })
                  }
                >
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  {t("Save")}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {allahNames.map((name) => (
              <div
                key={name.id}
                className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold">{name.arabic}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {name.transliteration} — {name.meaning}
                    </p>
                    <p className="text-xs text-foreground/70 mt-2">
                      {reflection(name.meaning)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => playAudio(name.arabic)}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllahNames;
