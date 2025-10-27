import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, LogOut, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "@/components/ChatMessage";
import ConversationSidebar from "@/components/ConversationSidebar";
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

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: any[];
  timestamp: Date;
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
      content: "السلام عليكم! I'm your Hadith Assistant. Ask me any question about the Prophet's ﷺ teachings, and I'll provide authentic hadiths with direct citations.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [hasAskedFirstQuestion, setHasAskedFirstQuestion] = useState(false);

  useEffect(() => {
    // Check authentication (but don't redirect, allow anonymous usage)
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

    const loadedMessages: Message[] = data.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
      citations: msg.citations as any[],
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
        content: "السلام عليكم! I'm your Hadith Assistant. Ask me any question about the Prophet's ﷺ teachings, and I'll provide authentic hadiths with direct citations.",
        timestamp: new Date(),
      }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Show sign up dialog after first question for anonymous users
    if (!session?.user && !hasAskedFirstQuestion) {
      setHasAskedFirstQuestion(true);
      setShowSignUpDialog(true);
    }

    let conversationId = currentConversationId;

    // Create new conversation if user is logged in and none exists
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
    
    // Only save message if user is logged in
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
          headers: {
            "Content-Type": "application/json",
          },
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
        citations: data.citations || [],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Only save message and update title if user is logged in
      if (session?.user && conversationId) {
        await saveMessage(conversationId, assistantMessage);

        // Update conversation title with first user message
        if (messages.length === 1) {
          const title = input.slice(0, 50) + (input.length > 50 ? "..." : "");
          await supabase
            .from("conversations")
            .update({ title })
            .eq("id", conversationId);
        }
      }
    } catch (error) {
      console.error("Error calling hadith-chat:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        role: "assistant",
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Only show sidebar if user is logged in */}
      {session?.user && (
        <ConversationSidebar
          currentConversationId={currentConversationId}
          onSelectConversation={loadConversation}
          onNewConversation={handleNewConversation}
          userId={session.user.id}
        />
      )}

      {/* Sign Up Dialog */}
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
            <h1 className="text-xl font-bold gold-text">Hadith Assistant</h1>
            {session?.user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
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
                      <span className="text-sm font-medium">Searching authentic hadiths...</span>
                      <span className="text-xs opacity-70">Finding relevant citations</span>
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
                  placeholder="Ask about any topic... (e.g., 'What did the Prophet ﷺ say about charity?')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
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
              Authentic hadiths from sunnah.com • Not for issuing fatwas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;