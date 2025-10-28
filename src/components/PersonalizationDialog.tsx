import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePreferences, HadithDisplayFormat, ThemePreference } from "@/contexts/PreferencesContext";

interface PersonalizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PersonalizationDialog = ({ open, onOpenChange }: PersonalizationDialogProps) => {
  const { preferences, updatePreferences } = usePreferences();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl gold-text">Personalization</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Hadith Display Format */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Hadith Display Format</Label>
            <RadioGroup
              value={preferences.hadithDisplayFormat}
              onValueChange={(value) => updatePreferences({ hadithDisplayFormat: value as HadithDisplayFormat })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="arabic-only" id="arabic-only" />
                <Label htmlFor="arabic-only" className="cursor-pointer font-normal">
                  Arabic only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="english-only" id="english-only" />
                <Label htmlFor="english-only" className="cursor-pointer font-normal">
                  English only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="cursor-pointer font-normal">
                  Arabic + English side-by-side
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Theme Preference */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Theme Preference</Label>
            <RadioGroup
              value={preferences.themePreference}
              onValueChange={(value) => updatePreferences({ themePreference: value as ThemePreference })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="cursor-pointer font-normal">
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="cursor-pointer font-normal">
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="masjid" id="masjid" />
                <Label htmlFor="masjid" className="cursor-pointer font-normal">
                  Masjid (green tones, kufic pattern)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalizationDialog;
