import Header from "@/components/Header";
import { adhkaar } from "@/data/adhkaar";
import { useTranslate } from "@/hooks/useTranslate";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, Volume2 } from "lucide-react";
import { useSavedContent } from "@/hooks/useSavedContent";
import { saveOfflineItem } from "@/lib/offlineStore";

const Adhkaar = () => {
  const { t } = useTranslate();
  const { addItem } = useSavedContent();

  const handleRead = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{t("SunnahMind Adhkaar")}</h1>
            <p className="text-muted-foreground">
              {t("Morning, evening, sleep, stress, and gratitude adhkaar in a calm layout.")}
            </p>
          </div>

          <div className="grid gap-6">
            {adhkaar.map((category) => (
              <section
                key={category.id}
                className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm"
              >
                <h2 className="text-2xl font-semibold">{category.title}</h2>
                <p className="text-sm text-muted-foreground mt-2">{category.description}</p>

                <div className="mt-6 space-y-4">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border/40 bg-background/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xl font-semibold text-right">{item.arabic}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {item.transliteration}
                          </p>
                          <p className="text-sm mt-2">{item.translation}</p>
                          {item.times && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {t("Repeat")}: {item.times}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRead(item.arabic)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              addItem({
                                type: "adhkar",
                                title: category.title,
                                content: `${item.arabic}\n${item.translation}`,
                                list: "favorites",
                              });
                              saveOfflineItem("adhkar", item);
                            }}
                          >
                            <BookmarkPlus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Adhkaar;
