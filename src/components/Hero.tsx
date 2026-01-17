import { Button } from "@/components/ui/button";
import { useTranslate } from "@/hooks/useTranslate";
import { ArrowRight, Shield, Search, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslate();

  return (
    <section className="relative overflow-hidden paper-texture" style={{ background: 'var(--gradient-background)' }}>
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">

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
            <span className="font-semibold text-foreground">
              {t("Ask questions about Hadith & Sunnah:")}
            </span>{" "}
            {t(
              "AI assistant that answers your questions using Hadiths from sunnah.com. Every answer includes clear references.",
            )}
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
              {t("Start Asking Questions")}
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
              onClick={() => {
                const element = document.getElementById('how-it-works');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t("Learn how it works")}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="p-6 rounded-lg bg-card border border-border/50 shadow-sm hover:shadow-elegant transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">{t("Verified Sources")}</h3>
              <p className="text-sm text-muted-foreground">
                {t(
                  "All answers cite specific hadiths from sunnah.com with book, number, and link",
                )}
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border/50 shadow-sm hover:shadow-elegant transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">{t("No Fatwas Given")}</h3>
              <p className="text-sm text-muted-foreground">
                {t(
                  "We provide hadith references, not religious rulings. Consult qualified scholars",
                )}
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border/50 shadow-sm hover:shadow-elegant transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">{t("Transparent Research")}</h3>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Every citation is auditable. Click any reference to view it on sunnah.com",
                )}
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
