import { Button } from "@/components/ui/button";
import { useTranslate } from "@/hooks/useTranslate";
import { BookOpen, Menu, MoonStar, Sun } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { usePreferences } from "@/contexts/PreferencesContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslate();
  const { preferences, updatePreferences } = usePreferences();

  const toggleTheme = () => {
    updatePreferences({
      themePreference: preferences.themePreference === "dark" ? "light" : "dark",
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-sm group-hover:shadow-gold-glow transition-all">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold leading-none">Sunnah Mind</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            {[
              { to: "/ai", label: t("SunnahMind AI") },
              { to: "/articles", label: t("Articles") },
              { to: "/ilm", label: t("Ilm") },
              { to: "/adhkaar", label: t("Adhkaar") },
              { to: "/wallpapers", label: t("Wallpapers") },
              { to: "/family-tree", label: t("Family Tree") },
              { to: "/allah-names", label: t("99 Names") },
              { to: "/library", label: t("Library") },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `transition-colors ${isActive ? "text-accent" : "hover:text-accent"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="border border-border/40 hover:bg-accent/10"
              aria-label={t("Toggle theme")}
            >
              {preferences.themePreference === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <MoonStar className="w-4 h-4" />
              )}
            </Button>
            <Button 
              variant="outline" 
              className="border-accent/30 hover:bg-accent/10 hover:border-accent"
              onClick={() => navigate('/auth')}
            >
              {t("Sign In")}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-accent/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu */}
          {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <nav className="flex flex-col gap-4">
              {[
                { to: "/ai", label: t("SunnahMind AI") },
                { to: "/articles", label: t("Articles") },
                { to: "/ilm", label: t("Ilm") },
                { to: "/adhkaar", label: t("Adhkaar") },
                { to: "/wallpapers", label: t("Wallpapers") },
                { to: "/family-tree", label: t("Family Tree") },
                { to: "/allah-names", label: t("99 Names") },
                { to: "/library", label: t("Library") },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `text-sm font-medium ${isActive ? "text-accent" : "hover:text-accent"}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={toggleTheme}
              >
                {preferences.themePreference === "dark"
                  ? t("Light Theme")
                  : t("Dark Theme")}
              </Button>
              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => {
                  navigate('/auth');
                  setMobileMenuOpen(false);
                }}
              >
                {t("Sign In")}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
