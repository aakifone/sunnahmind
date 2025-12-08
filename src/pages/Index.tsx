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
            <div className="text-center mb-8 space-y-4">
              <p>
                In recent years, many scholars and educators have warned against using artificial intelligence for Islamic learning, especially in areas like Hadith, because many AI tools rely on unverified or unreliable sources. This can lead to misquotations, incorrect attributions, or even fabricated narrations being presented as authentic. Such mistakes go against the precision and trust that the study of Hadith requires.
              </p>
              <p>
                Hadith AI was created to address this concern by providing a reliable and transparent tool that only retrieves Hadith directly from Sunnah.com, a trusted and well-recognized source for authentic Islamic texts. The goal is not to replace traditional scholarship, but to make genuine Hadith knowledge more accessible, accurate, and easy to explore in the digital age.
              </p>
              <p>
                By combining verified sources with modern technology, Hadith AI aims to support students, teachers, and researchers in their pursuit of authentic Islamic understanding, while maintaining full respect for the integrity of religious knowledge and the guidance of scholars.
              </p>
            </div>
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

              {/* Sources Section */}
              <div id="sources" className="mt-12 pt-8 border-t border-border/30">
                <h3 className="text-xl font-bold text-foreground mb-6">
                  List of Hadith Sources
                </h3>
                <div className="space-y-4">
                  <div className="bg-background/50 border border-border/40 rounded-lg p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                        1
                      </span>
                      <div>
                        <a 
                          href="https://sunnah.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-accent hover:text-accent/80 transition-colors"
                        >
                          Sunnah.com
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">
                          A comprehensive online database of Hadith collections, featuring authenticated texts from major compilations including Sahih Bukhari, Sahih Muslim, Sunan Abu Dawud, and more. Each hadith includes Arabic text, English translations, and detailed chain of narration information.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
