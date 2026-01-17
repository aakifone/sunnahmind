import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

interface LoadingAnimationProps {
  onComplete: () => void;
}

const LoadingAnimation = ({ onComplete }: LoadingAnimationProps) => {
  const [phase, setPhase] = useState<'outline' | 'colorFill' | 'solidFill' | 'transition' | 'complete'>('outline');
  const arabicText = "السُّنَّة العَقْل";
  const englishText = "SunnahMind";
  const [displayText, setDisplayText] = useState(arabicText);
  const [letterIndex, setLetterIndex] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    // Phase 1: Outline (1s)
    const outlineTimer = setTimeout(() => {
      setPhase('colorFill');
    }, 1000);

    // Phase 2: Color fill animation (2s)
    const colorFillTimer = setTimeout(() => {
      setPhase('solidFill');
    }, 3000);

    // Phase 3: Solid fill (0.5s)
    const solidFillTimer = setTimeout(() => {
      setPhase('transition');
      setShowLogo(true);
    }, 3500);

    // Phase 4: Start letter transformation
    const transitionTimer = setTimeout(() => {
      // Start letter-by-letter transformation
      let currentIndex = 0;
      const transformInterval = setInterval(() => {
        if (currentIndex <= englishText.length) {
          const newText = englishText.slice(0, currentIndex) + arabicText.slice(currentIndex);
          setDisplayText(englishText.slice(0, currentIndex));
          setLetterIndex(currentIndex);
          currentIndex++;
        } else {
          clearInterval(transformInterval);
          setDisplayText(englishText);
        }
      }, 100);
    }, 4000);

    // Complete animation
    const completeTimer = setTimeout(() => {
      setPhase('complete');
    }, 5500);

    const finalTimer = setTimeout(() => {
      onComplete();
    }, 6500);

    return () => {
      clearTimeout(outlineTimer);
      clearTimeout(colorFillTimer);
      clearTimeout(solidFillTimer);
      clearTimeout(transitionTimer);
      clearTimeout(completeTimer);
      clearTimeout(finalTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-colors duration-1000 ${
        phase === 'transition' || phase === 'complete' ? 'bg-background' : 'bg-black'
      }`}
    >
      <div
        className={`flex items-center gap-4 transition-all duration-1000 ease-out ${
          phase === 'complete'
            ? 'fixed top-4 left-4 scale-50 origin-top-left'
            : 'scale-100'
        }`}
      >
        {/* Logo */}
        <div
          className={`transition-all duration-700 ${
            showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${
            phase === 'transition' || phase === 'complete'
              ? 'bg-gradient-to-br from-accent to-primary'
              : 'bg-gradient-to-br from-amber-500 to-amber-700'
          }`}>
            <BookOpen className={`w-8 h-8 ${
              phase === 'transition' || phase === 'complete'
                ? 'text-primary-foreground'
                : 'text-white'
            }`} />
          </div>
        </div>

        {/* Text */}
        <div className="relative">
          {phase === 'outline' && (
            <h1
              className="text-6xl md:text-8xl font-bold animate-outline-pulse"
              style={{
                fontFamily: "'Amiri', 'Noto Sans Arabic', serif",
                WebkitTextStroke: '2px',
                WebkitTextStrokeColor: '#B8860B',
                color: 'transparent',
                textShadow: '0 0 30px rgba(184, 134, 11, 0.3)',
              }}
            >
              {arabicText}
            </h1>
          )}

          {phase === 'colorFill' && (
            <h1
              className="text-6xl md:text-8xl font-bold animate-color-shift"
              style={{
                fontFamily: "'Amiri', 'Noto Sans Arabic', serif",
                background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1, #96E6A1, #DDA0DD, #F7DC6F, #BB8FCE)',
                backgroundSize: '400% 400%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: 'colorShift 2s ease-in-out infinite',
              }}
            >
              {arabicText}
            </h1>
          )}

          {phase === 'solidFill' && (
            <h1
              className="text-6xl md:text-8xl font-bold animate-solid-fill"
              style={{
                fontFamily: "'Amiri', 'Noto Sans Arabic', serif",
                background: 'linear-gradient(135deg, #D4A574 0%, #8B6914 50%, #D4A574 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {arabicText}
            </h1>
          )}

          {(phase === 'transition' || phase === 'complete') && (
            <h1
              className={`text-4xl md:text-6xl font-bold transition-all duration-500 ${
                phase === 'complete' ? 'text-foreground' : ''
              }`}
              style={{
                fontFamily: letterIndex >= englishText.length ? "'Inter', sans-serif" : "'Amiri', 'Noto Sans Arabic', serif",
                background: phase !== 'complete' 
                  ? 'linear-gradient(135deg, #D4A574 0%, #8B6914 50%, #D4A574 100%)'
                  : undefined,
                WebkitBackgroundClip: phase !== 'complete' ? 'text' : undefined,
                backgroundClip: phase !== 'complete' ? 'text' : undefined,
                color: phase !== 'complete' ? 'transparent' : undefined,
              }}
            >
              {displayText || englishText}
            </h1>
          )}
        </div>
      </div>

      {/* Decorative geometric patterns */}
      <div className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-1000 ${
        phase === 'transition' || phase === 'complete' ? 'opacity-0' : 'opacity-20'
      }`}>
        <div className="absolute top-10 left-10 w-32 h-32 border border-amber-500/30 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-10 right-10 w-24 h-24 border border-amber-500/30 rotate-12 animate-reverse-spin" />
        <div className="absolute top-1/4 right-20 w-16 h-16 border border-amber-500/20 animate-pulse" />
        <div className="absolute bottom-1/4 left-20 w-20 h-20 border border-amber-500/20 rotate-45 animate-pulse" />
      </div>

      {/* Radial glow effect */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
        phase === 'transition' || phase === 'complete' ? 'opacity-0' : 'opacity-100'
      }`}>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(184, 134, 11, 0.15) 0%, transparent 70%)',
          }}
        />
      </div>
    </div>
  );
};

export default LoadingAnimation;
