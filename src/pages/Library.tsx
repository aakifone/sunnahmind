import Header from "@/components/Header";
import { useSavedContent } from "@/hooks/useSavedContent";
import { useTranslate } from "@/hooks/useTranslate";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { getOfflineItems } from "@/lib/offlineStore";
import type { Citation } from "@/types/citations";
import type { QuranCitationData } from "@/components/QuranCitation";
import type { Article } from "@/data/articles";

const Library = () => {
  const { t } = useTranslate();
  const { items, removeItem, clearList } = useSavedContent();

  const favorites = items.filter((item) => item.list === "favorites");
  const later = items.filter((item) => item.list === "later");
  const offlineHadith = getOfflineItems<Citation>("hadith");
  const offlineQuran = getOfflineItems<QuranCitationData>("quran");
  const offlineArticles = getOfflineItems<Article>("articles");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{t("Saved Library")}</h1>
            <p className="text-muted-foreground">
              {t("Favorites and Saved for Later, available offline.")}
            </p>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{t("Favorites")}</h2>
              {favorites.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => clearList("favorites")}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("Clear")}
                </Button>
              )}
            </div>
            <div className="grid gap-4">
              {favorites.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("No favorites yet. Save items to return daily.")}
                </p>
              )}
              {favorites.map((item) => (
                <div key={item.id} className="rounded-xl border border-border/50 bg-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {item.type}
                      </p>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.content}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{t("Saved for Later")}</h2>
              {later.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => clearList("later")}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("Clear")}
                </Button>
              )}
            </div>
            <div className="grid gap-4">
              {later.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("Save reflections here for short-term revisits.")}
                </p>
              )}
              {later.map((item) => (
                <div key={item.id} className="rounded-xl border border-border/50 bg-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {item.type}
                      </p>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.content}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{t("Offline Archive")}</h2>
            </div>
            <div className="grid gap-4">
              {(offlineHadith.length + offlineQuran.length + offlineArticles.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  {t("No offline items yet. View content while online to keep it available offline.")}
                </p>
              )}
              {offlineHadith.map((item, index) => (
                <div key={`hadith-${index}`} className="rounded-xl border border-border/50 bg-card p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("Hadith")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.translation || item.arabic || item.text}</p>
                </div>
              ))}
              {offlineQuran.map((item, index) => (
                <div key={`quran-${index}`} className="rounded-xl border border-border/50 bg-card p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("Quran")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.translation}</p>
                </div>
              ))}
              {offlineArticles.map((item, index) => (
                <div key={`article-${index}`} className="rounded-xl border border-border/50 bg-card p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("Article")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.title}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Library;
