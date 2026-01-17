import { useState, useEffect, useCallback } from "react";
import { BookOpen } from "lucide-react";

interface LoadingAnimationProps {
  onComplete: () => void;
}

const LoadingAnimation = ({ onComplete }: LoadingAnimationProps) => {
  const [phase, setPhase] = useState<'forming' | 'display' | 'bgTransition' | 'morphing' | 'moving' | 'complete'>('forming');
  const arabicText = "السُّنَّة العَقْل";
  const englishText = "SunnahMind";
  const [visibleArabicChars, setVisibleArabicChars] = useState(0);
  const [morphProgress, setMorphProgress] = useState(0);
  const [bgProgress, setBgProgress] = useState(0);
  const [moveProgress, setMoveProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  const handleSkip = useCallback(() => {
    sessionStorage.setItem('hasSeenLoadingAnimation', 'true');
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Phase 1: Form Arabic text letter by letter (left to right)
    let charIndex = 0;
    const formInterval = setInterval(() => {
      if (charIndex <= arabicText.length) {
        setVisibleArabicChars(charIndex);
        charIndex++;
      } else {
        clearInterval(formInterval);
        setPhase('display');
      }
    }, 80);

    return () => clearInterval(formInterval);
  }, []);

  useEffect(() => {
    if (phase === 'display') {
      // Brief pause to display full Arabic text
      const displayTimer = setTimeout(() => {
        setPhase('bgTransition');
        setShowLogo(true);
      }, 800);
      return () => clearTimeout(displayTimer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'bgTransition') {
      // Smooth background transition from black to white
      let progress = 0;
      const bgInterval = setInterval(() => {
        progress += 0.02;
        if (progress >= 1) {
          setBgProgress(1);
          clearInterval(bgInterval);
          setPhase('morphing');
        } else {
          setBgProgress(progress);
        }
      }, 20);
      return () => clearInterval(bgInterval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'morphing') {
      // Smooth morph from Arabic to English
      let progress = 0;
      const morphInterval = setInterval(() => {
        progress += 0.015;
        if (progress >= 1) {
          setMorphProgress(1);
          clearInterval(morphInterval);
          setPhase('moving');
        } else {
          setMorphProgress(progress);
        }
      }, 20);
      return () => clearInterval(morphInterval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'moving') {
      // Move to top-left position
      let progress = 0;
      const moveInterval = setInterval(() => {
        progress += 0.02;
        if (progress >= 1) {
          setMoveProgress(1);
          clearInterval(moveInterval);
          setPhase('complete');
        } else {
          setMoveProgress(progress);
        }
      }, 16);
      return () => clearInterval(moveInterval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'complete') {
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 300);
      return () => clearTimeout(completeTimer);
    }
  }, [phase, onComplete]);

  // Easing function for smooth animations
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Calculate background color based on progress
  const bgColor = `rgb(${Math.round(255 * easeOutCubic(bgProgress))}, ${Math.round(255 * easeOutCubic(bgProgress))}, ${Math.round(255 * easeOutCubic(bgProgress))})`;

  // Calculate position based on move progress
  const easedMoveProgress = easeInOutCubic(moveProgress);
  const scale = 1 - (easedMoveProgress * 0.6); // Scale from 1 to 0.4
  const translateX = -easedMoveProgress * (window.innerWidth / 2 - 100);
  const translateY = -easedMoveProgress * (window.innerHeight / 2 - 50);

  // Get displayed text based on morph progress
  const getDisplayedText = () => {
    if (phase === 'forming' || phase === 'display' || phase === 'bgTransition') {
      return arabicText.slice(0, visibleArabicChars);
    }
    
    const easedMorph = easeInOutCubic(morphProgress);
    
    // Crossfade between Arabic and English
    return {
      arabic: arabicText,
      english: englishText,
      arabicOpacity: 1 - easedMorph,
      englishOpacity: easedMorph,
    };
  };

  const displayContent = getDisplayedText();
  const isObjectDisplay = typeof displayContent === 'object';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className={`fixed top-6 right-6 z-[10000] px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
          bgProgress < 0.5 
            ? 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20' 
            : 'bg-black/10 text-black/70 hover:bg-black/20 hover:text-black border border-black/20'
        }`}
      >
        Skip
      </button>

      <div
        className="flex items-center gap-4"
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transition: phase === 'moving' ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Logo */}
        <div
          className="transition-all duration-700 ease-out"
          style={{
            opacity: showLogo ? 1 : 0,
            transform: showLogo ? 'scale(1)' : 'scale(0.5)',
          }}
        >
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #D4A574 0%, #8B6914 100%)',
            }}
          >
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Text Container */}
        <div className="relative">
          {isObjectDisplay ? (
            <>
              {/* Arabic text (fading out) */}
              <h1
                className="text-5xl md:text-7xl font-bold whitespace-nowrap absolute inset-0"
                style={{
                  fontFamily: "'Amiri', 'Noto Sans Arabic', serif",
                  background: 'linear-gradient(135deg, #D4A574 0%, #8B6914 50%, #D4A574 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  opacity: displayContent.arabicOpacity,
                  transition: 'opacity 0.05s linear',
                }}
              >
                {displayContent.arabic}
              </h1>
              {/* English text (fading in) */}
              <h1
                className="text-5xl md:text-7xl font-bold whitespace-nowrap"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  background: 'linear-gradient(135deg, #D4A574 0%, #8B6914 50%, #D4A574 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  opacity: displayContent.englishOpacity,
                  transition: 'opacity 0.05s linear',
                }}
              >
                {displayContent.english}
              </h1>
            </>
          ) : (
            <h1
              className="text-5xl md:text-7xl font-bold whitespace-nowrap"
              style={{
                fontFamily: "'Amiri', 'Noto Sans Arabic', serif",
                background: 'linear-gradient(135deg, #D4A574 0%, #8B6914 50%, #D4A574 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                direction: 'rtl',
              }}
            >
              {displayContent}
            </h1>
          )}
        </div>
      </div>

      {/* Decorative geometric patterns */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ opacity: 0.15 * (1 - bgProgress) }}
      >
        <div className="absolute top-10 left-10 w-32 h-32 border border-amber-500/50 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-10 right-10 w-24 h-24 border border-amber-500/50 rotate-12 animate-reverse-spin" />
        <div className="absolute top-1/4 right-20 w-16 h-16 border border-amber-500/40 animate-pulse" />
        <div className="absolute bottom-1/4 left-20 w-20 h-20 border border-amber-500/40 rotate-45 animate-pulse" />
      </div>

      {/* Radial glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 1 - bgProgress }}
      >
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212, 165, 116, 0.2) 0%, transparent 70%)',
          }}
        />
      </div>
    </div>
  );
};

export default LoadingAnimation;
