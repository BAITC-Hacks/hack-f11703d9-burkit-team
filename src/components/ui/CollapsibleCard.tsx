import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CollapsibleCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  subtitle,
  icon,
  badge,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  children,
  className = '',
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-[#E2E5EE] transition-all overflow-hidden shadow-2xs hover:border-[#7047EB]/30 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#F8F9FC]/60 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-[#F0ECFF] text-[#7047EB] flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-[#17171C]">{title}</span>
              {badge}
            </div>
            {subtitle && (
              <p className="text-[11px] text-[#667085] truncate mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-7 h-7 rounded-lg bg-[#F4F5F9] text-[#667085] flex items-center justify-center shrink-0"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-[#F0F2F7]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
