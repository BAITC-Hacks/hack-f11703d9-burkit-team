import React, { useState } from 'react';
import { StudentProposal, Task, ProposalStatus } from '../types';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  ChevronRight,
  Filter,
  Check,
  Send,
  RotateCcw
} from 'lucide-react';

interface ProposalsScreenProps {
  proposals: StudentProposal[];
  tasks: Task[];
  initialFilterTaskId?: string;
  onUpdateProposalStatus: (proposalId: string, newStatus: ProposalStatus) => void;
  onNavigateToTask: (taskId: string) => void;
}

export const ProposalsScreen: React.FC<ProposalsScreenProps> = ({
  proposals,
  tasks,
  initialFilterTaskId,
  onUpdateProposalStatus,
  onNavigateToTask,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialFilterTaskId || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProposals = proposals.filter((p) => {
    if (selectedTaskId !== 'all' && p.taskId !== selectedTaskId) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#36B875]/15 text-[#258B55] border border-[#36B875]/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Выбран</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#F45F68]/10 text-[#F45F68] border border-[#F45F68]/20 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            <span>Отклонён</span>
          </span>
        );
      case 'new':
        return (
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#F5B942]/15 text-[#B87C05] border border-[#F5B942]/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Новый</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#7047EB]/10 text-[#7047EB] border border-[#7047EB]/20 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>На рассмотрении</span>
          </span>
        );
    }
  };

  const acceptedCount = proposals.filter(p => p.status === 'accepted').length;
  const newCount = proposals.filter(p => p.status === 'new').length;
  const pendingCount = proposals.filter(p => p.status === 'pending').length;

  return (
    <div className="max-w-[1320px] mx-auto space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#17171C] tracking-tight">
            Предложения студенческих команд
          </h2>
          <p className="text-sm text-[#667085] mt-1">
            Рассмотрите идеи и планы реализации от команд, отберите лучшие решения для пилота
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-[#E5E7EF] shadow-2xs">
            <div className="text-xs text-[#667085] font-semibold">Всего откликов</div>
            <div className="text-base font-extrabold text-[#17171C] tabular-nums">{proposals.length}</div>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl border border-[#E5E7EF] shadow-2xs">
            <div className="text-xs text-[#B87C05] font-semibold">Новые</div>
            <div className="text-base font-extrabold text-[#B87C05] tabular-nums">{newCount}</div>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl border border-[#E5E7EF] shadow-2xs">
            <div className="text-xs text-[#258B55] font-semibold">Выбрано команд</div>
            <div className="text-base font-extrabold text-[#258B55] tabular-nums">{acceptedCount}</div>
          </div>
        </div>
      </div>

      {/* 2. Unified Task and Status Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EF] p-4 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* By Task */}
        <div className="md:col-span-7">
          <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1">
            Фильтр по задаче:
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors cursor-pointer"
          >
            <option value="all">Все задачи ({proposals.length} откликов)</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* By Status */}
        <div className="md:col-span-5">
          <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1">
            Статус решения:
          </label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#F5F6FA] border border-[#E5E7EF] rounded-xl h-11">
            {[
              { id: 'all', label: 'Все' },
              { id: 'new', label: 'Новый' },
              { id: 'accepted', label: 'Выбран' },
              { id: 'rejected', label: 'Отклонён' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                  statusFilter === st.id
                    ? 'bg-white text-[#17171C] shadow-2xs'
                    : 'text-[#667085] hover:text-[#17171C]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. List of Compact Proposal Cards */}
      {filteredProposals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EF] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#F5F6FA] text-[#667085] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#17171C]">
            Предложения не найдены
          </h3>
          <p className="text-sm text-[#667085] max-w-sm mx-auto">
            Нет откликов по выбранным фильтрам. Сбросьте фильтры для просмотра всех поступивших заявок.
          </p>
          <button
            type="button"
            onClick={() => { setSelectedTaskId('all'); setStatusFilter('all'); }}
            className="h-10 px-4 bg-[#F5F6FA] hover:bg-[#E5E7EF] text-xs font-bold text-[#17171C] rounded-xl transition-colors cursor-pointer"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const isAccepted = proposal.status === 'accepted';
            const isRejected = proposal.status === 'rejected';

            return (
              <div
                key={proposal.id}
                className={`bg-white rounded-2xl border p-6 transition-all duration-200 shadow-2xs space-y-4 ${
                  isAccepted
                    ? 'border-[#36B875] ring-2 ring-[#36B875]/20 bg-[#36B875]/5'
                    : isRejected
                    ? 'border-[#E5E7EF] opacity-75'
                    : 'border-[#E5E7EF] hover:border-[#7047EB]/40'
                }`}
              >
                {/* Header: Team name, university, task link & status badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EF]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-[#17171C]">
                        {proposal.teamName}
                      </h3>
                      <span className="text-xs text-[#667085]">({proposal.university})</span>
                      <span className="text-xs text-[#667085]">• {proposal.membersCount} участника</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigateToTask(proposal.taskId)}
                      className="text-xs font-bold text-[#7047EB] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <span>Задача: {proposal.taskTitle}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="shrink-0">
                    {getStatusBadge(proposal.status)}
                  </div>
                </div>

                {/* Body: Idea, Stages/Sprints, Timeline, Tech stack */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-sm">
                  {/* Left: Idea & Approach */}
                  <div className="md:col-span-6 space-y-1.5">
                    <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
                      Идея решения:
                    </span>
                    <p className="text-sm text-[#17171C] font-medium leading-relaxed bg-[#F5F6FA] p-3.5 rounded-xl border border-[#E5E7EF]">
                      {proposal.idea}
                    </p>
                  </div>

                  {/* Right: Stages / Sprints & Timeline */}
                  <div className="md:col-span-6 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">
                        Этапы реализации:
                      </span>
                      <span className="text-xs font-bold text-[#7047EB] bg-[#F0ECFF] px-2 py-0.5 rounded-md">
                        Срок: {proposal.timeline}
                      </span>
                    </div>
                    <pre className="text-xs font-sans text-[#17171C] leading-relaxed bg-[#F5F6FA] p-3.5 rounded-xl border border-[#E5E7EF] whitespace-pre-wrap">
                      {proposal.sprintPlan}
                    </pre>
                  </div>
                </div>

                {/* Tech Stack & Prototype Link */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-[#667085]">Стек:</span>
                    {proposal.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#F5F6FA] text-[#17171C] border border-[#E5E7EF] font-semibold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <a
                    href={proposal.prototypeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7047EB] hover:underline bg-[#F0ECFF] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Прототип / GitHub</span>
                  </a>
                </div>

                {/* Bottom Row: Captain contacts on left, Business Actions on bottom right */}
                <div className="pt-3 border-t border-[#E5E7EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-[#667085]">
                    Капитан: <strong className="text-[#17171C]">{proposal.captain}</strong> ({proposal.captainTelegram})
                    <span className="mx-2">•</span>
                    <span>Отправлено {proposal.submittedAt}</span>
                  </div>

                  {/* Actions placed on bottom right as requested */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isAccepted ? (
                      <button
                        type="button"
                        onClick={() => onUpdateProposalStatus(proposal.id, 'pending')}
                        className="h-10 px-3.5 bg-white border border-[#E5E7EF] hover:bg-[#F5F6FA] text-xs font-semibold text-[#667085] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Вернуть на рассмотрение</span>
                      </button>
                    ) : (
                      <>
                        {!isRejected && (
                          <button
                            type="button"
                            onClick={() => onUpdateProposalStatus(proposal.id, 'rejected')}
                            className="h-10 px-4 bg-white border border-[#E5E7EF] hover:bg-[#F45F68]/10 hover:text-[#F45F68] text-xs font-bold text-[#667085] rounded-xl transition-colors cursor-pointer"
                          >
                            Отклонить
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onUpdateProposalStatus(proposal.id, 'accepted')}
                          className="h-10 px-5 bg-[#36B875] hover:bg-[#2fa066] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>Выбрать команду</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
