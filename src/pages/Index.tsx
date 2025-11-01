import Header from "@/components/Header";
import Hero from "@/components/Hero";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              How It Works
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              A simple, transparent approach to Islamic knowledge
            </p>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Ask Your Question</h3>
                  <p className="text-muted-foreground">
                    Type your question about Hadith in natural language. Our AI understands context and searches sunnah.com's authenticated collections.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Get Cited Answers</h3>
                  <p className="text-muted-foreground">
                    Receive a concise answer with direct quotes from Hadith. Each response includes a short description on the query and a link to verify on sunnah.com.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Verify & Learn</h3>
                  <p className="text-muted-foreground">
                    Click any citation to view the full Hadith on sunnah.com. See the Arabic text, translation, and chain of narration. Always consult scholars for rulings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 paper-texture">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Our Mission
            </h2>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p className="text-center mb-8">
                We believe access to authenticated Islamic knowledge should be simple, transparent, and trustworthy.
              </p>
              <div className="bg-card border border-accent/20 rounded-lg p-6 space-y-4">
                <p className="font-semibold text-foreground">
                  This tool is designed for:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>✓ Students and researchers studying Hadith</li>
                  <li>✓ Anyone seeking quick, verified references from authentic sources</li>
                  <li>✓ Those who want to learn about the Prophet's ﷺ teachings</li>
                </ul>
                <p className="text-sm italic border-t border-border/30 pt-4 text-destructive">
                  ⚠️ Important: This is not a fatwa-issuing service. We provide Hadith references only. For religious rulings, please consult qualified scholars.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              All hadith content sourced from{" "}
              <a 
                href="https://sunnah.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80 font-medium transition-colors"
              >
                sunnah.com
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 Hadith AI. For educational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
