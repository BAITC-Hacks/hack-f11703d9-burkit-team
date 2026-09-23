import React from 'react';
import { RatingBreakdown } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  HelpCircle,
  ShieldCheck,
  Check
} from 'lucide-react';

interface RatingPanelProps {
  rating: RatingBreakdown;
  hasUnsavedChanges: boolean;
  onApplySuggestion: (suggestionId: string) => void;
  onConfirmChanges: () => void;
}

export const RatingPanel: React.FC<RatingPanelProps> = ({
  rating,
  hasUnsavedChanges,
  onApplySuggestion,
  onConfirmChanges,
}) => {
  const getReadinessBadgeStyle = () => {
    switch (rating.readinessLevel) {
      case 'gold':
        return 'bg-[#36B875]/15 text-[#258B55] border-[#36B875]/30';
      case 'ready':
        return 'bg-[#7047EB]/10 text-[#7047EB] border-[#7047EB]/25';
      case 'basic':
        return 'bg-[#F5B942]/15 text-[#B87C05] border-[#F5B942]/30';
      default:
        return 'bg-[#F45F68]/10 text-[#F45F68] border-[#F45F68]/30';
    }
  };

  // Only show the top concrete recommendation to avoid clutter
  const topSuggestion = rating.suggestions[0];

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EF] p-5 shadow-2xs space-y-5">
      {/* 1. Large Score & Readiness Level */}
      <div className="space-y-3 pb-4 border-b border-[#E5E7EF]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">
            Рейтинг готовности задачи
          </span>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${getReadinessBadgeStyle()}`}>
            {rating.readinessLabel}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-[#17171C] font-mono tabular-nums tracking-tight">
            {rating.totalScore}
          </span>
          <span className="text-sm font-bold text-[#667085]">/ 100 баллов</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-[#F5F6FA] rounded-full overflow-hidden border border-[#E5E7EF]">
          <div
            className="h-full bg-[#7047EB] rounded-full transition-all duration-300"
            style={{ width: `${rating.totalScore}%` }}
          />
        </div>
      </div>

      {/* 2. Unsaved Changes Alert inside panel */}
      {hasUnsavedChanges && (
        <div className="p-3 bg-[#F45F68]/10 border border-[#F45F68]/20 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F45F68]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Есть неподтверждённые изменения</span>
          </div>
          <p className="text-[11px] text-[#667085] leading-snug">
            Баллы обновятся после нажатия «Подтвердить изменения» внизу формы.
          </p>
        </div>
      )}

      {/* 3. Seven Standard Criteria Breakdown */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-[#17171C]">
          <span>7 критериев стандарта TALAP</span>
          <span className="text-[#667085] font-normal">
            {rating.criteria.filter(c => c.score === c.maxScore).length} из 7 выполнено
          </span>
        </div>

        <div className="space-y-1.5">
          {rating.criteria.map((c) => {
            const isFull = c.score === c.maxScore;
            const percent = (c.score / c.maxScore) * 100;

            return (
              <div
                key={c.id}
                className="p-2.5 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#17171C] truncate">
                      {c.name}
                    </span>
                    <span className="font-bold text-[#17171C] font-mono tabular-nums shrink-0 ml-2">
                      {c.score}/{c.maxScore}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-[#E5E7EF]">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        isFull ? 'bg-[#36B875]' : 'bg-[#7047EB]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Missing Information */}
      {rating.missingFields.length > 0 && (
        <div className="pt-3 border-t border-[#E5E7EF] space-y-2">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
            Недостающие сведения:
          </span>
          <ul className="space-y-1">
            {rating.missingFields.map((field, idx) => (
              <li key={idx} className="text-xs text-[#667085] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F45F68] shrink-0" />
                <span>{field}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. One Concrete Actionable Recommendation */}
      {topSuggestion && (
        <div className="pt-3 border-t border-[#E5E7EF] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7047EB] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Рекомендация TALAP AI</span>
            </span>
            <span className="text-xs font-bold text-[#36B875] bg-[#36B875]/10 px-2 py-0.5 rounded-md">
              +{topSuggestion.pointsAdd} баллов
            </span>
          </div>

          <p className="text-xs text-[#17171C] font-medium leading-relaxed bg-[#F0ECFF]/40 p-3 rounded-xl border border-[#7047EB]/20">
            {topSuggestion.text}
          </p>

          <button
            type="button"
            onClick={() => onApplySuggestion(topSuggestion.id)}
            className="w-full h-10 px-3 bg-white hover:bg-[#F0ECFF] text-[#7047EB] border border-[#7047EB]/30 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>Применить подсказку в форму</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
