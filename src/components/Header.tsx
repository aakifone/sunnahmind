import { Button } from "@/components/ui/button";
import { BookOpen, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-sm group-hover:shadow-gold-glow transition-all">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold leading-none">Hadith AI</span>
              <span className="text-xs text-muted-foreground">via Sunnah.com</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm font-medium hover:text-accent transition-colors">
              How It Works
            </a>
            <a href="#about" className="text-sm font-medium hover:text-accent transition-colors">
              About
            </a>
            <a 
              href="https://sunnah.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium hover:text-accent transition-colors"
            >
              Sunnah.com
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="outline" 
              className="border-accent/30 hover:bg-accent/10 hover:border-accent"
              onClick={() => navigate('/chat')}
            >
              Try Chat
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-accent/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <nav className="flex flex-col gap-4">
              <a href="#how-it-works" className="text-sm font-medium hover:text-accent transition-colors">
                How It Works
              </a>
              <a href="#about" className="text-sm font-medium hover:text-accent transition-colors">
                About
              </a>
              <a 
                href="https://sunnah.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-accent transition-colors"
              >
                Sunnah.com
              </a>
              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => {
                  navigate('/chat');
                  setMobileMenuOpen(false);
                }}
              >
                Try Chat
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
