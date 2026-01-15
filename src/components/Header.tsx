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
import { BookOpen, Languages, Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const languageOptions = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ur", label: "اردو" },
  { code: "tr", label: "Türkçe" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "fa", label: "فارسی" },
  { code: "sw", label: "Kiswahili" },
  { code: "ha", label: "Hausa" },
  { code: "so", label: "Soomaali" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "nl", label: "Nederlands" },
  { code: "sv", label: "Svenska" },
  { code: "no", label: "Norsk" },
  { code: "da", label: "Dansk" },
  { code: "pl", label: "Polski" },
  { code: "ro", label: "Română" },
  { code: "cs", label: "Čeština" },
  { code: "el", label: "Ελληνικά" },
  { code: "uk", label: "Українська" },
  { code: "sr", label: "Српски" },
  { code: "af", label: "Afrikaans" },
  { code: "sq", label: "Shqip" },
  { code: "am", label: "አማርኛ" },
  { code: "hy", label: "Հայերեն" },
  { code: "az", label: "Azərbaycanca" },
  { code: "eu", label: "Euskara" },
  { code: "be", label: "Беларуская" },
  { code: "bs", label: "Bosanski" },
  { code: "bg", label: "Български" },
  { code: "my", label: "မြန်မာ" },
  { code: "ca", label: "Català" },
  { code: "ceb", label: "Cebuano" },
  { code: "ny", label: "Chichewa" },
  { code: "co", label: "Corsu" },
  { code: "hr", label: "Hrvatski" },
  { code: "eo", label: "Esperanto" },
  { code: "et", label: "Eesti" },
  { code: "tl", label: "Filipino" },
  { code: "fi", label: "Suomi" },
  { code: "fy", label: "Frysk" },
  { code: "gl", label: "Galego" },
  { code: "ka", label: "ქართული" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "ht", label: "Kreyòl Ayisyen" },
  { code: "haw", label: "ʻŌlelo Hawaiʻi" },
  { code: "he", label: "עברית" },
  { code: "hu", label: "Magyar" },
  { code: "is", label: "Íslenska" },
  { code: "ig", label: "Igbo" },
  { code: "ga", label: "Gaeilge" },
  { code: "jw", label: "Jawa" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "kk", label: "Қазақша" },
  { code: "km", label: "ភាសាខ្មែរ" },
  { code: "ku", label: "Kurdî" },
  { code: "ky", label: "Кыргызча" },
  { code: "lo", label: "ລາວ" },
  { code: "la", label: "Latina" },
  { code: "lv", label: "Latviešu" },
  { code: "lt", label: "Lietuvių" },
  { code: "lb", label: "Lëtzebuergesch" },
  { code: "mk", label: "Македонски" },
  { code: "mg", label: "Malagasy" },
  { code: "ml", label: "മലയാളം" },
  { code: "mt", label: "Malti" },
  { code: "mi", label: "Māori" },
  { code: "mr", label: "मराठी" },
  { code: "mn", label: "Монгол" },
  { code: "ne", label: "नेपाली" },
  { code: "or", label: "ଓଡ଼ିଆ" },
  { code: "ps", label: "پښتو" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "qu", label: "Quechua" },
  { code: "sm", label: "Gagana Samoa" },
  { code: "gd", label: "Gàidhlig" },
  { code: "st", label: "Sesotho" },
  { code: "sn", label: "Shona" },
  { code: "sd", label: "سنڌي" },
  { code: "si", label: "සිංහල" },
  { code: "sl", label: "Slovenščina" },
  { code: "su", label: "Sunda" },
  { code: "tg", label: "Тоҷикӣ" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "th", label: "ไทย" },
  { code: "tk", label: "Türkmen" },
  { code: "ug", label: "ئۇيغۇرچە" },
  { code: "uz", label: "Oʻzbek" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "cy", label: "Cymraeg" },
  { code: "xh", label: "isiXhosa" },
  { code: "yi", label: "ייִדיש" },
  { code: "yo", label: "Yorùbá" },
  { code: "zu", label: "isiZulu" },
  { code: "as", label: "অসমীয়া" },
  { code: "br", label: "Brezhoneg" },
  { code: "fo", label: "Føroyskt" },
  { code: "gv", label: "Gaelg" },
  { code: "ln", label: "Lingála" },
  { code: "lu", label: "Tshiluba" },
  { code: "oc", label: "Occitan" },
  { code: "om", label: "Oromoo" },
  { code: "rw", label: "Kinyarwanda" },
  { code: "sa", label: "संस्कृतम्" },
  { code: "sc", label: "Sardu" },
  { code: "se", label: "Davvisámegiella" },
  { code: "tn", label: "Setswana" },
  { code: "ti", label: "ትግርኛ" },
  { code: "to", label: "Faka Tonga" },
  { code: "ts", label: "Xitsonga" },
  { code: "tt", label: "Татарча" },
  { code: "ve", label: "Tshivenḓa" },
  { code: "wo", label: "Wolof" },
  { code: "zza", label: "Zazaki" },
  { code: "ay", label: "Aymara" },
  { code: "dv", label: "ދިވެހި" },
  { code: "ee", label: "Eʋegbe" },
  { code: "ff", label: "Fulfulde" },
  { code: "gn", label: "Guarani" },
  { code: "ki", label: "Gĩkũyũ" },
  { code: "kr", label: "Kanuri" },
  { code: "lg", label: "Ganda" },
  { code: "nb", label: "Norsk Bokmål" },
  { code: "nn", label: "Norsk Nynorsk" },
  { code: "sk", label: "Slovenčina" },
  { code: "sah", label: "Саха" },
  { code: "pap", label: "Papiamentu" },
  { code: "cv", label: "Чӑвашла" },
  { code: "ba", label: "Башҡортса" },
  { code: "nah", label: "Nāhuatl" },
  { code: "nso", label: "Sepedi" },
  { code: "ocg", label: "Gɔ́ɔnɔ́" },
  { code: "rm", label: "Rumantsch" },
  { code: "rn", label: "Ikirundi" },
  { code: "ss", label: "SiSwati" },
  { code: "ttt", label: "Tati" },
  { code: "ty", label: "Reo Tahiti" },
  { code: "wbp", label: "Warlpiri" },
  { code: "ace", label: "Aceh" },
  { code: "ban", label: "Basa Bali" },
  { code: "bho", label: "भोजपुरी" },
  { code: "bua", label: "Буряад" },
  { code: "ch", label: "Chamoru" },
  { code: "chy", label: "Tsetsêhestâhese" },
  { code: "frr", label: "Frasch" },
  { code: "gag", label: "Gagauz" },
  { code: "inh", label: "Гӏалгӏай" },
  { code: "kbd", label: "Адыгэбзэ" },
  { code: "krc", label: "Къарачай-Малкъар" },
  { code: "lad", label: "Ladino" },
  { code: "lkt", label: "Lakȟólʼiyapi" },
  { code: "mni", label: "ꯃꯤꯇꯩꯂꯣꯟ" },
  { code: "sco", label: "Scots" },
  { code: "tet", label: "Tetun" },
  { code: "vep", label: "Vepsä" },
  { code: "vro", label: "Võro" },
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
                    placeholder="100+ Languages Available"
                    className="h-9"
                  />
                </div>
                <div className="max-h-64 overflow-y-scroll px-1">
                  <DropdownMenuRadioGroup
                    value={activeLanguage.code}
                    onValueChange={(value) => {
                      const language = languageMap.get(value);
                      if (language) {
                        setActiveLanguage(language);
                      }
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
                      placeholder="100+ Languages Available"
                      className="h-9"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-scroll px-1">
                    <DropdownMenuRadioGroup
                      value={activeLanguage.code}
                      onValueChange={(value) => {
                        const language = languageMap.get(value);
                        if (language) {
                          setActiveLanguage(language);
                        }
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
