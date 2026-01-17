import { useState, useEffect, useCallback } from "react";

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
      let progress = 0;
      const moveInterval = setInterval(() => {
        progress += 0.025;
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
      }, 200);
      return () => clearTimeout(completeTimer);
    }
  }, [phase, onComplete]);

  // Easing functions
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Background: pure black to white
  const bgValue = Math.round(255 * easeOutCubic(bgProgress));
  const bgColor = `rgb(${bgValue}, ${bgValue}, ${bgValue})`;

  // Position calculations - move to exactly where header logo is (top-left)
  const easedMoveProgress = easeInOutCubic(moveProgress);
  
  // Final position: top-left corner matching header
  // Start: center of screen, End: top-4 left-4 (16px from edges) with proper scale
  const startScale = 1;
  const endScale = 0.35;
  const scale = startScale - (easedMoveProgress * (startScale - endScale));
  
  // Calculate translation to top-left (accounting for the element starting at center)
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
  
  // Target: 16px from left edge, 16px from top (matching header position)
  const targetX = -(viewportWidth / 2) + 120; // Offset to left side
  const targetY = -(viewportHeight / 2) + 40; // Offset to top
  
  const translateX = easedMoveProgress * targetX;
  const translateY = easedMoveProgress * targetY;

  // Text display logic
  const easedMorph = easeInOutCubic(morphProgress);
  const showArabic = phase === 'forming' || phase === 'display' || phase === 'bgTransition' || (phase === 'morphing' && morphProgress < 1);
  const showEnglish = phase === 'morphing' || phase === 'moving' || phase === 'complete';

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
        className="flex items-center gap-3"
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          willChange: 'transform',
        }}
      >
        {/* Text Container - Single text element with crossfade */}
        <div className="relative h-[80px] md:h-[100px] flex items-center justify-center">
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
