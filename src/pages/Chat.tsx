import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "@/components/ChatMessage";
import Header from "@/components/Header";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: any[];
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "السلام عليكم! I'm here to help answer your questions about Hadith using only verified content from sunnah.com. Every answer I provide will include specific citations you can verify. What would you like to know?",
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

    // Simulate AI response with mock data
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: "The Prophet ﷺ emphasized the importance of charity given in secret. Secret charity is considered a form of sincere worship, as it protects the giver from pride and ensures the deed is done purely for Allah's sake.",
        citations: [
          {
            collection: "Sahih al-Bukhari",
            hadithNumber: "1423",
            narrator: "Abu Hurairah",
            url: "https://sunnah.com/bukhari:1423",
            translation: "The Prophet (ﷺ) said, 'Seven people will be shaded by Allah under His shade on the day when there will be no shade except His. They are: (1) a just ruler; (2) a young man who has been brought up in the worship of Allah, (i.e. worship Allah (Alone) sincerely from his childhood), (3) a man whose heart is attached to the mosque, (4) two persons who love each other only for Allah's sake and they meet and part in Allah's cause only, (5) a man who refuses the call of a charming woman of noble birth for an illegal sexual intercourse with her and says: I am afraid of Allah, (6) a person who practices charity so secretly that his left hand does not know what his right hand has given (i.e. nobody knows how much he has given in charity). (7) a person who remembers Allah in seclusion and his eyes become flooded with tears.'",
            arabic: "قَالَ النَّبِيُّ صلى الله عليه وسلم ‏ سَبْعَةٌ يُظِلُّهُمُ اللَّهُ تَعَالَى فِي ظِلِّهِ يَوْمَ لاَ ظِلَّ إِلاَّ ظِلُّهُ..."
          },
          {
            collection: "Sahih Muslim",
            hadithNumber: "1031",
            narrator: "Abu Hurairah",
            url: "https://sunnah.com/muslim:1031",
            translation: "The Prophet (ﷺ) said: 'Charity does not decrease wealth, no one forgives another except that Allah increases his honor, and no one humbles himself for the sake of Allah except that Allah raises his status.'",
            arabic: "قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم ‏ مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ..."
          }
        ],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
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
                <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Searching sunnah.com...</span>
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
                  placeholder="Ask a question about Hadith... (e.g., 'What did the Prophet ﷺ say about charity?')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[60px] max-h-[200px] resize-none pr-12 bg-background border-border/50 focus:border-accent"
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
              All answers are sourced exclusively from sunnah.com • Not for issuing fatwas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
