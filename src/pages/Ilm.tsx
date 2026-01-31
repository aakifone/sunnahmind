import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ilmTopics } from "@/data/ilm";
import { useTranslate } from "@/hooks/useTranslate";
import { BookOpen, BookmarkPlus, Image } from "lucide-react";
import { useSavedContent } from "@/hooks/useSavedContent";
import WallpaperGenerator from "@/components/WallpaperGenerator";

const Ilm = () => {
  const { t } = useTranslate();
  const { addItem } = useSavedContent();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{t("SunnahMind ‘Ilm")}</h1>
            <p className="text-muted-foreground">
              {t("Structured learning paths with themes, collections, and Quran anchors.")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {ilmTopics.map((topic) => (
              <div
                key={topic.id}
                className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 text-accent">
                  <BookOpen className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">{topic.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{topic.summary}</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t("Themes")}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {topic.themes.map((theme) => (
                        <Badge key={theme} variant="secondary">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t("Hadith collections")}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {topic.hadithCollections.map((collection) => (
                        <Badge key={collection} variant="outline">
                          {collection}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t("Quran focus")}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {topic.quranFocus.map((ayah) => (
                        <Badge key={ayah} variant="outline">
                          {ayah}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addItem({
                        type: "ilm",
                        title: topic.title,
                        content: topic.summary,
                        source: topic.hadithCollections.join(", "),
                        list: "favorites",
                      })
                    }
                  >
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    {t("Save to favorites")}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Image className="w-4 h-4 mr-2" />
                    {t("Create wallpaper")}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-semibold">{t("Wallpaper generator")}</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("Create calming wallpapers from Qur'an ayat or hadith for reflection.")}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <WallpaperGenerator />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Ilm;
