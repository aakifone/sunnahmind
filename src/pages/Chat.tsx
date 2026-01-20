import { useState, useRef, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useFavorites } from "@/hooks/useFavorites";
import {
  getStoredHadithEdition,
  listHadithEditions,
  setStoredHadithEdition,
  type HadithEdition,
} from "@/services/hadithApi";
import { fetchRelevantHadith } from "@/services/relevantContent";
import type { HadithCitationData } from "@/types/citations";
import type { QuranCitationData } from "@/components/QuranCitation";

const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message must be less than 2000 characters").trim(),
});

type CitationStatus = "loading" | "ready" | "empty" | "error" | undefined;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  query?: string;
  citations?: HadithCitationData[];
  quranCitations?: QuranCitationData[];
  hadithStatus?: CitationStatus;
  hadithError?: string;
  timestamp: Date;
}

interface ChatMessageRow {
  role: string;
  content: string;
  citations: unknown;
  quran_citations: unknown;
  created_at: string;
}

const createMessageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

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
      id: createMessageId(),
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
  const [hadithEditions, setHadithEditions] = useState<HadithEdition[]>([]);
  const [hadithEdition, setHadithEdition] = useState(getStoredHadithEdition());
  const [editionError, setEditionError] = useState<string | null>(null);

  const { favorites, removeFavorite } = useFavorites();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant" && prev[0].content.startsWith("السلام عليكم!")) {
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

  useEffect(() => {
    const loadEditions = async () => {
      try {
        const hadithData = await listHadithEditions();
        setHadithEditions(hadithData);
        setEditionError(null);
      } catch (error) {
        console.error("Error loading editions:", error);
        setEditionError(t("Failed to load editions list."));
      }
    };

    loadEditions();
  }, [t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    const { error } = await supabase.from("chat_messages").insert({
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

    const loadedMessages: Message[] = (data as ChatMessageRow[]).map((msg) => {
      const hadithCitations = (msg.citations as HadithCitationData[]) || [];
      const quranCitations = (msg.quran_citations as QuranCitationData[]) || [];

      return {
        id: createMessageId(),
        role: msg.role as "user" | "assistant",
        content: msg.content,
        citations: hadithCitations,
        quranCitations,
        hadithStatus: hadithCitations.length > 0 ? "ready" : undefined,
        timestamp: new Date(msg.created_at),
      };
    });

    setMessages(loadedMessages);
    setCurrentConversationId(conversationId);
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([
      {
        id: createMessageId(),
        role: "assistant",
        content: greetingMessage,
        timestamp: new Date(),
      },
    ]);
  };

  const updateMessageById = (messageId: string, updates: Partial<Message>) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)));
  };

  const loadHadithCitations = async (messageId: string, query: string) => {
    updateMessageById(messageId, { hadithStatus: "loading", hadithError: undefined });

    try {
      const citations = await fetchRelevantHadith(query, hadithEdition);
      updateMessageById(messageId, {
        citations,
        hadithStatus: citations.length > 0 ? "ready" : "empty",
      });
      return citations;
    } catch (error) {
      updateMessageById(messageId, {
        hadithStatus: "error",
        hadithError: t("Could not load hadith sources. Please retry."),
      });
      return [];
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const validation = messageSchema.safeParse({ content: input });
    if (!validation.success) {
      toast({
        title: t("Invalid input"),
        description: t(validation.error.errors[0].message),
        variant: "destructive",
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

    const userMessage: Message = {
      id: createMessageId(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    if (session?.user && conversationId) {
      await saveMessage(conversationId, userMessage);
    }

    const queryText = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hadith-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: "user", content: queryText },
          ],
          language: {
            code: language.code,
            label: language.label,
            translateCode: language.translateCode,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from service");
      }

      const data = await response.json();

      const assistantMessageId = createMessageId();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: data.content,
        query: queryText,
        citations: [],
        quranCitations: (data.quranCitations as QuranCitationData[]) || [],
        hadithStatus: "loading",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const hadithCitations = await loadHadithCitations(assistantMessageId, queryText);

      if (session?.user && conversationId) {
        await saveMessage(conversationId, {
          ...assistantMessage,
          citations: hadithCitations,
          quranCitations: assistantMessage.quranCitations,
        });

        if (messages.length === 1) {
          await updateConversationTitle(conversationId, queryText);
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
        id: createMessageId(),
        role: "assistant",
        content: t("I apologize, but I encountered an error processing your request. Please try again."),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const updateConversationTitle = async (conversationId: string, userMessage: string) => {
    const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
    await supabase.from("conversations").update({ title }).eq("id", conversationId);

    setRefreshSidebar((prev) => prev + 1);
  };

  const handleHadithEditionChange = (value: string) => {
    setHadithEdition(value);
    setStoredHadithEdition(value);
  };

  const retryEditions = async () => {
    try {
      const hadithData = await listHadithEditions();
      setHadithEditions(hadithData);
      setEditionError(null);
    } catch (error) {
      console.error("Error loading editions:", error);
      setEditionError(t("Failed to load editions list."));
    }
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
            setMessages((prev) => [
              ...prev,
              {
                id: createMessageId(),
                role: "assistant",
                content: `${t("Here's a hadith from your favorites:")}\n\n"${hadith.english}"\n\n— ${hadith.reference}`,
                timestamp: new Date(),
              },
            ]);
          }}
        />
      )}

      <AlertDialog open={showSignUpDialog} onOpenChange={setShowSignUpDialog}>
        <AlertDialogContent className="paper-texture border-accent/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl gold-text">{t("💫 Save Your Conversations")}</AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3 pt-2">
              <p className="text-foreground/90">{t("Sign up to unlock the full experience:")}</p>
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
            <AlertDialogCancel>{t("Continue Without Saving")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate("/auth")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {t("Sign Up Now")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-border/40 bg-card/50 backdrop-blur px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 hover:bg-accent/10">
              <Home className="w-4 h-4" />
              <span>{t("Home")}</span>
            </Button>
            <h1 className="text-xl font-bold gold-text">Sunnah Mind</h1>
            {session?.user ? (
              <AccountDropdown userEmail={session.user.email || ""} />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
                className="gap-2 border-accent/30 hover:bg-accent/10"
              >
                <LogIn className="w-4 h-4" />
                {t("Sign In")}
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 paper-texture">
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className="animate-fade-in">
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  citations={message.citations}
                  quranCitations={message.quranCitations}
                  hadithStatus={message.hadithStatus}
                  hadithError={message.hadithError}
                  onRetryHadith={
                    message.query ? () => loadHadithCitations(message.id, message.query) : undefined
                  }
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
                      <span className="text-sm font-medium">{t("Searching authentic sources...")}</span>
                      <span className="text-xs opacity-70">{t("Finding hadiths and Quran verses")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-border/40 bg-card/50 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
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

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{t("Hadith edition")}</p>
                <Select value={hadithEdition} onValueChange={handleHadithEditionChange}>
                  <SelectTrigger className="bg-background/70">
                    <SelectValue placeholder={t("Select an edition")} />
                  </SelectTrigger>
                  <SelectContent side="top" position="popper">
                    {hadithEditions.map((edition) => (
                      <SelectItem key={edition.name} value={edition.name}>
                        {edition.englishName || edition.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editionError && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{editionError}</span>
                <Button variant="outline" size="sm" onClick={retryEditions}>
                  {t("Retry")}
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2 text-center">
              {t(
                "Sources from fawazahmed0 hadith-api plus sunnah.com/quran.com citations • Not for issuing fatwas",
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
