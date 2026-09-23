import React, { useState, useEffect } from 'react';
import { Task, RatingBreakdown } from '../types';
import { calculateTaskRating } from '../utils/ratingCalculator';
import { RatingPanel } from './RatingPanel';
import { AccordionItem } from './ui/Accordion';
import { ContextHelp } from './ui/ContextHelp';
import { useToast } from './ui/Toast';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft,
  Eye,
  Check,
  Sparkles,
  Building2,
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface EditTaskScreenProps {
  task: Task;
  onSaveTask: (updatedTask: Task) => void;
  onPreviewStudent: () => void;
  onBackToCatalog: () => void;
}

export const EditTaskScreen: React.FC<EditTaskScreenProps> = ({
  task,
  onSaveTask,
  onPreviewStudent,
  onBackToCatalog,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Task>(task);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublished, setIsPublished] = useState(task.published);
  const [previewRating, setPreviewRating] = useState<RatingBreakdown>(task.rating);
  const [scoreGained, setScoreGained] = useState<number | null>(null);

  // Requirement 4: By default, filled sections are collapsed, only 1 section is open
  const [activeSection, setActiveSection] = useState<string>('context');

  const toggleSection = (key: string) => {
    setActiveSection((prev) => (prev === key ? '' : key));
  };

  useEffect(() => {
    setFormData(task);
    setPreviewRating(task.rating);
    setIsPublished(task.published);
    setHasUnsavedChanges(false);
    setScoreGained(null);
  }, [task.id]);

  const handleFieldChange = (field: keyof Task, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setHasUnsavedChanges(true);
    const calculated = calculateTaskRating(updated);
    setPreviewRating(calculated);
  };

  const handleApplySuggestion = (sugId: string) => {
    const currentRating = calculateTaskRating(formData);
    const suggestion = currentRating.suggestions.find((s) => s.id === sugId);
    if (!suggestion) return;

    const fieldKey = suggestion.field as keyof Task;
    const currentVal = (formData[fieldKey] as string) || '';
    const newVal = currentVal ? `${currentVal}\n\n${suggestion.sampleValue}` : suggestion.sampleValue;

    handleFieldChange(fieldKey, newVal);
    showToast('Рекомендация TALAP добавлена в поле', 'info');
  };

  const handleOpenMissionField = (field: keyof Task) => {
    if (field === 'need' || field === 'context') {
      setActiveSection('context');
    } else if (field === 'dataProvided' || field === 'targetUsers') {
      setActiveSection('data');
    } else if (field === 'expectedResult') {
      setActiveSection('outcome');
    } else if (field === 'successCriteria') {
      setActiveSection('success');
    } else if (field === 'constraints' || field === 'contact' || field === 'interactionFormat') {
      setActiveSection('mentorship');
    }
  };

  const handleConfirmChanges = () => {
    const calculated = calculateTaskRating(formData);
    const oldScore = task.rating.totalScore;
    const newScore = calculated.totalScore;
    const diff = Math.max(0, newScore - oldScore);

    const savedTask: Task = {
      ...formData,
      published: isPublished,
      rating: calculated,
      updatedAt: 'Только что',
    };

    onSaveTask(savedTask);
    setHasUnsavedChanges(false);
    setPreviewRating(calculated);

    if (diff > 0) {
      setScoreGained(diff);
      showToast(`Карточка сохранена! Начислено +${diff} баллов к рейтингу`, 'success');
    } else {
      showToast('Изменения сохранены', 'success');
    }
  };

  // Section completion helpers & 1-line summaries (Requirement 4)
  const isContextFilled = Boolean(formData.need?.trim() && formData.context?.trim());
  const isDataFilled = Boolean(formData.dataProvided?.trim() && formData.targetUsers?.trim());
  const isOutcomeFilled = Boolean(formData.expectedResult?.trim());
  const isSuccessFilled = Boolean(formData.successCriteria?.trim());
  const isMentorshipFilled = Boolean(formData.interactionFormat?.trim() && formData.contact?.trim());

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
      {/* 1. Header Zone: Single H1 and 1-line subtitle (Requirement 2 & 17) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToCatalog}
              className="text-xs font-bold text-[#667085] hover:text-[#7047EB] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Вернуться в каталог</span>
            </button>
            <span className="text-xs text-[#E2E5EE]">/</span>
            <span className="text-xs font-semibold text-[#667085] truncate max-w-xs">{formData.company.name}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#17171C] tracking-tight">
            Карточка: {formData.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] max-w-xl">
            Заполняйте прикладные блоки задачи. Рейтинг растёт по мере предоставления данных и критериев.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onPreviewStudent}
            className="h-10 px-4 bg-white border border-[#E2E5EE] hover:bg-[#F4F5F9] text-[#17171C] text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Eye className="w-4 h-4 text-[#7047EB]" />
            <span>Студенческий вид</span>
          </button>

          <button
            type="button"
            onClick={handleConfirmChanges}
            disabled={!hasUnsavedChanges}
            className={`h-10 px-5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-[#7047EB] hover:bg-[#5E32DF] text-white shadow-xs'
                : 'bg-[#F4F5F9] text-[#98A2B3] cursor-not-allowed border border-[#E2E5EE]'
            }`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{hasUnsavedChanges ? 'Сохранить изменения' : 'Сохранено'}</span>
          </button>
        </div>
      </div>

      {/* 2. 12-Column Grid Layout: 7 cols main, 5 cols rating panel, 24px gap (Requirement 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Task Form with Accordion Sections */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Title & Theme Card */}
          <div className="bg-white rounded-2xl border border-[#E2E5EE] p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8 space-y-1">
                <label className="text-xs font-bold text-[#17171C]">
                  Название задачи
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="Например: Детекция дубликатов объявлений на базе эмбеддингов"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-sm font-semibold text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] focus:ring-2 focus:ring-[#7047EB]/20 transition-all"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="text-xs font-bold text-[#17171C]">
                  Отрасль / Направление
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => handleFieldChange('theme', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-bold text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all cursor-pointer"
                >
                  <option value="AI / ML">AI / ML</option>
                  <option value="FinTech">FinTech</option>
                  <option value="LogTech">LogTech</option>
                  <option value="GovTech">GovTech</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="E-commerce">E-commerce</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accordion 1: Бизнес-контекст и потребность */}
          <AccordionItem
            stepNumber={1}
            title="Бизнес-контекст и потребность"
            subtitle="Какую проблему бизнеса решает задача"
            summary={formData.need ? formData.need.slice(0, 80) + '...' : undefined}
            isFilled={isContextFilled}
            badgeText={isContextFilled ? 'Заполнено · 20 баллов' : 'Требует данных'}
            scoreBonus="+20 б."
            isOpen={activeSection === 'context'}
            onToggle={() => toggleSection('context')}
          >
            <div className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#17171C]">
                    Потребность бизнеса (простыми словами)
                  </label>
                  <ContextHelp topic="readiness" />
                </div>
                <textarea
                  rows={3}
                  value={formData.need}
                  onChange={(e) => handleFieldChange('need', e.target.value)}
                  placeholder="Опишите, с какой трудностью сталкивается компания сейчас..."
                  className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17171C]">
                  Контекст задачи
                </label>
                <textarea
                  rows={3}
                  value={formData.context}
                  onChange={(e) => handleFieldChange('context', e.target.value)}
                  placeholder="Опишите текущий рабочий процесс и используемые инструменты..."
                  className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                />
              </div>
            </div>
          </AccordionItem>

          {/* Accordion 2: Предоставляемые данные и целевая аудитория */}
          <AccordionItem
            stepNumber={2}
            title="Предоставляемые данные и аудитория"
            subtitle="Что получит команда для старта"
            summary={formData.dataProvided ? formData.dataProvided.slice(0, 80) + '...' : undefined}
            isFilled={isDataFilled}
            badgeText={isDataFilled ? 'Заполнено · 25 баллов' : 'Требует данных'}
            scoreBonus="+25 б."
            isOpen={activeSection === 'data'}
            onToggle={() => toggleSection('data')}
          >
            <div className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#17171C]">
                    Данные, которые предоставляет компания
                  </label>
                  <ContextHelp topic="data" />
                </div>
                <textarea
                  rows={3}
                  value={formData.dataProvided}
                  onChange={(e) => handleFieldChange('dataProvided', e.target.value)}
                  placeholder="Опишите датасеты, API, дампы, схему базы или тестовые выгрузки..."
                  className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17171C]">
                  Целевая аудитория и конечные пользователи
                </label>
                <input
                  type="text"
                  value={formData.targetUsers}
                  onChange={(e) => handleFieldChange('targetUsers', e.target.value)}
                  placeholder="Например: Модераторы контента, покупатели на сайте..."
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                />
              </div>
            </div>
          </AccordionItem>

          {/* Accordion 3: Ожидаемый результат решения */}
          <AccordionItem
            stepNumber={3}
            title="Ожидаемый результат решения"
            subtitle="Что именно должна сдать студенческая команда"
            summary={formData.expectedResult ? formData.expectedResult.slice(0, 80) + '...' : undefined}
            isFilled={isOutcomeFilled}
            badgeText={isOutcomeFilled ? 'Заполнено · 20 баллов' : 'Требует данных'}
            scoreBonus="+20 б."
            isOpen={activeSection === 'outcome'}
            onToggle={() => toggleSection('outcome')}
          >
            <div className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#17171C]">
                    Ожидаемый артефакт (результат спринта)
                  </label>
                  <ContextHelp topic="criteria" />
                </div>
                <textarea
                  rows={3}
                  value={formData.expectedResult}
                  onChange={(e) => handleFieldChange('expectedResult', e.target.value)}
                  placeholder="Микросервис в Docker, веб-дэшборд, ML-пайплайн с валидацией..."
                  className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                />
              </div>
            </div>
          </AccordionItem>

          {/* Accordion 4: Критерии успеха и метрики */}
          <AccordionItem
            stepNumber={4}
            title="Критерии успеха и метрики"
            subtitle="Как бизнес поймёт, что задача решена качественно"
            summary={formData.successCriteria ? formData.successCriteria.slice(0, 80) + '...' : undefined}
            isFilled={isSuccessFilled}
            badgeText={isSuccessFilled ? 'Заполнено · 15 баллов' : 'Требует данных'}
            scoreBonus="+15 б."
            isOpen={activeSection === 'success'}
            onToggle={() => toggleSection('success')}
          >
            <div className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#17171C]">
                    Критерии успеха решения
                  </label>
                  <ContextHelp topic="criteria" />
                </div>
                <textarea
                  rows={3}
                  value={formData.successCriteria}
                  onChange={(e) => handleFieldChange('successCriteria', e.target.value)}
                  placeholder="Например: F1-score > 0.88, задержка ответа < 150мс..."
                  className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                />
              </div>
            </div>
          </AccordionItem>

          {/* Accordion 5: Взаимодействие, контакты и ограничения */}
          <AccordionItem
            stepNumber={5}
            title="Взаимодействие и ограничения"
            subtitle="Формат менторства, контакты и технологический стек"
            summary={formData.interactionFormat ? formData.interactionFormat.slice(0, 80) + '...' : undefined}
            isFilled={isMentorshipFilled}
            badgeText={isMentorshipFilled ? 'Заполнено · 20 баллов' : 'Требует данных'}
            scoreBonus="+20 б."
            isOpen={activeSection === 'mentorship'}
            onToggle={() => toggleSection('mentorship')}
          >
            <div className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17171C]">
                  Формат взаимодействия и синхронизаций
                </label>
                <input
                  type="text"
                  value={formData.interactionFormat}
                  onChange={(e) => handleFieldChange('interactionFormat', e.target.value)}
                  placeholder="Например: Еженедельный синк по четвергам в Google Meet..."
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#17171C]">
                    Контактное лицо ментора
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => handleFieldChange('contact', e.target.value)}
                    placeholder="Имя, должность, Telegram..."
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#17171C]">
                    Ограничения и предпочтительный стек
                  </label>
                  <input
                    type="text"
                    value={formData.constraints}
                    onChange={(e) => handleFieldChange('constraints', e.target.value)}
                    placeholder="Python, Docker, FastAPI..."
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                  />
                </div>
              </div>
            </div>
          </AccordionItem>
        </div>

        {/* Right Column (5 cols): Rating Panel (Requirement 3 & 4) */}
        <div className="lg:col-span-5 sticky top-6">
          <RatingPanel
            rating={previewRating}
            hasUnsavedChanges={hasUnsavedChanges}
            onApplySuggestion={handleApplySuggestion}
            onOpenMissionField={handleOpenMissionField}
            onConfirmChanges={handleConfirmChanges}
            scoreGained={scoreGained}
          />
        </div>
      </div>
    </div>
  );
};
