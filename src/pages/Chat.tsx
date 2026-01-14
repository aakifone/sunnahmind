import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, LogIn, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "@/components/ChatMessage";
import ConversationSidebar from "@/components/ConversationSidebar";
import AccountDropdown from "@/components/AccountDropdown";
import { useToast } from "@/hooks/use-toast";
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

// Slash command imports
import { SlashCommand, ActiveCommand } from "@/types/commands";
import SlashCommandMenu from "@/components/commands/SlashCommandMenu";
import PlusButtonMenu from "@/components/commands/PlusButtonMenu";
import CommandBubble from "@/components/commands/CommandBubble";
import TopicSelector from "@/components/commands/TopicSelector";
import BatchProgressNotification from "@/components/commands/BatchProgressNotification";
import BatchDisplay from "@/components/commands/BatchDisplay";
import ShareImageGenerator from "@/components/commands/ShareImageGenerator";
import { useSlashCommands } from "@/hooks/useSlashCommands";
import { useFavorites } from "@/hooks/useFavorites";

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

interface BatchData {
  hadiths: { collection: string; number: string; text: string; url?: string }[];
  quranVerses: { surah: number; ayah: number; text: string; translation: string }[];
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "السلام عليكم! I'm Sunnah Mind. Ask me any question about Islamic teachings, and I'll provide authentic hadiths and Quran verses with direct citations.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [hasAskedFirstQuestion, setHasAskedFirstQuestion] = useState(false);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  // Batch mode state
  const [batchData, setBatchData] = useState<BatchData>({ hadiths: [], quranVerses: [] });
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [showBatchProgress, setShowBatchProgress] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Current hadith for save/share (from last assistant message)
  const [currentHadith, setCurrentHadith] = useState<{
    arabic?: string;
    english: string;
    reference: string;
  } | null>(null);

  // Has any query been submitted
  const hasQuerySubmitted = messages.length > 1;

  // Slash commands hook
  const {
    isMenuOpen,
    menuSearchQuery,
    selectedIndex,
    activeCommand,
    handleKeyDown,
    selectCommand,
    cancelCommand,
    setActiveCommand,
  } = useSlashCommands({
    input,
    setInput,
    hasQuerySubmitted,
  });

  const handleCancelCommand = useCallback(() => {
    cancelCommand();
    setSelectedTopic(null);
  }, [cancelCommand]);

  // Favorites hook
  const { favorites, saveFavorite, removeFavorite, isFavorite } = useFavorites();

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

  // Extract current hadith from last assistant message
  useEffect(() => {
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant" && m.citations && m.citations.length > 0);
    if (lastAssistantMessage?.citations?.[0]) {
      const citation = lastAssistantMessage.citations[0];
      setCurrentHadith({
        arabic: citation.arabic,
        english: citation.translation || citation.text || lastAssistantMessage.content.slice(0, 200),
        reference: `${citation.collection} #${citation.hadithNumber}`,
      });
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewConversation = async () => {
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: session.user.id,
        title: "New Conversation",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create conversation",
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
        title: "Error",
        description: "Failed to load conversation",
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
        content: "السلام عليكم! I'm Sunnah Mind. Ask me any question about Islamic teachings, and I'll provide authentic hadiths and Quran verses with direct citations.",
        timestamp: new Date(),
      }
    ]);
    setBatchData({ hadiths: [], quranVerses: [] });
    handleCancelCommand();
  };

  // Handle command execution
  const handleCommandExecution = useCallback(async (
    commandId: ActiveCommand,
    options?: { query?: string; topic?: string }
  ) => {
    if (!commandId) return;
    const trimmedQuery = options?.query?.trim() || "";
    const resolvedTopic = options?.topic?.trim() || trimmedQuery;

    switch (commandId) {
      case 'daily':
        // Execute daily hadith
        setIsLoading(true);
        try {
          const focusPrompt = trimmedQuery
            ? ` Focus on: "${trimmedQuery}".`
            : "";
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hadith-chat`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [{
                  role: "user",
                  content: `Give me a beautiful Hadith of the Day for reflection and spiritual growth.${focusPrompt} Choose one that is universally beneficial.`,
                }],
              }),
            }
          );
          const data = await response.json();
          setMessages(prev => [...prev, {
            role: "assistant",
            content: data.content,
            citations: data.citations,
            quranCitations: data.quranCitations,
            timestamp: new Date(),
          }]);
        } catch (error) {
          toast({ title: "Error", description: "Failed to get Hadith of the Day", variant: "destructive" });
        } finally {
          setIsLoading(false);
          handleCancelCommand();
        }
        break;

      case 'topic':
        if (resolvedTopic) {
          setIsLoading(true);
          try {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hadith-chat`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  messages: [{
                    role: "user",
                    content: `Give me 1-3 authentic hadiths about ${resolvedTopic}. Include references from sunnah.com.`,
                  }],
                }),
              }
            );
            const data = await response.json();
            setMessages(prev => [...prev, {
              role: "assistant",
              content: data.content,
              citations: data.citations,
              quranCitations: data.quranCitations,
              timestamp: new Date(),
            }]);
          } catch (error) {
            toast({ title: "Error", description: "Failed to get topic hadiths", variant: "destructive" });
          } finally {
            setIsLoading(false);
            handleCancelCommand();
          }
        } else {
          toast({ title: "Missing topic", description: "Add a topic to search for related hadiths.", variant: "destructive" });
          handleCancelCommand();
        }
        break;

      case 'explain':
        if (currentHadith) {
          setIsLoading(true);
          try {
            const focusPrompt = trimmedQuery
              ? ` The user asked: "${trimmedQuery}". Address this in your explanation.`
              : "";
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hadith-chat`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  messages: [{
                    role: "user",
                    content: `Please provide a simple educational explanation of this hadith: "${currentHadith.english}" (${currentHadith.reference}).${focusPrompt} Use clear, neutral language without any rulings or opinions. End with: "This explanation is for educational purposes only and is not a fatwa."`,
                  }],
                }),
              }
            );
            const data = await response.json();
            setMessages(prev => [...prev, {
              role: "assistant",
              content: data.content,
              citations: data.citations,
              quranCitations: data.quranCitations,
              timestamp: new Date(),
            }]);
          } catch (error) {
            toast({ title: "Error", description: "Failed to get explanation", variant: "destructive" });
          } finally {
            setIsLoading(false);
            handleCancelCommand();
          }
        } else {
          toast({ title: "No Hadith", description: "Ask a question first to get a hadith to explain", variant: "destructive" });
          handleCancelCommand();
        }
        break;

      case 'context':
        if (currentHadith) {
          setIsLoading(true);
          try {
            const focusPrompt = trimmedQuery
              ? ` The user asked: "${trimmedQuery}". Address this in your response.`
              : "";
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hadith-chat`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  messages: [{
                    role: "user",
                    content: `What is the historical or situational background of this hadith: "${currentHadith.english}" (${currentHadith.reference})?${focusPrompt} Explain when or why it was said. If the context is not available, please state that clearly without speculation.`,
                  }],
                }),
              }
            );
            const data = await response.json();
            setMessages(prev => [...prev, {
              role: "assistant",
              content: data.content,
              citations: data.citations,
              quranCitations: data.quranCitations,
              timestamp: new Date(),
            }]);
          } catch (error) {
            toast({ title: "Error", description: "Failed to get context", variant: "destructive" });
          } finally {
            setIsLoading(false);
            handleCancelCommand();
          }
        } else {
          toast({ title: "No Hadith", description: "Ask a question first to get hadith context", variant: "destructive" });
          handleCancelCommand();
        }
        break;

      case 'batch':
        setIsBatchLoading(true);
        setShowBatchProgress(true);
        try {
          const focusPrompt = trimmedQuery
            ? ` Focus on: "${trimmedQuery}".`
            : "";
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hadith-chat`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [{
                  role: "user",
                  content: `Please provide a comprehensive batch of 10-15 diverse authentic hadiths and 10-15 related Quran verses.${focusPrompt} For each hadith, include the collection name and hadith number. Include surah and ayah numbers for each Quran verse.`,
                }],
              }),
            }
          );
          const data = await response.json();
          
          // Parse citations into batch data
          const hadiths = (data.citations || []).map((c: any) => ({
            collection: c.collection || "Sahih",
            number: c.hadithNumber || "1",
            text: c.translation || c.text || "",
            url: c.url,
          }));
          
          const quranVerses = (data.quranCitations || []).map((c: any) => ({
            surah: c.surah || 1,
            ayah: c.ayah || 1,
            text: c.arabic || c.text || "",
            translation: c.translation || "",
          }));

          setBatchData({ hadiths, quranVerses });
          
          // Add a message indicating batch is ready
          setMessages(prev => [...prev, {
            role: "assistant",
            content: "I've prepared a comprehensive batch of authentic hadiths and Quran verses for you. You can browse them below and feel free to ask me any follow-up questions!",
            timestamp: new Date(),
          }]);
          toast({
            title: "Batch ready",
            description: "Your hadith and Quran batch has been generated successfully.",
          });
        } catch (error) {
          toast({ title: "Error", description: "Failed to generate batch", variant: "destructive" });
          setShowBatchProgress(false);
        } finally {
          setIsBatchLoading(false);
          handleCancelCommand();
        }
        break;

      case 'save':
        if (currentHadith) {
          saveFavorite({
            arabic: currentHadith.arabic,
            english: currentHadith.english,
            reference: currentHadith.reference,
          });
          handleCancelCommand();
        } else {
          toast({ title: "No Hadith", description: "No hadith available to save", variant: "destructive" });
          handleCancelCommand();
        }
        break;

      case 'share':
        // Share command keeps bubble open for image generation
        break;
    }
  }, [currentHadith, saveFavorite, toast, handleCancelCommand]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const validation = messageSchema.safeParse({ content: input });
    if (!validation.success) {
      toast({
        title: "Invalid input",
        description: validation.error.errors[0].message,
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

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    if (session?.user && conversationId) {
      await saveMessage(conversationId, userMessage);
    }
    
    setInput("");

    const commandWithQuery = activeCommand && ['daily', 'topic', 'explain', 'context', 'batch'].includes(activeCommand);
    if (commandWithQuery && activeCommand) {
      await handleCommandExecution(activeCommand, { query: input, topic: selectedTopic || undefined });
      return;
    }

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
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Handle slash command navigation first
    if (handleKeyDown(e)) return;

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

  const handleSelectCommand = (command: SlashCommand) => {
    if (command.id === 'save') {
      handleCommandExecution('save');
      return;
    }
    selectCommand(command);
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setInput(topic);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Batch Progress Notification */}
      <BatchProgressNotification
        isActive={showBatchProgress}
        onComplete={() => setShowBatchProgress(false)}
      />

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
              content: `Here's a hadith from your favorites:\n\n"${hadith.english}"\n\n— ${hadith.reference}`,
              timestamp: new Date(),
            }]);
          }}
        />
      )}

      <AlertDialog open={showSignUpDialog} onOpenChange={setShowSignUpDialog}>
        <AlertDialogContent className="paper-texture border-accent/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl gold-text">
              💫 Save Your Conversations
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3 pt-2">
              <p className="text-foreground/90">
                Sign up to unlock the full experience:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>Save and revisit all your conversations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>Access your chat history from any device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>Organize and manage your hadith research</span>
                </li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Without Saving</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate('/auth')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Sign Up Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border/40 bg-card/50 backdrop-blur px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2 hover:bg-accent/10"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Button>
            <h1 className="text-xl font-bold gold-text">Sunnah Mind</h1>
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
                Sign In
              </Button>
            )}
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

            {/* Batch Display */}
            <BatchDisplay
              hadiths={batchData.hadiths}
              quranVerses={batchData.quranVerses}
              isLoading={isBatchLoading}
            />

            {isLoading && !isBatchLoading && (
              <div className="flex justify-start mb-6">
                <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm animate-pulse">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Sparkles className="w-5 h-5 animate-spin text-accent" />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">Searching authentic sources...</span>
                      <span className="text-xs opacity-70">Finding hadiths and Quran verses</span>
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
            {/* Active Command Bubble */}
            {activeCommand && (
              <CommandBubble activeCommand={activeCommand} onCancel={handleCancelCommand}>
                {activeCommand === 'topic' && (
                  <TopicSelector onSelectTopic={handleTopicSelect} />
                )}
                {activeCommand === 'share' && currentHadith && (
                  <ShareImageGenerator
                    arabic={currentHadith.arabic}
                    english={currentHadith.english}
                    reference={currentHadith.reference}
                    onClose={handleCancelCommand}
                  />
                )}
                {activeCommand === 'share' && !currentHadith && (
                  <p className="text-white/80 text-sm">No hadith available to share. Ask a question first!</p>
                )}
              </CommandBubble>
            )}

            <div className="flex gap-2 items-end">
              {/* Plus Button */}
              <PlusButtonMenu
                hasQuerySubmitted={hasQuerySubmitted}
                onSelectCommand={handleSelectCommand}
              />

              <div className="flex-1 relative">
                {/* Slash Command Menu */}
                <SlashCommandMenu
                  isOpen={isMenuOpen}
                  searchQuery={menuSearchQuery}
                  hasQuerySubmitted={hasQuerySubmitted}
                  selectedIndex={selectedIndex}
                  onSelect={handleSelectCommand}
                  onClose={() => setInput("")}
                />

                <Textarea
                  placeholder="Ask about any topic... Type / for commands"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[60px] max-h-[200px] resize-none pr-12 bg-background border-border/50 focus:border-accent transition-colors"
                  disabled={isLoading || isBatchLoading}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isBatchLoading || input.startsWith("/")}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm hover:shadow-gold-glow transition-all duration-300 hover:scale-105"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              Authentic sources from sunnah.com & quran.com • Type <span className="font-mono bg-muted px-1 rounded">/</span> for commands • Not for issuing fatwas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
