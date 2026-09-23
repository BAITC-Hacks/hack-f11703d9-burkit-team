import React, { useState } from 'react';
import { Task, StudentProposal } from '../types';
import { talapApi } from '../api/talapApi';
import { useAsyncAction } from '../utils/useAsyncAction';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  ArrowLeft,
  ArrowRight,
  Copy,
  Sparkles,
  Database,
  Layers,
  PhoneCall,
  Clock,
  AlertCircle,
  Award,
  Loader2,
  AlertTriangle,
  Building2,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { useToast } from './ui/Toast';
import { CollapsibleCard } from './ui/CollapsibleCard';

interface StudentTaskScreenProps {
  task: Task;
  tasks: Task[];
  onSelectAnotherTask: (task: Task) => void;
  onSubmitProposal: (newProposal: StudentProposal) => void;
  onBackToCatalog: () => void;
  onNavigateToMyProposals?: () => void;
}

export const StudentTaskScreen: React.FC<StudentTaskScreenProps> = ({
  task,
  tasks,
  onSelectAnotherTask,
  onSubmitProposal,
  onBackToCatalog,
  onNavigateToMyProposals,
}) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposalStep, setProposalStep] = useState<1 | 2 | 3>(1);

  // Proposal form state
  const [teamName, setTeamName] = useState('VisionCraft KBTU');
  const [university, setUniversity] = useState('КБТУ (Казахстанско-Британский технический университет)');
  const [captainContact, setCaptainContact] = useState('@sanzhar_cv_craft | s_mukhtarov@kbtu.kz');
  const [skills, setSkills] = useState('Python, PyTorch, FastAPI, Docker, React');
  const [idea, setIdea] = useState(
    'Двухуровневый ансамбль: быстрый детектор зон повреждений для фильтрации бликов + квантованная модель для запуска на CPU со скоростью до 250 мс.'
  );
  const [firstMilestone, setFirstMilestone] = useState(
    'EDA данных, очистка разметки и прототип инференса модели на 100 тестовых примерах.'
  );
  const [timelineWeeks, setTimelineWeeks] = useState('3-4 недели');

  const [copiedData, setCopiedData] = useState(false);

  const handleCopyData = () => {
    navigator.clipboard.writeText(task.dataProvided);
    setCopiedData(true);
    showToast('Данные скопированы в буфер обмена', 'info');
    setTimeout(() => setCopiedData(false), 2000);
  };

  const handleOpenProposal = () => {
    setProposalStep(1);
    setIsModalOpen(true);
  };

  // Async action for proposal submission
  const submitProposalAction = useAsyncAction(
    async () => {
      const email = captainContact.includes('@')
        ? captainContact.split('|')[1]?.trim() || captainContact
        : 'team@univ.kz';
      const telegram = captainContact.startsWith('@')
        ? captainContact.split('|')[0]?.trim() || captainContact
        : '@student_lead';

      return talapApi.submitProposal({
        taskId: task.id,
        taskTitle: task.title,
        companyName: task.company.name,
        teamName: teamName.trim(),
        university: university.trim(),
        captain: 'Санжар Мухтаров',
        captainEmail: email,
        captainTelegram: telegram,
        membersCount: 4,
        techStack: skills.split(',').map((s) => s.trim()),
        idea: idea.trim(),
        firstMilestone: firstMilestone.trim(),
        timeline: timelineWeeks.trim(),
        prototypeUrl: 'https://github.com/visioncraft-kbtu/demo',
      });
    },
    {
      onSuccess: (newProposal) => {
        onSubmitProposal(newProposal);
        setIsModalOpen(false);
        showToast('Предложение успешно отправлено бизнесу!', 'success');
        if (onNavigateToMyProposals) {
          onNavigateToMyProposals();
        }
      },
      onError: (errMsg) => {
        showToast(`Ошибка отправки: ${errMsg}`, 'error');
      },
    }
  );

  const handleSubmitProposal = () => {
    if (submitProposalAction.isLoading) return;
    submitProposalAction.execute();
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-5 max-w-[1080px] mx-auto w-full overflow-y-auto pb-8 pr-1">
      {/* 1. Header with Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E5EE] shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#667085]">
            <button
              type="button"
              onClick={onBackToCatalog}
              className="text-[#7047EB] hover:text-[#5E32DF] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Каталог задач</span>
            </button>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[#17171C]">{task.company.name}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[#17171C] tracking-tight">
            {task.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-[#F0ECFF] text-[#7047EB] border border-[#7047EB]/20">
            Готовность: {Math.min(100, Math.max(0, task.rating.totalScore))} из 100 б.
          </span>
        </div>
      </div>

      {/* 2. Top Summary Card */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#E2E5EE] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F0F2F7]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#7047EB]" />
            <span className="text-xs font-bold text-[#17171C]">{task.company.name}</span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-xs text-[#667085]">{task.theme}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-[#667085]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#D97706]" />
              Спринт: ~3-4 недели
            </span>
            <span className="flex items-center gap-1 text-[#149A8B] font-bold">
              <Award className="w-3.5 h-3.5" />
              До +1050 XP
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-[#7047EB]">
            Суть вызова
          </div>
          <p className="text-xs sm:text-sm text-[#17171C] font-semibold leading-relaxed">
            {task.need || task.context}
          </p>
          {task.targetUsers && (
            <p className="text-xs text-[#667085]">
              <strong className="text-[#17171C]">Целевая аудитория:</strong> {task.targetUsers}
            </p>
          )}
        </div>
      </div>

      {/* 3. Collapsible Structured Blocks for Details */}
      <div className="space-y-3">
        {/* Block 1: Ожидаемый результат и приёмка */}
        <CollapsibleCard
          title="Что нужно сделать и критерии приёмки"
          subtitle="Формат сдачи и технические требования"
          icon={<FileCheck className="w-4 h-4" />}
          defaultOpen={true}
        >
          <div className="space-y-3 text-xs text-[#17171C]">
            <div className="space-y-1">
              <span className="font-bold text-[#667085] text-[11px] uppercase tracking-wider">Ожидаемый результат:</span>
              <p className="font-medium leading-relaxed">
                {task.expectedResult || 'Работающий прототип с исходным кодом и инструкцией развёртывания.'}
              </p>
            </div>

            {task.successCriteria && (
              <div className="p-3 bg-[#FAF8FF] border border-[#7047EB]/15 rounded-xl space-y-1">
                <span className="font-bold text-[#7047EB] text-[11px] uppercase tracking-wider">Критерии успеха:</span>
                <p className="text-xs text-[#17171C] leading-relaxed">{task.successCriteria}</p>
              </div>
            )}
          </div>
        </CollapsibleCard>

        {/* Block 2: Доступные данные и материалы */}
        <CollapsibleCard
          title="Доступные данные и материалы"
          subtitle="Датасеты, схемы и примеры"
          icon={<Database className="w-4 h-4" />}
          defaultOpen={false}
          badge={
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyData();
              }}
              className="text-[11px] font-bold text-[#149A8B] hover:underline flex items-center gap-1 cursor-pointer bg-[#E8FAF7] px-2 py-0.5 rounded-md border border-[#2CC7B5]/30"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedData ? 'Скопировано!' : 'Скопировать'}</span>
            </button>
          }
        >
          <div className="space-y-2 text-xs">
            <p className="text-[#17171C] font-medium leading-relaxed whitespace-pre-line bg-[#F8F9FD] p-3 rounded-xl border border-[#E2E5EE]">
              {task.dataProvided || 'Формат данных и тестовые выборки будут переданы утверждённой команде.'}
            </p>
          </div>
        </CollapsibleCard>

        {/* Block 3: Связь и поддержка бизнеса */}
        <CollapsibleCard
          title="Формат связи и менторство"
          subtitle="Регулярность синхронизаций и контакты"
          icon={<PhoneCall className="w-4 h-4" />}
          defaultOpen={false}
        >
          <div className="space-y-2 text-xs text-[#17171C]">
            <p className="font-medium">
              {task.interactionFormat || 'Регулярные синхронизации по спринтам + оперативный чат с ментором.'}
            </p>
            <div className="text-[#667085] text-xs pt-2 border-t border-[#F0F2F7]">
              <span className="font-bold text-[#17171C]">Представитель компании: </span>
              {task.contact || task.company.repName}
            </div>
            {task.constraints && (
              <div className="p-2.5 bg-[#FFF8E7] border border-[#FFC44D]/40 rounded-xl text-xs text-[#92400E]">
                <strong className="font-bold">Ограничения: </strong>{task.constraints}
              </div>
            )}
          </div>
        </CollapsibleCard>
      </div>

      {/* 4. Action Banner / Sticky Prompt */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#7047EB] to-[#5527D6] rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-black tracking-tight">
            Готовы предложить решение?
          </h3>
          <p className="text-xs text-white/80 max-w-md">
            Отправьте идею и первый этап. Заполнение занимает до 3 минут.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenProposal}
          className="h-11 px-6 bg-[#2CC7B5] hover:bg-[#20AE9D] text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
        >
          <span>Откликнуться на задачу</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* 5. Three-Step Proposal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-[#E2E5EE] shadow-2xl space-y-5"
            >
              {/* Header with 3 steps indicator */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E5EE]">
                <div>
                  <span className="text-[11px] font-extrabold text-[#7047EB] uppercase tracking-wider">
                    Шаг {proposalStep} из 3
                  </span>
                  <h3 className="text-lg font-black text-[#17171C]">
                    {proposalStep === 1 && 'Шаг 1. Данные команды'}
                    {proposalStep === 2 && 'Шаг 2. Идея решения'}
                    {proposalStep === 3 && 'Шаг 3. Проверка и отправка'}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${proposalStep >= 1 ? 'bg-[#7047EB]' : 'bg-[#E2E5EE]'}`} />
                  <span className={`w-2.5 h-2.5 rounded-full ${proposalStep >= 2 ? 'bg-[#7047EB]' : 'bg-[#E2E5EE]'}`} />
                  <span className={`w-2.5 h-2.5 rounded-full ${proposalStep >= 3 ? 'bg-[#7047EB]' : 'bg-[#E2E5EE]'}`} />
                </div>
              </div>

              {/* Step 1: Данные команды */}
              {proposalStep === 1 && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Название команды
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Например: VisionCraft KBTU"
                      className="w-full h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-sm text-[#17171C] font-semibold outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Вуз или город
                    </label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="Например: КБТУ, Алматы"
                      className="w-full h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] font-medium outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Контакты капитана (Telegram / Email)
                    </label>
                    <input
                      type="text"
                      value={captainContact}
                      onChange={(e) => setCaptainContact(e.target.value)}
                      placeholder="@telegram | email@domain.kz"
                      className="w-full h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] font-medium outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Стек технологий
                    </label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="Python, PyTorch, React, Docker..."
                      className="w-full h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] font-medium outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Идея решения */}
              {proposalStep === 2 && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Идея архитектуры и подхода
                    </label>
                    <textarea
                      rows={3}
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Опишите предлагаемый метод и алгоритмы..."
                      className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] outline-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Что сдадите на 1-м спринте?
                    </label>
                    <textarea
                      rows={2}
                      value={firstMilestone}
                      onChange={(e) => setFirstMilestone(e.target.value)}
                      placeholder="Например: EDA, очистка данных и базовый инференс..."
                      className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] outline-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Ожидаемый срок реализации
                    </label>
                    <input
                      type="text"
                      value={timelineWeeks}
                      onChange={(e) => setTimelineWeeks(e.target.value)}
                      placeholder="Например: 3-4 недели"
                      className="w-full h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] font-medium outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Проверка и отправка */}
              {proposalStep === 3 && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-[#F8F9FD] rounded-2xl border border-[#E2E5EE] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#17171C] text-sm">{teamName}</span>
                      <span className="text-[11px] text-[#667085]">{university}</span>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-[#E2E5EE]">
                      <span className="font-bold text-[#667085] block">Идея:</span>
                      <p className="text-[#17171C]">{idea}</p>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-[#E2E5EE]">
                      <span className="font-bold text-[#667085] block">Первый результат:</span>
                      <p className="text-[#17171C]">{firstMilestone}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#E2E5EE] text-[#667085]">
                      <span>Срок: <strong className="text-[#17171C]">{timelineWeeks}</strong></span>
                      <span>Контакты: <strong className="text-[#17171C]">{captainContact}</strong></span>
                    </div>
                  </div>

                  {/* Error display if submission fails */}
                  {submitProposalAction.isError && (
                    <div className="p-3 bg-[#FFF0F0] border border-[#FF6266]/30 rounded-xl flex items-center justify-between gap-2 text-xs text-[#DC2626]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{submitProposalAction.error || 'Ошибка отправки предложения'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={submitProposalAction.retry}
                        className="px-2.5 py-1 bg-[#FF6266] text-white font-bold rounded-lg hover:bg-[#E5484D] text-[11px] cursor-pointer"
                      >
                        Повторить
                      </button>
                    </div>
                  )}

                  <div className="p-3 bg-[#FFF8E7] rounded-xl border border-[#FFC44D]/50 text-[#92400E] flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
                    <span className="text-[11px] leading-relaxed font-medium">
                      Предложение будет направлено представителю бизнеса для рассмотрения.
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Navigation Buttons */}
              <div className="flex items-center justify-between pt-2">
                {proposalStep > 1 ? (
                  <button
                    type="button"
                    disabled={submitProposalAction.isLoading}
                    onClick={() => setProposalStep((prev) => (prev - 1) as any)}
                    className="text-xs font-bold text-[#667085] hover:text-[#17171C] cursor-pointer disabled:opacity-50"
                  >
                    ← Назад
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitProposalAction.isLoading}
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs font-bold text-[#667085] hover:text-[#17171C] cursor-pointer disabled:opacity-50"
                  >
                    Отмена
                  </button>
                )}

                {proposalStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setProposalStep((prev) => (prev + 1) as any)}
                    className="h-10 px-5 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Далее</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitProposalAction.isLoading}
                    onClick={handleSubmitProposal}
                    className="h-10 px-6 bg-[#2CC7B5] hover:bg-[#20AE9D] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    {submitProposalAction.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Отправляем…</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Отправить предложение</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
