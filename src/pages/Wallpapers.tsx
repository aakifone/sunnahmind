import Header from "@/components/Header";
import WallpaperGenerator from "@/components/WallpaperGenerator";
import { useTranslate } from "@/hooks/useTranslate";

const Wallpapers = () => {
  const { t } = useTranslate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{t("Wallpaper Generator")}</h1>
            <p className="text-muted-foreground">
              {t("Generate Quran and Hadith wallpapers for calm reflection.")}
            </p>
          </div>
          <WallpaperGenerator />
        </div>
      </main>
    </div>
  );
};

export default Wallpapers;
