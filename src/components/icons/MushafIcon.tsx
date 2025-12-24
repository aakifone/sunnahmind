import React from "react";

interface MushafIconProps {
  className?: string;
  size?: number;
}

const MushafIcon = ({ className = "", size = 16 }: MushafIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Outer book shape - minimal Mushaf page outline */}
      <path d="M4 4.5C4 3.12 5.12 2 6.5 2H18c.55 0 1 .45 1 1v18c0 .55-.45 1-1 1H6.5C5.12 22 4 20.88 4 19.5v-15z" />
      
      {/* Book spine detail */}
      <path d="M4 19.5C4 18.12 5.12 17 6.5 17H19" />
      
      {/* Inner page lines suggesting text blocks (minimal, no actual text) */}
      <line x1="7.5" y1="6" x2="15.5" y2="6" />
      <line x1="7.5" y1="9" x2="15.5" y2="9" />
      <line x1="7.5" y1="12" x2="13" y2="12" />
    </svg>
  );
};

export default MushafIcon;
