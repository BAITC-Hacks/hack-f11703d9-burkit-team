import React, { useState } from 'react';
import { Task, StudentProposal } from '../types';
import { 
  Building2, 
  Send, 
  CheckCircle2, 
  ExternalLink, 
  ArrowLeft,
  Check,
  Calendar,
  FileCode,
  ShieldAlert,
  Target,
  Award,
  Users
} from 'lucide-react';

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
  // Only the 5 necessary fields as requested
  const [teamName, setTeamName] = useState('VisionCraft KBTU');
  const [idea, setIdea] = useState(
    'Двухуровневый ансамбль: быстрый легковесный детектор признаков для фильтрации + специализированная квантованная модель для достижения задержки менее 200 мс на CPU без потери точности.'
  );
  const [sprintPlan, setSprintPlan] = useState(
    '• Неделя 1: EDA датасета, валидационный пайплайн.\n• Неделя 2: Эксперименты с архитектурами и подбор порогов.\n• Неделя 3: Сборка Docker и FastAPI сервиса.\n• Неделя 4: Интерактивное веб-демо и презентация.'
  );
  const [timeline, setTimeline] = useState('3 недели');
  const [prototypeUrl, setPrototypeUrl] = useState('https://github.com/visioncraft-kbtu/prototype-demo');

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !idea.trim() || !sprintPlan.trim() || !timeline.trim()) return;

    const newProposal: StudentProposal = {
      id: `prop-${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      companyName: task.company.name,
      teamName: teamName.trim(),
      university: 'КБТУ / Студенческая лаборатория',
      captain: 'Санжар Мухтаров',
      captainEmail: 's_mukhtarov@kbtu.kz',
      captainTelegram: '@sanzhar_cv_craft',
      membersCount: 4,
      techStack: ['Python', 'PyTorch', 'FastAPI', 'Docker'],
      idea: idea.trim(),
      sprintPlan: sprintPlan.trim(),
      timeline: timeline.trim(),
      prototypeUrl: prototypeUrl.trim() || 'https://github.com/team/demo',
      submittedAt: 'Только что',
      status: 'new'
    };

    onSubmitProposal(newProposal);
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-[1320px] mx-auto space-y-6">
      {/* Top Bar with Back Link & Task Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EF]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="h-10 px-3 bg-white border border-[#E5E7EF] hover:bg-[#F5F6FA] text-xs font-semibold text-[#17171C] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#667085]" />
            <span>К списку задач</span>
          </button>
          <div>
            <div className="text-xs font-semibold text-[#667085]">
              {task.company.name} · {task.theme}
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-[#17171C] truncate max-w-xl">
              {task.title}
            </h2>
          </div>
        </div>

        {/* Task selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#667085] font-semibold">Сменить задачу:</span>
          <select
            value={task.id}
            onChange={(e) => {
              const selected = tasks.find(t => t.id === e.target.value);
              if (selected) {
                onSelectAnotherTask(selected);
                setIsSubmitted(false);
              }
            }}
            className="h-10 px-3 rounded-xl bg-white border border-[#E5E7EF] text-xs font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors cursor-pointer max-w-[260px] truncate"
          >
            {tasks.map(t => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two-Column Scannable Layout: Left Task Cards / Right Application Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Task broken down into scannable visual sections */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-[#E5E7EF] p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#F0ECFF] text-[#7047EB]">
                {task.theme}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#36B875] bg-[#36B875]/10 px-2.5 py-0.5 rounded-md">
                <span>Рейтинг готовности: {task.rating.totalScore}/100</span>
              </div>
            </div>

            <h1 className="text-xl font-extrabold text-[#17171C] leading-snug">
              {task.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-[#667085] pt-1">
              <span>Компания: <strong className="text-[#17171C]">{task.company.name}</strong></span>
              <span>•</span>
              <span>Отрасль: <strong className="text-[#17171C]">{task.company.industry}</strong></span>
            </div>
          </div>

          {/* Section: Проблема */}
          <div className="bg-white rounded-2xl border border-[#E5E7EF] p-5 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
              Проблема и потребность бизнеса
            </span>
            <p className="text-sm text-[#17171C] font-medium leading-relaxed bg-[#F5F6FA] p-3.5 rounded-xl border border-[#E5E7EF]">
              {task.need}
            </p>
          </div>

          {/* Section: Контекст и пользователи */}
          <div className="bg-white rounded-2xl border border-[#E5E7EF] p-5 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
              Бизнес-контекст и пользователи
            </span>
            <p className="text-sm text-[#17171C] leading-relaxed">
              {task.context}
            </p>
            <div className="text-xs text-[#667085] pt-1">
              <strong className="text-[#17171C]">Целевые пользователи:</strong> {task.targetUsers}
            </div>
          </div>

          {/* Section: Данные */}
          <div className="bg-white rounded-2xl border border-[#E5E7EF] p-5 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
              Предоставляемые данные и API
            </span>
            <pre className="text-xs font-mono bg-[#17171C] text-[#36B875] p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {task.dataProvided}
            </pre>
          </div>

          {/* Section: Ограничения */}
          <div className="bg-white rounded-2xl border border-[#E5E7EF] p-5 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
              Технические ограничения
            </span>
            <p className="text-xs text-[#17171C] font-semibold bg-[#F5B942]/10 text-[#B87C05] p-3.5 rounded-xl border border-[#F5B942]/30 leading-relaxed">
              {task.constraints}
            </p>
          </div>

          {/* Section: Результат и критерии успеха */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#E5E7EF] p-4 shadow-2xs space-y-1.5">
              <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
                Ожидаемый результат
              </span>
              <p className="text-xs text-[#17171C] leading-relaxed whitespace-pre-wrap">
                {task.expectedResult}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EF] p-4 shadow-2xs space-y-1.5">
              <span className="text-xs font-bold text-[#36B875] uppercase tracking-wider block">
                Критерии успеха и KPI
              </span>
              <p className="text-xs text-[#17171C] leading-relaxed whitespace-pre-wrap">
                {task.successCriteria}
              </p>
            </div>
          </div>

          {/* Section: Связь с бизнесом */}
          <div className="bg-white rounded-2xl border border-[#E5E7EF] p-4 shadow-2xs text-xs space-y-1">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
              Формат взаимодействия и менторства
            </span>
            <p className="text-[#17171C] leading-relaxed">
              {task.interactionFormat}
            </p>
            <div className="text-[#7047EB] font-bold pt-1">
              Контакты: {task.contact}
            </div>
          </div>
        </div>

        {/* Right Column: Application Form with ONLY the 5 required fields */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EF] p-6 shadow-2xs space-y-5">
            <div>
              <h3 className="text-lg font-extrabold text-[#17171C]">
                Подать предложение команды
              </h3>
              <p className="text-xs text-[#667085] mt-0.5">
                Заполните ключевые пункты решения для рассмотрения менторами {task.company.name}
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-6 rounded-xl bg-[#36B875]/10 border border-[#36B875]/30 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#36B875] text-white flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-[#17171C]">
                  Предложение успешно отправлено!
                </h4>
                <p className="text-xs text-[#667085]">
                  Статус: <strong className="text-[#B87C05]">Новый</strong>. Менторы компании рассмотрят отклик на вкладке «Предложения команд».
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  {onNavigateToMyProposals && (
                    <button
                      type="button"
                      onClick={onNavigateToMyProposals}
                      className="h-10 px-4 bg-[#7047EB] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Перейти в раздел «Мои отклики»
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="h-10 px-4 bg-white border border-[#E5E7EF] text-xs font-semibold text-[#17171C] rounded-xl hover:bg-[#F5F6FA] transition-colors cursor-pointer"
                  >
                    Подать ещё одно предложение
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Название команды */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
                    1. Название команды
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Например: VisionCraft KBTU"
                    className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors"
                  />
                </div>

                {/* 2. Идея решения */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
                    2. Идея решения
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Какую архитектуру или алгоритм вы предлагаете..."
                    className="w-full p-3.5 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm leading-relaxed text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors resize-y"
                  />
                </div>

                {/* 3. План (по неделям) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
                    3. План реализации по неделям
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={sprintPlan}
                    onChange={(e) => setSprintPlan(e.target.value)}
                    placeholder="Неделя 1: ... Неделя 2: ... Неделя 3: ..."
                    className="w-full p-3.5 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm leading-relaxed text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors resize-y"
                  />
                </div>

                {/* 4. Срок */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
                    4. Срок выполнения
                  </label>
                  <input
                    type="text"
                    required
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="Например: 3 недели"
                    className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors"
                  />
                </div>

                {/* 5. Ссылка на прототип */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
                    5. Ссылка на прототип / GitHub
                  </label>
                  <input
                    type="url"
                    required
                    value={prototypeUrl}
                    onChange={(e) => setPrototypeUrl(e.target.value)}
                    placeholder="https://github.com/team/prototype"
                    className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors"
                  />
                </div>

                {/* Primary Button: «Отправить предложение» */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 bg-[#7047EB] hover:bg-[#5b32d6] text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Отправить предложение</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
