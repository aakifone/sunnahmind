import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { useTranslate } from "@/hooks/useTranslate";
import { useContentPreferences } from "@/contexts/ContentPreferencesContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { preferences, updatePreferences } = usePreferences();
  const {
    hadithLanguage,
    quranLanguage,
    articleLanguage,
    setHadithLanguage,
    setQuranLanguage,
    setArticleLanguage,
    options,
  } = useContentPreferences();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    onOpenChange(false);
  };

  const handleClearChats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("user_id", session.user.id);

    if (error) {
      toast({
        title: t("Error"),
        description: t("Failed to clear chats"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("Success"),
        description: t("All chats cleared successfully"),
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl gold-text">
            {t("Settings")}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">{t("Account")}</TabsTrigger>
            <TabsTrigger value="behavior">{t("App Behavior")}</TabsTrigger>
            <TabsTrigger value="accessibility">{t("Accessibility")}</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {t("Account Actions")}
                </Label>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t("Manage your profile and account settings")}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    {t("Edit Profile")}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    {t("Sign Out")}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* App Behavior Tab */}
          <TabsContent value="behavior" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{t("Chat History")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("Save your conversations for later")}
                  </p>
                </div>
                <Switch
                  checked={preferences.chatHistoryEnabled}
                  onCheckedChange={(checked) => updatePreferences({ chatHistoryEnabled: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {t("Clear All Chats")}
                </Label>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    {t("This will permanently delete all your conversations")}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleClearChats}
                >
                  {t("Clear All Chats")}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  {t("Content Languages")}
                </Label>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm">{t("Hadith")}</Label>
                    <Select value={hadithLanguage.code} onValueChange={setHadithLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Language")} />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem key={option.code} value={option.code}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t("Quran")}</Label>
                    <Select value={quranLanguage.code} onValueChange={setQuranLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Language")} />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem key={option.code} value={option.code}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t("Articles")}</Label>
                    <Select value={articleLanguage.code} onValueChange={setArticleLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Language")} />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem key={option.code} value={option.code}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  {t("Font Size")}
                </Label>
                <RadioGroup
                  value={preferences.fontSize}
                  onValueChange={(value) => updatePreferences({ fontSize: value as "small" | "medium" | "large" })}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="small" />
                    <Label htmlFor="small" className="cursor-pointer font-normal">
                      {t("Small")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="cursor-pointer font-normal">
                      {t("Medium")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="large" />
                    <Label htmlFor="large" className="cursor-pointer font-normal">
                      {t("Large")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{t("Text-to-Speech")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("Read Hadith aloud")}
                  </p>
                </div>
                <Switch
                  checked={preferences.textToSpeech}
                  onCheckedChange={(checked) => updatePreferences({ textToSpeech: checked })}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
