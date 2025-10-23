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
      <div className="max-w-[80%] md:max-w-[70%]">
        <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
          <div className="text-sm leading-relaxed mb-4 space-y-3">
            {content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="whitespace-pre-wrap">{paragraph}</p>
            ))}
          </div>

          {/* Citations Section */}
          {citations && citations.length > 0 && (
            <div className="border-t border-border/30 pt-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide">
                <BookOpen className="w-4 h-4" />
                Sunnah Sources
              </div>

              {citations.map((citation, index) => (
                <div 
                  key={index}
                  className="border border-accent/20 rounded-lg overflow-hidden bg-accent/5"
                >
                  {/* Citation Header */}
                  <div className="p-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium">
                          {citation.collection}
                        </span>
                        <span className="text-xs font-semibold">
                          Hadith {citation.hadithNumber}
                        </span>
                      </div>
                      {citation.narrator && (
                        <p className="text-xs text-muted-foreground">
                          Narrated by {citation.narrator}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 hover:bg-accent/10"
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
                        className="h-8 px-2 hover:bg-accent/10"
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
                    <div className="px-3 pb-3 pt-0 border-t border-accent/10 bg-background/50">
                      <div className="space-y-3 pt-3">
                        {citation.arabic && (
                          <div className="text-right font-arabic text-base leading-loose text-foreground/90 p-3 bg-card rounded-md">
                            {citation.arabic}
                          </div>
                        )}
                        <div className="text-sm leading-relaxed text-muted-foreground italic">
                          "{citation.translation}"
                        </div>
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors font-medium"
                        >
                          View full hadith on sunnah.com
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Context/Notes */}
          <div className="mt-4 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground italic">
              💡 These citations are from sunnah.com. For religious rulings, please consult qualified scholars.
            </p>
          </div>
        </div>

        {timestamp && (
          <p className="text-xs text-muted-foreground mt-1">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
