import React, { useState } from 'react';
import { Task, StudentProposal } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Send, 
  ArrowLeft,
  ArrowRight,
  Check, 
  Copy,
  Sparkles,
  Database,
  Layers,
  PhoneCall,
  Clock,
  AlertCircle,
  Award,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useToast } from './ui/Toast';

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
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposalStep, setProposalStep] = useState<1 | 2 | 3>(1);

  // Proposal form state
  // Step 1: Данные команды
  const [teamName, setTeamName] = useState('VisionCraft KBTU');
  const [university, setUniversity] = useState('КБТУ (Казахстанско-Британский технический университет)');
  const [captainContact, setCaptainContact] = useState('@sanzhar_cv_craft | s_mukhtarov@kbtu.kz');
  const [skills, setSkills] = useState('Python, PyTorch, FastAPI, Docker, React');

  // Step 2: Идея решения
  const [idea, setIdea] = useState(
    'Двухуровневый ансамбль: быстрый легковесный детектор зон повреждений для фильтрации бликов + специализированная квантованная модель для запуска на CPU со скоростью до 250 мс.'
  );
  const [firstMilestone, setFirstMilestone] = useState(
    'EDA предоставленных данных, очистка разметки и базовый прототип инференса модели на 100 тестовых примерах.'
  );
  const [timelineWeeks, setTimelineWeeks] = useState('3-4 недели');

  const [copiedData, setCopiedData] = useState(false);

  const handleCopyData = () => {
    navigator.clipboard.writeText(task.dataProvided);
    setCopiedData(true);
    showToast('Данные скопированы в буфер обмена', 'info');
    setTimeout(() => setCopiedData(false), 2000);
  };

  const handleOpenProposal = () => {
    setProposalStep(1);
    setIsModalOpen(true);
  };

  const handleSubmitProposal = () => {
    const newProposal: StudentProposal = {
      id: `prop-${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      companyName: task.company.name,
      teamName: teamName.trim(),
      university: university.trim(),
      captain: 'Санжар Мухтаров',
      captainEmail: captainContact.includes('@') ? captainContact.split('|')[1]?.trim() || captainContact : 'team@univ.kz',
      captainTelegram: captainContact.startsWith('@') ? captainContact.split('|')[0]?.trim() || captainContact : '@student_lead',
      membersCount: 4,
      techStack: skills.split(',').map(s => s.trim()),
      idea: idea.trim(),
      sprintPlan: `• Этап 1: ${firstMilestone}\n• Этап 2: Достижение целевых метрик точности и оптимизация инференса.\n• Этап 3: Финальный Docker-контейнер и веб-интерфейс для бизнеса.`,
      timeline: timelineWeeks.trim(),
      prototypeUrl: 'https://github.com/visioncraft-kbtu/demo',
      submittedAt: 'Только что',
      status: 'new',
      teamProgressPoints: 0,
      milestones: [
        {
          id: `m-${Date.now()}-1`,
          title: 'Этап 1: Первый рабочий результат',
          description: firstMilestone,
          deadline: 'Через 10 дней',
          points: 300,
          status: 'pending'
        },
        {
          id: `m-${Date.now()}-2`,
          title: 'Этап 2: Оптимизация решения и проверка метрик',
          description: 'Достижение заявленных критериев приёмки бизнеса',
          deadline: 'Через 20 дней',
          points: 400,
          status: 'pending'
        },
        {
          id: `m-${Date.now()}-3`,
          title: 'Этап 3: Демонстрационный прототип и сдача пилота',
          description: 'Финальная демонстрация представителю компании',
          deadline: 'Через 30 дней',
          points: 500,
          status: 'pending'
        }
      ]
    };

    onSubmitProposal(newProposal);
    setIsModalOpen(false);
    showToast('Предложение отправлено бизнесу! Вы можете отслеживать его статус в «Мои отклики».', 'success');
    if (onNavigateToMyProposals) {
      onNavigateToMyProposals();
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 max-w-[1080px] mx-auto w-full overflow-y-auto pr-1">
      {/* 1. Header with Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E5EE] shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#667085]">
            <button
              type="button"
              onClick={onBackToCatalog}
              className="text-[#7047EB] hover:text-[#5E32DF] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Каталог задач</span>
            </button>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[#17171C]">{task.company.name}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[#17171C] tracking-tight">
            {task.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-[#F0ECFF] text-[#7047EB] border border-[#7047EB]/20">
            Готовность: {task.rating.totalScore} из 100 б. ({task.rating.readinessLabel})
          </span>
        </div>
      </div>

      {/* 2. Four Key Structured Blocks (Requirement 11) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Block 1: Суть проблемы */}
        <div className="p-5 bg-white rounded-2xl border border-[#E2E5EE] shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-[#7047EB] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Суть проблемы</span>
          </div>
          <p className="text-xs text-[#17171C] font-semibold leading-relaxed">
            {task.need || task.context}
          </p>
          {task.targetUsers && (
            <div className="text-[11px] text-[#667085] pt-2 border-t border-[#F0F2F7]">
              <span className="font-bold text-[#17171C]">Кто пользователи: </span>
              {task.targetUsers}
            </div>
          )}
        </div>

        {/* Block 2: Доступные данные */}
        <div className="p-5 bg-white rounded-2xl border border-[#E2E5EE] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-[#149A8B] uppercase tracking-wider">
              <Database className="w-4 h-4" />
              <span>Доступные данные</span>
            </div>
            <button
              type="button"
              onClick={handleCopyData}
              className="text-[11px] font-bold text-[#149A8B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedData ? 'Скопировано!' : 'Скопировать'}</span>
            </button>
          </div>
          <p className="text-xs text-[#17171C] font-medium leading-relaxed whitespace-pre-line bg-[#F8F9FD] p-3 rounded-xl border border-[#E2E5EE]">
            {task.dataProvided || 'Формат данных будет передан утверждённой команде.'}
          </p>
        </div>

        {/* Block 3: Ожидаемый результат */}
        <div className="p-5 bg-white rounded-2xl border border-[#E2E5EE] shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-[#D97706] uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Ожидаемый результат</span>
          </div>
          <p className="text-xs text-[#17171C] font-medium leading-relaxed whitespace-pre-line">
            {task.expectedResult || 'Работающий прототип с инструкцией запуска.'}
          </p>
          {task.successCriteria && (
            <div className="text-[11px] text-[#667085] pt-2 border-t border-[#F0F2F7]">
              <span className="font-bold text-[#17171C]">Критерии успеха: </span>
              {task.successCriteria}
            </div>
          )}
        </div>

        {/* Block 4: Формат связи с бизнесом */}
        <div className="p-5 bg-white rounded-2xl border border-[#E2E5EE] shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-[#7047EB] uppercase tracking-wider">
            <PhoneCall className="w-4 h-4" />
            <span>Формат связи с бизнесом</span>
          </div>
          <div className="space-y-1 text-xs text-[#17171C]">
            <p className="font-medium">
              {task.interactionFormat || 'Еженедельный созвон на 30 минут + чат в Telegram.'}
            </p>
            <p className="text-[#667085] text-[11px]">
              <span className="font-bold text-[#17171C]">Представитель: </span>
              {task.contact || task.company.repName}
            </p>
          </div>
          {task.constraints && (
            <div className="text-[11px] text-[#667085] pt-2 border-t border-[#F0F2F7]">
              <span className="font-bold text-[#17171C]">Условия: </span>
              {task.constraints}
            </div>
          )}
        </div>
      </div>

      {/* 3. Action Prompt Bar: Готовы взяться за решение? */}
      <div className="p-6 bg-gradient-to-r from-[#7047EB] to-[#5527D6] rounded-2xl text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-black tracking-tight">
            Готовы взяться за решение?
          </h3>
          <p className="text-xs text-white/80 max-w-md">
            Предложите вашу идею и план первого этапа. Заполнение займёт не более 3 минут.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenProposal}
          className="h-12 px-7 bg-[#2CC7B5] hover:bg-[#20AE9D] text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
        >
          <span>Предложить решение</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* 4. Three-Step Proposal Modal (Requirement 12) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-[#E2E5EE] shadow-2xl space-y-5"
            >
              {/* Header with 3 steps indicator */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E5EE]">
                <div>
                  <span className="text-[11px] font-extrabold text-[#7047EB] uppercase tracking-wider">
                    Шаг {proposalStep} из 3
                  </span>
                  <h3 className="text-lg font-black text-[#17171C]">
                    {proposalStep === 1 && 'Шаг 1. Данные команды'}
                    {proposalStep === 2 && 'Шаг 2. Идея решения'}
                    {proposalStep === 3 && 'Шаг 3. Проверка и отправка'}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${proposalStep >= 1 ? 'bg-[#7047EB]' : 'bg-[#E2E5EE]'}`} />
                  <span className={`w-2.5 h-2.5 rounded-full ${proposalStep >= 2 ? 'bg-[#7047EB]' : 'bg-[#E2E5EE]'}`} />
                  <span className={`w-2.5 h-2.5 rounded-full ${proposalStep >= 3 ? 'bg-[#7047EB]' : 'bg-[#E2E5EE]'}`} />
                </div>
              </div>

              {/* Step 1: Данные команды */}
              {proposalStep === 1 && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Название команды
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Например: VisionCraft KBTU"
                      className="w-full h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-sm text-[#17171C] font-semibold outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Вуз или город
                    </label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="Например: КБТУ, Алматы"
                      className="w-full h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] font-medium outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Контакт капитана (Telegram / Email)
                    </label>
                    <input
                      type="text"
                      value={captainContact}
                      onChange={(e) => setCaptainContact(e.target.value)}
                      placeholder="@telegram_handle | email@domain.kz"
                      className="w-full h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] font-medium outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Коротко о навыках команды
                    </label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="Python, PyTorch, React, Docker..."
                      className="w-full h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] font-medium outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Идея решения */}
              {proposalStep === 2 && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Как вы планируете решить задачу?
                    </label>
                    <textarea
                      rows={3}
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Опишите подход простыми словами: какие модели или алгоритмы будете использовать."
                      className="w-full p-3.5 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] font-medium outline-none leading-relaxed resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Какой результат покажете на первом этапе?
                    </label>
                    <textarea
                      rows={2}
                      value={firstMilestone}
                      onChange={(e) => setFirstMilestone(e.target.value)}
                      placeholder="Например: Проверка данных, базовый прототип на 100 тестовых примерах."
                      className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] font-medium outline-none leading-relaxed resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#17171C] block">
                      Срок выполнения
                    </label>
                    <input
                      type="text"
                      value={timelineWeeks}
                      onChange={(e) => setTimelineWeeks(e.target.value)}
                      placeholder="Например: 3-4 недели"
                      className="w-full h-11 px-4 rounded-xl border border-[#E2E5EE] bg-[#F8F9FD] focus:bg-white focus:border-[#7047EB] text-xs text-[#17171C] font-medium outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Проверка и отправка */}
              {proposalStep === 3 && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-[#F8F9FD] rounded-2xl border border-[#E2E5EE] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#17171C] text-sm">{teamName}</span>
                      <span className="text-[#667085]">{university}</span>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-[#E2E5EE]">
                      <span className="font-bold text-[#667085] block">Идея:</span>
                      <p className="text-[#17171C]">{idea}</p>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-[#E2E5EE]">
                      <span className="font-bold text-[#667085] block">Первый результат:</span>
                      <p className="text-[#17171C]">{firstMilestone}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#E2E5EE] text-[#667085]">
                      <span>Срок: <strong className="text-[#17171C]">{timelineWeeks}</strong></span>
                      <span>Контакты: <strong className="text-[#17171C]">{captainContact}</strong></span>
                    </div>
                  </div>

                  {/* Warning message required by prompt */}
                  <div className="p-3.5 bg-[#FFF8E7] rounded-xl border border-[#FFC44D]/50 text-[#92400E] flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
                    <span className="text-[11px] leading-relaxed font-medium">
                      Предложение нельзя будет отредактировать после отправки, но вы сможете дополнять этапы.
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Navigation Buttons */}
              <div className="flex items-center justify-between pt-2">
                {proposalStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setProposalStep((prev) => (prev - 1) as any)}
                    className="text-xs font-bold text-[#667085] hover:text-[#17171C] cursor-pointer"
                  >
                    ← Назад
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs font-bold text-[#667085] hover:text-[#17171C] cursor-pointer"
                  >
                    Отмена
                  </button>
                )}

                {proposalStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setProposalStep((prev) => (prev + 1) as any)}
                    className="h-10 px-5 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Далее</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitProposal}
                    className="h-10 px-6 bg-[#2CC7B5] hover:bg-[#20AE9D] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Отправить предложение бизнесу</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
