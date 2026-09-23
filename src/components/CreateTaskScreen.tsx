import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskTheme, RatingBreakdown } from '../types';
import { AIQuestionDto } from '../api/types';
import { talapApi } from '../api/talapApi';
import { useAsyncAction } from '../utils/useAsyncAction';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Play, 
  X, 
  Building2, 
  HelpCircle,
  Award,
  Layers,
  Check,
  Eye,
  Send,
  Zap,
  RotateCcw,
  Loader2,
  AlertTriangle,
  FileText,
  Save
} from 'lucide-react';
import { ContextHelp } from './ui/ContextHelp';
import { useToast } from './ui/Toast';
import { Select, SelectOption } from './ui/Select';

interface CreateTaskScreenProps {
  onTaskCreated: (newTask: Task) => void;
  onCancel?: () => void;
}

export const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ 
  onTaskCreated,
  onCancel
}) => {
  const { showToast } = useToast();

  // 4 steps:
  // Step 1: Проблема
  // Step 2: Уточняющие вопросы
  // Step 3: Проверка карточки
  // Step 4: Публикация
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form states
  const [problemDescription, setProblemDescription] = useState(
    'Мы часто списываем продукты и хотим заранее понимать, сколько товара заказывать, чтобы избежать потерь.'
  );
  const [companyName, setCompanyName] = useState('Magnum Cash & Carry');
  const [taskTheme, setTaskTheme] = useState<TaskTheme>('AI / ML');

  // Dynamic AI Questions state
  const [questions, setQuestions] = useState<AIQuestionDto[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);

  // Answers stored strictly as Record<string, string> by field name
  const [answers, setAnswers] = useState<Record<string, string>>({
    targetUsers: 'Категорийные менеджеры, товароведы магазинов и операторы склада.',
    dataProvided: 'Обезличенная выгрузка из 45 000 чеков за 6 месяцев по категориям молочной и хлебной продукции + данные о погоде и праздниках.',
    expectedResult: 'Модель прогноза дневных продаж на 7 дней вперед с простым веб-интерфейсом для загрузки новых данных.',
    successCriteria: 'Снижение объема списаний на 15% при сохранении доступности товара на полках выше 95%.',
    constraints: 'Использование открытых библиотек Python (Pandas, LightGBM/CatBoost), работа на обычном офисном компьютере.',
    interactionFormat: 'Еженедельный 30-минутный созвон по вторникам + чат в Telegram с ведущим аналитиком.'
  });

  const [customAnswer, setCustomAnswer] = useState('');

  // Rating state from server API
  const [rating, setRating] = useState<RatingBreakdown | null>(null);
  const [isTestMode, setIsTestMode] = useState(true);

  // Fetch dynamic AI questions from API
  const loadQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    setQuestionsError(null);
    try {
      const res = await talapApi.fetchAIQuestions({
        problem: problemDescription,
        theme: taskTheme,
      });
      if (res.success && res.data) {
        setQuestions(res.data);
      } else {
        setQuestionsError(res.error?.message || 'Не удалось загрузить уточняющие вопросы');
      }
    } catch (err: any) {
      setQuestionsError(err?.message || 'Ошибка подключения к сервису вопросов');
    } finally {
      setQuestionsLoading(false);
    }
  }, [problemDescription, taskTheme]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Recalculate unified server rating whenever answers change
  useEffect(() => {
    let isMounted = true;
    talapApi.fetchTaskRating({
      need: problemDescription,
      targetUsers: answers.targetUsers || '',
      dataProvided: answers.dataProvided || '',
      expectedResult: answers.expectedResult || '',
      successCriteria: answers.successCriteria || '',
      constraints: answers.constraints || '',
      interactionFormat: answers.interactionFormat || ''
    }).then((res) => {
      if (isMounted && res.success && res.data) {
        setRating(res.data);
        setIsTestMode(Boolean(res.isMock));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [problemDescription, answers]);

  // Current active question
  const currentQuestion: AIQuestionDto | undefined = questions[questionIndex];

  // Async action for publishing
  const publishAction = useAsyncAction(
    async (published: boolean) => {
      const title = problemDescription.length > 70 
        ? problemDescription.slice(0, 70).replace(/\s+[^\s]+$/, '') + '...' 
        : problemDescription;

      return talapApi.createTask({
        title: title || 'Практическая задача бизнеса',
        theme: taskTheme,
        company: {
          name: companyName || 'Бизнес-партнёр TALAP',
          industry: `${taskTheme} & Retail`,
          repName: 'Данияр Ахметов',
          repRole: 'Руководитель аналитики',
          repContact: 'innovations@company.kz',
        },
        context: `Практическая задача компании: ${problemDescription}`,
        need: problemDescription,
        targetUsers: answers.targetUsers || 'Сотрудники компании и клиенты.',
        dataProvided: answers.dataProvided || 'Формат данных будет согласован с выбранной командой.',
        constraints: answers.constraints || 'Современный открытый стек технологий.',
        expectedResult: answers.expectedResult || 'Работающий прототип с понятной инструкцией.',
        successCriteria: answers.successCriteria || 'Работоспособность решения на тестовых данных.',
        contact: 'Данияр Ахметов, Telegram: @daniyar_biz',
        interactionFormat: answers.interactionFormat || 'Еженедельный созвон и чат для оперативных вопросов.',
        published,
      });
    },
    {
      onSuccess: (createdTask) => {
        showToast(
          createdTask.published
            ? 'Задача успешно опубликована в каталоге!'
            : 'Черновик задачи сохранён!',
          'success'
        );
        onTaskCreated(createdTask);
      },
      onError: (errMsg) => {
        showToast(`Ошибка: ${errMsg}`, 'error');
      },
    }
  );

  // Demo walkthrough controller
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const handleStartDemo = () => {
    setIsDemoActive(true);
    setDemoStep(1);
    setCurrentStep(1);
    setProblemDescription('Мы часто списываем продукты в 220 филиалах и хотим заранее понимать объём спроса.');
    setCompanyName('Magnum Retail KZ');
    showToast('Демо-режим: шаг 1 — формулирование проблемы', 'info');
  };

  const handleNextDemoStep = () => {
    if (demoStep === 1) {
      setDemoStep(2);
      setCurrentStep(2);
      setQuestionIndex(0);
      showToast('Демо-режим: шаг 2 — ответы на вопросы', 'info');
    } else if (demoStep === 2) {
      if (questionIndex < questions.length - 1) {
        setQuestionIndex((prev) => prev + 1);
      } else {
        setDemoStep(3);
        setCurrentStep(3);
        showToast('Демо-режим: шаг 3 — проверка карточки', 'info');
      }
    } else if (demoStep === 3) {
      setDemoStep(4);
      setCurrentStep(4);
      showToast('Демо-режим: шаг 4 — публикация задачи', 'success');
    } else {
      setIsDemoActive(false);
      setDemoStep(0);
      publishAction.execute(true);
    }
  };

  const handleStopDemo = () => {
    setIsDemoActive(false);
    setDemoStep(0);
    showToast('Демо-режим выключен.', 'info');
  };

  // Step 1 Submit
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) {
      showToast('Пожалуйста, опишите проблему своими словами.', 'error');
      return;
    }
    setCurrentStep(2);
    setQuestionIndex(0);
  };

  // Answer question in Step 2
  const handleAnswerQuestion = (val: string) => {
    if (!currentQuestion) return;
    const fieldKey = currentQuestion.field;
    setAnswers((prev) => ({ ...prev, [fieldKey]: val }));
    setCustomAnswer('');
    showToast(`Ответ сохранён: +${currentQuestion.maxPoints || 10} к рейтингу`, 'success');

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      setCurrentStep(3);
    }
  };

  const handleSkipQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      setCurrentStep(3);
    }
  };

  const totalScore = rating ? Math.min(100, Math.max(0, rating.totalScore)) : 0;

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 max-w-[1040px] mx-auto w-full overflow-y-auto pr-1">
      {/* Top Banner: Step Progress & Demo Trigger */}
      <div className="bg-white rounded-2xl border border-[#E2E5EE] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Step indicator */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0">
          <div className={`flex items-center gap-2 text-xs font-bold ${currentStep === 1 ? 'text-[#7047EB]' : currentStep > 1 ? 'text-[#2CC7B5]' : 'text-[#667085]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
              currentStep === 1 ? 'bg-[#7047EB] text-white' : currentStep > 1 ? 'bg-[#2CC7B5] text-white' : 'bg-[#F4F5F9] text-[#667085]'
            }`}>
              {currentStep > 1 ? '✓' : '1'}
            </span>
            <span>1. Проблема</span>
          </div>

          <div className="w-4 h-0.5 bg-[#E2E5EE]" />

          <div className={`flex items-center gap-2 text-xs font-bold ${currentStep === 2 ? 'text-[#7047EB]' : currentStep > 2 ? 'text-[#2CC7B5]' : 'text-[#667085]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
              currentStep === 2 ? 'bg-[#7047EB] text-white' : currentStep > 2 ? 'bg-[#2CC7B5] text-white' : 'bg-[#F4F5F9] text-[#667085]'
            }`}>
              {currentStep > 2 ? '✓' : '2'}
            </span>
            <span>2. Вопросы</span>
          </div>

          <div className="w-4 h-0.5 bg-[#E2E5EE]" />

          <div className={`flex items-center gap-2 text-xs font-bold ${currentStep === 3 ? 'text-[#7047EB]' : currentStep > 3 ? 'text-[#2CC7B5]' : 'text-[#667085]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
              currentStep === 3 ? 'bg-[#7047EB] text-white' : currentStep > 3 ? 'bg-[#2CC7B5] text-white' : 'bg-[#F4F5F9] text-[#667085]'
            }`}>
              {currentStep > 3 ? '✓' : '3'}
            </span>
            <span>3. Проверка</span>
          </div>

          <div className="w-4 h-0.5 bg-[#E2E5EE]" />

          <div className={`flex items-center gap-2 text-xs font-bold ${currentStep === 4 ? 'text-[#7047EB]' : 'text-[#667085]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
              currentStep === 4 ? 'bg-[#7047EB] text-white' : 'bg-[#F4F5F9] text-[#667085]'
            }`}>
              4
            </span>
            <span>4. Публикация</span>
          </div>
        </div>

        {/* Right side: Demo mode trigger */}
        <div className="flex items-center gap-3 shrink-0">
          {isTestMode && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF8E7] text-[#92400E] border border-[#FFC44D]/40">
              Тестовый режим
            </span>
          )}

          {!isDemoActive ? (
            <button
              type="button"
              onClick={handleStartDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8E7] hover:bg-[#FFF2D1] border border-[#FFC44D]/50 text-xs font-bold text-[#92400E] cursor-pointer transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Показать пример (демо)</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-[#F0ECFF] px-3 py-1.5 rounded-xl border border-[#7047EB]/30">
              <span className="w-2 h-2 rounded-full bg-[#7047EB] animate-ping" />
              <span className="text-xs font-bold text-[#7047EB]">
                Демо: шаг {demoStep} из 4
              </span>
              <button
                type="button"
                onClick={handleNextDemoStep}
                className="ml-1 px-2 py-0.5 bg-[#7047EB] text-white text-[11px] font-bold rounded-lg cursor-pointer"
              >
                Далее →
              </button>
              <button
                type="button"
                onClick={handleStopDemo}
                className="text-[#667085] hover:text-[#17171C] p-0.5 cursor-pointer"
                title="Остановить демо"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-[#667085] hover:text-[#17171C] transition-colors cursor-pointer"
            >
              Отмена
            </button>
          )}
        </div>
      </div>

      {/* Global Error Banner for Async Action */}
      {publishAction.isError && (
        <div className="p-4 bg-[#FFF0F0] border border-[#FF6266]/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-[#DC2626]">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{publishAction.error || 'Произошла ошибка при отправке на сервер.'}</span>
          </div>
          <button
            type="button"
            onClick={publishAction.retry}
            className="px-3 py-1.5 bg-[#FF6266] text-white font-bold rounded-lg hover:bg-[#E5484D] transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Повторить</span>
          </button>
        </div>
      )}

      {/* Main Step Body */}
      <AnimatePresence mode="wait">
        {/* ================= STEP 1: ПРОБЛЕМА ================= */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-[#E2E5EE] p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7047EB] uppercase tracking-wider">
                <span>Шаг 1 из 4</span>
                <span>·</span>
                <span>Формулировка проблемы</span>
              </div>
              <h2 className="text-2xl font-black text-[#17171C] tracking-tight">
                Что вы хотите улучшить?
              </h2>
              <p className="text-sm text-[#667085]">
                Опишите задачу простыми словами. TALAP поможет структурировать её для студенческих команд.
              </p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#17171C] block">
                    Название компании или бренда
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Например: Magnum Cash & Carry"
                    className="w-full h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-sm text-[#17171C] outline-none transition-all font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#17171C] block">
                    Отрасль / направление
                  </label>
                  <Select
                    value={taskTheme}
                    onChange={(val) => setTaskTheme(val as TaskTheme)}
                    options={[
                      { value: 'AI / ML', label: 'AI & Машинное обучение' },
                      { value: 'FinTech', label: 'FinTech & Финансы' },
                      { value: 'LogTech', label: 'LogTech & Доставка' },
                      { value: 'E-commerce', label: 'E-commerce & Ритейл' },
                      { value: 'GovTech', label: 'GovTech & Городские сервисы' },
                      { value: 'HealthTech', label: 'HealthTech & Медицина' },
                      { value: 'EdTech', label: 'EdTech & Образование' },
                    ]}
                    triggerClassName="h-11 rounded-xl bg-[#F8F9FD] border-[#E2E5EE] text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#17171C] flex items-center gap-1.5">
                    <span>Опишите проблему своими словами</span>
                    <ContextHelp topic="context" />
                  </label>
                  <span className="text-xs text-[#667085] font-semibold">
                    {problemDescription.length} символов
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Опишите текущую ситуацию, узкое место в процессе или задачу, которую нужно решить..."
                  className="w-full p-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-sm text-[#17171C] outline-none transition-all leading-relaxed resize-none font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-[#667085]">
                  <Sparkles className="w-4 h-4 text-[#7047EB]" />
                  <span>На следующем шаге TALAP задаст несколько уточняющих вопросов</span>
                </div>

                <button
                  type="submit"
                  className="h-11 px-6 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Перейти к вопросам</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ================= STEP 2: ДИНАМИЧЕСКИЕ AI-ВОПРОСЫ ================= */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Loading questions state */}
            {questionsLoading && (
              <div className="bg-white rounded-2xl border border-[#E2E5EE] p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#7047EB] animate-spin mx-auto" />
                <div className="text-sm font-bold text-[#17171C]">
                  Формируем уточняющие вопросы...
                </div>
                <div className="text-xs text-[#667085]">
                  Анализируем контекст вашей задачи
                </div>
              </div>
            )}

            {/* Error loading questions */}
            {questionsError && !questionsLoading && (
              <div className="bg-white rounded-2xl border border-[#FF6266]/30 p-8 text-center space-y-4">
                <AlertTriangle className="w-8 h-8 text-[#FF6266] mx-auto" />
                <div className="text-sm font-bold text-[#17171C]">
                  {questionsError}
                </div>
                <button
                  type="button"
                  onClick={loadQuestions}
                  className="px-4 py-2 bg-[#7047EB] text-white text-xs font-bold rounded-xl hover:bg-[#5E32DF] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Повторить загрузку</span>
                </button>
              </div>
            )}

            {/* Questions loaded & available */}
            {!questionsLoading && !questionsError && currentQuestion && (
              <div className="bg-white rounded-2xl border border-[#E2E5EE] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#E2E5EE] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#7047EB] uppercase tracking-wider">
                      <span>Вопрос {questionIndex + 1} из {questions.length}</span>
                      <span>·</span>
                      <span>+{currentQuestion.maxPoints || 10} баллов к готовности</span>
                    </div>
                    <h3 className="text-xl font-black text-[#17171C] tracking-tight">
                      {currentQuestion.question}
                    </h3>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F0ECFF] text-[#7047EB]">
                    {Math.round(((questionIndex + 1) / questions.length) * 100)}%
                  </span>
                </div>

                {currentQuestion.explanation && (
                  <p className="text-xs text-[#667085] leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                )}

                {/* Option buttons */}
                {currentQuestion.options && currentQuestion.options.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-[#667085] uppercase tracking-wider">
                      Выберите подходящий вариант:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentQuestion.options.map((opt, i) => {
                        const isSelected = answers[currentQuestion.field] === opt;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleAnswerQuestion(opt)}
                            className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-start gap-2.5 ${
                              isSelected
                                ? 'border-[#7047EB] bg-[#F0ECFF] text-[#7047EB] shadow-xs'
                                : 'border-[#E2E5EE] bg-[#F8F9FD] text-[#17171C] hover:border-[#7047EB]/40 hover:bg-white'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-md bg-white border border-[#E2E5EE] flex items-center justify-center text-[10px] font-bold shrink-0">
                              {i + 1}
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom input */}
                <div className="space-y-2 pt-2 border-t border-[#F0F2F7]">
                  <div className="text-xs font-bold text-[#667085] uppercase tracking-wider">
                    Или напишите свой вариант:
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAnswer || answers[currentQuestion.field] || ''}
                      onChange={(e) => setCustomAnswer(e.target.value)}
                      placeholder={currentQuestion.exampleAnswer || 'Введите свой ответ...'}
                      className="flex-1 h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] outline-none transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customAnswer.trim()) {
                          handleAnswerQuestion(customAnswer.trim());
                        }
                      }}
                      disabled={!customAnswer.trim()}
                      className="h-11 px-5 bg-[#7047EB] hover:bg-[#5E32DF] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Сохранить</span>
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom navigation */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (questionIndex > 0) {
                        setQuestionIndex((prev) => prev - 1);
                      } else {
                        setCurrentStep(1);
                      }
                    }}
                    className="text-xs font-bold text-[#667085] hover:text-[#17171C] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Назад</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSkipQuestion}
                      className="text-xs font-bold text-[#667085] hover:text-[#17171C] transition-colors cursor-pointer"
                    >
                      Пропустить этот вопрос
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="h-10 px-4 rounded-xl border border-[#E2E5EE] hover:bg-[#F8F9FD] text-xs font-bold text-[#17171C] transition-colors cursor-pointer"
                    >
                      К проверке карточки →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ================= STEP 3: ПРОВЕРКА КАРТОЧКИ ================= */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-[#E2E5EE] p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E5EE] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#7047EB] uppercase tracking-wider">
                  <span>Шаг 3 из 4</span>
                  <span>·</span>
                  <span>Проверка сформированной карточки</span>
                </div>
                <h2 className="text-2xl font-black text-[#17171C] tracking-tight">
                  Проверьте данные задачи
                </h2>
              </div>

              {rating && (
                <div className="flex items-center gap-3 bg-[#F8F9FD] p-2.5 px-4 rounded-xl border border-[#E2E5EE] shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#667085]">Готовность:</div>
                    <div className="text-sm font-black text-[#7047EB]">
                      {totalScore} / 100 баллов
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    rating.readinessLevel === 'priority'
                      ? 'bg-[#7047EB] text-white'
                      : rating.readinessLevel === 'ready'
                      ? 'bg-[#2CC7B5] text-white'
                      : rating.readinessLevel === 'working'
                      ? 'bg-[#FFC44D] text-[#92400E]'
                      : 'bg-[#FF6266] text-white'
                  }`}>
                    {rating.readinessLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Summary card preview */}
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F8F9FD] rounded-xl border border-[#E2E5EE] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#7047EB] text-sm">{companyName}</span>
                  <span className="text-[#667085] font-semibold">{taskTheme}</span>
                </div>
                <div className="text-sm font-bold text-[#17171C]">{problemDescription}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#F8F9FD] rounded-xl border border-[#E2E5EE] space-y-1">
                  <span className="font-bold text-[#667085] block">Пользователи решения:</span>
                  <p className="text-[#17171C] font-medium">{answers.targetUsers || 'Не заполнено'}</p>
                </div>

                <div className="p-3.5 bg-[#F8F9FD] rounded-xl border border-[#E2E5EE] space-y-1">
                  <span className="font-bold text-[#667085] block">Предоставляемые данные:</span>
                  <p className="text-[#17171C] font-medium">{answers.dataProvided || 'Не заполнено'}</p>
                </div>

                <div className="p-3.5 bg-[#F8F9FD] rounded-xl border border-[#E2E5EE] space-y-1">
                  <span className="font-bold text-[#667085] block">Ожидаемый результат:</span>
                  <p className="text-[#17171C] font-medium">{answers.expectedResult || 'Не заполнено'}</p>
                </div>

                <div className="p-3.5 bg-[#F8F9FD] rounded-xl border border-[#E2E5EE] space-y-1">
                  <span className="font-bold text-[#667085] block">Критерии успеха:</span>
                  <p className="text-[#17171C] font-medium">{answers.successCriteria || 'Не заполнено'}</p>
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(2);
                  setQuestionIndex(0);
                }}
                className="text-xs font-bold text-[#667085] hover:text-[#17171C] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Вернуться к вопросам</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={publishAction.isLoading}
                  onClick={() => publishAction.execute(false)}
                  className="h-11 px-5 rounded-xl border border-[#E2E5EE] hover:bg-[#F8F9FD] text-xs font-bold text-[#17171C] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {publishAction.isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7047EB]" />
                      <span>Сохраняем…</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Сохранить как черновик</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="h-11 px-6 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Далее к публикации</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 4: ПУБЛИКАЦИЯ ================= */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-[#E2E5EE] p-6 sm:p-8 shadow-xs space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#F0ECFF] text-[#7047EB] mx-auto flex items-center justify-center shadow-sm">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-2xl font-black text-[#17171C] tracking-tight">
                Карточка готова к публикации
              </h2>
              <p className="text-xs sm:text-sm text-[#667085]">
                Студенческие команды смогут изучить вашу задачу в каталоге и отправить предложения.
              </p>
            </div>

            {/* Readiness Summary */}
            {rating && (
              <div className="p-5 rounded-2xl bg-[#F8F9FD] border border-[#E2E5EE] max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#667085]">Итоговая готовность:</span>
                  <span className="text-sm font-black text-[#7047EB]">
                    {totalScore} из 100 баллов
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#667085]">Уровень задачи:</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${
                    rating.readinessLevel === 'priority'
                      ? 'bg-[#7047EB] text-white'
                      : rating.readinessLevel === 'ready'
                      ? 'bg-[#2CC7B5] text-white'
                      : rating.readinessLevel === 'working'
                      ? 'bg-[#FFC44D] text-[#92400E]'
                      : 'bg-[#FF6266] text-white'
                  }`}>
                    {rating.readinessLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#667085]">Позиция в каталоге:</span>
                  <span className="text-xs font-bold text-[#2CC7B5]">
                    {totalScore >= 70 ? 'В топе рекомендаций' : 'Стандартное размещение'}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                disabled={publishAction.isLoading}
                onClick={() => setCurrentStep(3)}
                className="h-11 px-5 rounded-xl border border-[#E2E5EE] text-xs font-bold text-[#667085] hover:text-[#17171C] transition-colors cursor-pointer disabled:opacity-50"
              >
                Вернуться к проверке
              </button>

              <button
                type="button"
                disabled={publishAction.isLoading}
                onClick={() => publishAction.execute(true)}
                className="h-11 px-8 bg-[#7047EB] hover:bg-[#5E32DF] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(112,71,235,0.3)]"
              >
                {publishAction.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Публикуем…</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Опубликовать в каталоге</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
