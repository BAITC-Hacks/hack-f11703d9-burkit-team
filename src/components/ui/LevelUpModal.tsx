import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, ArrowRight, X } from 'lucide-react';
import { TeamLevelInfo } from '../../types';

interface LevelUpModalProps {
  isOpen: boolean;
  levelInfo: TeamLevelInfo | null;
  onClose: () => void;
  onViewProgress: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  levelInfo,
  onClose,
  onViewProgress,
}) => {
  if (!isOpen || !levelInfo) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        {/* Soft color wave background behind the modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-[#7047EB]/20 via-[#2CC7B5]/20 to-transparent blur-3xl pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative bg-white border border-[#E2E5EE] shadow-[0_20px_50px_rgba(112,71,235,0.18)] rounded-3xl max-w-md w-full p-7 text-center overflow-hidden"
        >
          {/* Subtle decorative particles */}
          <div className="absolute top-4 left-6 w-2 h-2 rounded-full bg-[#7047EB]/40 animate-ping" />
          <div className="absolute top-10 right-8 w-2.5 h-2.5 rounded-full bg-[#2CC7B5]/50 animate-pulse" />
          <div className="absolute bottom-6 left-10 w-2 h-2 rounded-full bg-[#FFC44D]/60 animate-bounce" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#98A2B3] hover:text-[#17171C] p-1.5 rounded-xl hover:bg-[#F4F5F9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7047EB] to-[#2CC7B5] text-white flex items-center justify-center mx-auto mb-4 shadow-[0_8px_20px_rgba(112,71,235,0.3)]">
            <Award className="w-8 h-8 stroke-[2.2]" />
          </div>

          {/* Texts */}
          <div className="space-y-2 mb-6">
            <div className="text-xs font-black uppercase tracking-wider text-[#7047EB]">
              Уровень повышен · Уровень {levelInfo.level}
            </div>
            <h3 className="text-2xl font-black text-[#17171C] tracking-tight">
              Новый уровень: {levelInfo.name}
            </h3>
            <p className="text-sm text-[#667085] leading-relaxed max-w-xs mx-auto">
              Команда получила достаточно подтверждённого опыта за выполненные этапы задач бизнеса.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewProgress();
              }}
              className="w-full sm:flex-1 h-11 px-4 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(112,71,235,0.3)]"
            >
              <span>Посмотреть прогресс</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-11 px-4 bg-white border border-[#E2E5EE] hover:bg-[#F4F5F9] text-[#17171C] text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Продолжить
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
