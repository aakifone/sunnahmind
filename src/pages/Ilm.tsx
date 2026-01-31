import Header from "@/components/Header";
import OfflineBanner from "@/components/OfflineBanner";
import { Button } from "@/components/ui/button";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import { useTranslate } from "@/hooks/useTranslate";
import { ilmPaths } from "@/modules/ilm/ilmData";
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";

const Ilm = () => {
  const { t } = useTranslate();
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OfflineBanner isOnline={isOnline} />
      <main className="container mx-auto px-4 py-10 space-y-10">
        <section className="space-y-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold gold-text">
            {t("SunnahMind ‘Ilm")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "Structured learning paths rooted in Quran, Sunnah, and timeless scholarship.",
            )}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/wallpaper")}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {t("Create a reflection wallpaper")}
          </Button>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          {ilmPaths.map((path) => (
            <div
              key={path.id}
              className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{path.title}</h3>
                  <p className="text-sm text-muted-foreground">{path.summary}</p>
                </div>
              </div>
              <div className="space-y-3">
                {path.units.map((unit) => (
                  <div
                    key={unit.id}
                    className="border border-border/40 rounded-xl p-4 bg-background/50"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{unit.title}</h4>
                      <span className="text-xs text-muted-foreground">{unit.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{unit.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {unit.topics.map((topic) => (
                        <span
                          key={topic}
                          className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent"
                        >
                          {topic}
                        </span>
                      ))}
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

export default Ilm;
