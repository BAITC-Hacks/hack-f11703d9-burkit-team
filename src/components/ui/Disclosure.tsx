import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface DisclosureProps {
  initialOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  showText?: string;
  hideText?: string;
  title?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Disclosure: React.FC<DisclosureProps> = ({
  initialOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  showText = 'Показать детали',
  hideText = 'Скрыть детали',
  title,
  badge,
  children,
  className = '',
}) => {
  const [internalOpen, setInternalOpen] = useState(initialOpen);
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalOpen;

  const handleToggle = () => {
    const next = !open;
    if (!isControlled) {
      setInternalOpen(next);
    }
    if (onToggle) {
      onToggle(next);
    }
  };

  return (
    <div className={`transition-all ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between text-left py-2 px-1 text-xs font-bold text-[#667085] hover:text-[#7047EB] transition-colors cursor-pointer group select-none"
      >
        <div className="flex items-center gap-2">
          {title ? (
            <span className="text-[#17171C] group-hover:text-[#7047EB] font-bold">{title}</span>
          ) : (
            <span>{open ? hideText : showText}</span>
          )}
          {badge}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#7047EB]">
          {title && <span className="font-semibold text-[11px]">{open ? hideText : showText}</span>}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="inline-block"
          >
            <ChevronDown className="w-4 h-4 text-[#7047EB]" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
