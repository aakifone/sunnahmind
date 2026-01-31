import Header from "@/components/Header";
import OfflineBanner from "@/components/OfflineBanner";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import { useTranslate } from "@/hooks/useTranslate";
import { useFavorites } from "@/hooks/useFavorites";
import { useSavedForLater } from "@/hooks/useSavedForLater";
import { getCachedHadith, getCachedQuran } from "@/lib/offlineCache";
import { Button } from "@/components/ui/button";

const Saved = () => {
  const { t } = useTranslate();
  const isOnline = useOnlineStatus();
  const { favorites, removeFavorite } = useFavorites();
  const { savedItems, removeSavedItem, clearSavedItems } = useSavedForLater();
  const cachedHadith = getCachedHadith();
  const cachedQuran = getCachedQuran();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OfflineBanner isOnline={isOnline} />
      <main className="container mx-auto px-4 py-10 space-y-10">
        <section className="space-y-3 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold gold-text">
            {t("Saved & Offline Library")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "Favorites for long-term study and Saved for Later for short reflection.",
            )}
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-2xl font-semibold">{t("Favorites")}</h2>
            <span className="text-sm text-muted-foreground">
              {favorites.length} {t("items")}
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-card border border-border/60 rounded-2xl p-5 space-y-3"
              >
                <p className="text-sm text-foreground/90">“{favorite.english}”</p>
                <p className="text-xs text-muted-foreground">{favorite.reference}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFavorite(favorite.id)}
                >
                  {t("Remove")}
                </Button>
              </div>
            ))}
            {favorites.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("No favorites yet.")}</p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-2xl font-semibold">{t("Saved for Later")}</h2>
            <Button variant="outline" size="sm" onClick={clearSavedItems}>
              {t("Clear list")}
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {savedItems.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border/60 rounded-2xl p-5 space-y-3"
              >
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {item.content}
                </p>
                {item.reference && (
                  <p className="text-xs text-muted-foreground">{item.reference}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeSavedItem(item.id)}
                >
                  {t("Remove")}
                </Button>
              </div>
            ))}
            {savedItems.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("Nothing saved yet.")}</p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("Offline Library")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold">{t("Recently Viewed Hadith")}</h3>
              {cachedHadith.map((item, index) => (
                <p key={`${item.hadithNumber}-${index}`} className="text-sm text-muted-foreground">
                  {item.collection} • {t("Hadith")} {item.hadithNumber}
                </p>
              ))}
              {cachedHadith.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("No cached hadith yet.")}</p>
              )}
            </div>
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold">{t("Recently Viewed Quran Ayah")}</h3>
              {cachedQuran.map((item) => (
                <p
                  key={`${item.surahNumber}-${item.ayahNumber}`}
                  className="text-sm text-muted-foreground"
                >
                  {item.surahName} {item.surahNumber}:{item.ayahNumber}
                </p>
              ))}
              {cachedQuran.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("No cached ayah yet.")}</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Saved;
