import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "@/components/ChatMessage";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: any[];
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "السلام عليكم! I'm your Hadith Assistant. I search sunnah.com in real-time to find authentic hadiths that answer your questions. Each response includes 1-4 verified citations with direct links. What would you like to know about the teachings of Prophet Muhammad ﷺ?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the hadith-chat edge function
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
    } catch (error) {
      console.error("Error calling hadith-chat:", error);
      
      // Show error toast to user
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
        variant: "destructive",
      });
      
      // Show error message in chat
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

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 paper-texture">
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                citations={message.citations}
                timestamp={message.timestamp}
              />
            ))}

            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm animate-pulse">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Sparkles className="w-5 h-5 animate-spin text-accent" />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">Searching sunnah.com...</span>
                      <span className="text-xs opacity-70">Finding relevant authentic hadiths</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border/40 bg-card/50 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Ask about any topic... (e.g., 'What did the Prophet ﷺ say about charity?', 'Hadiths about patience', 'Prayer guidance')"
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
                className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm hover:shadow-gold-glow transition-all"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              Real-time search of sunnah.com • 1-4 verified citations per answer • Not for issuing fatwas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
