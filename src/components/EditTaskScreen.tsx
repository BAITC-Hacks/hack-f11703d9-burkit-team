import React, { useState, useEffect } from 'react';
import { Task, RatingBreakdown } from '../types';
import { calculateTaskRating } from '../utils/ratingCalculator';
import { RatingPanel } from './RatingPanel';
import { 
  CheckCheck, 
  AlertCircle, 
  ArrowLeft,
  Building2,
  Check,
  Globe,
  Save,
  Send,
  Eye
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
  const [formData, setFormData] = useState<Task>(task);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublished, setIsPublished] = useState(task.published);
  const [previewRating, setPreviewRating] = useState<RatingBreakdown>(task.rating);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormData(task);
    setPreviewRating(task.rating);
    setIsPublished(task.published);
    setHasUnsavedChanges(false);
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
    const suggestion = currentRating.suggestions.find(s => s.id === sugId);
    if (!suggestion) return;

    const fieldKey = suggestion.field as keyof Task;
    const currentVal = (formData[fieldKey] as string) || '';
    const newVal = currentVal ? `${currentVal}\n\n${suggestion.sampleValue}` : suggestion.sampleValue;

    handleFieldChange(fieldKey, newVal);
  };

  const handleConfirmChanges = () => {
    const finalRating = calculateTaskRating(formData);
    const savedTask: Task = {
      ...formData,
      rating: finalRating,
      updatedAt: 'Только что'
    };
    onSaveTask(savedTask);
    setPreviewRating(finalRating);
    setHasUnsavedChanges(false);

    setFeedbackMessage('Изменения успешно подтверждены! Рейтинг обновлен.');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleSaveDraft = () => {
    const finalRating = calculateTaskRating(formData);
    const savedTask: Task = {
      ...formData,
      rating: finalRating,
      updatedAt: 'Только что'
    };
    onSaveTask(savedTask);
    setHasUnsavedChanges(false);

    setFeedbackMessage('Черновик успешно сохранён.');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handlePublish = () => {
    const updated = { ...formData, published: true };
    setFormData(updated);
    setIsPublished(true);
    onSaveTask(updated);

    setFeedbackMessage('Задача успешно опубликована в общем каталоге!');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div className="max-w-[1320px] mx-auto space-y-6">
      {/* 1. Normal In-Flow Header (No sticky overlays!) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EF]">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#667085]">
            <button
              type="button"
              onClick={onBackToCatalog}
              className="text-[#7047EB] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>К списку задач</span>
            </button>
            <span>/</span>
            <span>{formData.company.name}</span>
            <span>/</span>
            <span className="text-[#7047EB] font-bold">{formData.theme}</span>
          </div>

          {/* Full Task Title without cutoffs */}
          <h2 className="text-xl md:text-2xl font-extrabold text-[#17171C] leading-snug">
            {formData.title}
          </h2>
        </div>

        {/* Status indicator in page flow */}
        <div className="flex items-center gap-2 shrink-0">
          {hasUnsavedChanges ? (
            <div className="px-3 py-1.5 bg-[#F45F68]/10 text-[#F45F68] text-xs font-bold rounded-xl border border-[#F45F68]/20 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Есть неподтверждённые изменения</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-[#36B875]/10 text-[#258B55] text-xs font-bold rounded-xl border border-[#36B875]/20 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Все данные подтверждены</span>
            </div>
          )}

          <button
            type="button"
            onClick={onPreviewStudent}
            className="h-10 px-3.5 bg-white border border-[#E5E7EF] hover:bg-[#F5F6FA] text-xs font-semibold text-[#17171C] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#667085]" />
            <span>Студенческий вид</span>
          </button>
        </div>
      </div>

      {/* Success / Info Feedback Banner (In-Flow, non-overlapping) */}
      {feedbackMessage && (
        <div className="p-4 bg-[#36B875]/15 border border-[#36B875]/30 rounded-2xl text-xs font-bold text-[#258B55] flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* 2. Clear Two-Column Layout (Left 65% / Right 35% in document flow) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (65%): Logical Sections Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Задача и контекст */}
          <div className="bg-white rounded-2xl border border-[#E5E7EF] p-6 shadow-2xs space-y-4">
            <div className="border-b border-[#E5E7EF] pb-2">
              <h3 className="text-base font-extrabold text-[#17171C]">
                1. Задача и бизнес-контекст
              </h3>
              <p className="text-xs text-[#667085]">
                Определите формулировку задачи, текущий процесс и корневую проблему бизнеса
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
                  Название задачи
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-bold text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
                  Бизнес-контекст ситуации
                </label>
                <textarea
                  rows={3}
                  value={formData.context}
                  onChange={(e) => handleFieldChange('context', e.target.value)}
                  placeholder="Где возникает кейс и как сейчас устроена работа компании..."
                  className="w-full p-3.5 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm leading-relaxed text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
                  Потребность и проблема бизнеса
                </label>
                <textarea
                  rows={3}
                  value={formData.need}
                  onChange={(e) => handleFieldChange('need', e.target.value)}
                  placeholder="В чем заключается проблема и какие потери несет бизнес от ручной работы..."
                  className="w-full p-3.5 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm leading-relaxed text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors resize-y"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Пользователи и данные */}
          <div className="bg-white rounded-2xl border border-[#E5E7EF] p-6 shadow-2xs space-y-4">
            <div className="border-b border-[#E5E7EF] pb-2">
              <h3 className="text-base font-extrabold text-[#17171C]">
                2. Пользователи и предоставляемые данные
              </h3>
              <p className="text-xs text-[#667085]">
                Опишите конечных потребителей решения и доступный датасет / API
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
                  Целевые пользователи
                </label>
                <input
                  type="text"
                  value={formData.targetUsers}
                  onChange={(e) => handleFieldChange('targetUsers', e.target.value)}
                  placeholder="Например: Эксперты-оценщики, операторы контакт-центра, клиенты сервиса"
                  className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5 flex items-center justify-between">
                  <span>Предоставляемые данные и API</span>
                  <span className="text-[11px] font-bold text-[#7047EB]">Критично для высокого балла</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.dataProvided}
                  onChange={(e) => handleFieldChange('dataProvided', e.target.value)}
                  placeholder="Укажите формат (CSV, JSON, REST API), размер датасета, схему полей и тестовую выборку..."
                  className="w-full p-3.5 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-xs font-mono leading-relaxed text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors resize-y"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Ограничения */}
          <div className="bg-white rounded-2xl border border-[#E5E7EF] p-6 shadow-2xs space-y-4">
            <div className="border-b border-[#E5E7EF] pb-2">
              <h3 className="text-base font-extrabold text-[#17171C]">
                3. Технические ограничения и стек
              </h3>
              <p className="text-xs text-[#667085]">
                Инфраструктура, целевые платформы, максимальная задержка и библиотеки
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
                Ограничения по стеку и вычислительным мощностям
              </label>
              <textarea
                rows={3}
                value={formData.constraints}
                onChange={(e) => handleFieldChange('constraints', e.target.value)}
                placeholder="Например: Python 3.11, Docker Compose, запуск на обычном CPU, задержка ответа < 250 мс..."
                className="w-full p-3.5 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm leading-relaxed text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors resize-y"
              />
            </div>
          </div>

          {/* Section 4: Результат и критерии успеха */}
          <div className="bg-white rounded-2xl border border-[#E5E7EF] p-6 shadow-2xs space-y-4">
            <div className="border-b border-[#E5E7EF] pb-2">
              <h3 className="text-base font-extrabold text-[#17171C]">
                4. Ожидаемый результат и критерии успеха
              </h3>
              <p className="text-xs text-[#667085]">
                Что команды сдают на финал и как оценивается победа в числовых метриках
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
                  Ожидаемый результат и артефакты
                </label>
                <textarea
                  rows={3}
                  value={formData.expectedResult}
                  onChange={(e) => handleFieldChange('expectedResult', e.target.value)}
                  placeholder="1. Docker-микросервис с REST API. 2. Репозиторий GitHub с README. 3. Веб-демо..."
                  className="w-full p-3.5 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm leading-relaxed text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5 flex items-center justify-between">
                  <span>Критерии успеха и числовые KPI</span>
                  <span className="text-[11px] font-bold text-[#36B875]">Числовые метрики</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.successCriteria}
                  onChange={(e) => handleFieldChange('successCriteria', e.target.value)}
                  placeholder="Например: F1 > 0.82, mAP@50 > 0.75, ускорение времени обработки на 15%..."
                  className="w-full p-3.5 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm leading-relaxed text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors resize-y"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Связь с бизнесом */}
          <div className="bg-white rounded-2xl border border-[#E5E7EF] p-6 shadow-2xs space-y-4">
            <div className="border-b border-[#E5E7EF] pb-2">
              <h3 className="text-base font-extrabold text-[#17171C]">
                5. Связь с бизнесом и менторство
              </h3>
              <p className="text-xs text-[#667085]">
                Контакты для связи и формат проведения регулярных синхронизаций
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
                  Контактное лицо
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => handleFieldChange('contact', e.target.value)}
                  placeholder="Имя, должность, Telegram"
                  className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17171C] mb-1.5">
                  Формат взаимодействия
                </label>
                <input
                  type="text"
                  value={formData.interactionFormat}
                  onChange={(e) => handleFieldChange('interactionFormat', e.target.value)}
                  placeholder="Еженедельный синк по средам, чат в Telegram"
                  className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions Row in strict clear order */}
          <div className="bg-white rounded-2xl border border-[#E5E7EF] p-5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#667085]">
              Последнее обновление: <strong className="text-[#17171C]">{formData.updatedAt}</strong>
            </div>

            <div className="flex items-center gap-3">
              {/* 1. Вторичная: «Сохранить черновик» */}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="h-11 px-4 bg-white border border-[#E5E7EF] hover:bg-[#F5F6FA] text-xs font-bold text-[#17171C] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#667085]" />
                <span>Сохранить черновик</span>
              </button>

              {/* 2. Основная: «Подтвердить изменения» */}
              <button
                type="button"
                onClick={handleConfirmChanges}
                disabled={!hasUnsavedChanges}
                className={`h-11 px-5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs ${
                  hasUnsavedChanges
                    ? 'bg-[#7047EB] hover:bg-[#5b32d6] text-white'
                    : 'bg-[#F5F6FA] text-[#667085] cursor-not-allowed border border-[#E5E7EF]'
                }`}
              >
                <CheckCheck className="w-4 h-4" />
                <span>Подтвердить изменения</span>
              </button>

              {/* 3. «Опубликовать» (доступна после подтверждения или если уже подтверждена) */}
              <button
                type="button"
                onClick={handlePublish}
                disabled={hasUnsavedChanges}
                className={`h-11 px-4 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  !hasUnsavedChanges
                    ? 'bg-[#36B875] hover:bg-[#2fa066] text-white'
                    : 'bg-[#F5F6FA] text-[#667085] cursor-not-allowed border border-[#E5E7EF]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isPublished ? 'Опубликовано' : 'Опубликовать'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (35%): Rating Panel in normal page flow */}
        <div className="lg:col-span-4 space-y-4">
          <RatingPanel
            rating={previewRating}
            hasUnsavedChanges={hasUnsavedChanges}
            onApplySuggestion={handleApplySuggestion}
            onConfirmChanges={handleConfirmChanges}
          />
        </div>
      </div>
    </div>
  );
};
