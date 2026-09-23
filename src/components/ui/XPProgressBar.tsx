import React, { useEffect, useState } from 'react';

export interface XPProgressBarProps {
  /** Percentage value of the progress bar (0 - 100) */
  value?: number;
  /** Alias for value */
  progressPercent?: number;
  /** Optional custom height Tailwind class (default: 'h-3') */
  heightClass?: string;
  /** Whether to show glowing halo effect */
  showGlow?: boolean;
  /** Whether to show shimmering light sweep effect */
  showShimmer?: boolean;
  /** Additional custom class names */
  className?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  value,
  progressPercent,
  heightClass = 'h-3',
  showGlow = true,
  showShimmer = true,
  className = '',
}) => {
  // Support both `value` and `progressPercent` props
  const targetValue = typeof value === 'number' ? value : (progressPercent ?? 0);
  const clampedValue = Math.min(100, Math.max(0, targetValue));

  const [currentWidth, setCurrentWidth] = useState<number>(0);

  useEffect(() => {
    // Slight frame delay so initial mount animates from 0 to value, and subsequent updates smoothly transition
    const frame = requestAnimationFrame(() => {
      setCurrentWidth(clampedValue);
    });
    return () => cancelAnimationFrame(frame);
  }, [clampedValue]);

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full ${heightClass} bg-[#F0F2F7] rounded-full overflow-hidden p-0.5 relative shadow-inner ${className}`}
    >
      <div
        className={`h-full rounded-full bg-gradient-to-r from-[#7047EB] via-[#5E32DF] to-[#2CC7B5] xp-progress-bar-fill relative overflow-hidden ${
          showGlow ? 'xp-pulse-glow' : ''
        }`}
        style={{
          width: `${currentWidth}%`,
          transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'width',
        }}
      >
        {/* Shimmer light sweep animation across the gradient */}
        {showShimmer && currentWidth > 0 && (
          <div className="xp-shimmer-overlay" />
        )}

        {/* Highlight particle glow at the leading edge */}
        {currentWidth > 0 && currentWidth < 100 && (
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 blur-[1px] rounded-full" />
        )}
      </div>
    </div>
  );
};
