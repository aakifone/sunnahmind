import { MoonStar, Timer } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTranslate } from "@/hooks/useTranslate";
import { useRamadanMode } from "@/hooks/useRamadanMode";

const getTimePrompt = () => {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 5) return "Before Fajr: renew intention and ask for steadfastness.";
  if (hour < 18) return "Through the day: keep dhikr light and focused.";
  if (hour < 20) return "Before Iftar: make dua for mercy and ease.";
  return "After Taraweeh: reflect on forgiveness and quiet gratitude.";
};

const RamadanModeCard = () => {
  const { isRamadanMode, inRamadanSeason, toggleRamadanMode } = useRamadanMode();
  const { t } = useTranslate();

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600">
            <MoonStar className="w-5 h-5" />
            <p className="text-xs uppercase tracking-wider font-semibold">
              {t("Ramadan Mode")}
            </p>
          </div>
          <h3 className="text-xl font-semibold mt-2">{t("Gentle, fasting-aware guidance")}</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t("Shorter answers, softer tone, and time-aware prompts for Ramadan.")}
          </p>
        </div>
        <Switch checked={isRamadanMode} onCheckedChange={toggleRamadanMode} />
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
        <Timer className="w-4 h-4" />
        <span>{t(getTimePrompt())}</span>
      </div>
      {inRamadanSeason && (
        <p className="mt-3 text-xs text-emerald-700">
          {t("Ramadan Mode is on by default during Ramadan.")}
        </p>
      )}
    </div>
  );
};

export default RamadanModeCard;
