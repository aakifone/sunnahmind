import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Shield, Search, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden paper-texture geometric-pattern">
      {/* Sign In Button - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <Button
          variant="outline"
          onClick={() => navigate('/auth')}
          className="gap-2 border-accent/30 hover:bg-accent/10"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Sourced exclusively from Sunnah.com</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{ 
              background: 'var(--gradient-gold)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              السلام عليكم ورحمة الله وبركاته
            </h1>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Ask Questions About
              <span className="block" style={{ 
                background: 'var(--gradient-emerald)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Hadith & Sunnah
              </span>
            </h2>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A respectful AI assistant that answers your questions using only authenticated content from sunnah.com. 
            Every answer includes clear citations and references you can verify.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="group bg-[hsl(160,65%,45%)] hover:bg-[hsl(160,65%,40%)] text-white shadow-elegant hover:shadow-lg transition-all"
              onClick={() => navigate('/chat')}
            >
              Start Asking Questions
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-accent/30 hover:bg-accent/10 hover:border-accent transition-all"
            >
              <BookOpen className="mr-2 w-5 h-5" />
              Learn How It Works
            </Button>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
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
