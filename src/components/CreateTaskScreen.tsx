import React, { useState, useEffect } from 'react';
import { SAMPLE_AI_QUESTIONS } from '../data/mockData';
import { ClarifyingQuestion, Task, TaskTheme, RatingBreakdown } from '../types';
import { calculateTaskRating } from '../utils/ratingCalculator';
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
  RotateCcw
} from 'lucide-react';
import { ContextHelp } from './ui/ContextHelp';
import { useToast } from './ui/Toast';

interface CreateTaskScreenProps {
  onTaskCreated: (newTask: Task) => void;
  onCancel?: () => void;
}

export const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ 
  onTaskCreated,
  onCancel
}) => {
  const { showToast } = useToast();

  // 4 clear steps:
  // Step 1: Что вы хотите улучшить?
  // Step 2: Уточняющие вопросы TALAP (one-by-one conversational flow)
  // Step 3: Проверьте карточку задачи
  // Step 4: Публикация и позиция в каталоге
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form states
  const [problemDescription, setProblemDescription] = useState(
    'Мы часто списываем продукты и хотим заранее понимать, сколько товара заказывать, чтобы избежать потерь.'
  );
  const [companyName, setCompanyName] = useState('Magnum Cash & Carry');
  const [taskTheme, setTaskTheme] = useState<TaskTheme>('AI / ML');

  // Conversational questions state
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    targetUsers: 'Категорийные менеджеры, товароведы магазинов и операторы склада.',
    dataProvided: 'Обезличенная выгрузка из 45 000 чеков за 6 месяцев по категориям молочной и хлебной продукции + данные о погоде и праздниках.',
    expectedResult: 'Модель прогноза дневных продаж на 7 дней вперед с простым веб-интерфейсом для загрузки новых данных.',
    successCriteria: 'Снижение объема списаний на 15% при сохранении доступности товара на полках выше 95%.',
    constraints: 'Использование открытых библиотек Python (Pandas, LightGBM/CatBoost), работа на обычном офисном компьютере.',
    interactionFormat: 'Еженедельный 30-минутный созвон по вторникам + чат в Telegram с ведущим аналитиком.'
  });

  // Current question active selection / custom input
  const currentQuestion = SAMPLE_AI_QUESTIONS[questionIndex];
  const [customAnswer, setCustomAnswer] = useState('');

  // Rating state
  const [rating, setRating] = useState<RatingBreakdown>(() => 
    calculateTaskRating({
      need: problemDescription,
      targetUsers: answers.targetUsers,
      dataProvided: answers.dataProvided,
      expectedResult: answers.expectedResult,
      successCriteria: answers.successCriteria,
      constraints: answers.constraints,
      interactionFormat: answers.interactionFormat
    })
  );

  // Demo mode state
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // Recalculate rating whenever answers or description change
  useEffect(() => {
    const updated = calculateTaskRating({
      need: problemDescription,
      targetUsers: answers.targetUsers,
      dataProvided: answers.dataProvided,
      expectedResult: answers.expectedResult,
      successCriteria: answers.successCriteria,
      constraints: answers.constraints,
      interactionFormat: answers.interactionFormat
    });
    setRating(updated);
  }, [problemDescription, answers]);

  // Demo walkthrough controller
  const handleStartDemo = () => {
    setIsDemoActive(true);
    setDemoStep(1);
    setCurrentStep(1);
    setProblemDescription('Мы часто списываем продукты в 220 филиалах и хотим заранее понимать объём спроса.');
    setCompanyName('Magnum Retail KZ');
    showToast('Демо-режим: шаг 1 — слабое описание задачи', 'info');
  };

  const handleNextDemoStep = () => {
    if (demoStep === 1) {
      setDemoStep(2);
      setCurrentStep(2);
      setQuestionIndex(0);
      showToast('Демо-режим: шаг 2 — отвечаем на уточняющие вопросы', 'info');
    } else if (demoStep === 2) {
      if (questionIndex < SAMPLE_AI_QUESTIONS.length - 1) {
        setQuestionIndex(prev => prev + 1);
      } else {
        setDemoStep(3);
        setCurrentStep(3);
        showToast('Демо-режим: шаг 3 — проверяем собранную карточку', 'info');
      }
    } else if (demoStep === 3) {
      setDemoStep(4);
      setCurrentStep(4);
      showToast('Демо-режим: шаг 4 — публикация и рост рейтинга до «Готовая»', 'success');
    } else {
      setIsDemoActive(false);
      setDemoStep(0);
      handlePublish();
    }
  };

  const handleStopDemo = () => {
    setIsDemoActive(false);
    setDemoStep(0);
    showToast('Демо-режим выключен. Вы можете продолжить самостоятельно.', 'info');
  };

  // Step 1 -> Step 2
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) {
      showToast('Пожалуйста, опишите проблему своими словами.', 'error');
      return;
    }
    setCurrentStep(2);
    setQuestionIndex(0);
  };

  // Answer a question in Step 2
  const handleAnswerQuestion = (val: string) => {
    if (!currentQuestion) return;
    const field = currentQuestion.field;
    setAnswers(prev => ({ ...prev, [field]: val }));
    setCustomAnswer('');
    showToast(`Ответ сохранён: +${currentQuestion.maxPoints || 10} к рейтингу!`, 'success');

    if (questionIndex < SAMPLE_AI_QUESTIONS.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      setCurrentStep(3);
    }
  };

  const handleSkipQuestion = () => {
    if (questionIndex < SAMPLE_AI_QUESTIONS.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      setCurrentStep(3);
    }
  };

  // Publish Task
  const handlePublish = () => {
    const title = problemDescription.length > 70 
      ? problemDescription.slice(0, 70).replace(/\s+[^\s]+$/, '') + '...' 
      : problemDescription;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title || 'Практическая задача бизнеса',
      theme: taskTheme,
      company: {
        name: companyName || 'Бизнес-партнёр TALAP',
        industry: `${taskTheme} & Retail`,
        repName: 'Данияр Ахметов',
        repRole: 'Руководитель аналитики',
        repContact: 'innovations@company.kz'
      },
      cardColor: 'purple',
      updatedAt: 'Только что',
      proposalsCount: 0,
      context: `Практическая задача компании: ${problemDescription}`,
      need: problemDescription,
      targetUsers: answers.targetUsers || 'Сотрудники компании и конечные пользователи.',
      dataProvided: answers.dataProvided || 'Формат данных будет предоставлен выбранной команде.',
      constraints: answers.constraints || 'Современный открытый стек технологий.',
      expectedResult: answers.expectedResult || 'Работающий прототип с инструкцией по запуску.',
      successCriteria: answers.successCriteria || 'Работоспособность решения на проверочных данных бизнеса.',
      contact: 'Данияр Ахметов, Telegram: @daniyar_biz',
      interactionFormat: answers.interactionFormat || 'Еженедельный синк и чат для оперативных вопросов.',
      published: true,
      rating
    };

    onTaskCreated(newTask);
    showToast('Задача опубликована в каталоге! Студенческие команды могут отправлять предложения.', 'success');
  };

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

      {/* Main Step Body */}
      <AnimatePresence mode="wait">
        {/* ================= STEP 1: ЧТО ВЫ ХОТИТЕ УЛУЧШИТЬ? ================= */}
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
                Опишите проблему так, как рассказали бы её коллеге. TALAP поможет оформить её в чёткую задачу для студентов.
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
                  <select
                    value={taskTheme}
                    onChange={(e) => setTaskTheme(e.target.value as TaskTheme)}
                    className="w-full h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-sm text-[#17171C] outline-none transition-all font-medium cursor-pointer"
                  >
                    <option value="AI / ML">AI & Машинное обучение</option>
                    <option value="FinTech">FinTech & Финансы</option>
                    <option value="LogTech">LogTech & Доставка</option>
                    <option value="E-commerce">E-commerce & Ритейл</option>
                    <option value="GovTech">GovTech & Городские сервисы</option>
                    <option value="HealthTech">HealthTech & Медицина</option>
                    <option value="EdTech">EdTech & Образование</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#17171C] flex items-center gap-1.5">
                    <span>Опишите проблему своими словами</span>
                    <span className="text-[#FF6266]">*</span>
                  </label>
                  <ContextHelp topic="readiness" label="Как это оценивается" />
                </div>

                <textarea
                  rows={4}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Опишите проблему так, как рассказали бы её коллеге."
                  className="w-full p-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-sm text-[#17171C] outline-none transition-all font-medium resize-none leading-relaxed"
                  required
                />

                <div className="p-3 bg-[#F0ECFF]/60 rounded-xl border border-[#7047EB]/20 text-xs text-[#475467] flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#7047EB] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#7047EB]">Пример хорошего описания: </span>
                    «Мы часто списываем продукты в 220 магазинах и хотим заранее прогнозировать спрос на молочную продукцию, чтобы избежать потерь и не оставлять пустые полки.»
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-[#667085]">
                  После этого шага TALAP задаст несколько коротких вопросов для повышения рейтинга.
                </div>

                <button
                  type="submit"
                  className="h-11 px-6 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(112,71,235,0.25)]"
                >
                  <span>Продолжить</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ================= STEP 2: УТОЧНЯЮЩИЕ ВОПРОСЫ ================= */}
        {currentStep === 2 && currentQuestion && (
          <motion.div
            key={`step2-${questionIndex}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="bg-white rounded-2xl border border-[#E2E5EE] p-6 sm:p-8 shadow-xs space-y-6"
          >
            {/* Header with question counter and points potential */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5EE]">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#7047EB] uppercase tracking-wider">
                  Вопрос {questionIndex + 1} из {SAMPLE_AI_QUESTIONS.length}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#17171C] tracking-tight">
                  {currentQuestion.question}
                </h3>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8FAF7] text-[#149A8B] border border-[#2CC7B5]/30">
                  до +{currentQuestion.maxPoints || 15} баллов
                </span>
              </div>
            </div>

            {/* Explanation box: Зачем это нужно */}
            <div className="p-4 bg-[#F8F9FD] rounded-xl border border-[#E2E5EE] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#17171C]">
                <HelpCircle className="w-4 h-4 text-[#7047EB]" />
                <span>Зачем это нужно студентам:</span>
              </div>
              <p className="text-xs text-[#667085] leading-relaxed">
                {currentQuestion.explanation}
              </p>
              {currentQuestion.exampleAnswer && (
                <div className="text-[11px] text-[#475467] font-medium pt-1 border-t border-[#E2E5EE]/60">
                  <span className="font-bold text-[#7047EB]">Пример ответа: </span>
                  {currentQuestion.exampleAnswer}
                </div>
              )}
            </div>

            {/* Quick Answer Options */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#17171C] block">
                Выберите готовый вариант или напишите свой:
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAnswerQuestion(opt)}
                    className="p-3.5 text-left rounded-xl border border-[#E2E5EE] hover:border-[#7047EB] hover:bg-[#F0ECFF]/30 transition-all text-xs font-medium text-[#17171C] flex items-center justify-between group cursor-pointer"
                  >
                    <span>{opt}</span>
                    <span className="text-xs font-bold text-[#7047EB] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 ml-2">
                      <span>Выбрать</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Answer Input */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-[#667085] block">
                Или напишите свой вариант:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                  placeholder="Ваш ответ своими словами..."
                  className="flex-1 h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] outline-none font-medium"
                />
                <button
                  type="button"
                  disabled={!customAnswer.trim()}
                  onClick={() => customAnswer.trim() && handleAnswerQuestion(customAnswer.trim())}
                  className="h-11 px-4 bg-[#7047EB] disabled:bg-[#E2E5EE] text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  Применить
                </button>
              </div>
            </div>

            {/* Step 2 Bottom Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E2E5EE]">
              <button
                type="button"
                onClick={() => {
                  if (questionIndex > 0) setQuestionIndex(prev => prev - 1);
                  else setCurrentStep(1);
                }}
                className="text-xs font-bold text-[#667085] hover:text-[#17171C] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад</span>
              </button>

              <button
                type="button"
                onClick={handleSkipQuestion}
                className="text-xs font-bold text-[#7047EB] hover:underline cursor-pointer"
              >
                Пропустить, отвечу позже →
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 3: ПРОВЕРЬТЕ КАРТОЧКУ ================= */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-[#E2E5EE] p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7047EB] uppercase tracking-wider">
                <span>Шаг 3 из 4</span>
                <span>·</span>
                <span>Проверка перед подтверждением</span>
              </div>
              <h2 className="text-2xl font-black text-[#17171C] tracking-tight">
                Проверьте карточку задачи
              </h2>
              <p className="text-sm text-[#667085]">
                Мы использовали только предоставленные вами сведения. Проверьте карточку перед подтверждением.
              </p>
            </div>

            {/* Card preview table / fields */}
            <div className="space-y-4 p-5 rounded-2xl bg-[#F8F9FD] border border-[#E2E5EE]">
              <div className="flex items-center justify-between border-b border-[#E2E5EE] pb-3">
                <div>
                  <span className="text-xs font-bold text-[#667085]">{companyName} · {taskTheme}</span>
                  <h3 className="text-base font-bold text-[#17171C] mt-0.5">
                    {problemDescription}
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white border border-[#E2E5EE] text-[#7047EB]">
                  {rating.totalScore} / 100 баллов
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-[#667085] block">Кто будет пользоваться решением:</span>
                  <p className="text-[#17171C] bg-white p-2.5 rounded-lg border border-[#E2E5EE]">
                    {answers.targetUsers || 'Не заполнено'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[#667085] block">Какие данные вы предоставите:</span>
                  <p className="text-[#17171C] bg-white p-2.5 rounded-lg border border-[#E2E5EE]">
                    {answers.dataProvided || 'Не заполнено'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[#667085] block">Что должна подготовить команда:</span>
                  <p className="text-[#17171C] bg-white p-2.5 rounded-lg border border-[#E2E5EE]">
                    {answers.expectedResult || 'Не заполнено'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[#667085] block">Как вы поймёте, что задача решена:</span>
                  <p className="text-[#17171C] bg-white p-2.5 rounded-lg border border-[#E2E5EE]">
                    {answers.successCriteria || 'Не заполнено'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[#667085] block">Какие условия нужно учесть:</span>
                  <p className="text-[#17171C] bg-white p-2.5 rounded-lg border border-[#E2E5EE]">
                    {answers.constraints || 'Не заполнено'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[#667085] block">Связь с бизнесом и формат общения:</span>
                  <p className="text-[#17171C] bg-white p-2.5 rounded-lg border border-[#E2E5EE]">
                    {answers.interactionFormat || 'Не заполнено'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
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

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="h-11 px-6 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(112,71,235,0.25)]"
              >
                <span>Подтвердить карточку</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 4: ОПУБЛИКУЙТЕ ЗАДАЧУ ================= */}
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
                Студенческие команды смогут изучить вашу задачу в каталоге и направить обоснованные предложения.
              </p>
            </div>

            {/* Readiness Summary Card */}
            <div className="p-5 rounded-2xl bg-[#F8F9FD] border border-[#E2E5EE] max-w-md mx-auto text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#667085]">Итоговая готовность:</span>
                <span className="text-sm font-black text-[#7047EB]">{rating.totalScore} из 100 баллов</span>
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
                <span className="text-xs font-bold text-[#667085]">Ориентировочная позиция в каталоге:</span>
                <span className="text-xs font-bold text-[#2CC7B5]">В топ-3 рекомендаций</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="h-11 px-5 rounded-xl border border-[#E2E5EE] text-xs font-bold text-[#667085] hover:text-[#17171C] transition-colors cursor-pointer"
              >
                Вернуться к проверке
              </button>

              <button
                type="button"
                onClick={handlePublish}
                className="h-11 px-8 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(112,71,235,0.3)]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Опубликовать в каталоге</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
