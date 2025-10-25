import { ExternalLink, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Citation {
  collection: string;
  hadithNumber: string;
  narrator?: string;
  url: string;
  translation: string;
  arabic?: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp?: Date;
}

const ChatMessage = ({ role, content, citations, timestamp }: ChatMessageProps) => {
  const [expandedCitations, setExpandedCitations] = useState<Record<number, boolean>>({});

  const toggleCitation = (index: number) => {
    setExpandedCitations(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (role === "user") {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[80%] md:max-w-[70%]">
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-5 py-3 shadow-sm">
            <p className="text-sm leading-relaxed">{content}</p>
          </div>
          {timestamp && (
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-[85%] md:max-w-[75%]">
        <div className="bg-gradient-to-br from-card to-card/80 border border-accent/30 rounded-2xl rounded-tl-sm px-6 py-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-sm leading-relaxed mb-4 space-y-3">
            {content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="whitespace-pre-wrap text-foreground/90">{paragraph}</p>
            ))}
          </div>

          {/* Citations Section */}
          {citations && citations.length > 0 && (
            <div className="border-t border-accent/20 pt-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                <BookOpen className="w-5 h-5" />
                {citations.length} Verified Hadith Citation{citations.length > 1 ? 's' : ''}
              </div>

              {citations.map((citation, index) => (
                <div 
                  key={index}
                  className="border border-accent/30 rounded-xl overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5 hover:border-accent/50 transition-all shadow-sm hover:shadow-md"
                >
                  {/* Citation Header */}
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-bold shadow-sm">
                          {citation.collection}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          Hadith #{citation.hadithNumber}
                        </span>
                      </div>
                      {citation.narrator && (
                        <p className="text-xs text-muted-foreground font-medium">
                          📖 Narrated by {citation.narrator}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 hover:bg-accent/20 hover:text-accent transition-all"
                        onClick={() => toggleCitation(index)}
                      >
                        {expandedCitations[index] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 hover:bg-accent/20 hover:text-accent transition-all"
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
                  </div>

                  {/* Expanded Citation Content */}
                  {expandedCitations[index] && (
                    <div className="px-4 pb-4 pt-0 border-t border-accent/20 bg-background/60 animate-in slide-in-from-top-2">
                      <div className="space-y-4 pt-4">
                        {citation.arabic && (
                          <div className="text-right font-arabic text-lg leading-loose text-foreground p-4 bg-gradient-to-br from-card to-card/50 rounded-xl border border-border/40 shadow-sm">
                            {citation.arabic}
                          </div>
                        )}
                        <div className="text-[15px] leading-relaxed text-foreground/90 p-4 bg-gradient-to-br from-background to-background/50 rounded-xl border border-border/40 shadow-sm">
                          <p className="text-xs text-muted-foreground mb-2 font-semibold">English Translation:</p>
                          <p className="italic">"{citation.translation}"</p>
                        </div>
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors font-semibold bg-accent/10 px-4 py-2 rounded-lg hover:bg-accent/20"
                        >
                          View full hadith on sunnah.com
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Context/Notes */}
          <div className="mt-5 pt-4 border-t border-accent/20">
            <p className="text-xs text-foreground/70 leading-relaxed bg-accent/5 p-3 rounded-lg">
              💡 <span className="font-semibold text-accent">Important:</span> These authentic hadiths are sourced from sunnah.com. For personal religious rulings (fatwas), please consult qualified Islamic scholars.
            </p>
          </div>
        </div>

        {timestamp && (
          <p className="text-xs text-muted-foreground mt-2">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
