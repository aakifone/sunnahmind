import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActiveCommand } from "@/types/commands";
import {
  Layers,
  History,
  Sun,
  BookOpen,
  Heart,
  Share2,
  Tags,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  batch: Layers,
  context: History,
  daily: Sun,
  explain: BookOpen,
  save: Heart,
  share: Share2,
  topic: Tags,
};

const commandLabels: Record<string, string> = {
  batch: "Batch Mode",
  context: "Context Search",
  daily: "Hadith of the Day",
  explain: "Explanation Mode",
  save: "Saving Hadith",
  share: "Creating Share Image",
  topic: "Topic Selection",
};

interface CommandBubbleProps {
  activeCommand: ActiveCommand;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const CommandBubble = ({
  activeCommand,
  onCancel,
  children,
}: CommandBubbleProps) => {
  if (!activeCommand) return null;

  const IconComponent = iconMap[activeCommand];
  const label = commandLabels[activeCommand] || activeCommand;

  return (
    <div
      className={cn(
        "w-full rounded-xl p-4 mb-4",
        "bg-gradient-to-r from-secondary/90 to-secondary/70",
        "border border-secondary/30",
        "shadow-lg",
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Islamic geometric pattern logo */}
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              "bg-white/20 backdrop-blur-sm",
              "border border-white/30"
            )}
          >
            {/* Simple Islamic geometric pattern */}
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {/* 8-pointed star pattern */}
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{label}</p>
            <p className="text-xs text-white/70">Active command</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "bg-white/20 hover:bg-white/30",
            "transition-all duration-200",
            "text-white"
          )}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {children && <div className="mt-2">{children}</div>}
    </div>
  );
};

export default CommandBubble;
