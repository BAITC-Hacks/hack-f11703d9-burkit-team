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
        <>
          {/* 1. Compact Team Progress Banner */}
          <div className="bg-white rounded-2xl border border-[#E2E5EE] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7047EB] to-[#2CC7B5] text-white flex items-center justify-center font-black text-base shadow-sm">
                  KI
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-[#17171C]">
                      KBTU Innovators
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-[#F0ECFF] text-[#7047EB] text-[11px] font-bold border border-[#7047EB]/20">
                      Уровень {teamProgress.levelInfo.level} · {teamProgress.levelInfo.name}
                    </span>
                  </div>
                  <p className="text-xs text-[#667085] mt-0.5">
                    Казахстанско-Британский технический университет
                  </p>
                </div>
              </div>

              {/* XP Counter */}
              <div className="flex items-baseline sm:flex-col sm:items-end gap-1.5 shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#7047EB] tabular-nums">
                    {teamProgress.totalXP}
                  </span>
                  <span className="text-xs font-bold text-[#667085]">
                    {teamProgress.levelInfo.nextLevelXP ? `/ ${teamProgress.levelInfo.nextLevelXP} XP` : 'XP'}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-[#149A8B]">
                  {teamProgress.xpRemaining > 0 
                    ? `Осталось ${teamProgress.xpRemaining} XP до «${teamProgress.nextLevelName}»`
                    : 'Максимальный уровень'}
                </div>
              </div>
            </div>

            {/* Visual Level Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#667085]">
                <span>Прогресс уровня</span>
                <span className="text-[#7047EB]">{teamProgress.progressPercent}%</span>
              </div>
              <XPProgressBar
                value={teamProgress.progressPercent}
                heightClass="h-2.5"
                showGlow={true}
                showShimmer={true}
              />
            </div>

            {/* Last Award Snippet */}
            {teamProgress.lastAward && (
              <div className="p-2.5 rounded-xl bg-[#FAF8FF] border border-[#7047EB]/15 text-xs text-[#17171C] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#149A8B] shrink-0" />
                  <span className="truncate font-semibold">
                    {teamProgress.lastAward.title}
                  </span>
                </div>
                <span className="text-xs font-black text-[#7047EB] shrink-0">
                  +{teamProgress.lastAward.amount} XP
                </span>
              </div>
            )}
          </div>

          {/* 2. Hero Block: «Следующая миссия» (Next Mission) */}
          <div className="bg-gradient-to-br from-[#FAF8FF] via-white to-[#F0FDFB] rounded-2xl border-2 border-[#7047EB]/30 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#7047EB] text-white flex items-center justify-center font-bold shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#7047EB]">
                    Текущий фокус команды
                  </div>
                  <h3 className="text-base font-black text-[#17171C]">
                    Следующая миссия
                  </h3>
                </div>
              </div>

              {activeProposal && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#E8FAF7] text-[#149A8B] border border-[#2CC7B5]/30">
                    Награда: +{nearestMilestone?.points || 350} XP
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    activeProposal.status === 'accepted'
                      ? 'bg-[#E8FAF7] text-[#149A8B] border border-[#2CC7B5]/30'
                      : 'bg-[#FFF8E7] text-[#92400E] border border-[#FFC44D]/40'
                  }`}>
                    {activeProposal.status === 'accepted' ? 'В работе' : 'На рассмотрении'}
                  </span>
                </div>
              )}
            </div>

            {activeProposal ? (
              <div className="p-4 bg-white rounded-xl border border-[#E2E5EE] space-y-3">
                <div className="space-y-1">
                  <div className="text-xs text-[#667085] font-semibold">
                    Задача: <span className="text-[#17171C] font-bold">{activeProposal.taskTitle}</span> ({activeProposal.companyName})
                  </div>
                  <h4 className="text-sm font-black text-[#7047EB]">
                    {nearestMilestone ? `Спринт: ${nearestMilestone.title}` : 'Все этапы сданы'}
                  </h4>
                  <p className="text-xs text-[#667085] leading-relaxed line-clamp-2">
                    {nearestMilestone?.description || 'Ожидайте итоговую оценку заказчика или выберите следующую практическую задачу в каталоге.'}
                  </p>
                </div>

                {nearestMilestone?.status === 'submitted' && (
                  <div className="p-2.5 rounded-lg bg-[#FFF8E7] border border-[#FFC44D]/40 text-xs text-[#92400E] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>Результат отправлен на проверку бизнесу. Ожидаем подтверждение.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-white rounded-xl border border-[#E2E5EE] text-center space-y-2">
                <p className="text-xs text-[#667085]">
                  У вашей команды пока нет активных проектов. Выберите задачу в каталоге для старта.
                </p>
              </div>
            )}

            {/* Single Main CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
              {activeProposal ? (
                <button
                  type="button"
                  onClick={handleMyProposals}
                  className="w-full sm:w-auto h-11 px-6 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>{nearestMilestone?.status === 'submitted' ? 'Проверить статус спринта' : 'Сдать результат спринта'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCatalog}
                  className="w-full sm:w-auto h-11 px-6 bg-[#2CC7B5] hover:bg-[#20AE9D] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Выбрать задачу в каталоге</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 3 Balanced Quick Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {/* Card 1: Каталог */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-5 bg-white rounded-2xl border border-[#E2E5EE] hover:border-[#2CC7B5] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8FAF7] text-[#149A8B] flex items-center justify-center shadow-2xs">
                  <FolderSearch className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-[#17171C]">Каталог задач</h3>
                  <p className="text-xs text-[#667085] line-clamp-2">
                    Прикладные задачи от реального бизнеса с прозрачными данными и критериями.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleCatalog}
                  className="w-full h-10 px-3 bg-[#F8F9FC] hover:bg-[#E8FAF7] text-[#17171C] hover:text-[#149A8B] text-xs font-bold rounded-xl border border-[#E2E5EE] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Открыть каталог</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* Card 2: Мои отклики */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-5 bg-white rounded-2xl border border-[#E2E5EE] hover:border-[#7047EB] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0ECFF] text-[#7047EB] flex items-center justify-center shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-[#17171C]">Мои отклики и этапы</h3>
                  <p className="text-xs text-[#667085] line-clamp-2">
                    Отслеживание статуса заявок, сдача результатов и обратная связь заказчиков.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleMyProposals}
                  className="w-full h-10 px-3 bg-[#F8F9FC] hover:bg-[#F0ECFF] text-[#17171C] hover:text-[#7047EB] text-xs font-bold rounded-xl border border-[#E2E5EE] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Перейти к откликам</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* Card 3: Опыт и достижения */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-5 bg-white rounded-2xl border border-[#E2E5EE] hover:border-[#7047EB] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#D97706] flex items-center justify-center shadow-2xs">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-[#17171C]">Рост и достижения</h3>
                  <p className="text-xs text-[#667085] line-clamp-2">
                    Подтверждённый рейтинг команды, история начислений и открытые бейджи.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleProgress}
                  className="w-full h-10 px-3 bg-[#F8F9FC] hover:bg-[#FAF8FF] text-[#17171C] hover:text-[#7047EB] text-xs font-bold rounded-xl border border-[#E2E5EE] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Посмотреть прогресс</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};
