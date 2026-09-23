import React from 'react';
import { UserRole, Task, StudentProposal } from '../types';
import { calculateTeamProgress } from '../utils/teamProgress';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Users, 
  FolderSearch, 
  Clock, 
  CheckCircle2, 
  Building2,
  TrendingUp,
  Sliders,
  ChevronRight,
  Award
} from 'lucide-react';
import { XPProgressBar } from './ui/XPProgressBar';

interface OverviewScreenProps {
  userRole: UserRole;
  tasks: Task[];
  proposals: StudentProposal[];
  currentTask?: Task;
  onNavigateToCatalog?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToEdit?: (task: Task) => void;
  onNavigateToProposals?: () => void;
  onNavigateToMyProposals?: () => void;
  onNavigateToStudentTask?: (task: Task) => void;
  onNavigateToProgress?: () => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  userRole,
  tasks,
  proposals,
  currentTask = tasks[0],
  onNavigateToCatalog,
  onNavigateToCreate,
  onNavigateToEdit,
  onNavigateToProposals,
  onNavigateToMyProposals,
  onNavigateToStudentTask,
  onNavigateToProgress,
}) => {
  // Navigation fallbacks
  const handleCatalog = onNavigateToCatalog || (() => {});
  const handleCreate = onNavigateToCreate || (() => {});
  const handleEdit = () => {
    if (onNavigateToEdit && currentTask) onNavigateToEdit(currentTask);
    else handleCatalog();
  };
  const handleProposals = onNavigateToProposals || (() => {});
  const handleMyProposals = onNavigateToMyProposals || (() => {});
  const handleStudentTask = (task?: Task) => {
    if (onNavigateToStudentTask && task) onNavigateToStudentTask(task);
    else handleCatalog();
  };
  const handleProgress = onNavigateToProgress || (() => {});

  // Compute team progress dynamically from real proposals
  const teamProgress = calculateTeamProgress(proposals);

  // Active / latest proposal for students
  const activeProposal = proposals.find(p => p.status === 'accepted') || proposals[0];
  const nearestMilestone = activeProposal?.milestones?.find(m => m.status === 'submitted' || m.status === 'pending') 
    || activeProposal?.milestones?.[0];

  // Business metrics
  const totalTasks = tasks.length;
  const readyTasks = tasks.filter(t => t.rating.totalScore >= 70).length;
  const pendingResponses = proposals.filter(p => p.status === 'new' || p.status === 'pending').length;

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-7 max-w-7xl mx-auto w-full">
      {userRole === 'business' ? (
        /* ================= BUSINESS OVERVIEW ================= */
        <>
          {/* Header zone with 1 H1 and 1 short subtitle (Requirement 2) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#7047EB]/10 text-[#7047EB] text-xs font-bold border border-[#7047EB]/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Кабинет бизнеса</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#17171C] tracking-tight">
                Управление практическими задачами
              </h1>
              <p className="text-xs sm:text-sm text-[#667085] max-w-xl">
                Формулируйте прикладные вызовы, повышайте рейтинг карточки и привлекайте сильные студенческие команды.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-2 bg-white rounded-xl border border-[#E2E5EE] shadow-2xs text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">Задач</div>
                <div className="text-base font-black text-[#17171C]">{totalTasks}</div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border border-[#E2E5EE] shadow-2xs text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#149A8B]">Готовых</div>
                <div className="text-base font-black text-[#149A8B]">{readyTasks}</div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border border-[#E2E5EE] shadow-2xs text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7047EB]">Новых откликов</div>
                <div className="text-base font-black text-[#7047EB]">+{pendingResponses}</div>
              </div>
            </div>
          </div>

          {/* 3 Main Action Cards (Equal height & button baseline) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Card 1: Создать задачу */}
            <motion.div
              whileHover={{ y: -3 }}
              className="p-6 bg-white rounded-2xl border border-[#E2E5EE] hover:border-[#7047EB] transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F0ECFF] text-[#7047EB] flex items-center justify-center shadow-2xs">
                  <PlusCircle className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-black text-[#17171C]">
                    Создать задачу
                  </h2>
                  <p className="text-xs text-[#667085] leading-relaxed line-clamp-3">
                    Пошаговый мастер поможет сформулировать бизнес-контекст, описать данные и критерии успеха без технической сложности.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="w-full h-11 px-4 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Создать новую задачу</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Card 2: Улучшить задачу */}
            <motion.div
              whileHover={{ y: -3 }}
              className="p-6 bg-white rounded-2xl border border-[#E2E5EE] hover:border-[#7047EB] transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#E8FAF7] text-[#149A8B] flex items-center justify-center shadow-2xs">
                    <Sliders className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  {currentTask && (
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-[#F0ECFF] text-[#7047EB]">
                      {currentTask.rating.totalScore} / 100 б.
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-black text-[#17171C]">
                    Улучшить задачу
                  </h2>
                  {currentTask ? (
                    <>
                      <div className="text-xs font-bold text-[#7047EB] truncate">
                        {currentTask.title}
                      </div>
                      <p className="text-xs text-[#667085] leading-relaxed line-clamp-2">
                        {currentTask.rating.nextBestStep?.text || 'Добавьте детали, чтобы повысить рейтинг карточки и привлечь лучших исполнителей.'}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-[#667085] line-clamp-3">
                      Проверьте текущие карточки в каталоге и дополните их подсказками TALAP.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="w-full h-11 px-4 bg-white hover:bg-[#F9F7FF] border border-[#7047EB] text-[#7047EB] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Дополнить карточку</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Card 3: Сравнить команды */}
            <motion.div
              whileHover={{ y: -3 }}
              className="p-6 bg-white rounded-2xl border border-[#E2E5EE] hover:border-[#7047EB] transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] text-[#D97706] flex items-center justify-center shadow-2xs">
                    <Users className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FFF8E7] text-[#92400E]">
                    {proposals.length} откликов
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-black text-[#17171C]">
                    Сравнить команды
                  </h2>
                  <p className="text-xs text-[#667085] leading-relaxed line-clamp-3">
                    Изучите предложенные архитектурные идеи, стек и этапы студенческих команд. Выберите команду для запуска спринта.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleProposals}
                  className="w-full h-11 px-4 bg-white hover:bg-[#F4F5F9] border border-[#E2E5EE] text-[#17171C] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Открыть отклики</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        /* ================= STUDENT OVERVIEW ================= */
        /* Requirement 15: Exactly 4 elements, equal height & visual balance */
        <>
          {/* Header Zone with 1 H1 and 1 short subtitle (Requirement 2 & 17) */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#2CC7B5]/10 text-[#149A8B] text-xs font-bold border border-[#2CC7B5]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Кабинет студенческой команды</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17171C] tracking-tight">
              Обзор возможностей и прогресса
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] max-w-xl">
              Решайте прикладные вызовы от реального бизнеса, зарабатывайте подтверждённый XP и формируйте портфолио.
            </p>
          </div>

          {/* 4 Cards Grid (2x2 on desktop, equal height, balanced) per Requirement 10 & 15 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* 1. Главное рекомендуемое действие */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-6 bg-white rounded-2xl border border-[#E2E5EE] hover:border-[#2CC7B5] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#E8FAF7] text-[#149A8B] flex items-center justify-center shadow-2xs">
                    <FolderSearch className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#E8FAF7] text-[#149A8B]">
                    Рекомендация
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-base font-black text-[#17171C]">
                    Найти новую задачу бизнеса
                  </h2>
                  <p className="text-xs text-[#667085] leading-relaxed line-clamp-3">
                    В каталоге размещены подтверждённые задачи от Kolesa Group, Choco и других партнёров с понятными вводными данными.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleCatalog}
                  className="w-full h-11 px-4 bg-[#2CC7B5] hover:bg-[#20AE9D] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Открыть каталог задач</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* 2. Текущий отклик или проект */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-6 bg-white rounded-2xl border border-[#E2E5EE] hover:border-[#7047EB] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#F0ECFF] text-[#7047EB] flex items-center justify-center shadow-2xs">
                    <FileText className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  {activeProposal && (
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md ${
                      activeProposal.status === 'accepted'
                        ? 'bg-[#E8FAF7] text-[#149A8B]'
                        : 'bg-[#FFF8E7] text-[#92400E]'
                    }`}>
                      {activeProposal.status === 'accepted' ? 'В работе' : 'На рассмотрении'}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-base font-black text-[#17171C]">
                    Текущий отклик
                  </h2>
                  {activeProposal ? (
                    <>
                      <div className="text-xs font-bold text-[#7047EB] truncate">
                        {activeProposal.taskTitle}
                      </div>
                      <p className="text-xs text-[#667085] leading-relaxed line-clamp-2">
                        Компания: {activeProposal.companyName}. Срок: {activeProposal.timeline}. Статус этапов отслеживается в деталях.
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-[#667085] line-clamp-3">
                      У вас пока нет активных откликов. Выберите задачу в каталоге.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleMyProposals}
                  className="w-full h-11 px-4 bg-white hover:bg-[#F9F7FF] border border-[#7047EB] text-[#7047EB] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Перейти к моим откликам</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* 3. Опыт команды (Widget per Requirement 10) */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-6 bg-white rounded-2xl border border-[#E2E5EE] hover:border-[#7047EB] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-xl bg-[#F0ECFF] text-[#7047EB] flex items-center justify-center shadow-2xs">
                      <TrendingUp className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                        Опыт команды
                      </div>
                      <h2 className="text-sm font-black text-[#17171C]">
                        {teamProgress.levelInfo.name} · Уровень {teamProgress.levelInfo.level}
                      </h2>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-[#7047EB] tabular-nums">
                      {teamProgress.totalXP}
                    </span>
                    <span className="text-xs font-bold text-[#667085] ml-1">
                      {teamProgress.levelInfo.nextLevelXP ? `/ ${teamProgress.levelInfo.nextLevelXP} XP` : 'XP'}
                    </span>
                  </div>
                </div>

                {/* Progress bar with smooth CSS transition & shimmer */}
                <div className="space-y-1.5 pt-1">
                  <XPProgressBar
                    progressPercent={teamProgress.progressPercent}
                    heightClass="h-2.5"
                    showGlow={true}
                    showShimmer={true}
                  />
                  <div className="text-[11px] font-semibold text-[#667085] flex items-center justify-between">
                    <span>
                      {teamProgress.xpRemaining > 0 
                        ? `До уровня «${teamProgress.nextLevelName}» осталось ${teamProgress.xpRemaining} XP` 
                        : 'Высший уровень'}
                    </span>
                  </div>
                </div>

                {/* Last award snippet (Requirement 10) */}
                {teamProgress.lastAward && (
                  <div className="p-2.5 rounded-lg bg-[#FAF8FF] border border-[#7047EB]/15 text-[11px] font-medium text-[#17171C] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#149A8B]" />
                    <span className="truncate">
                      Последнее начисление: +{teamProgress.lastAward.amount} XP за подтверждённый этап
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={handleProgress}
                  className="w-full h-11 px-4 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>История прогресса</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* 4. Ближайший этап */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-6 bg-white rounded-2xl border border-[#E2E5EE] hover:border-[#2CC7B5] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#FFF8E7] text-[#D97706] flex items-center justify-center shadow-2xs">
                    <Clock className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  {nearestMilestone && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FFF8E7] text-[#92400E]">
                      +{nearestMilestone.points} XP
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-base font-black text-[#17171C]">
                    Ближайший этап
                  </h2>
                  {nearestMilestone ? (
                    <>
                      <div className="text-xs font-bold text-[#17171C] truncate">
                        {nearestMilestone.title}
                      </div>
                      <p className="text-xs text-[#667085] leading-relaxed line-clamp-2">
                        {nearestMilestone.description || 'Сдайте результат этапа бизнесу на проверку для начисления опыта команде.'}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-[#667085] line-clamp-3">
                      Все активные этапы завершены или команда ожидает подтверждения от заказчика.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleMyProposals}
                  className="w-full h-11 px-4 bg-white hover:bg-[#F4F5F9] border border-[#E2E5EE] text-[#17171C] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Сдать результат этапа</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};
