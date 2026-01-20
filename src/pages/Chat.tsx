import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, LogIn, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "@/components/ChatMessage";
import ConversationSidebar from "@/components/ConversationSidebar";
import AccountDropdown from "@/components/AccountDropdown";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslate } from "@/hooks/useTranslate";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { z } from 'zod';
import { useFavorites } from "@/hooks/useFavorites";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultHadithEdition } from "@/services/contentDefaults";
import {
  fetchRelevantHadith,
  HadithEditionSummary,
  HadithSearchResult,
  listHadithEditions,
} from "@/services/hadithApi";

const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be less than 2000 characters')
    .trim()
});

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: any[];
  quranCitations?: any[];
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { t } = useTranslate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const greetingMessage = `السلام عليكم! ${t(
    "I'm Sunnah Mind. Ask me any question about Islamic teachings, and I'll provide authentic hadiths and Quran verses with direct citations.",
  )}`;
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: greetingMessage,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [hasAskedFirstQuestion, setHasAskedFirstQuestion] = useState(false);
  const [refreshSidebar, setRefreshSidebar] = useState(0);
  const [editionOptions, setEditionOptions] = useState<HadithEditionSummary[]>([]);
  const [editionStatus, setEditionStatus] = useState<"idle" | "loading" | "error">("idle");
  const [editionError, setEditionError] = useState<string | null>(null);
  const [selectedEdition, setSelectedEdition] = useState(() => {
    if (typeof window === "undefined") {
      return defaultHadithEdition;
    }
    return window.localStorage.getItem("hadith-selected-edition") || defaultHadithEdition;
  });
  const [hadithResults, setHadithResults] = useState<HadithSearchResult[]>([]);
  const [hadithStatus, setHadithStatus] = useState<
    "idle" | "loading" | "error" | "empty" | "success"
  >("idle");
  const [hadithError, setHadithError] = useState<string | null>(null);
  const [hadithQuery, setHadithQuery] = useState("");

  // Favorites hook
  const { favorites, removeFavorite } = useFavorites();

  const selectedEditionLabel = useMemo(() => {
    const selected = editionOptions.find((edition) => edition.name === selectedEdition);
    if (!selected) return selectedEdition;
    const collectionLabel = selected.collection ?? selected.name;
    return selected.language ? `${collectionLabel} (${selected.language})` : collectionLabel;
  }, [editionOptions, selectedEdition]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadEditions = async () => {
      setEditionStatus("loading");
      setEditionError(null);
      try {
        const editions = await listHadithEditions();
        const sorted = [...editions].sort((a, b) =>
          (a.collection ?? a.name).localeCompare(b.collection ?? b.name),
        );
        setEditionOptions(sorted);
        setEditionStatus("idle");

        if (!sorted.some((edition) => edition.name === selectedEdition)) {
          setSelectedEdition(sorted[0]?.name ?? defaultHadithEdition);
        }
      } catch (error) {
        console.error("Failed to load hadith editions:", error);
        setEditionStatus("error");
        setEditionError(t("Unable to load editions. Please retry."));
      }
    };

    loadEditions();
  }, [t]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hadith-selected-edition", selectedEdition);
    }
  }, [selectedEdition]);

  useEffect(() => {
    setMessages((prev) => {
      if (
        prev.length === 1 &&
        prev[0].role === "assistant" &&
        prev[0].content.startsWith("السلام عليكم!")
      ) {
        return [
          {
            ...prev[0],
            content: greetingMessage,
          },
        ];
      }
      return prev;
    });
  }, [greetingMessage]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const runHadithSearch = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        setHadithStatus("idle");
        setHadithResults([]);
        return;
      }

      setHadithStatus("loading");
      setHadithError(null);

      try {
        const results = await fetchRelevantHadith(trimmedQuery, selectedEdition);
        if (results.length === 0) {
          setHadithStatus("empty");
          setHadithResults([]);
        } else {
          setHadithStatus("success");
          setHadithResults(results);
        }
      } catch (error) {
        console.error("Failed to fetch relevant hadith:", error);
        setHadithStatus("error");
        setHadithResults([]);
        setHadithError(t("Unable to fetch hadiths. Please try again."));
      }
    },
    [selectedEdition, t],
  );

  useEffect(() => {
    if (hadithQuery) {
      runHadithSearch(hadithQuery);
    }
  }, [runHadithSearch, selectedEdition]);

  const createNewConversation = async () => {
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: session.user.id,
        title: t("New Conversation"),
      })
      .select()
      .single();

    if (error) {
      toast({
        title: t("Error"),
        description: t("Failed to create conversation"),
        variant: "destructive",
      });
      return null;
    }

    return data.id;
  };

  const saveMessage = async (conversationId: string, message: Message) => {
    const { error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        citations: message.citations || null,
        quran_citations: message.quranCitations || null,
      });

    if (error) {
      console.error("Error saving message:", error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: t("Error"),
        description: t("Failed to load conversation"),
        variant: "destructive",
      });
      return;
    }

    const loadedMessages: Message[] = data.map((msg: any) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
      citations: msg.citations as any[],
      quranCitations: msg.quran_citations as any[],
      timestamp: new Date(msg.created_at),
    }));

    setMessages(loadedMessages);
    setCurrentConversationId(conversationId);
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([
      {
        role: "assistant",
        content: greetingMessage,
        timestamp: new Date(),
      }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const validation = messageSchema.safeParse({ content: input });
    if (!validation.success) {
      toast({
        title: t("Invalid input"),
        description: t(validation.error.errors[0].message),
        variant: "destructive"
      });
      return;
    }

    if (!session?.user && !hasAskedFirstQuestion) {
      setHasAskedFirstQuestion(true);
      setShowSignUpDialog(true);
    }

    let conversationId = currentConversationId;

    if (session?.user && !conversationId) {
      conversationId = await createNewConversation();
      if (!conversationId) return;
      setCurrentConversationId(conversationId);
    }

    const trimmedQuery = input.trim();

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    setHadithQuery(trimmedQuery);
    void runHadithSearch(trimmedQuery);
    
    if (session?.user && conversationId) {
      await saveMessage(conversationId, userMessage);
    }
    
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hadith-chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              { role: "user", content: input }
            ],
            language: {
              code: language.code,
              label: language.label,
              translateCode: language.translateCode,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response from service');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
        citations: data.citations || [],
        quranCitations: data.quranCitations || [],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (session?.user && conversationId) {
        await saveMessage(conversationId, assistantMessage);

        if (messages.length === 1) {
          await updateConversationTitle(conversationId, input);
        }
      }
    } catch (error) {
      console.error("Error calling hadith-chat:", error);
      
      toast({
        title: t("Error"),
        description: t("Failed to get response. Please try again."),
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        role: "assistant",
        content: t(
          "I apologize, but I encountered an error processing your request. Please try again.",
        ),
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const updateConversationTitle = async (conversationId: string, userMessage: string) => {
    const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
    await supabase
      .from("conversations")
      .update({ title })
      .eq("id", conversationId);
    
    setRefreshSidebar(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-background">
      {session?.user && (
        <ConversationSidebar
          currentConversationId={currentConversationId}
          onSelectConversation={loadConversation}
          onNewConversation={handleNewConversation}
          userId={session.user.id}
          refreshTrigger={refreshSidebar}
          favorites={favorites}
          onRemoveFavorite={removeFavorite}
          onSelectFavorite={(hadith) => {
            setMessages(prev => [...prev, {
              role: "assistant",
              content: `${t(
                "Here's a hadith from your favorites:",
              )}\n\n"${hadith.english}"\n\n— ${hadith.reference}`,
              timestamp: new Date(),
            }]);
          }}
        />
      )}

      <AlertDialog open={showSignUpDialog} onOpenChange={setShowSignUpDialog}>
        <AlertDialogContent className="paper-texture border-accent/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl gold-text">
              {t("💫 Save Your Conversations")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3 pt-2">
              <p className="text-foreground/90">
                {t("Sign up to unlock the full experience:")}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>{t("Save and revisit all your conversations")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>{t("Access your chat history from any device")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>{t("Organize and manage your hadith research")}</span>
                </li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("Continue Without Saving")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate('/auth')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {t("Sign Up Now")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border/40 bg-card/50 backdrop-blur px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2 hover:bg-accent/10"
            >
              <Home className="w-4 h-4" />
              <span>{t("Home")}</span>
            </Button>
            <h1 className="text-xl font-bold gold-text">Sunnah Mind</h1>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {t("Hadith Edition")}
                </span>
                <Select
                  value={selectedEdition}
                  onValueChange={setSelectedEdition}
                  disabled={editionStatus === "loading" || editionStatus === "error"}
                >
                  <SelectTrigger className="h-8 w-[200px] text-xs">
                    <SelectValue placeholder={t("Select edition")} />
                  </SelectTrigger>
                  <SelectContent>
                    {editionOptions.map((edition) => (
                      <SelectItem key={edition.name} value={edition.name}>
                        {edition.collection ?? edition.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editionStatus === "loading" && (
                  <span className="text-[10px] text-muted-foreground">
                    {t("Loading editions...")}
                  </span>
                )}
                {editionStatus === "error" && (
                  <span className="text-[10px] text-destructive">{editionError}</span>
                )}
              </div>
              {session?.user ? (
                <AccountDropdown userEmail={session.user.email || ""} />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="gap-2 border-accent/30 hover:bg-accent/10"
                >
                  <LogIn className="w-4 h-4" />
                  {t("Sign In")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 paper-texture">
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  citations={message.citations}
                  quranCitations={message.quranCitations}
                  timestamp={message.timestamp}
                />
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm animate-pulse">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Sparkles className="w-5 h-5 animate-spin text-accent" />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        {t("Searching authentic sources...")}
                      </span>
                      <span className="text-xs opacity-70">
                        {t("Finding hadiths and Quran verses")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hadithStatus !== "idle" && (
              <div className="mt-6 rounded-2xl border border-accent/20 bg-card/60 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t("Relevant Hadiths")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("Edition")}: {selectedEditionLabel}
                    </p>
                  </div>
                  {hadithQuery && (
                    <span className="text-xs text-muted-foreground">
                      {t("Query")}: “{hadithQuery}”
                    </span>
                  )}
                </div>

                {hadithStatus === "loading" && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    <span className="text-sm">
                      {t("Searching the latest sources...")}
                    </span>
                  </div>
                )}

                {hadithStatus === "error" && (
                  <div className="space-y-3">
                    <p className="text-sm text-destructive">
                      {hadithError ?? t("Something went wrong.")}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runHadithSearch(hadithQuery)}
                    >
                      {t("Retry")}
                    </Button>
                  </div>
                )}

                {hadithStatus === "empty" && (
                  <p className="text-sm text-muted-foreground">
                    {t("No matches found in the sampled hadiths. Try another edition or refine your query.")}
                  </p>
                )}

                {hadithStatus === "success" && (
                  <div className="space-y-4">
                    {hadithResults.map((hadith, index) => (
                      <div
                        key={`${hadith.editionName}-${hadith.hadithNumber ?? index}`}
                        className="rounded-xl border border-accent/20 bg-background/70 p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full bg-accent/10 px-2 py-1 font-semibold text-accent">
                              {hadith.editionName}
                            </span>
                            {hadith.hadithNumber && (
                              <span className="rounded-full bg-muted px-2 py-1 text-foreground">
                                {t("Hadith")} #{hadith.hadithNumber}
                              </span>
                            )}
                            {hadith.section && (
                              <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
                                {t("Section")}: {hadith.section}
                              </span>
                            )}
                            {hadith.book && (
                              <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
                                {t("Book")}: {hadith.book}
                              </span>
                            )}
                          </div>
                          <a
                            href={hadith.sunnahUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-accent hover:text-accent/80"
                          >
                            {t("View on Sunnah.com")}
                          </a>
                        </div>
                        {hadith.text ? (
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {hadith.text}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {t("No text available for this hadith.")}
                          </p>
                        )}
                        {hadith.arabic && (
                          <p className="mt-3 text-right text-lg leading-loose font-arabic" dir="rtl">
                            {hadith.arabic}
                          </p>
                        )}
                        <p className="mt-3 text-xs text-muted-foreground">
                          {t("Source endpoint")}: {hadith.sourceUrl}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border/40 bg-card/50 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Textarea
                  placeholder={t("Ask about any topic...")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[60px] max-h-[200px] resize-none pr-12 bg-background border-border/50 focus:border-accent transition-colors"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm hover:shadow-gold-glow transition-all duration-300 hover:scale-105"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              {t(
                "Authentic sources from sunnah.com & quran.com • Not for issuing fatwas",
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
