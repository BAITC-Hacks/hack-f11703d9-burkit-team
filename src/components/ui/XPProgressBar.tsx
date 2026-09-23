import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface XPProgressBarProps {
  progressPercent: number;
  heightClass?: string;
  showGlow?: boolean;
  showShimmer?: boolean;
  className?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  progressPercent,
  heightClass = 'h-3',
  showGlow = true,
  showShimmer = true,
  className = '',
}) => {
  const [animatedPercent, setAnimatedPercent] = useState<number>(0);

  useEffect(() => {
    // Delay slightly to trigger smooth animation on mount/update
    const timer = setTimeout(() => {
      setAnimatedPercent(Math.min(100, Math.max(0, progressPercent)));
    }, 50);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  return (
    <div
      className={`w-full ${heightClass} bg-[#F0F2F7] rounded-full overflow-hidden p-0.5 relative shadow-inner ${className}`}
    >
      <div
        className={`h-full rounded-full bg-gradient-to-r from-[#7047EB] via-[#5E32DF] to-[#2CC7B5] xp-progress-bar-fill relative overflow-hidden ${
          showGlow ? 'xp-pulse-glow' : ''
        }`}
        style={{ width: `${animatedPercent}%` }}
      >
        {/* Shimmer light sweep animation across the gradient */}
        {showShimmer && animatedPercent > 0 && (
          <div className="xp-shimmer-overlay" />
        )}

        {/* Highlight particle glow at the leading edge */}
        {animatedPercent > 0 && animatedPercent < 100 && (
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 blur-[1px] rounded-full" />
        )}
      </div>
    </div>
  );
};
