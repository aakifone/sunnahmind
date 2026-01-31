import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image, Share2 } from "lucide-react";
import { createShareableImage, downloadDataUrl } from "@/lib/shareUtils";
import { useTranslate } from "@/hooks/useTranslate";

const BACKGROUNDS = [
  { id: "ocean", label: "Ocean", gradient: ["#0f1e3a", "#1f6feb"] },
  { id: "nature", label: "Nature", gradient: ["#1b4332", "#52b788"] },
  { id: "abstract", label: "Abstract Islamic", gradient: ["#3c1f2e", "#c89b3c"] },
];

const WallpaperGenerator = () => {
  const { t } = useTranslate();
  const [textType, setTextType] = useState("quran");
  const [language, setLanguage] = useState("Arabic + English");
  const [background, setBackground] = useState("ocean");
  const [text, setText] = useState(
    "Indeed, with hardship comes ease. (Qur'an 94:6)",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("sunnahmind-wallpaper-text");
    if (stored) {
      setText(stored);
    }
  }, []);

  const selectedBackground = useMemo(
    () => BACKGROUNDS.find((item) => item.id === background) ?? BACKGROUNDS[0],
    [background],
  );

  const handleSave = async () => {
    const dataUrl = await createShareableImage({
      title: t("SunnahMind Wallpaper"),
      body: text,
      footer: `${textType.toUpperCase()} • ${language}`,
    });
    downloadDataUrl(dataUrl, "sunnahmind-wallpaper.png");
  };

  const handleShare = async () => {
    const shareText = `${textType.toUpperCase()} • ${language}\n\n${text}`;
    if (navigator.share) {
      await navigator.share({ title: t("SunnahMind Wallpaper"), text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{t("Text type")}</Label>
            <Select value={textType} onValueChange={setTextType}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select")}/> 
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quran">{t("Qur'an")}</SelectItem>
                <SelectItem value="hadith">{t("Hadith")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("Language")}</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select")}/> 
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arabic">{t("Arabic")}</SelectItem>
                <SelectItem value="English">{t("English")}</SelectItem>
                <SelectItem value="Arabic + English">{t("Arabic + English")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("Background")}</Label>
            <Select value={background} onValueChange={setBackground}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select")}/> 
              </SelectTrigger>
              <SelectContent>
                {BACKGROUNDS.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {t(item.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("Text")}</Label>
          <Textarea
            className="min-h-[140px]"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} className="gap-2">
            <Image className="w-4 h-4" />
            {t("Save image")}
          </Button>
          <Button variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="w-4 h-4" />
            {t("Share")}
          </Button>
        </div>
      </div>

      <div
        className="rounded-2xl border border-border/50 p-6 text-white shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${selectedBackground.gradient[0]}, ${selectedBackground.gradient[1]})`,
        }}
      >
        <p className="text-xs uppercase tracking-widest text-white/70">
          {t("Preview")}
        </p>
        <p className="mt-4 text-xl font-semibold leading-relaxed">{text}</p>
        <p className="mt-6 text-sm text-white/70">
          {textType.toUpperCase()} • {language}
        </p>
      </div>
    </div>
  );
};

export default WallpaperGenerator;
