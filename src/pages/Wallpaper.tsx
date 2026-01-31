import { useMemo, useState } from "react";
import Header from "@/components/Header";
import OfflineBanner from "@/components/OfflineBanner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslate } from "@/hooks/useTranslate";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import { exportTextAsImage, downloadDataUrl, dataUrlToFile } from "@/lib/imageExport";
import { useContentLanguages } from "@/hooks/useContentLanguages";
import { Share2, Download } from "lucide-react";

const wallpaperTexts = {
  quran: [
    {
      id: "quran-1",
      language: "en",
      title: "Quran 94:5",
      content: "Indeed, with hardship comes ease.",
    },
    {
      id: "quran-1-ar",
      language: "ar",
      title: "الشرح ٩٤:٥",
      content: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    },
  ],
  hadith: [
    {
      id: "hadith-1",
      language: "en",
      title: "Prophetic Guidance",
      content: "The best among you are those who have the best manners and character.",
    },
    {
      id: "hadith-1-ar",
      language: "ar",
      title: "حديث نبوي",
      content: "خَيْرُكُمْ أَحْسَنُكُمْ أَخْلَاقًا",
    },
  ],
};

const backgrounds = [
  { id: "ocean", label: "Ocean" },
  { id: "nature", label: "Nature" },
  { id: "pattern", label: "Islamic Patterns" },
];

const Wallpaper = () => {
  const { t } = useTranslate();
  const isOnline = useOnlineStatus();
  const { languages, updateLanguage } = useContentLanguages();
  const [textType, setTextType] = useState<"quran" | "hadith">("quran");
  const [background, setBackground] = useState<"ocean" | "nature" | "pattern">("pattern");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const options = useMemo(() => {
    const selectedLanguage = textType === "quran" ? languages.quran : languages.hadith;
    const list = wallpaperTexts[textType].filter(
      (item) => item.language === selectedLanguage,
    );
    return list.length > 0 ? list : wallpaperTexts[textType];
  }, [languages.hadith, languages.quran, textType]);

  const selectedText = options.find((item) => item.id === selectedId) ?? options[0];

  const generatePreview = async () => {
    if (!selectedText) return;
    const url = await exportTextAsImage({
      title: selectedText.title,
      content: selectedText.content,
      footer: "SunnahMind",
      theme: background,
    });
    if (url) {
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    if (!previewUrl) {
      await generatePreview();
    }
    if (previewUrl) {
      downloadDataUrl(previewUrl, "sunnahmind-wallpaper.png");
    }
  };

  const handleShare = async () => {
    if (!previewUrl) {
      await generatePreview();
    }
    if (previewUrl && navigator.share) {
      const file = await dataUrlToFile(previewUrl, "sunnahmind-wallpaper.png");
      await navigator.share({ files: [file], title: "SunnahMind Wallpaper" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OfflineBanner isOnline={isOnline} />
      <main className="container mx-auto px-4 py-10 space-y-10">
        <section className="space-y-3 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold gold-text">
            {t("Wallpaper Generator")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "Create calming wallpapers with Quran ayahs or Hadith reflections.",
            )}
          </p>
        </section>

        <section className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
          <div className="space-y-4 bg-card border border-border/60 rounded-2xl p-6">
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t("Content type")}</p>
                <Select value={textType} onValueChange={(value) => setTextType(value as "quran" | "hadith")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quran">{t("Quran ayah")}</SelectItem>
                    <SelectItem value="hadith">{t("Hadith")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t("Language")}</p>
                <Select
                  value={textType === "quran" ? languages.quran : languages.hadith}
                  onValueChange={(value) =>
                    updateLanguage(textType === "quran" ? "quran" : "hadith", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t("Background")}</p>
                <Select
                  value={background}
                  onValueChange={(value) =>
                    setBackground(value as "ocean" | "nature" | "pattern")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {backgrounds.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t("Text selection")}</p>
                <Select value={selectedText?.id} onValueChange={setSelectedId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generatePreview} className="bg-accent text-accent-foreground">
                {t("Generate preview")}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-border/60 rounded-2xl bg-card p-6 min-h-[360px] flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={t("Wallpaper preview")}
                  className="max-h-[400px] w-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-sm text-muted-foreground">
                  {t("Generate a preview to see your wallpaper.")}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleSave}>
                <Download className="w-4 h-4 mr-2" />
                {t("Save image")}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                {t("Share image")}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Wallpaper;
