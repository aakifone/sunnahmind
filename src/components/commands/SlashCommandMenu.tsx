import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { SLASH_COMMANDS, SlashCommand } from "@/types/commands";
import { useTranslate } from "@/hooks/useTranslate";
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
  Layers,
  History,
  Sun,
  BookOpen,
  Heart,
  Share2,
  Tags,
};

interface SlashCommandMenuProps {
  isOpen: boolean;
  searchQuery: string;
  hasQuerySubmitted: boolean;
  selectedIndex: number;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
}

export const SlashCommandMenu = ({
  isOpen,
  searchQuery,
  hasQuerySubmitted,
  selectedIndex,
  onSelect,
  onClose,
}: SlashCommandMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslate();

  // Filter commands based on state and search
  const availableCommands = SLASH_COMMANDS
    .filter((cmd) => hasQuerySubmitted || cmd.availableInEmptyState)
    .filter((cmd) =>
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const selectedEl = menuRef.current.querySelector('[data-selected="true"]');
      selectedEl?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen || availableCommands.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        "absolute bottom-full left-0 mb-2 w-80 max-h-72 overflow-y-auto",
        "bg-card border border-border rounded-xl shadow-xl",
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
        "z-50"
      )}
    >
      <div className="p-2 border-b border-border/50">
        <p className="text-xs text-muted-foreground font-medium px-2">
          {t("Commands")}
        </p>
      </div>
      <div className="p-1">
        {availableCommands.map((command, index) => {
          const IconComponent = iconMap[command.icon];
          return (
            <button
              key={command.id}
              data-selected={index === selectedIndex}
              onClick={() => onSelect(command)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left",
                "transition-all duration-150",
                index === selectedIndex
                  ? "bg-accent/20 text-accent-foreground"
                  : "hover:bg-muted/50"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-br from-secondary/30 to-secondary/10"
                )}
              >
                {IconComponent && (
                  <IconComponent className="w-4 h-4 text-secondary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">/{command.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {t(command.description)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SlashCommandMenu;
