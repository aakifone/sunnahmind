import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LoadingAnimation from "@/components/LoadingAnimation";
import DailyHadithCard from "@/components/DailyHadithCard";
import { useTranslate } from "@/hooks/useTranslate";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { t } = useTranslate();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a fresh load/reload of the main page
    const hasSeenAnimation = sessionStorage.getItem('hasSeenLoadingAnimation');
    
    if (!hasSeenAnimation) {
      setShowLoading(true);
    } else {
      setIsReady(true);
    }
  }, []);

  const handleAnimationComplete = () => {
    sessionStorage.setItem('hasSeenLoadingAnimation', 'true');
    setShowLoading(false);
    setIsReady(true);
  };

  if (showLoading) {
    return <LoadingAnimation onComplete={handleAnimationComplete} />;
  }

  if (!isReady) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">{t("Daily Engagement")}</h2>
              <p className="text-muted-foreground mt-2">
                {t(
                  "Return each day for a gentle reminder, saved reflections, and structured study.",
                )}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <h3 className="font-semibold">{t("SunnahMind AI")}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("Chat-based guidance with sourced hadith and Quran support.")}
                </p>
                <Button className="mt-4" onClick={() => navigate("/ai")}>
                  {t("Open AI")}
                </Button>
              </div>
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <h3 className="font-semibold">{t("Saved & Offline")}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("Favorites and Saved for Later lists stay available offline.")}
                </p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/saved")}>
                  {t("Go to Saved")}
                </Button>
              </div>
            </div>
          </div>
          <DailyHadithCard />
        </div>
      </section>

      <section className="py-20 paper-texture">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              {t("Explore the SunnahMind Modules")}
            </h2>
            <p className="text-muted-foreground">
              {t("Clear sections for AI, Articles, Ilm, and Adhkaar with calm navigation.")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {[
              {
                title: t("SunnahMind AI"),
                description: t("Ask questions with cited hadith and Quran verses."),
                to: "/ai",
              },
              {
                title: t("SunnahMind Articles"),
                description: t("Timeless articles built for reflection."),
                to: "/articles",
              },
              {
                title: t("SunnahMind ‘Ilm"),
                description: t("Structured learning paths for daily study."),
                to: "/ilm",
              },
              {
                title: t("SunnahMind Adhkaar"),
                description: t("Morning, evening, and gratitude remembrances."),
                to: "/adhkaar",
              },
            ].map((item) => (
              <button
                key={item.title}
                onClick={() => navigate(item.to)}
                className="bg-card border border-border/60 rounded-2xl p-6 text-left hover:border-accent/40 hover:shadow-gold-glow transition-all"
              >
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("All hadith content sourced from Sunnah.com, Quran content from Quran.com.")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("© 2025 SunnahMind. For educational purposes only.")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
