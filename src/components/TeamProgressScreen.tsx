import React from 'react';
import { StudentProposal } from '../types';
import { calculateTeamProgress } from '../utils/teamProgress';
import { motion } from 'motion/react';
import { 
  Award, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  Trophy, 
  Clock, 
  ArrowRight,
  TrendingUp,
  FolderCheck,
  Check
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

  // Helper for achievement icon
  const renderAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-[#2CC7B5]" />;
      case 'Award':
        return <Award className="w-5 h-5 text-[#7047EB]" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-[#FFC44D]" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-[#38BB78]" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
      {/* 1 H1 and 1-line subtitle (Requirement 2 & 17) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#2CC7B5]/10 text-[#149A8B] text-xs font-bold border border-[#2CC7B5]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Опыт и развитие команды</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#17171C] tracking-tight">
          Прогресс студенческой команды
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] max-w-2xl">
          Опыт начисляется исключительно за подтверждённые бизнесом этапы прикладных задач.
        </p>
      </div>

      {/* 12-Column Grid (7 cols / 5 cols, gap 24px) per Requirement 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (7 cols): Текущий уровень + История XP */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* Area 1: Текущий уровень */}
          <div className="bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F7]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#F0ECFF] text-[#7047EB] flex items-center justify-center font-black">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                    Текущий уровень
                  </div>
                  <h2 className="text-lg font-black text-[#17171C]">
                    {progress.levelInfo.name} · Уровень {progress.levelInfo.level}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-[#7047EB] tabular-nums">
                  {progress.totalXP}
                </span>
                <span className="text-xs font-bold text-[#667085] ml-1">
                  {progress.levelInfo.nextLevelXP ? `/ ${progress.levelInfo.nextLevelXP} XP` : 'XP'}
                </span>
              </div>
            </div>

            {/* Progress Bar with smooth CSS transition & shimmer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#17171C]">
                  {progress.xpRemaining > 0 ? (
                    <>До уровня «{progress.nextLevelName}» осталось <span className="text-[#7047EB]">{progress.xpRemaining} XP</span></>
                  ) : (
                    <span className="text-[#149A8B]">Достигнут высший уровень экспертизы!</span>
                  )}
                </span>
                <span className="text-[#667085] tabular-nums">{progress.progressPercent}%</span>
              </div>

              <XPProgressBar
                progressPercent={progress.progressPercent}
                heightClass="h-3.5"
                showGlow={true}
                showShimmer={true}
              />
            </div>

            {/* Last Award Banner */}
            {progress.lastAward ? (
              <div className="p-3.5 bg-[#FAF8FF] border border-[#7047EB]/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#7047EB] text-white flex items-center justify-center font-bold text-xs">
                    +{progress.lastAward.amount}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#17171C]">
                      Последнее начисление: +{progress.lastAward.amount} XP за подтверждённый этап
                    </div>
                    <div className="text-[11px] text-[#667085]">
                      {progress.lastAward.companyName} · {progress.lastAward.date}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#7047EB] px-2 py-0.5 rounded bg-white border border-[#7047EB]/20">
                  Подтверждено
                </span>
              </div>
            ) : (
              <div className="p-3 bg-[#F8F9FC] border border-[#E2E5EE] rounded-xl text-xs text-[#667085]">
                Баллы начисляются после подтверждения этапа заказчиком.
              </div>
            )}
          </div>

          {/* Area 3: История XP */}
          <div className="bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-4 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F2F7]">
              <div>
                <h2 className="text-base font-extrabold text-[#17171C]">
                  История начислений XP
                </h2>
                <p className="text-[11px] text-[#667085]">
                  Фиксируются только реальные подтверждения от заказчиков
                </p>
              </div>
              <span className="text-xs font-bold text-[#667085] px-2 py-0.5 rounded bg-[#F4F5F9]">
                {progress.xpHistory.length} событий
              </span>
            </div>

            {progress.xpHistory.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#F4F5F9] text-[#667085] flex items-center justify-center mx-auto">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#17171C]">
                  Событий начисления пока нет
                </div>
                <p className="text-[11px] text-[#667085] max-w-xs mx-auto">
                  Отправьте результат этапа в отклике, и после проверки бизнесом здесь появится первое начисление.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {progress.xpHistory.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl border border-[#E2E5EE] hover:border-[#7047EB]/30 bg-[#FBFBFE] transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#E8FAF7] text-[#149A8B] flex items-center justify-center font-black text-xs shrink-0">
                        +{ev.amount}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#17171C] truncate">
                          {ev.title}
                        </div>
                        <div className="text-[11px] text-[#667085] flex items-center gap-2 truncate">
                          <span className="font-semibold text-[#17171C]">{ev.companyName}</span>
                          <span>•</span>
                          <span className="truncate">{ev.taskTitle}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-semibold text-[#667085]">
                        {ev.date}
                      </div>
                      <div className="text-[10px] font-bold text-[#149A8B]">
                        + {ev.amount} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Подтверждённые результаты + Достижения */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {/* Area 2: Подтверждённые результаты */}
          <div className="bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-[#17171C]">
                Подтверждённые результаты
              </h2>
              <p className="text-[11px] text-[#667085]">
                Фактическая статистика работы с бизнес-кейсами
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E2E5EE] text-center">
                <div className="text-xl font-black text-[#17171C] tabular-nums">
                  {progress.confirmedMilestonesCount}
                </div>
                <div className="text-[10px] font-bold text-[#667085] mt-0.5">
                  Завершено этапов
                </div>
              </div>

              <div className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E2E5EE] text-center">
                <div className="text-xl font-black text-[#7047EB] tabular-nums">
                  {progress.completedProjectsCount}
                </div>
                <div className="text-[10px] font-bold text-[#667085] mt-0.5">
                  Проектов сдано
                </div>
              </div>

              <div className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E2E5EE] text-center">
                <div className="text-xl font-black text-[#2CC7B5] tabular-nums">
                  {progress.activeMilestonesCount}
                </div>
                <div className="text-[10px] font-bold text-[#667085] mt-0.5">
                  Активных этапов
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenMyProposals}
                className="w-full h-10 px-4 bg-[#F4F5F9] hover:bg-[#EBECEF] text-[#17171C] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#E2E5EE]"
              >
                <span>Перейти к этапам в откликах</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Area 4: Достижения */}
          <div className="bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-4 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F2F7]">
              <div>
                <h2 className="text-base font-extrabold text-[#17171C]">
                  Достижения команды
                </h2>
                <p className="text-[11px] text-[#667085]">
                  Открываются только за реальные подтверждения
                </p>
              </div>
              <span className="text-xs font-bold text-[#7047EB] px-2 py-0.5 rounded bg-[#F0ECFF]">
                {progress.achievements.filter(a => a.isUnlocked).length} из {progress.achievements.length}
              </span>
            </div>

            <div className="space-y-3">
              {progress.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    ach.isUnlocked
                      ? 'bg-white border-[#E2E5EE] shadow-2xs'
                      : 'bg-[#F9FAFC] border-dashed border-[#E2E5EE] opacity-60'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    ach.isUnlocked ? 'bg-[#F4F5F9]' : 'bg-[#EAECEF] text-[#98A2B3]'
                  }`}>
                    {renderAchievementIcon(ach.iconName)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className={`text-xs font-bold truncate ${
                        ach.isUnlocked ? 'text-[#17171C]' : 'text-[#667085]'
                      }`}>
                        {ach.title}
                      </h3>
                      {ach.isUnlocked && (
                        <span className="text-[10px] font-extrabold text-[#149A8B] flex items-center gap-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Получено</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#667085] leading-snug mt-0.5">
                      {ach.description}
                    </p>
                    {ach.unlockedAt && (
                      <div className="text-[10px] text-[#98A2B3] mt-1">
                        Дата: {ach.unlockedAt}
                      </div>
                    )}
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
