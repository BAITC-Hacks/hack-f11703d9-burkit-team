import React, { useState, useEffect } from 'react';
import { RatingBreakdown, Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Zap,
  ChevronDown,
  Layers,
  FileText,
  Database,
  Target,
  Sliders,
  Users,
  MessageSquare
} from 'lucide-react';
import { ContextHelp } from './ui/ContextHelp';

interface RatingPanelProps {
  rating: RatingBreakdown;
  hasUnsavedChanges: boolean;
  onApplySuggestion: (suggestionId: string) => void;
  onOpenMissionField?: (field: keyof Task) => void;
  onConfirmChanges: () => void;
  scoreGained?: number | null;
}

export const RatingPanel: React.FC<RatingPanelProps> = ({
  rating,
  hasUnsavedChanges,
  onApplySuggestion,
  onOpenMissionField,
  onConfirmChanges,
  scoreGained = null,
}) => {
  const [showAllCriteria, setShowAllCriteria] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // 4 Levels track: Черновик (0-39) -> Рабочая (40-69) -> Готовая (70-89) -> Приоритетная (90-100)
  const levels = [
    { id: 'draft', label: 'Черновик', min: 0, max: 39 },
    { id: 'working', label: 'Рабочая', min: 40, max: 69 },
    { id: 'ready', label: 'Готовая', min: 70, max: 89 },
    { id: 'priority', label: 'Приоритетная', min: 90, max: 100 },
  ];

  const currentLevelIndex = levels.findIndex((l) => l.id === rating.readinessLevel) >= 0
    ? levels.findIndex((l) => l.id === rating.readinessLevel)
    : rating.totalScore >= 90 ? 3 : rating.totalScore >= 70 ? 2 : rating.totalScore >= 40 ? 1 : 0;

  // Calculate points to next level
  const getPointsToNextLevel = () => {
    if (rating.totalScore < 40) return { points: 40 - rating.totalScore, nextLabel: 'Рабочая' };
    if (rating.totalScore < 70) return { points: 70 - rating.totalScore, nextLabel: 'Готовая' };
    if (rating.totalScore < 90) return { points: 90 - rating.totalScore, nextLabel: 'Приоритетная' };
    return { points: 0, nextLabel: 'Максимальный уровень' };
  };

  const nextLvl = getPointsToNextLevel();

  // Watch for level transition celebration
  useEffect(() => {
    if (scoreGained && scoreGained > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [scoreGained]);

  // Visual styling based on readiness level
  const getLevelBadge = () => {
    switch (rating.readinessLevel) {
      case 'priority':
        return {
          bg: 'bg-[#7047EB] text-white',
          ringColor: '#7047EB',
          textColor: 'text-[#7047EB]',
        };
      case 'ready':
        return {
          bg: 'bg-[#2CC7B5] text-white',
          ringColor: '#2CC7B5',
          textColor: 'text-[#149A8B]',
        };
      case 'working':
        return {
          bg: 'bg-[#FFC44D] text-[#92400E]',
          ringColor: '#FFC44D',
          textColor: 'text-[#D97706]',
        };
      default:
        return {
          bg: 'bg-[#FF6266] text-white',
          ringColor: '#FF6266',
          textColor: 'text-[#DC2626]',
        };
    }
  };

  const lvlBadge = getLevelBadge();

  // SVG Circular Ring calculation
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rating.totalScore / 100) * circumference;

  // Mission Icon
  const getMissionIcon = (id: string) => {
    switch (id) {
      case 'm1': return FileText;
      case 'm2': return Database;
      case 'm3': return Layers;
      case 'm4': return Target;
      case 'm5': return Sliders;
      case 'm6': return Users;
      case 'm7': return MessageSquare;
      default: return Check;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E5EE] p-5 shadow-xs space-y-5 relative">
      {/* Celebration Banner */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="p-3 bg-gradient-to-r from-[#7047EB] to-[#2CC7B5] text-white rounded-xl shadow-md flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFC44D]" />
              <div>
                <div className="text-xs font-black">
                  +{scoreGained} баллов подтверждено!
                </div>
                <div className="text-[10px] text-white/90">
                  Готовность выросла. Задача получает больший приоритет.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="text-white/80 hover:text-white text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Кольцо рейтинга + Текущий уровень (Requirement 4.1 & 4.2) */}
      <div className="space-y-4 pb-4 border-b border-[#E2E5EE]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-[#17171C] uppercase tracking-wider">
              Рейтинг задачи
            </span>
            <ContextHelp topic="readiness" />
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${lvlBadge.bg}`}>
            {rating.readinessLabel}
          </span>
        </div>

        {/* Ring & Points to next level (Requirement 4.3) */}
        <div className="flex items-center gap-4">
          <div className="relative w-22 h-22 shrink-0 flex items-center justify-center">
            <svg className="w-22 h-22 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-[#F0F2F7]"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                stroke={lvlBadge.ringColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-xl font-black font-mono tracking-tight leading-none ${lvlBadge.textColor}`}>
                {rating.totalScore}
              </span>
              <span className="text-[10px] font-bold text-[#667085] mt-0.5">из 100</span>
            </div>
          </div>

          <div className="space-y-1 min-w-0">
            {nextLvl.points > 0 ? (
              <div className="text-xs font-bold text-[#17171C]">
                До уровня «{nextLvl.nextLabel}» осталось{' '}
                <span className="text-[#7047EB]">+{nextLvl.points} баллов</span>
              </div>
            ) : (
              <div className="text-xs font-bold text-[#149A8B] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Максимальный приоритет!</span>
              </div>
            )}
            <p className="text-[11px] text-[#667085] leading-snug">
              Баллы начисляются только за подтверждённые сведения после сохранения.
            </p>
          </div>
        </div>

        {/* Level Track */}
        <div className="grid grid-cols-4 gap-1 text-center pt-1">
          {levels.map((lvl, index) => {
            const isPassed = rating.totalScore >= lvl.min;
            const isCurrent = currentLevelIndex === index;
            return (
              <div key={lvl.id} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    isPassed ? 'bg-[#7047EB]' : 'bg-[#E2E5EE]'
                  }`}
                />
                <span
                  className={`text-[10px] block truncate font-bold ${
                    isCurrent ? 'text-[#7047EB]' : isPassed ? 'text-[#17171C]' : 'text-[#98A2B3]'
                  }`}
                >
                  {lvl.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-[#FFF8E7] border border-[#FFC44D]/50 rounded-xl space-y-2"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#92400E]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706]" />
            <span>Есть неподтверждённые изменения</span>
          </div>
          <p className="text-[11px] text-[#475467] leading-relaxed font-medium">
            Сохраните карточку для обновления рейтинга.
          </p>
          <button
            type="button"
            onClick={onConfirmChanges}
            className="w-full h-8 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Подтвердить изменения</span>
          </button>
        </motion.div>
      )}

      {/* 4. Следующее рекомендуемое действие (Requirement 4.4) */}
      {rating.nextBestStep && (
        <div className="p-4 rounded-xl bg-[#F0ECFF] border border-[#7047EB]/20 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#7047EB]">
            <Zap className="w-4 h-4 fill-[#7047EB]" />
            <span>Следующее рекомендуемое действие</span>
          </div>
          <p className="text-xs text-[#17171C] font-semibold leading-snug">
            {rating.nextBestStep.text}
          </p>
          <button
            type="button"
            onClick={() => {
              if (rating.nextBestStep?.field && onOpenMissionField) {
                onOpenMissionField(rating.nextBestStep.field);
              }
            }}
            className="h-8 px-3.5 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>{rating.nextBestStep.buttonLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5. Кнопка «Показать все критерии» (Requirement 4.5) */}
      <div>
        <button
          type="button"
          onClick={() => setShowAllCriteria(!showAllCriteria)}
          className="w-full py-2.5 px-3 bg-[#F4F5F9] hover:bg-[#EBECEF] text-[#17171C] text-xs font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer border border-[#E2E5EE]"
        >
          <span>{showAllCriteria ? 'Скрыть критерии' : 'Показать все критерии'}</span>
          <motion.div
            animate={{ rotate: showAllCriteria ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-[#667085]" />
          </motion.div>
        </button>

        {/* Collapsible list of missions inside panel */}
        <AnimatePresence initial={false}>
          {showAllCriteria && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden pt-3 space-y-2"
            >
              {rating.missions.map((mission) => {
                const IconComponent = getMissionIcon(mission.id);
                return (
                  <div
                    key={mission.id}
                    onClick={() => {
                      if (onOpenMissionField) {
                        onOpenMissionField(mission.field);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      mission.status === 'confirmed'
                        ? 'bg-[#E8FAF7]/40 border-[#38BB78]/30 hover:border-[#38BB78]'
                        : 'bg-[#F9FAFC] border-[#E2E5EE] hover:border-[#7047EB]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                          mission.status === 'confirmed'
                            ? 'bg-[#38BB78]/15 text-[#258B55]'
                            : 'bg-[#EAECEF] text-[#667085]'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#17171C] truncate">
                          {mission.title}
                        </div>
                        <div className="text-[10px] text-[#667085] truncate">
                          {mission.status === 'confirmed' ? 'Подтверждено' : 'Не заполнено'}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-black shrink-0 ${
                        mission.status === 'confirmed' ? 'text-[#149A8B]' : 'text-[#667085]'
                      }`}
                    >
                      +{mission.maxScore} б.
                    </span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
