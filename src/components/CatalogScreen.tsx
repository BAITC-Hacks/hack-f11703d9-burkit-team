import React, { useState, useMemo } from 'react';
import { Task, UserRole } from '../types';
import { 
  Search, 
  ArrowUpDown, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  Users, 
  Sparkles,
  Layers,
  Filter
} from 'lucide-react';

interface CatalogScreenProps {
  tasks: Task[];
  userRole: UserRole;
  onOpenTask: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onNavigateToCreate?: () => void;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({
  tasks,
  userRole,
  onOpenTask,
  onEditTask,
  onNavigateToCreate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [readinessFilter, setReadinessFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'proposals' | 'updated'>('rating');

  const themes = [
    { id: 'all', label: 'Все отрасли' },
    { id: 'AI / ML', label: 'AI / ML' },
    { id: 'FinTech', label: 'FinTech' },
    { id: 'LogTech', label: 'LogTech' },
    { id: 'GovTech', label: 'GovTech' },
    { id: 'HealthTech', label: 'HealthTech' },
    { id: 'E-commerce', label: 'E-commerce' },
  ];

  const readinessOptions = [
    { id: 'all', label: 'Любая готовность' },
    { id: 'gold', label: '86+ Высший стандарт' },
    { id: 'ready', label: '71-85 Готово к публикации' },
    { id: 'basic', label: 'До 70 В доработке' },
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

        if (readinessFilter === 'gold' && task.rating.totalScore < 86) return false;
        if (readinessFilter === 'ready' && (task.rating.totalScore < 71 || task.rating.totalScore >= 86)) return false;
        if (readinessFilter === 'basic' && task.rating.totalScore >= 71) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating.totalScore - a.rating.totalScore;
        if (sortBy === 'proposals') return b.proposalsCount - a.proposalsCount;
        return 0;
      });
  }, [tasks, searchQuery, selectedTheme, readinessFilter, sortBy]);

  // Extract skills preview from constraints
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
    return list.length > 0 ? list.slice(0, 4) : ['ML / Dev', 'API', 'Docker'];
  };

  return (
    <div className="max-w-[1320px] mx-auto space-y-6">
      {/* 1. Page Header & Explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#17171C] tracking-tight">
            Каталог практических задач бизнеса
          </h2>
          <p className="text-sm text-[#667085] mt-1">
            Практические кейсы от IT и FinTech компаний Казахстана с оценкой готовности по стандарту TALAP
          </p>
        </div>

        {/* 2. Compact Statistics Row */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-[#E5E7EF] shadow-2xs text-left">
            <div className="text-xs text-[#667085] font-medium">Всего задач</div>
            <div className="text-base font-extrabold text-[#17171C] tabular-nums">{tasks.length}</div>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl border border-[#E5E7EF] shadow-2xs text-left">
            <div className="text-xs text-[#36B875] font-medium">Готовы к работе</div>
            <div className="text-base font-extrabold text-[#36B875] tabular-nums">
              {tasks.filter(t => t.rating.totalScore >= 80).length}
            </div>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl border border-[#E5E7EF] shadow-2xs text-left">
            <div className="text-xs text-[#7047EB] font-medium">Заявок команд</div>
            <div className="text-base font-extrabold text-[#7047EB] tabular-nums">
              {tasks.reduce((sum, t) => sum + t.proposalsCount, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Unified Search, Filter and Sort Panel */}
      <div className="bg-white rounded-2xl border border-[#E5E7EF] p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Field */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, компании или технологиям..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-medium text-[#17171C] placeholder:text-[#667085] focus:outline-none focus:border-[#7047EB] transition-colors"
            />
          </div>

          {/* Theme Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors cursor-pointer"
            >
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors cursor-pointer"
              >
                <option value="rating">По рейтингу готовности</option>
                <option value="proposals">По числу откликов</option>
                <option value="updated">По новизне</option>
              </select>
            </div>
          </div>
        </div>

        {/* Readiness Quick Filters */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#E5E7EF] text-xs">
          <span className="text-[#667085] font-semibold">Уровень готовности:</span>
          <div className="flex flex-wrap gap-1.5">
            {readinessOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setReadinessFilter(opt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  readinessFilter === opt.id
                    ? 'bg-[#7047EB] text-white'
                    : 'bg-[#F5F6FA] text-[#667085] hover:text-[#17171C] border border-[#E5E7EF]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Grid of Task Cards (Max 3 in row, equal height, consistent structure) */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EF] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#F5F6FA] text-[#667085] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#17171C]">
            Задачи по указанным критериям не найдены
          </h3>
          <p className="text-sm text-[#667085] max-w-sm mx-auto">
            Попробуйте сбросить поисковый запрос или выбрать другой уровень готовности.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedTheme('all'); setReadinessFilter('all'); }}
            className="h-10 px-4 bg-[#F5F6FA] hover:bg-[#E5E7EF] text-[#17171C] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredTasks.map((task) => {
            const skills = getSkillsPreview(task.constraints);
            const isHighReady = task.rating.totalScore >= 86;

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-[#E5E7EF] p-5 flex flex-col justify-between h-full hover:border-[#7047EB]/50 hover:shadow-md transition-all duration-200"
              >
                {/* Top: Company & Industry Accent */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#F5F6FA] text-[#7047EB] flex items-center justify-center font-bold text-xs shrink-0">
                        {task.company.name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-[#17171C] truncate">
                        {task.company.name}
                      </span>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#F0ECFF] text-[#7047EB] shrink-0">
                      {task.theme}
                    </span>
                  </div>

                  {/* Title (max 3 lines) */}
                  <h3 className="text-base font-extrabold text-[#17171C] leading-snug line-clamp-3 min-h-[44px]">
                    {task.title}
                  </h3>

                  {/* Rating & Readiness */}
                  <div className="flex items-center justify-between p-2.5 bg-[#F5F6FA] rounded-xl border border-[#E5E7EF]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-black text-[#17171C] tabular-nums">
                        {task.rating.totalScore}
                      </span>
                      <span className="text-xs text-[#667085] font-semibold">/100</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      isHighReady ? 'bg-[#36B875]/15 text-[#258B55]' : 'bg-[#7047EB]/10 text-[#7047EB]'
                    }`}>
                      {task.rating.readinessLabel}
                    </span>
                  </div>

                  {/* Short business need summary */}
                  <div>
                    <span className="text-xs font-semibold text-[#667085] block mb-1">
                      Потребность:
                    </span>
                    <p className="text-xs text-[#17171C] line-clamp-2 leading-relaxed font-medium">
                      {task.need}
                    </p>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#F5F6FA] text-[#667085] border border-[#E5E7EF]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom: Proposals count & One Primary Action Button */}
                <div className="pt-4 mt-4 border-t border-[#E5E7EF] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#667085]">
                    <Users className="w-3.5 h-3.5" />
                    <span>Откликов: <strong className="text-[#17171C] tabular-nums">{task.proposalsCount}</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (userRole === 'business' && onEditTask) {
                        onEditTask(task);
                      } else {
                        onOpenTask(task);
                      }
                    }}
                    className="h-10 px-4 bg-[#7047EB] hover:bg-[#5b32d6] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{userRole === 'business' ? 'Паспорт задачи' : 'Открыть задачу'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
