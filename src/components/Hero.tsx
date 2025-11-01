import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Search, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden paper-texture" style={{ background: 'var(--gradient-background)' }}>
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Sourced exclusively from Sunnah.com</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{ 
              background: 'var(--gradient-gold-brown)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              السلام عليكم ورحمة الله وبركاته
            </h1>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            <span className="font-semibold text-foreground">Ask questions about Hadith & Sunnah:</span> A respectful AI assistant that answers your questions using only authenticated content from sunnah.com. 
            Every answer includes clear citations and references you can verify.
          </p>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button 
              size="lg" 
              className="group text-white shadow-elegant hover:shadow-gold-glow transition-all"
              style={{ 
                background: 'var(--gradient-gold-brown)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => navigate('/chat')}
            >
              Start Asking Questions
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="group bg-white text-foreground border-2 hover:bg-white/90"
              style={{ 
                borderImage: 'var(--gradient-gold-brown) 1',
                transition: 'all 0.3s ease'
              }}
            >
              Learn how it works
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="p-6 rounded-lg bg-card border border-border/50 shadow-sm hover:shadow-elegant transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Verified Sources</h3>
              <p className="text-sm text-muted-foreground">
                All answers cite specific hadiths from sunnah.com with book, number, and link
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border/50 shadow-sm hover:shadow-elegant transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">No Fatwas Given</h3>
              <p className="text-sm text-muted-foreground">
                We provide hadith references, not religious rulings. Consult qualified scholars
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border/50 shadow-sm hover:shadow-elegant transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Transparent Research</h3>
              <p className="text-sm text-muted-foreground">
                Every citation is auditable. Click any reference to view it on sunnah.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Gold Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
    </section>
  );
};

export default Hero;
