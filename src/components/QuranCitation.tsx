import { useState, useRef } from "react";
import { ExternalLink, BookOpen, ChevronDown, Play, Pause, Volume2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslate } from "@/hooks/useTranslate";

export interface QuranCitationData {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahName?: string;
  arabicText: string;
  translation: string;
  url: string;
}

interface WordData {
  id: number;
  position: number;
  arabic: string;
  translation: string;
  transliteration: string;
}

interface QuranCitationProps {
  citation: QuranCitationData;
}

const RECITERS = [
  { id: "mishary", name: "Mishary Rashid Al Afasy" },
  { id: "shuraim", name: "Abdurrahman Al Sudais" },
  { id: "minshawi", name: "Mohamed Al-Minshawi" },
  { id: "husary", name: "Mahmoud Al-Husary" },
  { id: "abdulbasit", name: "Abdul Basit" },
];

const QuranCitation = ({ citation }: QuranCitationProps) => {
  const [viewMode, setViewMode] = useState<"translation" | "tafsir">("translation");
  const [tafsirContent, setTafsirContent] = useState<string | null>(null);
  const [translationContent, setTranslationContent] = useState<string>(citation.translation);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { t } = useTranslate();
  
  // Word-by-word state
  const [showWordByWord, setShowWordByWord] = useState(false);
  const [wordByWordData, setWordByWordData] = useState<WordData[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(false);

  const fetchTafsir = async () => {
    if (tafsirContent) return;
    
    setIsLoadingContent(true);
    try {
      const { data, error } = await supabase.functions.invoke("quran-fetch", {
        body: {
          surahNumber: citation.surahNumber,
          ayahNumber: citation.ayahNumber,
          type: "tafsir",
        },
      });

      if (error) throw error;
      setTafsirContent(
        data.tafsir || t("Tafsir not available for this verse."),
      );
    } catch (err) {
      console.error("Error fetching tafsir:", err);
      toast({
        title: t("Error"),
        description: t("Failed to load tafsir. Please try again."),
        variant: "destructive",
      });
      setTafsirContent(t("Failed to load tafsir. Please try again."));
    } finally {
      setIsLoadingContent(false);
    }
  };

  const fetchWordByWord = async () => {
    if (wordByWordData.length > 0) return; // Already fetched
    
    setIsLoadingWords(true);
    try {
      const { data, error } = await supabase.functions.invoke("quran-fetch", {
        body: {
          surahNumber: citation.surahNumber,
          ayahNumber: citation.ayahNumber,
          type: "wordbyword",
        },
      });

      if (error) throw error;
      setWordByWordData(data.words || []);
    } catch (err) {
      console.error("Error fetching word-by-word:", err);
      toast({
        title: t("Error"),
        description: t("Failed to load word-by-word data. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoadingWords(false);
    }
  };

  const toggleWordByWord = async () => {
    if (!showWordByWord) {
      await fetchWordByWord();
    }
    setShowWordByWord(!showWordByWord);
  };

  const handleViewChange = async (mode: "translation" | "tafsir") => {
    setViewMode(mode);
    if (mode === "tafsir") {
      await fetchTafsir();
    }
  };

  const playAudio = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      const { data, error } = await supabase.functions.invoke("quran-fetch", {
        body: {
          surahNumber: citation.surahNumber,
          ayahNumber: citation.ayahNumber,
          type: "audio",
          reciterId: selectedReciter.id,
        },
      });

      if (error) throw error;

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        toast({
          title: t("Error"),
          description: t("Failed to play audio. Please try again."),
          variant: "destructive",
        });
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Error playing audio:", err);
      toast({
        title: t("Error"),
        description: t("Failed to load audio. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleReciterChange = (reciter: typeof RECITERS[0]) => {
    setSelectedReciter(reciter);
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="border border-emerald-500/30 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md">
      {/* Citation Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-sm">
              {t("Quran")}
            </span>
            <span className="text-xs font-bold text-foreground">
              {citation.surahName} ({citation.surahNumber}:{citation.ayahNumber})
            </span>
            {citation.ayahName && (
              <span className="text-xs text-muted-foreground italic">
                — {citation.ayahName}
              </span>
            )}
          </div>
          
          {/* Arabic Text - Toggle between regular and word-by-word view */}
          {showWordByWord && wordByWordData.length > 0 ? (
            <TooltipProvider delayDuration={100}>
              <div 
                className="text-lg text-foreground font-arabic leading-[2.5] text-right mb-3 bg-background/30 p-3 rounded-lg flex flex-wrap justify-end gap-x-3 gap-y-1" 
                dir="rtl"
              >
                {wordByWordData.map((word) => (
                  <Tooltip key={word.id}>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer hover:bg-emerald-500/20 hover:text-emerald-600 px-1 py-0.5 rounded transition-colors inline-block">
                        {word.arabic}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="bg-popover border border-emerald-500/30 text-foreground px-3 py-2 max-w-[200px] z-50"
                    >
                      <div className="text-center space-y-1">
                        <p className="text-xs text-muted-foreground italic">{word.transliteration}</p>
                        <p className="text-sm font-medium text-emerald-600">{word.translation}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          ) : (
            <p className="text-lg text-foreground font-arabic leading-loose text-right mb-3 bg-background/30 p-3 rounded-lg" dir="rtl">
              {citation.arabicText}
            </p>
          )}
          
          {/* Word-by-Word Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleWordByWord}
            disabled={isLoadingWords}
            className="h-7 gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 mb-2"
          >
            {isLoadingWords ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-500"></div>
            ) : (
              <Languages className="w-3.5 h-3.5" />
            )}
            {showWordByWord
              ? t("Hide Word-by-Word")
              : t("Word-by-Word Translation")}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all duration-200 hover:scale-110"
          asChild
        >
          <a 
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>

      {/* Translation/Tafsir Toggle and Content */}
      <div className="px-4 pb-4">
        {/* View Toggle Dropdown */}
        <div className="flex items-center gap-2 mb-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-xs bg-background/50">
                <BookOpen className="w-3 h-3" />
                {viewMode === "translation" ? t("Translation") : t("Tafsir")}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-popover border border-border z-50">
              <DropdownMenuItem 
                onClick={() => handleViewChange("translation")}
                className={viewMode === "translation" ? "bg-accent" : ""}
              >
                {t("Translation")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleViewChange("tafsir")}
                className={viewMode === "tafsir" ? "bg-accent" : ""}
              >
                {t("Tafsir (Ibn Kathir)")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content Area */}
        <div className="bg-background/30 p-3 rounded-lg text-sm text-foreground/90 leading-relaxed max-h-48 overflow-y-auto">
          {isLoadingContent ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
            </div>
          ) : viewMode === "translation" ? (
            <p>{translationContent}</p>
          ) : (
            <p>{tafsirContent || t("Loading tafsir...")}</p>
          )}
        </div>
      </div>

      {/* Audio Controls */}
      <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
        {/* Play Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={playAudio}
          disabled={isLoadingAudio}
          className="h-8 gap-2 text-xs bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50"
        >
          {isLoadingAudio ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-500"></div>
          ) : isPlaying ? (
            <Pause className="w-3 h-3" />
          ) : (
            <Play className="w-3 h-3" />
          )}
          {isPlaying ? t("Pause") : t("Listen to Ayah")}
        </Button>

        {/* Reciter Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs bg-background/50 max-w-[180px]">
              <Volume2 className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{selectedReciter.name}</span>
              <ChevronDown className="w-3 h-3 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover border border-border z-50">
            {RECITERS.map((reciter) => (
              <DropdownMenuItem
                key={reciter.id}
                onClick={() => handleReciterChange(reciter)}
                className={selectedReciter.id === reciter.id ? "bg-accent" : ""}
              >
                {reciter.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default QuranCitation;
