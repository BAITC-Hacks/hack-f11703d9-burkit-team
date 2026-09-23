import React, { useState } from 'react';
import { StudentProposal, Task, ProposalStatus, Milestone } from '../types';
import { talapApi } from '../api/talapApi';
import { useAsyncAction } from '../utils/useAsyncAction';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  ExternalLink, 
  ArrowRight,
  Sparkles,
  Calendar,
  Building2,
  Clock,
  Award,
  AlertCircle,
  HelpCircle,
  FileCode,
  ShieldCheck,
  Check,
  X,
  RotateCcw,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Select, SelectOption } from './ui/Select';
import { useToast } from './ui/Toast';

interface ProposalsScreenProps {
  proposals: StudentProposal[];
  tasks: Task[];
  initialFilterTaskId?: string;
  onUpdateProposalStatus: (proposalId: string, newStatus: ProposalStatus) => void;
  onNavigateToTask: (taskId: string) => void;
  onMilestoneConfirmed?: (proposalId: string, milestoneId: string, points: number) => void;
}

export const ProposalsScreen: React.FC<ProposalsScreenProps> = ({
  proposals,
  tasks,
  initialFilterTaskId,
  onUpdateProposalStatus,
  onNavigateToTask,
  onMilestoneConfirmed,
}) => {
  const { showToast } = useToast();
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialFilterTaskId || 'all');
  
  // Local state for instant UI update
  const [localProposals, setLocalProposals] = useState<StudentProposal[]>(proposals);

  React.useEffect(() => {
    setLocalProposals(proposals);
  }, [proposals]);

  const filteredProposals = localProposals.filter((p) => {
    if (selectedTaskId !== 'all' && p.taskId !== selectedTaskId) return false;
    return true;
  });

  // Selected proposal in Master-Detail (Requirement 6)
  const [selectedProposalId, setSelectedProposalId] = useState<string>(
    filteredProposals[0]?.id || ''
  );

  // Sync selectedProposalId when filter changes
  React.useEffect(() => {
    if (filteredProposals.length > 0 && !filteredProposals.find(p => p.id === selectedProposalId)) {
      setSelectedProposalId(filteredProposals[0].id);
    }
  }, [selectedTaskId, filteredProposals]);

  const selectedProposal = filteredProposals.find(p => p.id === selectedProposalId) || filteredProposals[0];

  // Async action for accepting team proposal
  const acceptProposalAction = useAsyncAction(
    async (proposalToAccept: StudentProposal) => {
      return talapApi.updateProposalStatus(proposalToAccept.id, 'accepted');
    },
    {
      onSuccess: (updatedProposal) => {
        const updated = localProposals.map((p) => {
          if (p.id === updatedProposal.id) {
            return { ...p, status: 'accepted' as ProposalStatus };
          }
          if (p.taskId === updatedProposal.taskId && p.id !== updatedProposal.id) {
            return { ...p, status: 'rejected' as ProposalStatus };
          }
          return p;
        });

        setLocalProposals(updated);
        onUpdateProposalStatus(updatedProposal.id, 'accepted');
        showToast(`Команда «${updatedProposal.teamName}» выбрана для реализации задачи!`, 'success');
      },
      onError: (errMsg) => {
        showToast(`Ошибка выбора команды: ${errMsg}`, 'error');
      },
    }
  );

  // Milestone Confirmation Modal state (Requirement 14)
  const [confirmMilestoneModal, setConfirmMilestoneModal] = useState<{
    proposal: StudentProposal;
    milestone: Milestone;
  } | null>(null);

  // Revision / Question Modal state
  const [revisionModal, setRevisionModal] = useState<{
    proposal: StudentProposal;
    milestone?: Milestone;
  } | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState('');

  const taskOptions: SelectOption[] = [
    { value: 'all', label: `Все задачи (${localProposals.length} откликов)` },
    ...tasks.map((t) => ({
      value: t.id,
      label: t.title,
      sublabel: t.company.name,
    })),
  ];

  // Confirm Milestone Handler with API capability check
  const handleConfirmMilestone = () => {
    if (!confirmMilestoneModal) return;
    const { proposal, milestone } = confirmMilestoneModal;
    const points = milestone.points || 350;

    if (!talapApi.capabilities.hasMilestonesRemoteApi) {
      showToast('Функция будет доступна после подключения сервера', 'info');
      setConfirmMilestoneModal(null);
      return;
    }

    const updated = localProposals.map((p) => {
      if (p.id !== proposal.id) return p;
      const updatedMilestones = (p.milestones || []).map((m) => {
        if (m.id === milestone.id) {
          return {
            ...m,
            status: 'confirmed' as const,
          };
        }
        return m;
      });
      return {
        ...p,
        milestones: updatedMilestones,
        teamProgressPoints: (p.teamProgressPoints || 0) + points,
      };
    });

    setLocalProposals(updated);
    if (onMilestoneConfirmed) {
      onMilestoneConfirmed(proposal.id, milestone.id, points);
    }

    setConfirmMilestoneModal(null);
    showToast(`Этап подтверждён. Команде начислено +${points} XP.`, 'success');
  };

  // Request revision handler
  const handleRequestRevision = () => {
    if (!revisionModal) return;
    const { proposal, milestone } = revisionModal;

    if (milestone) {
      const updated = localProposals.map((p) => {
        if (p.id !== proposal.id) return p;
        const updatedMilestones = (p.milestones || []).map((m) => {
          if (m.id === milestone.id) {
            return {
              ...m,
              status: 'pending' as const,
              feedback: revisionFeedback || 'Требуется доработка по критериям приёмки.',
            };
          }
          return m;
        });
        return { ...p, milestones: updatedMilestones };
      });
      setLocalProposals(updated);
    }

    setRevisionModal(null);
    setRevisionFeedback('');
    showToast('Запрос на доработку отправлен команде', 'info');
  };

  // Accept team proposal handler
  const handleAcceptTeam = (proposal: StudentProposal) => {
    if (acceptProposalAction.isLoading) return;
    acceptProposalAction.execute(proposal);
  };

  const getStatusBadge = (status: StudentProposal['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-[#E8FAF7] text-[#149A8B] border border-[#2CC7B5]/30">
            В работе
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F4F5F9] text-[#667085] border border-[#E2E5EE]">
            Архив
          </span>
        );
      case 'new':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-[#FFF8E7] text-[#92400E] border border-[#FFC44D]/40">
            Новый отклик
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#F0ECFF] text-[#7047EB] border border-[#7047EB]/25">
            На рассмотрении
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
      {/* 1. Header with single H1 and 1-line subtitle (Requirement 2 & 17) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#667085]">
            <Users className="w-3.5 h-3.5 text-[#7047EB]" />
            <span>Отклики студенческих команд</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17171C] tracking-tight">
            Отклики и выбор исполнителей
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] max-w-xl">
            Сравнивайте идеи и этапы команд. Выберите команду и подтверждайте контрольные точки спринтов.
          </p>
        </div>

        {/* Task Filter Select */}
        <div className="w-72 shrink-0">
          <Select
            value={selectedTaskId}
            onChange={(val) => setSelectedTaskId(val)}
            options={taskOptions}
            placeholder="Фильтр по задаче"
          />
        </div>
      </div>

      {/* 2. Master-Detail Layout (Requirement 6): 5 cols left, 7 cols right, gap 24px, equal height */}
      {filteredProposals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E5EE] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#F4F5F9] text-[#667085] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-base font-extrabold text-[#17171C]">
            Нет откликов по выбранному фильтру
          </h2>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            Попробуйте выбрать «Все задачи» или проверьте статус карточки в каталоге.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Master List (5 cols): Compact team cards (Requirement 6) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-[#667085] px-1 flex items-center justify-between">
              <span>Список команд ({filteredProposals.length})</span>
              <span>Выберите для просмотра</span>
            </div>

            <div className="space-y-2.5">
              {filteredProposals.map((proposal) => {
                const isSelected = selectedProposal?.id === proposal.id;
                const skills = (proposal.techStack || []).slice(0, 3);

                return (
                  <div
                    key={proposal.id}
                    onClick={() => setSelectedProposalId(proposal.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-white border-[#7047EB] ring-2 ring-[#7047EB]/15 shadow-sm'
                        : 'bg-white border-[#E2E5EE] hover:border-[#7047EB]/40 shadow-2xs'
                    }`}
                  >
                    {/* Team Name, University & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-sm font-black text-[#17171C] truncate">
                          {proposal.teamName}
                        </h2>
                        <span className="text-[11px] text-[#667085] font-semibold block truncate">
                          {proposal.university}
                        </span>
                      </div>
                      {getStatusBadge(proposal.status)}
                    </div>

                    {/* Short Idea (Requirement 6: max 2 lines) */}
                    <p className="text-xs text-[#475467] line-clamp-2 leading-relaxed font-normal">
                      {proposal.idea}
                    </p>

                    {/* Timeline & 3 top skills (Requirement 6) */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F0F2F7]">
                      <div className="flex items-center gap-1 text-[#667085] font-medium text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{proposal.timeline}</span>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap">
                        {skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded bg-[#F4F5F9] text-[#475467] font-semibold text-[10px] border border-[#E2E5EE]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail Panel (7 cols): Full view of selected proposal (Requirement 6) */}
          {selectedProposal && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-6">
              {/* Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F2F7]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-[#17171C]">
                      {selectedProposal.teamName}
                    </h2>
                    {getStatusBadge(selectedProposal.status)}
                  </div>
                  <div className="text-xs text-[#667085] flex items-center gap-2">
                    <span className="font-semibold text-[#17171C]">{selectedProposal.university}</span>
                    <span>•</span>
                    <span>Капитан: {selectedProposal.captain}</span>
                  </div>
                </div>

                {/* Team Selection Action */}
                {selectedProposal.status === 'accepted' ? (
                  <div className="h-10 px-4 bg-[#E8FAF7] border border-[#2CC7B5]/40 text-[#149A8B] text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 shadow-2xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Команда выбрана</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={acceptProposalAction.isLoading}
                    onClick={() => handleAcceptTeam(selectedProposal)}
                    className="h-10 px-4 bg-[#7047EB] hover:bg-[#5E32DF] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    {acceptProposalAction.isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Подтверждаем…</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Выбрать команду</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Error Banner with Retry */}
              {acceptProposalAction.isError && (
                <div className="p-3.5 bg-[#FFF0F0] border border-[#FF6266]/30 rounded-xl flex items-center justify-between gap-3 text-xs text-[#DC2626]">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{acceptProposalAction.error || 'Ошибка при выборе команды'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={acceptProposalAction.retry}
                    className="px-3 py-1 bg-[#FF6266] text-white font-bold rounded-lg hover:bg-[#E5484D] text-xs cursor-pointer shrink-0"
                  >
                    Повторить
                  </button>
                </div>
              )}

              {/* Task Link */}
              <div className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E2E5EE] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 text-[#7047EB] shrink-0" />
                  <span className="text-[#667085]">Задача:</span>
                  <span className="font-bold text-[#17171C] truncate">{selectedProposal.taskTitle}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToTask(selectedProposal.taskId)}
                  className="text-xs font-bold text-[#7047EB] hover:underline flex items-center gap-1 shrink-0 ml-2"
                >
                  <span>Карточка задачи</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Full Solution Idea */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Предлагаемое архитектурное решение
                </h3>
                <p className="text-xs text-[#17171C] leading-relaxed whitespace-pre-line bg-[#FAF8FF] p-4 rounded-xl border border-[#7047EB]/15">
                  {selectedProposal.idea}
                </p>
              </div>

              {/* Milestones / Sprints Section (Requirement 14) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Этапы реализации (спринты)
                  </h3>
                  <span className="text-xs text-[#667085]">
                    Всего XP: {selectedProposal.milestones?.reduce((s, m) => s + (m.points || 0), 0) || 0}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(selectedProposal.milestones || []).map((m) => {
                    const isConfirmed = m.status === 'confirmed';
                    const isSubmitted = m.status === 'submitted';

                    return (
                      <div
                        key={m.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isConfirmed
                            ? 'bg-[#E8FAF7]/30 border-[#38BB78]/30'
                            : isSubmitted
                            ? 'bg-[#FFF8E7]/30 border-[#FFC44D]/40 ring-1 ring-[#FFC44D]/25'
                            : 'bg-[#F9FAFC] border-[#E2E5EE]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-[#17171C]">
                                {m.title}
                              </h4>
                              {isConfirmed ? (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-[#E8FAF7] text-[#149A8B]">
                                  Подтверждён · +{m.points} XP
                                </span>
                              ) : isSubmitted ? (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-[#FFF8E7] text-[#92400E]">
                                  На проверке бизнесом
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-[#F4F5F9] text-[#667085]">
                                  В работе · {m.points} XP
                                </span>
                              )}
                            </div>

                            {m.description && (
                              <p className="text-xs text-[#667085] leading-relaxed">
                                {m.description}
                              </p>
                            )}

                            {/* Proof Link if submitted */}
                            {m.proofUrl && (
                              <div className="pt-1">
                                <a
                                  href={m.proofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-[#7047EB] hover:underline inline-flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Результат: {m.proofUrl}</span>
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Business Actions for Submitted Milestone (Requirement 14) */}
                          {isSubmitted && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => setRevisionModal({ proposal: selectedProposal, milestone: m })}
                                className="h-8 px-2.5 bg-white border border-[#E2E5EE] hover:bg-[#F4F5F9] text-[#17171C] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                Доработка
                              </button>

                              <button
                                type="button"
                                onClick={() => setConfirmMilestoneModal({ proposal: selectedProposal, milestone: m })}
                                className="h-8 px-3 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Подтвердить</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal before confirming milestone (Requirement 14) */}
      <AnimatePresence>
        {confirmMilestoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-[#E2E5EE] p-6 max-w-md w-full shadow-xl space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F0ECFF] text-[#7047EB] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-black text-[#17171C]">
                  Подтверждение этапа «{confirmMilestoneModal.milestone.title}»
                </h3>
                {/* Text explicitly per Requirement 14 */}
                <p className="text-xs text-[#475467] leading-relaxed">
                  После подтверждения команда получит {confirmMilestoneModal.milestone.points || 350} XP. Действие означает, что результат этапа принят бизнесом.
                </p>
              </div>

              {/* Buttons per Requirement 14 */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F2F7]">
                <button
                  type="button"
                  onClick={() => {
                    const currentModal = confirmMilestoneModal;
                    setConfirmMilestoneModal(null);
                    setRevisionModal({ proposal: currentModal.proposal, milestone: currentModal.milestone });
                  }}
                  className="h-10 px-4 bg-white border border-[#E2E5EE] hover:bg-[#F4F5F9] text-[#17171C] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Запросить доработку
                </button>

                <button
                  type="button"
                  onClick={handleConfirmMilestone}
                  className="h-10 px-4 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Подтвердить этап
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Revision Feedback Modal */}
      <AnimatePresence>
        {revisionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-[#E2E5EE] p-6 max-w-md w-full shadow-xl space-y-4"
            >
              <h3 className="text-base font-black text-[#17171C]">
                Запрос доработки этапа
              </h3>
              <p className="text-xs text-[#667085]">
                Опишите, какие моменты требуют исправления студенческой командой:
              </p>
              <textarea
                rows={4}
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
                placeholder="Например: Не хватает Dockerfile для развёртывания сервиса..."
                className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB]"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevisionModal(null)}
                  className="h-9 px-3.5 bg-white border border-[#E2E5EE] hover:bg-[#F4F5F9] text-xs font-bold text-[#667085] rounded-xl cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleRequestRevision}
                  className="h-9 px-4 bg-[#7047EB] text-white text-xs font-bold rounded-xl hover:bg-[#5E32DF] cursor-pointer"
                >
                  Отправить замечания
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
