import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

interface AccordionItemProps {
  id?: string;
  stepNumber?: number;
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  summary?: string;
  isFilled?: boolean;
  isCompleted?: boolean;
  badgeText?: string;
  scoreBonus?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  stepNumber,
  icon: Icon,
  title,
  subtitle,
  summary,
  isFilled,
  isCompleted,
  badgeText,
  scoreBonus,
  isOpen,
  onToggle,
  children,
}) => {
  const completed = isCompleted ?? isFilled ?? false;
  const displaySubtitle = !isOpen && summary ? summary : subtitle;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E5EE] shadow-xs overflow-hidden transition-colors hover:border-[#7047EB]/30">
      {/* Header Button */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors bg-white hover:bg-[#FBFBFE]"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Step Number Badge */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
              completed
                ? 'bg-[#38BB78]/15 text-[#258B55] border border-[#38BB78]/30'
                : 'bg-[#F0ECFF] text-[#7047EB] border border-[#E2E5EE]'
            }`}
          >
            {completed ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : (stepNumber ?? '•')}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-[#17171C]">{title}</span>
              {badgeText ? (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  completed ? 'text-[#258B55] bg-[#38BB78]/15' : 'text-[#D97706] bg-[#FFC44D]/20'
                }`}>
                  {badgeText}
                </span>
              ) : completed ? (
                <span className="text-[11px] font-bold text-[#258B55] bg-[#38BB78]/15 px-2 py-0.5 rounded-md">
                  Заполнено
                </span>
              ) : (
                <span className="text-[11px] font-bold text-[#D97706] bg-[#FFC44D]/20 px-2 py-0.5 rounded-md">
                  Требует данных
                </span>
              )}
            </div>
            {displaySubtitle && (
              <p className="text-xs text-[#667085] font-medium mt-0.5 truncate">{displaySubtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {scoreBonus && (
            <span className="text-xs font-black text-[#7047EB] bg-[#F0ECFF] px-2.5 py-1 rounded-lg hidden sm:inline-block">
              {scoreBonus}
            </span>
          )}
          <span className="text-xs font-bold text-[#7047EB] hidden md:inline">
            {isOpen ? 'Свернуть' : 'Раскрыть'}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-[#667085]"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-[#F0F2F7] bg-white">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
