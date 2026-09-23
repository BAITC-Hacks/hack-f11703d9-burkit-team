import React, { useState } from 'react';
import { SAMPLE_AI_QUESTIONS } from '../data/mockData';
import { ClarifyingQuestion, Task, TaskTheme } from '../types';
import { calculateTaskRating } from '../utils/ratingCalculator';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Building2,
  FileCheck2
} from 'lucide-react';

interface CreateTaskScreenProps {
  onTaskCreated: (newTask: Task) => void;
  onCancel?: () => void;
}

type StepState = 'description' | 'questions' | 'preview';

export const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ 
  onTaskCreated,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [promptText, setPromptText] = useState(
    'Разработать алгоритм предиктивного обслуживания для парка электросамокатов. Нужно прогнозировать выход из строя аккумулятора или контроллера за 72 часа на основе телеметрии (вольтаж, перепады температуры, вибрация акселерометра).'
  );
  const [companyName, setCompanyName] = useState('Jet Mobility KZ');
  const [selectedTheme, setSelectedTheme] = useState<TaskTheme>('AI / ML');

  const [analysisState, setAnalysisState] = useState<'initial' | 'analyzing' | 'ready' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState('');
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>(SAMPLE_AI_QUESTIONS);

  const samplePrompts = [
    {
      title: 'Предиктивный ремонт самокатов',
      company: 'Jet Mobility KZ',
      theme: 'AI / ML' as TaskTheme,
      text: 'Разработать алгоритм предиктивного обслуживания для парка электросамокатов. Нужно прогнозировать выход из строя аккумулятора или контроллера за 72 часа на основе телеметрии (вольтаж, перепады температуры, вибрация акселерометра).'
    },
    {
      title: 'Антифрод в P2P-переводах',
      company: 'Halyk Digital',
      theme: 'FinTech' as TaskTheme,
      text: 'Модель выявления дропперских карт и подозрительных цепочек переводов в реальном времени. Необходимо анализировать графы связей транзакций за последние 24 часа и блокировать подозрительные переводы с задержкой не более 150 миллисекунд.'
    },
    {
      title: 'Умный подбор аналогов лекарств',
      company: 'Europharma AI',
      theme: 'HealthTech' as TaskTheme,
      text: 'Модуль семантического поиска и подбора аналогов дефицитных медикаментов по действующему веществу (МНН), дозировке и противопоказаниям на базе базы данных лекарственных средств РК.'
    }
  ];

  const handleApplyPreset = (p: typeof samplePrompts[0]) => {
    setPromptText(p.text);
    setCompanyName(p.company);
    setSelectedTheme(p.theme);
    setAnalysisState('initial');
    setCurrentStep(1);
    setErrorMessage('');
  };

  const handleRunAnalysis = () => {
    if (!promptText.trim()) {
      setErrorMessage('Пожалуйста, введите описание задачи бизнеса.');
      setAnalysisState('error');
      return;
    }

    setAnalysisState('analyzing');
    setErrorMessage('');

    setTimeout(() => {
      setAnalysisState('ready');
      setCurrentStep(2);
    }, 450);
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, selectedOption: option } : q)
    );
  };

  const handleFinalize = () => {
    const q1 = questions.find(q => q.id === 'q1')?.selectedOption || 'Анонимизированный CSV-датасет с телеметрией';
    const q2 = questions.find(q => q.id === 'q2')?.selectedOption || 'Python 3.11+, PyTorch/FastAPI, запуск на CPU';
    const q3 = questions.find(q => q.id === 'q3')?.selectedOption || 'F1-score > 0.82 на отложенном тесте и latency < 250 мс';
    const q4 = questions.find(q => q.id === 'q4')?.selectedOption || 'Еженедельный 45-минутный демо-синк в Google Meet + чат в Telegram';

    const title = promptText.length > 75 
      ? promptText.slice(0, 75).replace(/\s+[^\s]+$/, '') + '...' 
      : promptText;

    const baseTask: Partial<Task> = {
      id: `task-${Date.now()}`,
      title,
      theme: selectedTheme,
      company: {
        name: companyName || 'Инновационная компания',
        industry: `${selectedTheme} & Software`,
        repName: 'Данияр Ахметов',
        repRole: 'Руководитель направления инноваций',
        repContact: 'innovations@company.kz'
      },
      cardColor: 'purple',
      updatedAt: 'Только что',
      proposalsCount: 0,
      context: `Проект в сфере ${selectedTheme}: ${promptText}`,
      need: `Корневая потребность бизнеса: ${promptText}. Текущий ручной процесс требует автоматизации и внедрения современного алгоритмического решения.`,
      targetUsers: 'Инженеры эксплуатации, аналитики данных, операционные менеджеры.',
      dataProvided: `• Основной источник данных: ${q1}\n• Документация схемы полей и синтетический генератор тестовых событий.`,
      constraints: `• Стек и среда выполнения: ${q2}\n• Контейнеризация в Docker Compose с инструкцией по локальному развертыванию.`,
      expectedResult: '1. Обученная модель или алгоритмический микросервис с REST API.\n2. Скрипты инференса и бенчмаркинга качества.\n3. Интерактивное веб-демо для защиты перед экспертами жюри.',
      successCriteria: `• Достижение целевых метрик: ${q3}\n• Воспроизводимость результатов обучения и чистый репозиторий с README.`,
      contact: 'Данияр Ахметов, Telegram: @daniyar_innov',
      interactionFormat: `${q4}\n• Финальная очная защита перед жюри и менторами HackAlem AI.`,
      published: true
    };

    const rating = calculateTaskRating(baseTask);
    const completeTask: Task = {
      ...(baseTask as Task),
      rating
    };

    onTaskCreated(completeTask);
  };

  const steps = [
    { num: 1, label: 'Описание' },
    { num: 2, label: 'Вопросы AI' },
    { num: 3, label: 'Карточка' },
    { num: 4, label: 'Подтверждение' },
  ];

  return (
    <div className="max-w-[860px] mx-auto space-y-6">
      {/* Title & Explanations */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#17171C] tracking-tight">
          Создание практической задачи с TALAP AI
        </h2>
        <p className="text-sm text-[#667085] mt-1">
          Опишите проблему бизнеса в свободной форме. Искусственный интеллект TALAP декомпозирует её и сформирует структурированный паспорт по стандарту хакатона.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white rounded-2xl border border-[#E5E7EF] p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          {steps.map((st, i) => {
            const isActive = currentStep === st.num;
            const isDone = currentStep > st.num;

            return (
              <React.Fragment key={st.num}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isDone
                      ? 'bg-[#36B875] text-white'
                      : isActive
                      ? 'bg-[#7047EB] text-white shadow-xs'
                      : 'bg-[#F5F6FA] text-[#667085] border border-[#E5E7EF]'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                  </div>
                  <span className={`text-xs font-bold ${
                    isActive ? 'text-[#17171C]' : 'text-[#667085]'
                  }`}>
                    {st.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${
                    currentStep > st.num ? 'bg-[#36B875]' : 'bg-[#E5E7EF]'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step 1: Input Form */}
      <div className="bg-white rounded-2xl border border-[#E5E7EF] p-6 shadow-2xs space-y-5">
        {/* Sample clickable hints */}
        <div>
          <span className="text-xs font-semibold text-[#667085] block mb-2">
            Примеры задач для быстрого старта (нажмите, чтобы заполнить):
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F5F6FA] hover:bg-[#F0ECFF] hover:text-[#7047EB] text-[#17171C] border border-[#E5E7EF] transition-colors cursor-pointer"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Company & Industry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
              Название компании
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Например: Jet Mobility KZ"
              className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
              Отраслевое направление
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as TaskTheme)}
              className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors cursor-pointer"
            >
              <option value="AI / ML">AI / ML & Computer Vision</option>
              <option value="FinTech">FinTech & Скоринг</option>
              <option value="LogTech">LogTech & Маршрутизация</option>
              <option value="GovTech">GovTech & Государственные сервисы</option>
              <option value="HealthTech">HealthTech & Медицина</option>
              <option value="E-commerce">E-commerce & Ритейл</option>
            </select>
          </div>
        </div>

        {/* Description textarea */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
            Свободное описание задачи или проблемы
          </label>
          <textarea
            rows={4}
            value={promptText}
            onChange={(e) => {
              setPromptText(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="Опишите, какую проблему бизнеса нужно решить, какой текущий ручной процесс и что ожидается от студенческой команды..."
            className="w-full p-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm leading-relaxed text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors resize-y"
          />
          <div className="flex justify-between items-center text-xs text-[#667085] mt-1.5">
            <span>Минимум 50 символов для точного AI-анализа</span>
            <span>{promptText.length} симв.</span>
          </div>
        </div>

        {/* Error message if any */}
        {analysisState === 'error' && (
          <div className="p-3 bg-[#F45F68]/10 border border-[#F45F68]/30 text-[#F45F68] rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage || 'Произошла ошибка при анализе. Пожалуйста, дополните описание.'}</span>
          </div>
        )}

        {/* Primary Action Button immediately below form */}
        <div className="pt-2 flex items-center justify-between border-t border-[#E5E7EF]">
          <div className="text-xs text-[#667085]">
            Шаг 1 из 2 перед формированием паспорта
          </div>

          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={analysisState === 'analyzing' || !promptText.trim()}
            className="h-11 px-6 bg-[#7047EB] hover:bg-[#5b32d6] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {analysisState === 'analyzing' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Идёт AI-анализ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Проанализировать с AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 2: Clarifying Questions from AI */}
      {analysisState === 'ready' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EF] p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EF]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#36B875]/15 text-[#36B875] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#17171C]">
                  Уточняющие вопросы от TALAP AI (4 вопроса)
                </h3>
                <p className="text-xs text-[#667085]">
                  Выберите наиболее подходящие ответы для автоматического заполнения паспорта
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#36B875] bg-[#36B875]/10 px-2.5 py-1 rounded-md">
              Готовность паспорта: 92%
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] space-y-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#7047EB] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#17171C] leading-snug">
                      {q.question}
                    </h4>
                    <p className="text-xs text-[#667085] mt-0.5">
                      {q.explanation}
                    </p>
                  </div>
                </div>

                {/* Selectable radio options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-7">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = q.selectedOption === opt;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`text-left p-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#F0ECFF] border-[#7047EB] text-[#7047EB] shadow-2xs'
                            : 'bg-white border-[#E5E7EF] text-[#17171C] hover:border-[#7047EB]/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#7047EB] bg-[#7047EB]' : 'border-[#E5E7EF]'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="leading-snug">{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Finalize Button */}
          <div className="pt-4 border-t border-[#E5E7EF] flex items-center justify-between">
            <span className="text-xs text-[#667085]">
              Паспорт будет скомпонован по 10 разделам и открыт в редакторе карточки
            </span>

            <button
              type="button"
              onClick={handleFinalize}
              className="h-11 px-6 bg-[#36B875] hover:bg-[#2fa066] text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Сформировать паспорт задачи</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
