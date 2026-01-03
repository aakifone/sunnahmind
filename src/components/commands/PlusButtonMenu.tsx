import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SLASH_COMMANDS, SlashCommand } from "@/types/commands";
import {
  Plus,
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

interface PlusButtonMenuProps {
  hasQuerySubmitted: boolean;
  onSelectCommand: (command: SlashCommand) => void;
}

export const PlusButtonMenu = ({
  hasQuerySubmitted,
  onSelectCommand,
}: PlusButtonMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const availableCommands = SLASH_COMMANDS
    .filter((cmd) => hasQuerySubmitted || cmd.availableInEmptyState)
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (command: SlashCommand) => {
    onSelectCommand(command);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-10 w-10 rounded-full transition-all duration-300",
          isOpen
            ? "bg-accent/20 rotate-45"
            : "hover:bg-muted"
        )}
      >
        <Plus className="w-5 h-5" />
      </Button>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            "absolute bottom-full left-0 mb-2 w-72",
            "bg-card border border-border rounded-xl shadow-xl",
            "animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
            "z-50 overflow-hidden"
          )}
        >
          <div className="p-2 border-b border-border/50 bg-muted/30">
            <p className="text-xs text-muted-foreground font-medium px-2">
              Quick Actions
            </p>
          </div>
          <div className="p-1 max-h-80 overflow-y-auto">
            {availableCommands.map((command) => {
              const IconComponent = iconMap[command.icon];
              return (
                <button
                  key={command.id}
                  onClick={() => handleSelect(command)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left",
                    "transition-all duration-150 hover:bg-muted/50"
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
                    <p className="font-medium text-sm capitalize">{command.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {command.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlusButtonMenu;
