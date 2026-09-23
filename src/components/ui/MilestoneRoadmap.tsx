import React, { useState } from 'react';
import { ProposalMilestone } from '../../types';
import { 
  Check, 
  Clock, 
  Lock, 
  ChevronDown, 
  ExternalLink, 
  UploadCloud, 
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface MilestoneRoadmapProps {
  milestones: ProposalMilestone[];
  onOpenProofModal?: (milestone: ProposalMilestone) => void;
  isLocked?: boolean;
}

export const MilestoneRoadmap: React.FC<MilestoneRoadmapProps> = ({
  milestones,
  onOpenProofModal,
  isLocked = false,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    // Expand the current active or submitted milestone by default
    const active = milestones.find((m) => m.status === 'submitted' || m.status === 'pending');
    return active ? active.id : milestones[0]?.id || null;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {/* Header with Total Earned XP */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F0F2F7]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#7047EB]" />
          <span className="text-xs font-bold text-[#17171C]">Маршрут спринтов проекта</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-black text-[#149A8B] bg-[#E8FAF7] px-2.5 py-0.5 rounded-lg border border-[#2CC7B5]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {milestones.filter((m) => m.status === 'confirmed').reduce((sum, m) => sum + (m.points || 0), 0)} XP получено
          </span>
        </div>
      </div>

      {/* Vertical Map */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E2E5EE]">
        {milestones.map((m, index) => {
          const isConfirmed = m.status === 'confirmed';
          const isSubmitted = m.status === 'submitted';
          const isRevision = m.feedback && !isConfirmed && !isSubmitted;
          const isCurrent = !isConfirmed && !isLocked && (isSubmitted || index === 0 || milestones[index - 1]?.status === 'confirmed');
          const isFuture = !isConfirmed && !isSubmitted && !isCurrent;
          const isExpanded = expandedId === m.id;

          // Status Node Marker
          let nodeBg = 'bg-[#F0F2F7] text-[#98A2B3] border-2 border-[#E2E5EE]';
          let nodeIcon = <Lock className="w-3 h-3" />;

          if (isConfirmed) {
            nodeBg = 'bg-[#38BB78] text-white border-2 border-white shadow-xs';
            nodeIcon = <Check className="w-3 h-3 stroke-[3]" />;
          } else if (isSubmitted) {
            nodeBg = 'bg-[#FFC44D] text-[#92400E] border-2 border-white shadow-xs animate-pulse';
            nodeIcon = <Clock className="w-3 h-3 stroke-[2.5]" />;
          } else if (isRevision) {
            nodeBg = 'bg-[#FF6266] text-white border-2 border-white shadow-xs';
            nodeIcon = <AlertCircle className="w-3 h-3 stroke-[2.5]" />;
          } else if (isCurrent) {
            nodeBg = 'bg-[#7047EB] text-white border-2 border-white shadow-xs ring-4 ring-[#7047EB]/15';
            nodeIcon = <span className="text-[10px] font-black">{index + 1}</span>;
          }

          return (
            <div key={m.id} className="relative group">
              {/* Left Circle Node */}
              <div
                className={`absolute -left-6 top-3 w-5 h-5 rounded-full flex items-center justify-center transition-all z-10 ${nodeBg}`}
              >
                {nodeIcon}
              </div>

              {/* Milestone Card */}
              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isConfirmed
                    ? 'bg-white border-[#38BB78]/40 shadow-2xs'
                    : isSubmitted
                    ? 'bg-white border-[#FFC44D] ring-2 ring-[#FFC44D]/20 shadow-xs'
                    : isCurrent
                    ? 'bg-white border-[#7047EB] ring-2 ring-[#7047EB]/15 shadow-sm'
                    : 'bg-[#F9FAFC] border-[#E2E5EE] opacity-75'
                }`}
              >
                {/* Collapsed Header */}
                <div
                  onClick={() => toggleExpand(m.id)}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F8F9FC]/80 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-[#17171C]">
                        Этап {index + 1}: {m.title}
                      </span>

                      {/* Status Badges */}
                      {isConfirmed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8FAF7] text-[#149A8B] border border-[#2CC7B5]/30">
                          Подтверждено · +{m.points} XP
                        </span>
                      )}
                      {isSubmitted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF8E7] text-[#92400E] border border-[#FFC44D]/40 flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-spin" />
                          <span>На проверке бизнесом</span>
                        </span>
                      )}
                      {isRevision && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF0F0] text-[#DC2626] border border-[#FF6266]/30">
                          Требует доработки
                        </span>
                      )}
                      {isCurrent && !isSubmitted && !isRevision && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F0ECFF] text-[#7047EB] border border-[#7047EB]/25">
                          Текущий спринт · {m.points} XP
                        </span>
                      )}
                      {isFuture && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F4F5F9] text-[#667085]">
                          Ожидает открытия · {m.points} XP
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-black text-[#7047EB]">+{m.points} XP</div>
                      <div className="text-[10px] text-[#667085]">награда</div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-6 h-6 rounded-lg bg-[#F4F5F9] text-[#667085] flex items-center justify-center"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-1 border-t border-[#F0F2F7] space-y-3 bg-[#FCFCFD]">
                        {/* Objective / Description */}
                        {m.description && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                              Цель спринта:
                            </span>
                            <p className="text-xs text-[#17171C] leading-relaxed">
                              {m.description}
                            </p>
                          </div>
                        )}

                        {/* Customer Feedback if revision needed */}
                        {m.feedback && (
                          <div className="p-3 bg-[#FFF8E7] border border-[#FFC44D]/40 rounded-xl text-xs text-[#92400E] space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Комментарий заказчика:</span>
                            </div>
                            <p className="text-[11px] leading-relaxed">{m.feedback}</p>
                          </div>
                        )}

                        {/* Proof URL if already submitted or confirmed */}
                        {m.proofUrl && (
                          <div className="p-2.5 bg-white rounded-xl border border-[#E2E5EE] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <ExternalLink className="w-3.5 h-3.5 text-[#7047EB] shrink-0" />
                              <span className="text-[#667085]">Результат:</span>
                              <a
                                href={m.proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-[#7047EB] hover:underline truncate"
                              >
                                {m.proofUrl}
                              </a>
                            </div>
                            <span className="text-[10px] text-[#149A8B] font-bold shrink-0">Отправлено</span>
                          </div>
                        )}

                        {/* Action Buttons for Current/Revision Sprint */}
                        {(isCurrent || isRevision) && onOpenProofModal && (
                          <div className="pt-2 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenProofModal(m)}
                              className="h-9 px-4 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>{m.proofUrl ? 'Обновить ссылку на результат' : 'Сдать результат этапа'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
