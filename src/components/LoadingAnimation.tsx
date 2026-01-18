import { useState, useEffect, useCallback } from "react";
import { useTranslate } from "@/hooks/useTranslate";

interface LoadingAnimationProps {
  onComplete: () => void;
}

const LoadingAnimation = ({ onComplete }: LoadingAnimationProps) => {
  const [phase, setPhase] = useState<'forming' | 'display' | 'bgTransition' | 'morphing' | 'fadeOut' | 'complete'>('forming');
  const arabicText = "السُّنَّة العَقْل";
  const englishText = "SunnahMind";
  const { t } = useTranslate();
  const [visibleArabicChars, setVisibleArabicChars] = useState(0);
  const [morphProgress, setMorphProgress] = useState(0);
  const [bgProgress, setBgProgress] = useState(0);
  const [fadeOutProgress, setFadeOutProgress] = useState(0);

  const handleSkip = useCallback(() => {
    sessionStorage.setItem('hasSeenLoadingAnimation', 'true');
    onComplete();
  }, [onComplete]);

  useEffect(() => {
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
      const displayTimer = setTimeout(() => {
        setPhase('bgTransition');
      }, 800);
      return () => clearTimeout(displayTimer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'bgTransition') {
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
      let progress = 0;
      const morphInterval = setInterval(() => {
        progress += 0.015;
        if (progress >= 1) {
          setMorphProgress(1);
          clearInterval(morphInterval);
          // Brief pause to show English text, then fade out
          setTimeout(() => setPhase('fadeOut'), 400);
        } else {
          setMorphProgress(progress);
        }
      }, 20);
      return () => clearInterval(morphInterval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'fadeOut') {
      let progress = 0;
      const fadeInterval = setInterval(() => {
        progress += 0.04;
        if (progress >= 1) {
          setFadeOutProgress(1);
          clearInterval(fadeInterval);
          setPhase('complete');
        } else {
          setFadeOutProgress(progress);
        }
      }, 16);
      return () => clearInterval(fadeInterval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'complete') {
      onComplete();
    }
  }, [phase, onComplete]);

  // Easing functions
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInOutQuart = (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

  // Background: pure black to white
  const bgValue = Math.round(255 * easeOutCubic(bgProgress));
  const bgColor = `rgb(${bgValue}, ${bgValue}, ${bgValue})`;

  // Text display logic
  const easedMorph = easeInOutQuart(morphProgress);
  const showArabic = phase === 'forming' || phase === 'display' || phase === 'bgTransition' || (phase === 'morphing' && morphProgress < 1);
  const showEnglish = phase === 'morphing' || phase === 'fadeOut' || phase === 'complete';

  // Fade out the entire animation
  const containerOpacity = phase === 'fadeOut' ? 1 - easeOutCubic(fadeOutProgress) : 1;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        opacity: containerOpacity,
        pointerEvents: phase === 'complete' ? 'none' : 'auto',
      }}
    >
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className={`fixed top-6 right-6 z-[10000] px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
          bgProgress < 0.5 
            ? 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20' 
            : 'bg-black/10 text-black/70 hover:bg-black/20 hover:text-black border border-black/20'
        }`}
        style={{ opacity: containerOpacity }}
      >
        {t("Skip")}
      </button>

      <div className="flex items-center justify-center">
        {/* Text Container */}
        <div className="relative flex items-center justify-center" style={{ height: '80px' }}>
          {/* Arabic text */}
          {showArabic && (
            <h1
              className="text-5xl md:text-7xl font-bold whitespace-nowrap absolute"
              style={{
                fontFamily: "'Amiri', 'Noto Sans Arabic', serif",
                background: 'linear-gradient(135deg, #D4A574 0%, #8B6914 50%, #D4A574 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                opacity: phase === 'morphing' ? 1 - easedMorph : 1,
                direction: 'rtl',
                lineHeight: 1.4,
              }}
            >
              {phase === 'forming' ? arabicText.slice(0, visibleArabicChars) : arabicText}
            </h1>
          )}
          
          {/* English text */}
          {showEnglish && (
            <h1
              className="text-5xl md:text-7xl font-bold whitespace-nowrap absolute"
              style={{
                fontFamily: "'Inter', sans-serif",
                background: 'linear-gradient(135deg, #D4A574 0%, #8B6914 50%, #D4A574 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                opacity: phase === 'morphing' ? easedMorph : 1,
                lineHeight: 1.4,
              }}
            >
              {englishText}
            </h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
