import React, { useState } from 'react';
import { StudentProposal, Milestone } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Building2, 
  ArrowRight,
  Upload,
  Check,
  ChevronDown,
  Sparkles,
  Award
} from 'lucide-react';
import { useToast } from './ui/Toast';
import { Disclosure } from './ui/Disclosure';

interface MyProposalsScreenProps {
  proposals: StudentProposal[];
  onOpenTask: (taskId: string) => void;
  onExploreCatalog: () => void;
  onMilestoneSubmitted?: (proposalId: string, milestoneId: string, proofUrl: string) => void;
}

export const MyProposalsScreen: React.FC<MyProposalsScreenProps> = ({
  proposals,
  onOpenTask,
  onExploreCatalog,
  onMilestoneSubmitted,
}) => {
  const { showToast } = useToast();
  const [localProposals, setLocalProposals] = useState<StudentProposal[]>(proposals);
  
  React.useEffect(() => {
    setLocalProposals(proposals);
  }, [proposals]);

  const [selectedProposalId, setSelectedProposalId] = useState<string>(
    localProposals[0]?.id || ''
  );

  React.useEffect(() => {
    if (localProposals.length > 0 && !localProposals.find(p => p.id === selectedProposalId)) {
      setSelectedProposalId(localProposals[0].id);
    }
  }, [localProposals]);

  const selectedProposal = localProposals.find(p => p.id === selectedProposalId) || localProposals[0];

  // Submit proof modal
  const [activeProofModal, setActiveProofModal] = useState<{ proposalId: string; milestoneId: string; milestoneTitle: string } | null>(null);
  const [proofUrlInput, setProofUrlInput] = useState('');

  const handleUploadProof = () => {
    if (!activeProofModal || !proofUrlInput.trim()) return;
    const { proposalId, milestoneId } = activeProofModal;

    const updated = localProposals.map((p) => {
      if (p.id !== proposalId) return p;
      const updatedMilestones = (p.milestones || []).map((m) => {
        if (m.id === milestoneId) {
          return {
            ...m,
            proofUrl: proofUrlInput.trim(),
            status: 'submitted' as const,
          };
        }
        return m;
      });
      return { ...p, milestones: updatedMilestones };
    });

    setLocalProposals(updated);
    if (onMilestoneSubmitted) {
      onMilestoneSubmitted(proposalId, milestoneId, proofUrlInput.trim());
    }

    setActiveProofModal(null);
    setProofUrlInput('');
    showToast('Ссылка на результат этапа отправлена бизнесу на проверку!', 'success');
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
            Отправлен
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
            <Send className="w-3.5 h-3.5 text-[#2CC7B5]" />
            <span>Кабинет студенческой команды</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17171C] tracking-tight">
            Мои поданные отклики
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] max-w-xl">
            Отслеживайте статус рассмотрения откликов бизнесом и сдавайте выполненные этапы спринтов.
          </p>
        </div>

        <button
          type="button"
          onClick={onExploreCatalog}
          className="h-10 px-4 bg-white border border-[#E2E5EE] hover:bg-[#F4F5F9] text-[#17171C] text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
        >
          <span>Найти ещё задачу</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Master-Detail Layout (Requirement 7): 5 cols left, 7 cols right, gap 24px */}
      {localProposals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E5EE] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8FAF7] text-[#149A8B] flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-[#17171C]">
              У вашей команды пока нет активных откликов
            </h2>
            <p className="text-xs text-[#667085] max-w-sm mx-auto">
              Выберите задачу в каталоге и отправьте структурированное архитектурное предложение.
            </p>
          </div>
          <button
            type="button"
            onClick={onExploreCatalog}
            className="h-10 px-5 bg-[#2CC7B5] hover:bg-[#20AE9D] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Перейти в каталог задач
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Master List (5 cols): Compact cards with task, company, status, nearest milestone, deadline, earned XP (Requirement 7) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-[#667085] px-1 flex items-center justify-between">
              <span>Мои отклики ({localProposals.length})</span>
              <span>Выберите для деталей</span>
            </div>

            <div className="space-y-2.5">
              {localProposals.map((proposal) => {
                const isSelected = selectedProposal?.id === proposal.id;
                
                // Earned XP strictly from confirmed milestones
                const earnedXP = (proposal.milestones || [])
                  .filter(m => m.status === 'confirmed')
                  .reduce((sum, m) => sum + (m.points || 0), 0);

                // Nearest milestone
                const nearest = (proposal.milestones || []).find(
                  m => m.status === 'submitted' || m.status === 'pending'
                ) || (proposal.milestones || [])[0];

                return (
                  <div
                    key={proposal.id}
                    onClick={() => setSelectedProposalId(proposal.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-white border-[#2CC7B5] ring-2 ring-[#2CC7B5]/20 shadow-sm'
                        : 'bg-white border-[#E2E5EE] hover:border-[#2CC7B5]/40 shadow-2xs'
                    }`}
                  >
                    {/* Task Title & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-sm font-black text-[#17171C] truncate">
                          {proposal.taskTitle}
                        </h2>
                        <span className="text-[11px] text-[#667085] font-semibold block truncate">
                          {proposal.companyName}
                        </span>
                      </div>
                      {getStatusBadge(proposal.status)}
                    </div>

                    {/* Nearest milestone & deadline */}
                    {nearest && (
                      <div className="p-2.5 bg-[#F8F9FC] rounded-xl text-xs space-y-1 border border-[#E2E5EE]/60">
                        <div className="text-[10px] uppercase font-bold text-[#667085]">
                          Ближайший этап:
                        </div>
                        <div className="font-semibold text-[#17171C] truncate">
                          {nearest.title}
                        </div>
                      </div>
                    )}

                    {/* Deadline & Earned XP (Requirement 7) */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F0F2F7]">
                      <div className="flex items-center gap-1 text-[#667085] font-medium text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Срок: {proposal.timeline}</span>
                      </div>

                      <div className="text-xs font-black text-[#7047EB] bg-[#F0ECFF] px-2 py-0.5 rounded-md">
                        {earnedXP} XP получено
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail Panel (7 cols): Full view of selected proposal (Requirement 7) */}
          {selectedProposal && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F2F7]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-[#17171C]">
                      {selectedProposal.taskTitle}
                    </h2>
                    {getStatusBadge(selectedProposal.status)}
                  </div>
                  <div className="text-xs text-[#667085] flex items-center gap-2">
                    <span className="font-semibold text-[#17171C]">{selectedProposal.companyName}</span>
                    <span>•</span>
                    <span>Срок проекта: {selectedProposal.timeline}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenTask(selectedProposal.taskId)}
                  className="h-9 px-3 bg-white border border-[#E2E5EE] hover:bg-[#F4F5F9] text-[#17171C] text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Карточка задачи</span>
                  <ArrowRight className="w-3 h-3 text-[#667085]" />
                </button>
              </div>

              {/* Submitted Idea (with Disclosure per Requirement 7 & 16) */}
              <div className="space-y-2 bg-[#FAF8FF] p-4 rounded-xl border border-[#7047EB]/15">
                <Disclosure
                  title="Отправленное предложение команды"
                  initialOpen={false}
                  showText="Показать детали идеи"
                  hideText="Скрыть детали идеи"
                >
                  <p className="text-xs text-[#17171C] leading-relaxed whitespace-pre-line pt-2">
                    {selectedProposal.idea}
                  </p>
                </Disclosure>
              </div>

              {/* Milestones list (Completed collapsed by default, current expanded per Requirement 7) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Этапы реализации (спринты)
                  </h3>
                  <span className="text-xs font-bold text-[#7047EB]">
                    Заработано: {(selectedProposal.milestones || []).filter(m => m.status === 'confirmed').reduce((s, m) => s + (m.points || 0), 0)} XP
                  </span>
                </div>

                <div className="space-y-3">
                  {(selectedProposal.milestones || []).map((m, idx) => {
                    const isConfirmed = m.status === 'confirmed';
                    const isSubmitted = m.status === 'submitted';
                    const isCurrent = !isConfirmed && (isSubmitted || idx === 0 || (selectedProposal.milestones?.[idx - 1]?.status === 'confirmed'));

                    return (
                      <div
                        key={m.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isConfirmed
                            ? 'bg-[#E8FAF7]/20 border-[#38BB78]/30'
                            : isSubmitted
                            ? 'bg-[#FFF8E7]/30 border-[#FFC44D]/40 ring-1 ring-[#FFC44D]/25'
                            : isCurrent
                            ? 'bg-white border-[#2CC7B5] shadow-2xs'
                            : 'bg-[#F9FAFC] border-[#E2E5EE] opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-[#17171C]">
                                {m.title}
                              </h4>
                              {isConfirmed ? (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-[#E8FAF7] text-[#149A8B] flex items-center gap-1">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Подтверждено · +{m.points} XP</span>
                                </span>
                              ) : isSubmitted ? (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-[#FFF8E7] text-[#92400E]">
                                  На проверке бизнесом
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-[#F4F5F9] text-[#667085]">
                                  В работе · {m.points} XP
                                </span>
                              )}
                            </div>

                            {/* Completed milestones collapse details by default per Requirement 7 */}
                            {isConfirmed ? (
                              <Disclosure
                                showText="Показать детали этапа"
                                hideText="Скрыть детали этапа"
                                initialOpen={false}
                              >
                                <p className="text-xs text-[#667085] leading-relaxed pt-1">
                                  {m.description}
                                </p>
                                {m.proofUrl && (
                                  <div className="pt-2">
                                    <a
                                      href={m.proofUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-bold text-[#7047EB] hover:underline inline-flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>Сданный результат: {m.proofUrl}</span>
                                    </a>
                                  </div>
                                )}
                              </Disclosure>
                            ) : (
                              /* Current active milestone is expanded by default (Requirement 7) */
                              <div className="space-y-2 pt-1">
                                {m.description && (
                                  <p className="text-xs text-[#667085] leading-relaxed">
                                    {m.description}
                                  </p>
                                )}

                                {m.feedback && (
                                  <div className="p-2.5 bg-[#FFF8E7] border border-[#FFC44D]/40 rounded-lg text-xs text-[#92400E]">
                                    <span className="font-bold">Замечания заказчика:</span> {m.feedback}
                                  </div>
                                )}

                                {m.proofUrl && (
                                  <div className="text-xs text-[#7047EB] font-semibold flex items-center gap-1">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Отправлено на проверку: {m.proofUrl}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Button: Submit proof for active milestone */}
                          {!isConfirmed && (
                            <button
                              type="button"
                              onClick={() => setActiveProofModal({
                                proposalId: selectedProposal.id,
                                milestoneId: m.id,
                                milestoneTitle: m.title
                              })}
                              className={`h-9 px-3 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                isSubmitted
                                  ? 'bg-white border border-[#E2E5EE] text-[#17171C] hover:bg-[#F4F5F9]'
                                  : 'bg-[#2CC7B5] hover:bg-[#20AE9D] text-white shadow-xs'
                              }`}
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isSubmitted ? 'Обновить ссылку' : 'Сдать результат'}</span>
                            </button>
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

      {/* Proof URL Submission Modal */}
      <AnimatePresence>
        {activeProofModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-[#E2E5EE] p-6 max-w-md w-full shadow-xl space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E8FAF7] text-[#149A8B] flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-[#17171C]">
                  Сдать результат этапа
                </h3>
                <p className="text-xs text-[#667085]">
                  «{activeProofModal.milestoneTitle}»
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17171C]">
                  Ссылка на результат (GitHub репозиторий, демо или релиз)
                </label>
                <input
                  type="url"
                  value={proofUrlInput}
                  onChange={(e) => setProofUrlInput(e.target.value)}
                  placeholder="https://github.com/visioncraft/eda-pipeline"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs text-[#17171C] focus:bg-white focus:outline-none focus:border-[#2CC7B5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F2F7]">
                <button
                  type="button"
                  onClick={() => setActiveProofModal(null)}
                  className="h-9 px-3.5 bg-white border border-[#E2E5EE] hover:bg-[#F4F5F9] text-xs font-bold text-[#667085] rounded-xl cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleUploadProof}
                  disabled={!proofUrlInput.trim()}
                  className={`h-9 px-4 text-white text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    proofUrlInput.trim()
                      ? 'bg-[#2CC7B5] hover:bg-[#20AE9D] shadow-xs'
                      : 'bg-[#98A2B3] cursor-not-allowed'
                  }`}
                >
                  Отправить на проверку
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
