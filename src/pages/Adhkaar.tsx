import Header from "@/components/Header";
import OfflineBanner from "@/components/OfflineBanner";
import { adhkaarCategories } from "@/modules/adhkaar/adhkaarData";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import { useTranslate } from "@/hooks/useTranslate";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, Volume2 } from "lucide-react";
import { useSavedForLater } from "@/hooks/useSavedForLater";

const Adhkaar = () => {
  const { t } = useTranslate();
  const isOnline = useOnlineStatus();
  const { saveForLater } = useSavedForLater();

  const handleRead = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar";
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OfflineBanner isOnline={isOnline} />
      <main className="container mx-auto px-4 py-10 space-y-10">
        <section className="space-y-3 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold gold-text">
            {t("SunnahMind Adhkaar")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "Morning, evening, sleep, and gratitude adhkaar with a calm, focused layout.",
            )}
          </p>
        </section>

        <section className="space-y-8">
          {adhkaarCategories.map((category) => (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-2xl font-semibold">{category.title}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {category.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-card border border-border/60 rounded-2xl p-5 space-y-4"
                  >
                    <div>
                      <h3 className="font-semibold">{entry.title}</h3>
                      <p className="text-right text-lg font-arabic leading-loose mt-3">
                        {entry.arabic}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {entry.transliteration}
                      </p>
                      <p className="text-sm text-foreground/90 mt-2">
                        {entry.translation}
                      </p>
                      {entry.reference && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {t("Reference")}: {entry.reference}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRead(entry.arabic)}
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        {t("Read aloud")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          saveForLater({
                            type: "adhkaar",
                            title: entry.title,
                            content: `${entry.arabic}\n${entry.transliteration}\n${entry.translation}`,
                            reference: entry.reference,
                          })
                        }
                      >
                        <BookmarkPlus className="w-4 h-4 mr-2" />
                        {t("Save for later")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Adhkaar;
