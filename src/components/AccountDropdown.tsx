import { useState } from "react";
import { LogOut, Settings, Palette, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import PersonalizationDialog from "./PersonalizationDialog";
import SettingsDialog from "./SettingsDialog";
import ContactDialog from "./ContactDialog";
import KeyboardShortcutsDialog from "./KeyboardShortcutsDialog";
import { useTranslate } from "@/hooks/useTranslate";

interface AccountDropdownProps {
  userEmail: string;
}

const AccountDropdown = ({ userEmail }: AccountDropdownProps) => {
  const navigate = useNavigate();
  const { t } = useTranslate();
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
            <Avatar className="w-9 h-9 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src="" alt={userEmail} />
              <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                {getInitials(userEmail)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 bg-card" align="end" sideOffset={8}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowPersonalization(true)} className="cursor-pointer">
            <Palette className="mr-2 h-4 w-4" />
            <span>{t("Personalization")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowSettings(true)} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>{t("Settings")}</span>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>{t("Help")}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-card">
              <DropdownMenuItem onClick={() => setShowContact(true)} className="cursor-pointer">
                {t("Contact Us")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowKeyboardShortcuts(true)} className="cursor-pointer">
                {t("Keyboard Shortcuts")}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t("Sign Out")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PersonalizationDialog open={showPersonalization} onOpenChange={setShowPersonalization} />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <ContactDialog open={showContact} onOpenChange={setShowContact} />
      <KeyboardShortcutsDialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts} />
    </>
  );
};

export default AccountDropdown;
