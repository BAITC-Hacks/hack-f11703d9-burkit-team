import React from 'react';
import { StudentProposal } from '../types';
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Building2, 
  ArrowRight,
  FolderKanban
} from 'lucide-react';

interface MyProposalsScreenProps {
  proposals: StudentProposal[];
  onOpenTask: (taskId: string) => void;
  onExploreCatalog: () => void;
}

export const MyProposalsScreen: React.FC<MyProposalsScreenProps> = ({
  proposals,
  onOpenTask,
  onExploreCatalog,
}) => {
  const getStatusBadge = (status: StudentProposal['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#36B875]/15 text-[#258B55] border border-[#36B875]/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Выбран бизнесом для пилота</span>
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
            <span>На рассмотрении менторами</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto space-y-6">
      {/* Title & Explanations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#17171C] tracking-tight">
            Мои поданные отклики на задачи
          </h2>
          <p className="text-sm text-[#667085] mt-1">
            Отслеживайте статусы рассмотрения ваших заявок компаниями и приглашения на пилот
          </p>
        </div>

        <button
          type="button"
          onClick={onExploreCatalog}
          className="h-11 px-4 bg-[#7047EB] hover:bg-[#5b32d6] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <FolderKanban className="w-4 h-4" />
          <span>Найти ещё задачу</span>
        </button>
      </div>

      {/* List of Applications */}
      {proposals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EF] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#F5F6FA] text-[#667085] flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#17171C]">
            Вы ещё не подавали откликов на задачи
          </h3>
          <p className="text-sm text-[#667085] max-w-sm mx-auto">
            Откройте каталог практических задач, выберите подходящий кейс и отправьте предложение вашей команды.
          </p>
          <button
            type="button"
            onClick={onExploreCatalog}
            className="h-10 px-5 bg-[#7047EB] text-white text-xs font-bold rounded-xl hover:bg-[#5b32d6] transition-colors cursor-pointer"
          >
            Перейти в каталог
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E5E7EF] p-6 shadow-2xs space-y-4 hover:border-[#7047EB]/30 transition-all"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EF]">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7047EB] mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{item.companyName}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#17171C]">
                    {item.taskTitle}
                  </h3>
                </div>

                <div className="shrink-0">
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* Idea and Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-[#667085] uppercase tracking-wider block">
                    Ваша идея решения:
                  </span>
                  <p className="text-[#17171C] font-medium leading-relaxed bg-[#F5F6FA] p-3 rounded-xl border border-[#E5E7EF]">
                    {item.idea}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#667085] uppercase tracking-wider">
                      План спринтов:
                    </span>
                    <span className="text-[#7047EB] font-bold">Срок: {item.timeline}</span>
                  </div>
                  <pre className="text-xs font-sans text-[#17171C] leading-relaxed bg-[#F5F6FA] p-3 rounded-xl border border-[#E5E7EF] whitespace-pre-wrap">
                    {item.sprintPlan}
                  </pre>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#E5E7EF] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#667085]">Команда: <strong className="text-[#17171C]">{item.teamName}</strong></span>
                  <span className="text-[#667085]">• Отправлено {item.submittedAt}</span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={item.prototypeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#7047EB] font-bold hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Прототип</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onOpenTask(item.taskId)}
                    className="h-9 px-3.5 bg-[#F5F6FA] hover:bg-[#E5E7EF] text-[#17171C] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Открыть задачу</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
