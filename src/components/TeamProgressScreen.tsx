import React, { useState } from 'react';
import { StudentProposal } from '../types';
import { calculateTeamProgress } from '../utils/teamProgress';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Trophy, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Check,
  Lock,
  ChevronDown,
  Layers,
  Flame,
  Star
} from 'lucide-react';
import { XPProgressBar } from './ui/XPProgressBar';

interface TeamProgressScreenProps {
  proposals: StudentProposal[];
  onExploreCatalog: () => void;
  onOpenMyProposals: () => void;
}

export const TeamProgressScreen: React.FC<TeamProgressScreenProps> = ({
  proposals,
  onExploreCatalog,
  onOpenMyProposals,
}) => {
  const progress = calculateTeamProgress(proposals);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Helper for achievement icon
  const renderAchievementIcon = (iconName: string, isUnlocked: boolean) => {
    const colorClass = isUnlocked ? 'text-[#7047EB]' : 'text-[#98A2B3]';
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className={`w-5 h-5 ${isUnlocked ? 'text-[#149A8B]' : colorClass}`} />;
      case 'Award':
        return <Award className={`w-5 h-5 ${colorClass}`} />;
      case 'Trophy':
        return <Trophy className={`w-5 h-5 ${isUnlocked ? 'text-[#D97706]' : colorClass}`} />;
      default:
        return <CheckCircle2 className={`w-5 h-5 ${isUnlocked ? 'text-[#149A8B]' : colorClass}`} />;
    }
  };

  // Group achievements into: Unlocked, In Progress / Available, Locked
  const unlockedAchievements = progress.achievements.filter((a) => a.isUnlocked);
  const nextTargetAchievement = progress.achievements.find((a) => !a.isUnlocked);
  const otherLockedAchievements = progress.achievements.filter((a) => !a.isUnlocked && a.id !== nextTargetAchievement?.id);

  const visibleHistory = showAllHistory ? progress.xpHistory : progress.xpHistory.slice(0, 3);

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#667085]">
            <Sparkles className="w-3.5 h-3.5 text-[#7047EB]" />
            <span>Кабинет студенческой команды</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17171C] tracking-tight">
            Опыт и рост команды
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] max-w-xl">
            Баллы начисляются исключительно за реальные подтверждённые результаты этапов.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExploreCatalog}
            className="h-10 px-4 bg-white border border-[#E2E5EE] hover:bg-[#F4F5F9] text-[#17171C] text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <span>Найти задачу</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Grid Layout: 7 cols left / 5 cols right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Текущий уровень + История начислений */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Уровень и прогресс (Answer 1 & 2) */}
          <div className="bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F7]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F0ECFF] text-[#7047EB] flex items-center justify-center font-black">
                  <TrendingUp className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                    Текущий уровень команды
                  </div>
                  <h2 className="text-xl font-black text-[#17171C]">
                    {progress.levelInfo.name} · Уровень {progress.levelInfo.level}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-[#7047EB] tabular-nums">
                  {progress.totalXP}
                </span>
                <span className="text-xs font-bold text-[#667085] ml-1">
                  {progress.levelInfo.nextLevelXP ? `/ ${progress.levelInfo.nextLevelXP} XP` : 'XP'}
                </span>
              </div>
            </div>

            {/* Visual Level Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#17171C]">
                  {progress.xpRemaining > 0 ? (
                    <>До уровня «{progress.nextLevelName}» осталось <span className="text-[#7047EB]">{progress.xpRemaining} XP</span></>
                  ) : (
                    <span className="text-[#149A8B]">Максимальный уровень экспертизы</span>
                  )}
                </span>
                <span className="text-[#667085] tabular-nums">{progress.progressPercent}%</span>
              </div>

              <XPProgressBar
                value={progress.progressPercent}
                heightClass="h-3.5"
                showGlow={true}
                showShimmer={true}
              />
            </div>

            {/* Next Target / What to do next (Answer 3) */}
            {nextTargetAchievement && (
              <div className="p-3.5 bg-[#FAF8FF] border border-[#7047EB]/20 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#7047EB] text-white flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#17171C] truncate">
                      Ближайшая цель: {nextTargetAchievement.title}
                    </div>
                    <div className="text-[11px] text-[#667085] truncate">
                      {nextTargetAchievement.description}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenMyProposals}
                  className="px-3 py-1.5 bg-white border border-[#7047EB]/30 text-[#7047EB] hover:bg-[#F0ECFF] text-xs font-bold rounded-lg cursor-pointer shrink-0 transition-colors"
                >
                  К этапам
                </button>
              </div>
            )}
          </div>

          {/* Card 2: История начислений XP (Answer 4) */}
          <div className="bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F2F7]">
              <div>
                <h3 className="text-base font-black text-[#17171C]">
                  История начислений
                </h3>
                <p className="text-[11px] text-[#667085]">
                  Только реальные подтверждённые результаты от заказчиков
                </p>
              </div>
              <span className="text-xs font-bold text-[#667085] px-2 py-0.5 rounded bg-[#F4F5F9]">
                {progress.xpHistory.length} событий
              </span>
            </div>

            {progress.xpHistory.length === 0 ? (
              <div className="p-8 text-center space-y-2 bg-[#F8F9FD] rounded-xl border border-[#E2E5EE]">
                <Clock className="w-6 h-6 text-[#98A2B3] mx-auto" />
                <div className="text-xs font-bold text-[#17171C]">
                  Начислений пока нет
                </div>
                <p className="text-[11px] text-[#667085] max-w-xs mx-auto">
                  Сдайте результат первого этапа спринта в отклике, и после подтверждения заказчиком опыт будет начислен.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {visibleHistory.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl border border-[#E2E5EE] hover:border-[#7047EB]/30 bg-[#FCFCFD] transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#E8FAF7] text-[#149A8B] flex items-center justify-center font-black text-xs shrink-0">
                        +{ev.amount}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#17171C] truncate">
                          {ev.title}
                        </div>
                        <div className="text-[11px] text-[#667085] truncate">
                          {ev.companyName} • {ev.taskTitle}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-semibold text-[#667085]">
                        {ev.date}
                      </div>
                      <div className="text-[10px] font-bold text-[#149A8B]">
                        +{ev.amount} XP
                      </div>
                    </div>
                  </div>
                ))}

                {progress.xpHistory.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    className="w-full py-2 text-xs font-bold text-[#7047EB] hover:text-[#5E32DF] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{showAllHistory ? 'Свернуть историю' : `Показать все (${progress.xpHistory.length})`}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllHistory ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Достижения и статистика */}
        <div className="lg:col-span-5 space-y-6">
          {/* Statistics Card */}
          <div className="bg-white rounded-2xl border border-[#E2E5EE] p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Подтверждённая статистика
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E2E5EE]">
                <div className="text-lg font-black text-[#17171C] tabular-nums">
                  {progress.confirmedMilestonesCount}
                </div>
                <div className="text-[10px] font-semibold text-[#667085] mt-0.5">
                  Сдано этапов
                </div>
              </div>
              <div className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E2E5EE]">
                <div className="text-lg font-black text-[#7047EB] tabular-nums">
                  {progress.completedProjectsCount}
                </div>
                <div className="text-[10px] font-semibold text-[#667085] mt-0.5">
                  Проектов
                </div>
              </div>
              <div className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E2E5EE]">
                <div className="text-lg font-black text-[#149A8B] tabular-nums">
                  {progress.activeMilestonesCount}
                </div>
                <div className="text-[10px] font-semibold text-[#667085] mt-0.5">
                  В работе
                </div>
              </div>
            </div>
          </div>

          {/* Categorized Achievements Grid */}
          <div className="bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F2F7]">
              <div>
                <h3 className="text-base font-black text-[#17171C]">
                  Достижения команды
                </h3>
                <p className="text-[11px] text-[#667085]">
                  Условия и открытые бейджи
                </p>
              </div>
              <span className="text-xs font-bold text-[#7047EB] px-2 py-0.5 rounded bg-[#F0ECFF]">
                {unlockedAchievements.length} из {progress.achievements.length}
              </span>
            </div>

            <div className="space-y-3">
              {/* Unlocked */}
              {unlockedAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-3.5 rounded-xl border border-[#38BB78]/30 bg-[#E8FAF7]/20 flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-white text-[#149A8B] flex items-center justify-center shadow-2xs shrink-0 border border-[#2CC7B5]/20">
                    {renderAchievementIcon(ach.iconName, true)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-[#17171C] truncate">
                        {ach.title}
                      </h4>
                      <span className="text-[10px] font-black text-[#149A8B] flex items-center gap-0.5 shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Получено</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-[#667085] leading-snug mt-0.5">
                      {ach.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Next Target / Available */}
              {nextTargetAchievement && (
                <div
                  key={nextTargetAchievement.id}
                  className="p-3.5 rounded-xl border border-[#7047EB] ring-2 ring-[#7047EB]/10 bg-white shadow-xs flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#F0ECFF] text-[#7047EB] flex items-center justify-center shrink-0">
                    {renderAchievementIcon(nextTargetAchievement.iconName, false)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-[#7047EB] truncate">
                        {nextTargetAchievement.title}
                      </h4>
                      <span className="text-[10px] font-bold text-[#7047EB] px-2 py-0.2 rounded bg-[#F0ECFF] shrink-0">
                        В процессе
                      </span>
                    </div>
                    <p className="text-[11px] text-[#667085] leading-snug mt-0.5">
                      {nextTargetAchievement.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Locked */}
              {otherLockedAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-3 rounded-xl border border-dashed border-[#E2E5EE] bg-[#F9FAFC] opacity-60 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#EAECEF] text-[#98A2B3] flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#667085] truncate">
                      {ach.title}
                    </h4>
                    <p className="text-[10px] text-[#98A2B3] leading-snug mt-0.5">
                      {ach.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
