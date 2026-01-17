import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";
import { useTranslate } from "@/hooks/useTranslate";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KeyboardShortcutsDialog = ({ open, onOpenChange }: KeyboardShortcutsDialogProps) => {
  const { t } = useTranslate();
  const shortcuts = [
    { keys: "Ctrl + K", description: t("Search Hadith") },
    { keys: "Ctrl + N", description: t("New Chat") },
    { keys: "Ctrl + D", description: t("Daily Hadith") },
    { keys: "Esc", description: t("Close current panel") },
    { keys: "/", description: t("Quick Search") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl gold-text flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            {t("Keyboard Shortcuts")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-background border border-border rounded">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsDialog;
