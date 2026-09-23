import React from 'react';

export type LogoVariant = 'main' | 'favicon' | 'monochrome-white' | 'monochrome-purple' | 'badge';

export interface TalapLogoProps {
  variant?: LogoVariant;
  size?: number | string;
  className?: string;
  withBackground?: boolean;
}

export const TalapLogo: React.FC<TalapLogoProps> = ({
  variant = 'main',
  size = 40,
  className = '',
  withBackground = false,
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  // Favicon (Ultra-simplified for 16x16 and 32x32)
  if (variant === 'favicon') {
    return (
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {withBackground && (
          <rect width="32" height="32" rx="7" fill="#1E1145" />
        )}
        {/* Mentor Head */}
        <circle cx="9" cy="8.5" r="3.2" fill="#C4B5FD" />
        {/* Mentor Body & Arm */}
        <path
          d="M4.5 25C4.5 17.5 7.5 14.5 12 14.5C13.5 14.5 15.5 16 17 18"
          stroke="#8B5CF6"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Student Cap */}
        <path
          d="M23 7.5L28.5 10L23 12.5L17.5 10L23 7.5Z"
          fill="#A78BFA"
        />
        <path
          d="M28.5 10V14"
          stroke="#A78BFA"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Student Head */}
        <circle cx="23" cy="14" r="3.2" fill="#E0E7FF" />
        {/* Student Body & Arm */}
        <path
          d="M27.5 25C27.5 19 25 17 21 17C19.5 17 17.5 18 16 19"
          stroke="#7047EB"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Task Card in Center */}
        <rect
          x="10.5"
          y="15.5"
          width="11"
          height="8"
          rx="2"
          fill="#FFFFFF"
          stroke="#7047EB"
          strokeWidth="1.2"
        />
        <path
          d="M13 18.5H16.5M13 21H19"
          stroke="#7047EB"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Monochrome White Variant (for dark headers, dark mode, watermarks)
  if (variant === 'monochrome-white') {
    return (
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {withBackground && (
          <rect width="100" height="100" rx="22" fill="#120A2E" />
        )}
        {/* Left Mentor Figure */}
        <circle cx="28" cy="27" r="9.5" fill="#FFFFFF" />
        <path
          d="M14 74C14 52 23 44.5 35 44.5C39 44.5 45 48.5 48 53"
          stroke="#FFFFFF"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M28 45.5L25 60L32 64"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Student Figure with Cap */}
        <path
          d="M72 17L87 23.5L72 30L57 23.5L72 17Z"
          fill="#FFFFFF"
        />
        <path
          d="M87 23.5V33"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="87" cy="34" r="2" fill="#FFFFFF" />
        <circle cx="72" cy="38" r="9.5" fill="#FFFFFF" />
        <path
          d="M86 74C86 56 79 50 67 50C63 50 57 53 53 56"
          stroke="#FFFFFF"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Central Task Card */}
        <rect
          x="34"
          y="46"
          width="32"
          height="24"
          rx="5"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <rect x="39" y="52" width="7" height="6" rx="1.5" fill="#120A2E" />
        <path
          d="M49 53.5H60M49 56.5H58M39 63.5H60"
          stroke="#120A2E"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Exchange Spark Rays */}
        <path
          d="M50 36V40M42 38L44.5 41.5M58 38L55.5 41.5"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Monochrome Purple Variant (for light documents, stamps, monochrome purple watermarks)
  if (variant === 'monochrome-purple') {
    return (
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {withBackground && (
          <rect width="100" height="100" rx="22" fill="#F0ECFF" />
        )}
        {/* Left Mentor Figure */}
        <circle cx="28" cy="27" r="9.5" fill="#7047EB" />
        <path
          d="M14 74C14 52 23 44.5 35 44.5C39 44.5 45 48.5 48 53"
          stroke="#7047EB"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M28 45.5L25 60L32 64"
          stroke="#7047EB"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Student Figure with Cap */}
        <path
          d="M72 17L87 23.5L72 30L57 23.5L72 17Z"
          fill="#7047EB"
        />
        <path
          d="M87 23.5V33"
          stroke="#7047EB"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="87" cy="34" r="2" fill="#7047EB" />
        <circle cx="72" cy="38" r="9.5" fill="#7047EB" />
        <path
          d="M86 74C86 56 79 50 67 50C63 50 57 53 53 56"
          stroke="#7047EB"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Central Task Card */}
        <rect
          x="34"
          y="46"
          width="32"
          height="24"
          rx="5"
          fill="#7047EB"
        />
        <rect x="39" y="52" width="7" height="6" rx="1.5" fill="#FFFFFF" />
        <path
          d="M49 53.5H60M49 56.5H58M39 63.5H60"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Exchange Spark Rays */}
        <path
          d="M50 36V40M42 38L44.5 41.5M58 38L55.5 41.5"
          stroke="#7047EB"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Main Brand Logo Variant (Multi-tone Purple, Lavender, White)
  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {withBackground && (
        <rect width="100" height="100" rx="22" fill="#150B2D" />
      )}

      <defs>
        {/* Crisp vector gradients (clean brand shades) */}
        <linearGradient id="mentorGrad" x1="14" y1="44" x2="48" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>

        <linearGradient id="studentGrad" x1="53" y1="50" x2="86" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        <linearGradient id="capGrad" x1="57" y1="17" x2="87" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>

        <linearGradient id="cardGrad" x1="34" y1="46" x2="66" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F5F3FF" />
        </linearGradient>

        <filter id="cardGlow" x="26" y="30" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#7047EB" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* 1. Left Mentor / Business Figure */}
      {/* Mentor Head (Clean Lavender-White) */}
      <circle cx="28" cy="27" r="9.5" fill="#DDD6FE" />
      
      {/* Mentor Torso & Giving Arm */}
      <path
        d="M14 74C14 52 23 44.5 35 44.5C39 44.5 45 48.5 48 53"
        stroke="url(#mentorGrad)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Business Tie / Lapel Accent */}
      <path
        d="M28 45.5L25 60L32 64"
        stroke="#DDD6FE"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. Right Student Figure with Graduation Cap */}
      {/* Student Academic Cap */}
      <path
        d="M72 17L87 23.5L72 30L57 23.5L72 17Z"
        fill="url(#capGrad)"
      />
      <path
        d="M87 23.5V33"
        stroke="#DDD6FE"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="87" cy="34" r="2.2" fill="#DDD6FE" />
      
      {/* Student Head (Pure Lavender) */}
      <circle cx="72" cy="38" r="9.5" fill="#EDE9FE" />

      {/* Student Torso & Receiving Arm */}
      <path
        d="M86 74C86 56 79 50 67 50C63 50 57 53 53 56"
        stroke="url(#studentGrad)"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* 3. Central Handover Task Card */}
      <g filter="url(#cardGlow)">
        <rect
          x="34"
          y="46"
          width="32"
          height="24"
          rx="5"
          fill="url(#cardGrad)"
          stroke="#7047EB"
          strokeWidth="1.8"
        />
        {/* Card Header Chip / Badge */}
        <rect x="38.5" y="51.5" width="7" height="6" rx="1.5" fill="#7047EB" />
        
        {/* Card Task Detail Lines */}
        <path
          d="M48.5 53.5H60M48.5 56.5H57.5M38.5 63.5H60"
          stroke="#8B5CF6"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* 4. Top Exchange Spark Rays */}
      <path
        d="M50 36V40M42 38L44.5 41.5M58 38L55.5 41.5"
        stroke="#A78BFA"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
