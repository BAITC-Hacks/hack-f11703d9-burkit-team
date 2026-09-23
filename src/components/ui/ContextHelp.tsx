import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContextHelpProps {
  topic: 'readiness' | 'criteria' | 'data' | 'student_view' | 'milestones' | 'context' | 'need' | 'users' | 'expected';
  label?: string;
}

const HELP_TOPICS: Record<string, { title: string; content: string; tip?: string }> = {
  readiness: {
    title: 'Что такое готовность задачи?',
    content: 'Это оценка того, насколько полно и понятно описана ваша задача для студенческих команд (по шкале от 0 до 100 баллов). Чем выше готовность, тем выше задача отображается в каталоге и тем более качественные и точные предложения присылают команды.',
    tip: 'Задачи с готовностью от 70 баллов привлекают в 4 раза больше сильных команд.'
  },
  context: {
    title: 'Бизнес-контекст',
    content: 'Опишите реальную бизнес-ситуацию, где возникает проблема. Это поможет студентам понять практическую ценность и ограничения.',
    tip: 'Укажите, в каких подразделениях или процессах используется решение.'
  },
  need: {
    title: 'Потребность бизнеса',
    content: 'Что именно должно измениться в результате решения задачи. Сформулируйте целевое состояние процесса.',
    tip: 'Например: сокращение ручного труда, автоматизация отчётов или рост конверсии.'
  },
  users: {
    title: 'Целевые пользователи',
    content: 'Кто будет пользоваться созданным решением: менеджеры, клиенты компании или инженеры.',
    tip: 'Помогает команде спроектировать удобный интерфейс и правильные роли доступа.'
  },
  expected: {
    title: 'Ожидаемый результат',
    content: 'В каком виде вы хотите принять работу: веб-сервис, Telegram-бот, скрипт аналитики или прототип в Docker.',
    tip: 'Чёткий формат сдачи экономит время на интеграцию в инфраструктуру бизнеса.'
  },
  criteria: {
    title: 'Почему нужны критерии успеха?',
    content: 'Студентам важно понимать, по какому признаку бизнес оценит результат их работы. Без четких ориентиров команды могут создать решение, не отвечающее вашим ожиданиям.',
    tip: 'Достаточно указать 1-2 простых ориентира: например, «точность прогноза выше 80%» или «сокращение времени операции вдвое».'
  },
  data: {
    title: 'Какие данные можно предоставить?',
    content: 'Командам нужны примеры реальных данных, чтобы натренировать модель или проверить алгоритм. Это могут быть обезличенные таблицы (CSV, Excel), демонстрационный API или несколько типичных файлов.',
    tip: 'Передавайте только обезличенную информацию без персональных данных клиентов или коммерческой тайны.'
  },
  student_view: {
    title: 'Что увидят студенты?',
    content: 'Студенты видят задачу в удобном структурированном виде: суть проблемы, необходимые навыки, ожидаемый результат и формат связи с вами. Ваши внутренние черновики видны только вам.',
    tip: 'Вы можете в любой момент нажать «Студенческий вид», чтобы увидеть карточку глазами участников.'
  },
  milestones: {
    title: 'Как работают этапы выполнения?',
    content: 'После выбора команды работа разбивается на понятные спринты. Студенты загружают результаты этапа (ссылку на код или демо), а вы подтверждаете выполнение в один клик.',
    tip: 'Подтверждение этапа начисляет команде баллы прогресса и подтверждает успешность пилота.'
  }
};

export const ContextHelp: React.FC<ContextHelpProps> = ({ topic, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const data = HELP_TOPICS[topic] || HELP_TOPICS.readiness;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={data.title}
        className="inline-flex items-center gap-1 text-[#667085] hover:text-[#7047EB] transition-colors p-1 rounded-full hover:bg-[#F0ECFF] cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        {label && <span className="text-[11px] font-medium underline underline-offset-2">{label}</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 bottom-full mb-2 w-72 sm:w-80 p-4 bg-[#17171C] text-white rounded-2xl shadow-xl border border-white/10 text-xs"
          >
            <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 font-bold text-[#FFC44D]">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{data.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-white/90 leading-relaxed font-normal mb-2.5">
              {data.content}
            </p>

            {data.tip && (
              <div className="bg-white/10 rounded-xl p-2.5 text-[11px] text-white/80 leading-snug">
                <span className="font-bold text-[#2CC7B5]">Подсказка: </span>
                {data.tip}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
