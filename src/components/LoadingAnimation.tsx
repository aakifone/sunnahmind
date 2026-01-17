import { useState, useEffect, useCallback, useRef } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);

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
      }, 150);
      return () => clearTimeout(completeTimer);
    }
  }, [phase, onComplete]);

  // Easing functions
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInOutQuart = (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

  // Background: pure black to white
  const bgValue = Math.round(255 * easeOutCubic(bgProgress));
  const bgColor = `rgb(${bgValue}, ${bgValue}, ${bgValue})`;

  // Get current element dimensions and calculate target
  const easedMoveProgress = easeInOutQuart(moveProgress);
  
  // Header position: 
  // - container has px-4 (16px padding)
  // - logo div is 40x40 with gap-3 (12px) before text
  // - header height is h-16 (64px), text is vertically centered
  // Target: 16px padding + 40px logo + 12px gap = 68px from left
  // Vertically: 32px from top (center of 64px header)
  
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
  
  // Current center position
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  
  // Target position (where header text sits)
  // Header: sticky top-0, h-16 (64px), container mx-auto px-4
  // Logo button: 40px logo + 12px gap + text
  // For container mx-auto, we need to account for max container width
  const containerPadding = 16; // px-4
  const logoSize = 40;
  const logoGap = 12; // gap-3
  
  // Target X: left padding + logo + gap + half of final text width
  // Final text at 18px (text-lg) is roughly 120px wide for "Sunnah Mind"
  const finalTextWidth = 130;
  const targetX = containerPadding + logoSize + logoGap + (finalTextWidth / 2);
  
  // Target Y: center of header (32px from top)
  const targetY = 32;
  
  // Calculate translation from center to target
  const translateX = (targetX - centerX) * easedMoveProgress;
  const translateY = (targetY - centerY) * easedMoveProgress;
  
  // Scale: from large (1) to header size
  // Header text is text-lg (18px/1.125rem), current is ~56px (text-5xl md:text-7xl)
  // Scale factor: 18/56 ≈ 0.32
  const startScale = 1;
  const endScale = 0.28;
  const scale = startScale - (easedMoveProgress * (startScale - endScale));

  // Text display logic
  const easedMorph = easeInOutQuart(morphProgress);
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
        ref={containerRef}
        className="flex items-center"
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          willChange: 'transform',
          transformOrigin: 'center center',
        }}
      >
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
