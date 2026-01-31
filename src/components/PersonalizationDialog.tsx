import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePreferences, HadithDisplayFormat, ThemePreference } from "@/contexts/PreferencesContext";
import { useTranslate } from "@/hooks/useTranslate";

interface PersonalizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PersonalizationDialog = ({ open, onOpenChange }: PersonalizationDialogProps) => {
  const { preferences, updatePreferences } = usePreferences();
  const { t } = useTranslate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl gold-text">
            {t("Personalization")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Hadith Display Format */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {t("Hadith Display Format")}
            </Label>
            <RadioGroup
              value={preferences.hadithDisplayFormat}
              onValueChange={(value) => updatePreferences({ hadithDisplayFormat: value as HadithDisplayFormat })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="arabic-only" id="arabic-only" />
                <Label htmlFor="arabic-only" className="cursor-pointer font-normal">
                  {t("Arabic only")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="english-only" id="english-only" />
                <Label htmlFor="english-only" className="cursor-pointer font-normal">
                  {t("English only")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="cursor-pointer font-normal">
                  {t("Arabic + English side-by-side")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Theme Preference */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {t("Theme Preference")}
            </Label>
            <RadioGroup
              value={preferences.themePreference}
              onValueChange={(value) => updatePreferences({ themePreference: value as ThemePreference })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="cursor-pointer font-normal">
                  {t("Light")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="cursor-pointer font-normal">
                  {t("Dark")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="masjid" id="masjid" />
                <Label htmlFor="masjid" className="cursor-pointer font-normal">
                  {t("Masjid (green tones, kufic pattern)")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer font-normal">
                  {t("Custom theme")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {preferences.themePreference === "custom" && (
            <div className="space-y-4 rounded-lg border border-border/50 p-4">
              <div className="space-y-2">
                <Label className="text-sm">{t("Background")}</Label>
                <input
                  type="color"
                  value={preferences.customTheme.background}
                  onChange={(event) =>
                    updatePreferences({
                      customTheme: {
                        ...preferences.customTheme,
                        background: event.target.value,
                      },
                    })
                  }
                  className="h-10 w-full rounded-md border border-border/50 bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t("Card")}</Label>
                <input
                  type="color"
                  value={preferences.customTheme.card}
                  onChange={(event) =>
                    updatePreferences({
                      customTheme: {
                        ...preferences.customTheme,
                        card: event.target.value,
                      },
                    })
                  }
                  className="h-10 w-full rounded-md border border-border/50 bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t("Accent")}</Label>
                <input
                  type="color"
                  value={preferences.customTheme.accent}
                  onChange={(event) =>
                    updatePreferences({
                      customTheme: {
                        ...preferences.customTheme,
                        accent: event.target.value,
                      },
                    })
                  }
                  className="h-10 w-full rounded-md border border-border/50 bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t("Primary")}</Label>
                <input
                  type="color"
                  value={preferences.customTheme.primary}
                  onChange={(event) =>
                    updatePreferences({
                      customTheme: {
                        ...preferences.customTheme,
                        primary: event.target.value,
                      },
                    })
                  }
                  className="h-10 w-full rounded-md border border-border/50 bg-background"
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalizationDialog;
