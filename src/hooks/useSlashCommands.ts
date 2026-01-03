import { useState, useCallback, useEffect } from "react";
import { SlashCommand, ActiveCommand, SLASH_COMMANDS } from "@/types/commands";

interface UseSlashCommandsProps {
  input: string;
  setInput: (value: string) => void;
  hasQuerySubmitted: boolean;
}

export const useSlashCommands = ({
  input,
  setInput,
  hasQuerySubmitted,
}: UseSlashCommandsProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCommand, setActiveCommand] = useState<ActiveCommand>(null);

  // Detect "/" at start of input
  useEffect(() => {
    if (input.startsWith("/")) {
      setIsMenuOpen(true);
      setMenuSearchQuery(input.slice(1));
      setSelectedIndex(0);
    } else {
      setIsMenuOpen(false);
      setMenuSearchQuery("");
    }
  }, [input]);

  // Get filtered commands
  const getFilteredCommands = useCallback(() => {
    return SLASH_COMMANDS
      .filter((cmd) => hasQuerySubmitted || cmd.availableInEmptyState)
      .filter((cmd) =>
        cmd.name.toLowerCase().includes(menuSearchQuery.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [hasQuerySubmitted, menuSearchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isMenuOpen) return false;

      const filteredCommands = getFilteredCommands();

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          return true;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          return true;

        case "Tab":
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            selectCommand(filteredCommands[selectedIndex]);
          }
          return true;

        case "Escape":
          e.preventDefault();
          setIsMenuOpen(false);
          setInput("");
          return true;

        default:
          return false;
      }
    },
    [isMenuOpen, selectedIndex, getFilteredCommands, setInput]
  );

  // Select a command
  const selectCommand = useCallback(
    (command: SlashCommand) => {
      setIsMenuOpen(false);
      setInput("");
      setActiveCommand(command.id as ActiveCommand);
    },
    [setInput]
  );

  // Cancel active command
  const cancelCommand = useCallback(() => {
    setActiveCommand(null);
  }, []);

  return {
    isMenuOpen,
    menuSearchQuery,
    selectedIndex,
    activeCommand,
    handleKeyDown,
    selectCommand,
    cancelCommand,
    setActiveCommand,
    getFilteredCommands,
  };
};

export default useSlashCommands;
