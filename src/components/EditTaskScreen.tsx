import React, { useState, useEffect } from 'react';
import { Task, RatingBreakdown } from '../types';
import { calculateTaskRating } from '../utils/ratingCalculator';
import { talapApi } from '../api/talapApi';
import { useAsyncAction } from '../utils/useAsyncAction';
import { RatingPanel } from './RatingPanel';
import { AccordionItem } from './ui/Accordion';
import { ContextHelp } from './ui/ContextHelp';
import { useToast } from './ui/Toast';
import { Select } from './ui/Select';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft,
  Eye,
  Check,
  Sparkles,
  Building2,
  HelpCircle,
  FileCheck,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Save,
  Send
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

  // Accordion state
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

  // Async action to save task changes to server
  const saveTaskAction = useAsyncAction(
    async (publishNow?: boolean) => {
      const willPublish = publishNow !== undefined ? publishNow : isPublished;
      const updatedFields = {
        ...formData,
        published: willPublish,
      };
      const calculated = calculateTaskRating(updatedFields);
      return talapApi.updateTask(task.id, {
        ...updatedFields,
        rating: calculated,
      });
    },
    {
      onSuccess: (updatedTask) => {
        const oldScore = task.rating?.totalScore || 0;
        const newScore = updatedTask.rating?.totalScore || 0;
        const diff = Math.max(0, newScore - oldScore);

        setIsPublished(updatedTask.published);
        onSaveTask(updatedTask);
        setHasUnsavedChanges(false);
        setPreviewRating(updatedTask.rating);

        if (updatedTask.published && !task.published) {
          showToast('Задача успешно опубликована в каталоге!', 'success');
        } else if (diff > 0) {
          setScoreGained(diff);
          showToast(`Карточка сохранена на сервере! +${diff} баллов к рейтингу`, 'success');
        } else {
          showToast('Изменения успешно сохранены на сервере', 'success');
        }
      },
      onError: (errMsg) => {
        showToast(`Ошибка сохранения: ${errMsg}`, 'error');
      },
    }
  );

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
    if (saveTaskAction.isLoading) return;
    saveTaskAction.execute();
  };

  // Section completion helpers
  const isContextFilled = Boolean(formData.need?.trim() && formData.context?.trim());
  const isDataFilled = Boolean(formData.dataProvided?.trim() && formData.targetUsers?.trim());
  const isOutcomeFilled = Boolean(formData.expectedResult?.trim());
  const isSuccessFilled = Boolean(formData.successCriteria?.trim());
  const isMentorshipFilled = Boolean(formData.interactionFormat?.trim() && formData.contact?.trim());

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
      {/* 1. Header Zone */}
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

          {!isPublished && (
            <button
              type="button"
              onClick={() => saveTaskAction.execute(true)}
              disabled={saveTaskAction.isLoading}
              className="h-10 px-4 bg-[#2CC7B5] hover:bg-[#20AE9D] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {saveTaskAction.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Публикуем…</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Опубликовать в каталоге</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmChanges}
            disabled={!hasUnsavedChanges || saveTaskAction.isLoading}
            className={`h-10 px-5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              hasUnsavedChanges && !saveTaskAction.isLoading
                ? 'bg-[#7047EB] hover:bg-[#5E32DF] text-white shadow-xs'
                : 'bg-[#F4F5F9] text-[#98A2B3] cursor-not-allowed border border-[#E2E5EE]'
            }`}
          >
            {saveTaskAction.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Сохраняем…</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{hasUnsavedChanges ? 'Сохранить изменения' : 'Сохранено'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {saveTaskAction.isError && (
        <div className="p-4 bg-[#FFF0F0] border border-[#FF6266]/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-[#DC2626]">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{saveTaskAction.error || 'Ошибка сохранения на сервере.'}</span>
          </div>
          <button
            type="button"
            onClick={saveTaskAction.retry}
            className="px-3 py-1.5 bg-[#FF6266] text-white font-bold rounded-lg hover:bg-[#E5484D] transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Повторить</span>
          </button>
        </div>
      )}

      {/* 2. 12-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Task Form with Accordion Sections */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Title & Theme Card */}
          <div className="bg-white rounded-2xl border border-[#E2E5EE] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#F0ECFF] text-[#7047EB] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-[#17171C]">
                    {formData.company.name}
                  </div>
                  <div className="text-[11px] text-[#667085]">
                    {formData.company.industry}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                  formData.published 
                    ? 'bg-[#E8FAF7] text-[#149A8B] border border-[#2CC7B5]/30'
                    : 'bg-[#FFF8E7] text-[#92400E] border border-[#FFC44D]/40'
                }`}>
                  {formData.published ? 'Опубликована в каталоге' : 'Черновик'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8 space-y-1">
                <label className="text-xs font-bold text-[#17171C]">
                  Заголовок практической задачи
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
                <Select
                  value={formData.theme}
                  onChange={(val) => handleFieldChange('theme', val)}
                  options={[
                    { value: 'AI / ML', label: 'AI / ML' },
                    { value: 'FinTech', label: 'FinTech' },
                    { value: 'LogTech', label: 'LogTech' },
                    { value: 'GovTech', label: 'GovTech' },
                    { value: 'HealthTech', label: 'HealthTech' },
                    { value: 'E-commerce', label: 'E-commerce' },
                  ]}
                  triggerClassName="h-11 rounded-xl bg-[#F8F9FC] border-[#E2E5EE] text-xs font-bold"
                />
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
                    Потребность бизнеса (что должно измениться)
                  </label>
                  <ContextHelp topic="need" />
                </div>
                <textarea
                  rows={3}
                  value={formData.need}
                  onChange={(e) => handleFieldChange('need', e.target.value)}
                  placeholder="Опишите, чего вы хотите достичь..."
                  className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#17171C]">
                    Текущий контекст и предпосылки
                  </label>
                  <ContextHelp topic="context" />
                </div>
                <textarea
                  rows={3}
                  value={formData.context}
                  onChange={(e) => handleFieldChange('context', e.target.value)}
                  placeholder="Как процесс устроен сейчас и почему возникла задача..."
                  className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                />
              </div>
            </div>
          </AccordionItem>

          {/* Accordion 2: Данные и целевые пользователи */}
          <AccordionItem
            stepNumber={2}
            title="Данные и пользователи"
            subtitle="Что получит команда и кто конечные пользователи"
            summary={formData.dataProvided ? formData.dataProvided.slice(0, 80) + '...' : undefined}
            isFilled={isDataFilled}
            badgeText={isDataFilled ? 'Заполнено · 20 баллов' : 'Требует данных'}
            scoreBonus="+20 б."
            isOpen={activeSection === 'data'}
            onToggle={() => toggleSection('data')}
          >
            <div className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#17171C]">
                    Предоставляемые данные и файлы
                  </label>
                  <ContextHelp topic="data" />
                </div>
                <textarea
                  rows={3}
                  value={formData.dataProvided}
                  onChange={(e) => handleFieldChange('dataProvided', e.target.value)}
                  placeholder="Формат, объём, структура датасета или тестового API..."
                  className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#17171C]">
                    Целевые пользователи решения
                  </label>
                  <ContextHelp topic="users" />
                </div>
                <input
                  type="text"
                  value={formData.targetUsers}
                  onChange={(e) => handleFieldChange('targetUsers', e.target.value)}
                  placeholder="Например: Операторы колл-центра, аналитики, клиенты..."
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                />
              </div>
            </div>
          </AccordionItem>

          {/* Accordion 3: Ожидаемый результат */}
          <AccordionItem
            stepNumber={3}
            title="Ожидаемый результат"
            subtitle="Какой формат сдачи ожидает бизнес от студентов"
            summary={formData.expectedResult ? formData.expectedResult.slice(0, 80) + '...' : undefined}
            isFilled={isOutcomeFilled}
            badgeText={isOutcomeFilled ? 'Заполнено · 20 баллов' : 'Требует данных'}
            scoreBonus="+20 б."
            isOpen={activeSection === 'outcome'}
            onToggle={() => toggleSection('outcome')}
          >
            <div className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#17171C]">
                    Артефакты и формат сдачи
                  </label>
                  <ContextHelp topic="expected" />
                </div>
                <textarea
                  rows={4}
                  value={formData.expectedResult}
                  onChange={(e) => handleFieldChange('expectedResult', e.target.value)}
                  placeholder="Например: 1. GitHub репозиторий с FastAPI. 2. Dockerfile. 3. Демо-интерфейс..."
                  className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-medium text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB] transition-all"
                />
              </div>
            </div>
          </AccordionItem>

          {/* Accordion 4: Критерии успеха */}
          <AccordionItem
            stepNumber={4}
            title="Критерии успеха решения"
            subtitle="Измеримые метрики качества и приёмки"
            summary={formData.successCriteria ? formData.successCriteria.slice(0, 80) + '...' : undefined}
            isFilled={isSuccessFilled}
            badgeText={isSuccessFilled ? 'Заполнено · 20 баллов' : 'Требует данных'}
            scoreBonus="+20 б."
            isOpen={activeSection === 'success'}
            onToggle={() => toggleSection('success')}
          >
            <div className="space-y-3 pt-3">
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

        {/* Right Column (5 cols): Rating Panel */}
        <div className="lg:col-span-5 sticky top-6">
          <RatingPanel
            rating={previewRating}
            hasUnsavedChanges={hasUnsavedChanges}
            onApplySuggestion={handleApplySuggestion}
            onOpenMissionField={handleOpenMissionField}
            onConfirmChanges={handleConfirmChanges}
            scoreGained={scoreGained}
            isTestMode={true}
          />
        </div>
      </div>
    </div>
  );
};
