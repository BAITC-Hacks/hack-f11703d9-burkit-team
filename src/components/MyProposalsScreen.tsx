import React, { useState } from 'react';
import { StudentProposal } from '../types';
import { talapApi } from '../api/talapApi';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Clock, 
  ArrowRight,
  Upload,
  FileText
} from 'lucide-react';
import { useToast } from './ui/Toast';
import { MilestoneRoadmap } from './ui/MilestoneRoadmap';
import { CollapsibleCard } from './ui/CollapsibleCard';

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

    if (!talapApi.capabilities.hasMilestonesRemoteApi) {
      showToast('Функция будет доступна после подключения сервера', 'info');
      setActiveProofModal(null);
      setProofUrlInput('');
      return;
    }

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
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#667085]">
            <Send className="w-3.5 h-3.5 text-[#2CC7B5]" />
            <span>Кабинет студенческой команды</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17171C] tracking-tight">
            Мои отклики и этапы
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] max-w-xl">
            Отслеживайте статус спринтов и сдавайте результаты для начисления XP.
          </p>
        </div>

        <button
          type="button"
          onClick={onExploreCatalog}
          className="h-10 px-4 bg-white border border-[#E2E5EE] hover:bg-[#F4F5F9] text-[#17171C] text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
        >
          <span>Найти задачу</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Master-Detail Layout */}
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
              Выберите практическую задачу в каталоге и отправьте предложение.
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
          {/* Left Master List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-[#667085] px-1 flex items-center justify-between">
              <span>Мои проекты ({localProposals.length})</span>
              <span>Выберите для деталей</span>
            </div>

            <div className="space-y-2.5">
              {localProposals.map((proposal) => {
                const isSelected = selectedProposal?.id === proposal.id;
                const milestones = proposal.milestones || [];
                const confirmedCount = milestones.filter(m => m.status === 'confirmed').length;
                const earnedXP = milestones.filter(m => m.status === 'confirmed').reduce((s, m) => s + (m.points || 0), 0);

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
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-xs sm:text-sm font-black text-[#17171C] truncate">
                          {proposal.taskTitle}
                        </h2>
                        <span className="text-[11px] text-[#667085] font-semibold block truncate">
                          {proposal.companyName}
                        </span>
                      </div>
                      {getStatusBadge(proposal.status)}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F0F2F7]">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#667085] font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Спринты: {confirmedCount} / {milestones.length}</span>
                      </div>

                      <span className="text-xs font-black text-[#7047EB]">
                        {earnedXP > 0 ? `+${earnedXP} XP` : '0 XP'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail Panel (7 cols) */}
          {selectedProposal && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F2F7]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-[#17171C]">
                      {selectedProposal.taskTitle}
                    </h2>
                    {getStatusBadge(selectedProposal.status)}
                  </div>
                  <div className="text-xs text-[#667085] flex items-center gap-2">
                    <span className="font-semibold text-[#17171C]">{selectedProposal.companyName}</span>
                    <span>•</span>
                    <span>Срок: {selectedProposal.timeline}</span>
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

              {/* Collapsible Proposal Idea */}
              <CollapsibleCard
                title="Идея решения команды"
                subtitle="Архитектурный подход и технологии"
                icon={<FileText className="w-4 h-4" />}
                defaultOpen={false}
              >
                <p className="text-xs text-[#17171C] leading-relaxed whitespace-pre-line pt-1">
                  {selectedProposal.idea}
                </p>
              </CollapsibleCard>

              {/* Vertical Milestone Map */}
              <div className="pt-2">
                <MilestoneRoadmap
                  milestones={selectedProposal.milestones || []}
                  onOpenProofModal={(m) => setActiveProofModal({
                    proposalId: selectedProposal.id,
                    milestoneId: m.id,
                    milestoneTitle: m.title
                  })}
                  isLocked={selectedProposal.status !== 'accepted'}
                />
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
                  Сдать результат спринта
                </h3>
                <p className="text-xs text-[#667085]">
                  «{activeProofModal.milestoneTitle}»
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17171C]">
                  Ссылка на результат (GitHub, Demo, API docs или релиз)
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
