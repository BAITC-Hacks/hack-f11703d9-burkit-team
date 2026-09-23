import React, { useState, useMemo } from 'react';
import { Task, UserRole } from '../types';
import { talapApi } from '../api/talapApi';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ArrowRight, 
  Users, 
  Sparkles, 
  Award,
  Layers
} from 'lucide-react';
import { Select, SelectOption } from './ui/Select';

interface CatalogScreenProps {
  tasks: Task[];
  userRole: UserRole;
  onOpenTask: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onNavigateToCreate?: () => void;
  isMockData?: boolean;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({
  tasks,
  userRole,
  onOpenTask,
  onEditTask,
  onNavigateToCreate,
  isMockData = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [readinessFilter, setReadinessFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'proposals' | 'updated'>('rating');

  const themeOptions: SelectOption[] = [
    { value: 'all', label: 'Все отрасли' },
    { value: 'AI / ML', label: 'AI / ML' },
    { value: 'FinTech', label: 'FinTech' },
    { value: 'LogTech', label: 'LogTech' },
    { value: 'GovTech', label: 'GovTech' },
    { value: 'HealthTech', label: 'HealthTech' },
    { value: 'E-commerce', label: 'E-commerce' },
  ];

  const sortOptions: SelectOption[] = [
    { value: 'rating', label: 'По рейтингу готовности' },
    { value: 'proposals', label: 'По числу откликов' },
    { value: 'updated', label: 'По новизне' },
  ];

  const readinessOptions = [
    { id: 'all', label: 'Все уровни' },
    { id: 'priority', label: 'Приоритетная (90–100)' },
    { id: 'ready', label: 'Готовая (70–89)' },
    { id: 'working', label: 'Рабочая (40–69)' },
    { id: 'draft', label: 'Черновик (0–39)' },
  ];

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchCompany = task.company.name.toLowerCase().includes(q);
          const matchNeed = task.need.toLowerCase().includes(q);
          const matchConstraints = task.constraints.toLowerCase().includes(q);
          if (!matchTitle && !matchCompany && !matchNeed && !matchConstraints) {
            return false;
          }
        }

        if (selectedTheme !== 'all' && task.theme !== selectedTheme) {
          return false;
        }

        const score = task.rating.totalScore;
        if (readinessFilter === 'priority' && score < 90) return false;
        if (readinessFilter === 'ready' && (score < 70 || score >= 90)) return false;
        if (readinessFilter === 'working' && (score < 40 || score >= 70)) return false;
        if (readinessFilter === 'draft' && score >= 40) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating.totalScore - a.rating.totalScore;
        if (sortBy === 'proposals') return b.proposalsCount - a.proposalsCount;
        return 0;
      });
  }, [tasks, searchQuery, selectedTheme, readinessFilter, sortBy]);

  // Extract exactly 3 technologies (Requirement 5)
  const getSkillsPreview = (constraints: string): string[] => {
    const list: string[] = [];
    if (/python/i.test(constraints)) list.push('Python');
    if (/pytorch/i.test(constraints)) list.push('PyTorch');
    if (/fastapi/i.test(constraints)) list.push('FastAPI');
    if (/docker/i.test(constraints)) list.push('Docker');
    if (/react/i.test(constraints)) list.push('React');
    if (/rust/i.test(constraints)) list.push('Rust');
    if (/xgboost|lightgbm/i.test(constraints)) list.push('LightGBM');
    if (/sql|postgres/i.test(constraints)) list.push('PostgreSQL');
    return (list.length > 0 ? list : ['Python', 'Docker', 'API']).slice(0, 3);
  };

  // 4-tier visual meta
  const getTierVisuals = (score: number) => {
    if (score >= 90) {
      return {
        badgeBg: 'bg-[#7047EB]/10 text-[#7047EB] border border-[#7047EB]/30',
        tierLabel: 'Приоритетная',
        barBg: 'bg-[#7047EB]',
      };
    }
    if (score >= 70) {
      return {
        badgeBg: 'bg-[#2CC7B5]/15 text-[#149A8B] border border-[#2CC7B5]/30',
        tierLabel: 'Готовая',
        barBg: 'bg-[#2CC7B5]',
      };
    }
    if (score >= 40) {
      return {
        badgeBg: 'bg-[#FFC44D]/25 text-[#92400E] border border-[#FFC44D]/40',
        tierLabel: 'Рабочая',
        barBg: 'bg-[#FFC44D]',
      };
    }
    return {
      badgeBg: 'bg-[#FF6266]/15 text-[#D92D20] border border-[#FF6266]/30',
      tierLabel: 'Черновик',
      barBg: 'bg-[#FF6266]',
    };
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
      {/* 1. Header with 1 H1 and 1-line subtitle (Requirement 2 & 17) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#667085]">
            <Sparkles className="w-3.5 h-3.5 text-[#7047EB]" />
            <span>Каталог прикладных задач бизнеса</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17171C] tracking-tight">
            Каталог задач
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] max-w-xl">
            Задачи с высоким рейтингом содержат прозрачный контекст, валидированные данные и понятные критерии приёмки.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isMockData && (
            <span className="px-3 py-1.5 bg-[#FFF8E7] text-[#92400E] border border-[#FFC44D]/40 rounded-xl text-xs font-bold shadow-2xs">
              Тестовый режим
            </span>
          )}
          <div className="px-3.5 py-1.5 bg-white rounded-xl border border-[#E2E5EE] shadow-2xs text-xs font-bold text-[#667085]">
            Всего задач: <span className="text-[#17171C] font-black">{tasks.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Unified Search & Filter Panel */}
      <div className="bg-white rounded-2xl border border-[#E2E5EE] p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, компании (Kolesa, Choco), технологиям..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F8F9FD] border border-[#E2E5EE] text-xs font-medium text-[#17171C] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#7047EB] focus:bg-white transition-all"
            />
          </div>

          <div className="md:col-span-3">
            <Select
              value={selectedTheme}
              onChange={(val) => setSelectedTheme(val)}
              options={themeOptions}
              placeholder="Отрасль"
            />
          </div>

          <div className="md:col-span-3">
            <Select
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              options={sortOptions}
              placeholder="Сортировка"
            />
          </div>
        </div>

        {/* Readiness Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0F2F7] text-xs">
          <span className="text-[#667085] font-bold text-[11px] uppercase tracking-wider mr-1">
            Рейтинг:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {readinessOptions.map((opt) => {
              const isActive = readinessFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setReadinessFilter(opt.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#7047EB] text-white shadow-xs'
                      : 'bg-[#F4F5F9] text-[#667085] hover:text-[#17171C] border border-[#E2E5EE]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Cards Grid: Equal height, buttons aligned at bottom (Requirement 5) */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E5EE] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#F4F5F9] text-[#667085] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-base font-extrabold text-[#17171C]">
            Задачи по указанным критериям не найдены
          </h2>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            Попробуйте сбросить поисковый запрос или выбрать другой уровень готовности.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedTheme('all'); setReadinessFilter('all'); }}
            className="h-10 px-4 bg-[#7047EB] text-white text-xs font-bold rounded-xl transition-all hover:bg-[#5E32DF] cursor-pointer"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <AnimatePresence>
            {filteredTasks.map((task) => {
              const skills = getSkillsPreview(task.constraints);
              const score = task.rating.totalScore;
              const visuals = getTierVisuals(score);

              return (
                <motion.div
                  layout
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="bg-white rounded-2xl border border-[#E2E5EE] hover:border-[#7047EB]/50 transition-all duration-200 flex flex-col justify-between h-full shadow-xs hover:shadow-md overflow-hidden"
                >
                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    {/* Top zone: Company, Industry, Title, Rating, 2-line need */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-xs font-black text-[#17171C] truncate block">
                            {task.company.name}
                          </span>
                          <span className="text-[10px] text-[#667085] font-semibold truncate block">
                            {task.company.industry}
                          </span>
                        </div>

                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#F4F5F9] border border-[#E2E5EE] text-[#475467] shrink-0">
                          {task.theme}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-sm font-black text-[#17171C] leading-snug line-clamp-2 min-h-[40px] tracking-tight">
                        {task.title}
                      </h2>

                      {/* Rating & Readiness Level (Requirement 5) */}
                      <div className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E2E5EE] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${visuals.badgeBg}`}>
                            {visuals.tierLabel}
                          </span>
                          <div className="flex items-baseline gap-1 text-xs">
                            <span className="font-black text-[#17171C] tabular-nums">{score}</span>
                            <span className="text-[10px] text-[#667085] font-semibold">/ 100 б.</span>
                          </div>
                        </div>

                        <div className="w-full h-1.5 bg-[#E2E5EE] rounded-full overflow-hidden">
                          <div
                            style={{ width: `${score}%` }}
                            className={`h-full rounded-full ${visuals.barBg}`}
                          />
                        </div>
                      </div>

                      {/* Short need context (Requirement 5: Max 2 lines) */}
                      <p className="text-xs text-[#667085] line-clamp-2 leading-relaxed">
                        {task.need}
                      </p>
                    </div>

                    {/* Bottom zone: 3 technologies, proposals count, 1 main button (Requirement 5) */}
                    <div className="pt-3 border-t border-[#F0F2F7] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-[#F4F5F9] text-[#475467] font-semibold text-[10px] border border-[#E2E5EE]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1 text-[#667085] text-xs font-bold shrink-0">
                          <Users className="w-3.5 h-3.5 text-[#7047EB]" />
                          <span className="text-[#17171C]">{task.proposalsCount}</span>
                        </div>
                      </div>

                      {/* 1 main action button (Requirement 5: No duplicate edit button) */}
                      <button
                        type="button"
                        onClick={() => onOpenTask(task)}
                        className="w-full h-10 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>{userRole === 'business' ? 'Открыть карточку' : 'Изучить задачу'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
