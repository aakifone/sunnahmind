import { WifiOff } from "lucide-react";
import { useTranslate } from "@/hooks/useTranslate";

interface OfflineBannerProps {
  isOnline: boolean;
}

const OfflineBanner = ({ isOnline }: OfflineBannerProps) => {
  const { t } = useTranslate();

  if (isOnline) return null;

  return (
    <div className="w-full bg-destructive/10 border-b border-destructive/30 text-destructive-foreground">
      <div className="container mx-auto px-4 py-2 flex items-center gap-2 text-sm">
        <WifiOff className="w-4 h-4" />
        <span>
          {t(
            "You are offline. Previously viewed content and saved lists are still available.",
          )}
        </span>
      </div>
    </div>
  );
};

export default OfflineBanner;
