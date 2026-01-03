import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface BatchProgressNotificationProps {
  isActive: boolean;
  onComplete: () => void;
  estimatedDuration?: number; // in milliseconds
}

export const BatchProgressNotification = ({
  isActive,
  onComplete,
  estimatedDuration = 8000,
}: BatchProgressNotificationProps) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setIsComplete(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, estimatedDuration / 50);

    return () => clearInterval(interval);
  }, [isActive, estimatedDuration]);

  useEffect(() => {
    if (progress >= 100 && !isComplete) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [progress, isComplete, onComplete]);

  if (!isActive) return null;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50",
        "bg-card border border-border rounded-xl shadow-xl",
        "p-4 min-w-64",
        "animate-in fade-in-0 slide-in-from-right-4 duration-300"
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        {isComplete ? (
          <CheckCircle className="w-5 h-5 text-secondary" />
        ) : (
          <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
        )}
        <span className="text-sm font-medium">
          {isComplete ? "Hadith batch has been generated" : "Generating batch..."}
        </span>
      </div>

      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            "bg-gradient-to-r from-secondary to-secondary/70"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default BatchProgressNotification;
