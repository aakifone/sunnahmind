import { WifiOff } from "lucide-react";
import { useTranslate } from "@/hooks/useTranslate";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

const OfflineBanner = () => {
  const isOffline = useOfflineStatus();
  const { t } = useTranslate();

  if (!isOffline) return null;

  return (
    <div className="w-full bg-destructive/10 border-b border-destructive/20 text-destructive">
      <div className="container mx-auto px-4 py-2 flex items-center gap-2 text-sm">
        <WifiOff className="w-4 h-4" />
        <span className="font-medium">{t("You are offline")}</span>
        <span className="text-xs text-destructive/80">
          {t("Previously viewed Hadiths, Quran verses, and articles remain available.")}
        </span>
      </div>
    </div>
  );
};

export default OfflineBanner;
