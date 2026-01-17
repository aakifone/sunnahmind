import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { switchLanguageWithTransition } from "@/lib/languageSwitch";
import { BookOpen, Languages, Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const languageOptions = [
  { code: "af", label: "Afrikaans" },
  { code: "ar", label: "Arabic" },
  { code: "bn", label: "Bengali" },
  { code: "nl", label: "Dutch" },
  { code: "en", label: "English" },
  { code: "fil", label: "Filipino (Tagalog)" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "gu", label: "Gujarati" },
  { code: "hi", label: "Hindi" },
  { code: "id", label: "Indonesian" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "kn", label: "Kannada" },
  { code: "ko", label: "Korean" },
  { code: "ml", label: "Malayalam" },
  { code: "zh", label: "Mandarin Chinese" },
  { code: "fa", label: "Persian (Farsi)" },
  { code: "pt", label: "Portuguese" },
  { code: "pa", label: "Punjabi" },
  { code: "ru", label: "Russian" },
  { code: "es", label: "Spanish" },
  { code: "sw", label: "Swahili" },
  { code: "ta", label: "Tamil" },
  { code: "th", label: "Thai" },
  { code: "tr", label: "Turkish" },
  { code: "ur", label: "Urdu" },
  { code: "vi", label: "Vietnamese" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(languageOptions[0]);
  const [isLanguageSwitching, setIsLanguageSwitching] = useState(false);
  const [languageQuery, setLanguageQuery] = useState("");
  const navigate = useNavigate();
  const languageMap = useMemo(
    () => new Map(languageOptions.map((language) => [language.code, language])),
    [],
  );
  const filteredLanguages = useMemo(() => {
    const sortedLanguages = [...languageOptions].sort((a, b) =>
      a.label.localeCompare(b.label),
    );
    const query = languageQuery.trim().toLowerCase();
    if (!query) {
      return sortedLanguages;
    }
    return sortedLanguages.filter(
      (language) =>
        language.label.toLowerCase().includes(query) ||
        language.code.toLowerCase().includes(query),
    );
  }, [languageQuery]);

  useEffect(() => {
    const storedLanguage = localStorage.getItem("preferredLanguage");
    if (storedLanguage && languageMap.has(storedLanguage)) {
      setActiveLanguage(languageMap.get(storedLanguage) ?? languageOptions[0]);
    }
  }, [languageMap]);

  useEffect(() => {
    setIsLanguageSwitching(true);
    const timer = window.setTimeout(() => setIsLanguageSwitching(false), 700);
    localStorage.setItem("preferredLanguage", activeLanguage.code);
    return () => window.clearTimeout(timer);
  }, [activeLanguage]);

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
          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm font-medium hover:text-accent transition-colors">
              How It Works
            </a>
            <a href="#about" className="text-sm font-medium hover:text-accent transition-colors">
              About
            </a>
            <a href="#sources" className="text-sm font-medium hover:text-accent transition-colors">
              Sources
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`border-accent/30 px-3 transition-all duration-300 hover:bg-accent/10 hover:border-accent ${
                    isLanguageSwitching ? "ring-2 ring-accent/40 shadow-gold-glow" : ""
                  }`}
                  aria-label="Change language"
                >
                  <Languages className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">{activeLanguage.label}</span>
                  <span
                    className={`ml-2 h-2 w-2 rounded-full bg-accent transition-all duration-300 ${
                      isLanguageSwitching ? "animate-ping" : "opacity-40"
                    }`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-60 border border-border/60 bg-card/95 backdrop-blur"
              >
                <DropdownMenuLabel className="text-xs uppercase tracking-widest text-muted-foreground">
                  Language
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 pb-2">
                  <Input
                    value={languageQuery}
                    onChange={(event) => setLanguageQuery(event.target.value)}
                    placeholder="25+ Languages Available"
                    className="h-9"
                  />
                </div>
                <div className="max-h-64 overflow-y-scroll px-1">
                  <DropdownMenuRadioGroup
                    value={activeLanguage.code}
                    onValueChange={(value) => {
                      void switchLanguageWithTransition(value, (lang) => {
                        const nextLanguage = languageMap.get(lang);
                        if (nextLanguage) {
                          setActiveLanguage(nextLanguage);
                        }
                      });
                    }}
                  >
                    {filteredLanguages.length === 0 ? (
                      <DropdownMenuLabel className="px-2 py-2 text-xs text-muted-foreground">
                        No matches found
                      </DropdownMenuLabel>
                    ) : (
                      filteredLanguages.map((language) => (
                        <DropdownMenuRadioItem
                          key={language.code}
                          value={language.code}
                          className="cursor-pointer rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:bg-accent/10"
                        >
                          {language.label}
                        </DropdownMenuRadioItem>
                      ))
                    )}
                  </DropdownMenuRadioGroup>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              className="border-accent/30 hover:bg-accent/10 hover:border-accent"
              onClick={() => navigate('/auth')}
            >
              Sign In
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
              <a href="#how-it-works" className="text-sm font-medium hover:text-accent transition-colors">
                How It Works
              </a>
              <a href="#about" className="text-sm font-medium hover:text-accent transition-colors">
                About
              </a>
              <a href="#sources" className="text-sm font-medium hover:text-accent transition-colors">
                Sources
              </a>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`border-accent/30 transition-all duration-300 hover:bg-accent/10 hover:border-accent ${
                      isLanguageSwitching ? "ring-2 ring-accent/40 shadow-gold-glow" : ""
                    }`}
                    aria-label="Change language"
                  >
                    <Languages className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">{activeLanguage.label}</span>
                    <span
                      className={`ml-2 h-2 w-2 rounded-full bg-accent transition-all duration-300 ${
                        isLanguageSwitching ? "animate-ping" : "opacity-40"
                      }`}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-60 border border-border/60 bg-card/95 backdrop-blur"
                >
                  <DropdownMenuLabel className="text-xs uppercase tracking-widest text-muted-foreground">
                    Language
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-2 pb-2">
                    <Input
                      value={languageQuery}
                      onChange={(event) => setLanguageQuery(event.target.value)}
                      placeholder="25+ Languages Available"
                      className="h-9"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-scroll px-1">
                    <DropdownMenuRadioGroup
                      value={activeLanguage.code}
                      onValueChange={(value) => {
                        void switchLanguageWithTransition(value, (lang) => {
                          const nextLanguage = languageMap.get(lang);
                          if (nextLanguage) {
                            setActiveLanguage(nextLanguage);
                          }
                        });
                      }}
                    >
                      {filteredLanguages.length === 0 ? (
                        <DropdownMenuLabel className="px-2 py-2 text-xs text-muted-foreground">
                          No matches found
                        </DropdownMenuLabel>
                      ) : (
                        filteredLanguages.map((language) => (
                          <DropdownMenuRadioItem
                            key={language.code}
                            value={language.code}
                            className="cursor-pointer rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:bg-accent/10"
                          >
                            {language.label}
                          </DropdownMenuRadioItem>
                        ))
                      )}
                    </DropdownMenuRadioGroup>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => {
                  navigate('/auth');
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
