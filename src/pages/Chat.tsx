import { useState, useRef, useEffect, useCallback } from "react";
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
import { QuranCitationData } from "@/components/QuranCitation";
import type { Json } from "@/integrations/supabase/types";
import type { Citation } from "@/types/citations";
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
  citations?: Citation[];
  quranCitations?: QuranCitationData[];
  timestamp: Date;
  requestId?: number;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { t } = useTranslate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const bismillahMessage = "بِسْــــــــــــــــــمِ اﷲِالرَّحْمَنِ اارَّحِيم";
  const greetingMessage = `${bismillahMessage}\n\n\n\n${t(
    "I'm Sunnah Mind. Ask me any question about Islamic teachings, and I'll provide authentic hadiths and Quran verses with direct citations.",
  )} إِنْ شَاءَ ٱللَّٰهُ`;
  const buildInitialMessages = useCallback(
    (includeBismillahIntro: boolean) => {
      const greeting: Message = {
        role: "assistant",
        content: greetingMessage,
        timestamp: new Date(),
      };
      if (!includeBismillahIntro) {
        return [greeting];
      }
      return [
        {
          role: "assistant",
          content: bismillahMessage,
          timestamp: new Date(),
        },
        greeting,
      ];
    },
    [bismillahMessage, greetingMessage],
  );
  const [messages, setMessages] = useState<Message[]>(() => buildInitialMessages(false));
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [hasAskedFirstQuestion, setHasAskedFirstQuestion] = useState(false);
  const [refreshSidebar, setRefreshSidebar] = useState(0);
  const ALL_EDITIONS_VALUE = "all";
  const allEditionsLabel = t("All editions");
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
  const [hadithStatus, setHadithStatus] = useState<"idle" | "loading" | "error" | "success">(
    "idle",
  );
  const [hadithError, setHadithError] = useState<string | null>(null);
  const [hadithQuery, setHadithQuery] = useState("");
  const requestIdRef = useRef(0);
  const pendingHadithCitations = useRef(new Map<number, Citation[]>());

  // Favorites hook
  const { favorites, removeFavorite } = useFavorites();

  const getEditionLabel = useCallback(
    (editionName: string) => {
      const selected = editionOptions.find((edition) => edition.name === editionName);
      if (!selected) return editionName;
      return selected.collection ?? selected.name;
    },
    [editionOptions],
  );

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
        const allEditionsOption: HadithEditionSummary = {
          name: ALL_EDITIONS_VALUE,
          collection: allEditionsLabel,
        };
        const options = [allEditionsOption, ...sorted];
        setEditionOptions(options);
        setEditionStatus("idle");

        if (!options.some((edition) => edition.name === selectedEdition)) {
          setSelectedEdition(sorted[0]?.name ?? defaultHadithEdition);
        }
      } catch (error) {
        console.error("Failed to load hadith editions:", error);
        setEditionStatus("error");
        setEditionError(t("Unable to load editions. Please retry."));
      }
    };

    loadEditions();
  }, [allEditionsLabel, t]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hadith-selected-edition", selectedEdition);
    }
  }, [selectedEdition]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant" && prev[0].content.includes(bismillahMessage)) {
        return [
          {
            ...prev[0],
            content: greetingMessage,
          },
        ];
      }
      return prev;
    });
  }, [bismillahMessage, greetingMessage]);

  useEffect(() => {
    if (!session?.user) return;
    setMessages((prev) => {
      if (
        prev.length === 1 &&
        prev[0].role === "assistant" &&
        prev[0].content === greetingMessage
      ) {
        return buildInitialMessages(true);
      }
      return prev;
    });
  }, [buildInitialMessages, greetingMessage, session?.user]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const mergeHadithCitations = useCallback((requestId: number, citations: Citation[]) => {
    if (citations.length === 0) return;

    setMessages((prev) =>
      prev.map((message) => {
        if (message.requestId !== requestId || message.role !== "assistant") {
          return message;
        }
        const existing = message.citations ?? [];
        return {
          ...message,
          citations: [...existing, ...citations],
        };
      }),
    );
  }, []);

  const runHadithSearch = useCallback(
    async (query: string, requestId: number) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        setHadithStatus("idle");
        setHadithResults([]);
        return;
      }

      setHadithStatus("loading");
      setHadithError(null);

      const maxResults = 8;
      const sampleCount = 24;
      const runEditionSearch = async (editionName: string, limit: number) =>
        fetchRelevantHadith(trimmedQuery, editionName, sampleCount, limit);

      const runAllEditionsSearch = async () => {
        const editionNames = editionOptions
          .filter((edition) => edition.name !== ALL_EDITIONS_VALUE)
          .map((edition) => edition.name);
        if (editionNames.length === 0) return [];

        const batchSize = 3;
        const aggregated: HadithSearchResult[] = [];

        for (let i = 0; i < editionNames.length && aggregated.length < maxResults; i += batchSize) {
          const batch = editionNames.slice(i, i + batchSize);
          const remaining = maxResults - aggregated.length;
          const batchResults = await Promise.all(
            batch.map((editionName) => runEditionSearch(editionName, remaining)),
          );
          for (const results of batchResults) {
            aggregated.push(...results);
            if (aggregated.length >= maxResults) break;
          }
        }

        return aggregated.slice(0, maxResults);
      };

      try {
        const results =
          selectedEdition === ALL_EDITIONS_VALUE
            ? await runAllEditionsSearch()
            : await runEditionSearch(selectedEdition, maxResults);
        if (results.length === 0) {
          setHadithStatus("idle");
          setHadithResults([]);
          return;
        }

        setHadithStatus("success");
        setHadithResults(results);

        const citations = results.map((hadith) => ({
          collection: getEditionLabel(hadith.editionName),
          hadithNumber: hadith.hadithNumber ?? t("N/A"),
          url: hadith.sunnahUrl ?? hadith.sourceUrl,
          translation: hadith.text,
          arabic: hadith.arabic,
          sourceUrl: hadith.sourceUrl,
        }));

        if (citations.length > 0) {
          pendingHadithCitations.current.set(requestId, citations);
          mergeHadithCitations(requestId, citations);
        }
      } catch (error) {
        console.error("Failed to fetch relevant hadith:", error);
        setHadithStatus("error");
        setHadithResults([]);
        setHadithError(t("Unable to fetch hadiths. Please try again."));
      }
    },
    [ALL_EDITIONS_VALUE, editionOptions, getEditionLabel, mergeHadithCitations, selectedEdition, t],
  );

  useEffect(() => {
    if (hadithQuery) {
      runHadithSearch(hadithQuery, requestIdRef.current);
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
      // PostgREST typings in this project expect an array payload.
      .insert([
        {
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          citations: (message.citations ?? null) as unknown as Json | null,
          quran_citations: (message.quranCitations ?? null) as unknown as Json | null,
        },
      ]);

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

    const loadedMessages: Message[] = data.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
      citations: (Array.isArray(msg.citations)
        ? (msg.citations as unknown as Citation[])
        : undefined),
      quranCitations: (Array.isArray(msg.quran_citations)
        ? (msg.quran_citations as unknown as QuranCitationData[])
        : undefined),
      timestamp: new Date(msg.created_at),
    }));

    setMessages(loadedMessages);
    setCurrentConversationId(conversationId);
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages(buildInitialMessages(Boolean(session?.user)));
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
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
      requestId,
    };

    setMessages(prev => [...prev, userMessage]);

    setHadithQuery(trimmedQuery);
    void runHadithSearch(trimmedQuery, requestId);
    
    if (session?.user && conversationId) {
      await saveMessage(conversationId, userMessage);
    }
    
    setInput("");
    setIsLoading(true);

    try {
      const hadithChatEndpoint = import.meta.env.VITE_HADITH_API_URL;
      if (!hadithChatEndpoint) {
        throw new Error("VITE_HADITH_API_URL is not configured");
      }

      const response = await fetch(
        hadithChatEndpoint,
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
        requestId,
      };

      setMessages(prev => {
        const pendingCitations = pendingHadithCitations.current.get(requestId) ?? [];
        if (pendingCitations.length === 0) {
          return [...prev, assistantMessage];
        }
        pendingHadithCitations.current.delete(requestId);
        return [
          ...prev,
          {
            ...assistantMessage,
            citations: [...(assistantMessage.citations ?? []), ...pendingCitations],
          },
        ];
      });
      
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
                <Select
                  value={selectedEdition}
                  onValueChange={setSelectedEdition}
                  disabled={editionStatus === "loading" || editionStatus === "error"}
                >
                  <SelectTrigger className="h-9 w-[360px] text-base">
                    <SelectValue placeholder={t("Select edition")} />
                  </SelectTrigger>
                  <SelectContent>
                    {editionOptions.map((edition) => (
                      <SelectItem
                        key={edition.name}
                        value={edition.name}
                        className="pl-3 text-base data-[state=checked]:bg-[#8b6a2b] data-[state=checked]:text-white [&>span:first-child]:hidden"
                      >
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
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground text-center">
                {t(
                  "Authentic sources from sunnah.com & quran.com • Not for issuing fatwas",
                )}
              </p>
            </div>
            {hadithStatus !== "idle" && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {hadithStatus === "loading" && (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border border-accent border-t-transparent" />
                      <span>{t("Fetching hadith citations...")}</span>
                    </>
                  )}
                  {hadithStatus === "success" && hadithResults.length > 0 && (
                    <span>
                      {t("Added")} {hadithResults.length} {t("hadith citations")}
                    </span>
                  )}
                  {hadithStatus === "error" && (
                    <span className="text-destructive">
                      {hadithError ?? t("Unable to fetch hadiths.")}
                    </span>
                  )}
                </div>
                {hadithStatus === "error" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runHadithSearch(hadithQuery, requestIdRef.current)}
                  >
                    {t("Retry")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
