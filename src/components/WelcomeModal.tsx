import React, { useState } from 'react';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  FileEdit,
  Sliders,
  Send,
  Search,
  Lightbulb,
  Award
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onSelectRole: (role: UserRole) => void;
  onClose?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onSelectRole,
  onClose,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState<'choose' | 'hint'>('choose');

  if (!isOpen) return null;

  const handleCardClick = (role: UserRole) => {
    setSelectedRole(role);
    setStep('hint');
  };

  const handleStart = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-[#E2E5EE] relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#7047EB]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#2CC7B5]/10 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {step === 'choose' ? (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0ECFF] text-[#7047EB] text-xs font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Добро пожаловать в TALAP</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#17171C] tracking-tight">
                  Как вы хотите использовать TALAP?
                </h2>
                <p className="text-sm text-[#667085] max-w-md mx-auto">
                  Выберите вашу роль — интерфейс настроится под ваши рабочие цели и задачи
                </p>
              </div>

              {/* Two Big Clickable Role Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* 1. Business Card */}
                <button
                  type="button"
                  onClick={() => handleCardClick('business')}
                  className="group relative text-left p-6 rounded-2xl border-2 border-[#E2E5EE] hover:border-[#7047EB] bg-white hover:bg-[#FAF9FF] transition-all duration-200 cursor-pointer shadow-xs hover:shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0ECFF] group-hover:bg-[#7047EB] text-[#7047EB] group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#17171C] group-hover:text-[#7047EB] transition-colors">
                        Я представляю бизнес
                      </h3>
                      <p className="text-xs text-[#667085] leading-relaxed mt-1.5">
                        Хочу оформить задачу, получить предложения студентов и выбрать команду.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F0F2F7] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#7047EB]">
                      Продолжить как бизнес
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#F0ECFF] group-hover:bg-[#7047EB] text-[#7047EB] group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* 2. Student Card */}
                <button
                  type="button"
                  onClick={() => handleCardClick('student')}
                  className="group relative text-left p-6 rounded-2xl border-2 border-[#E2E5EE] hover:border-[#2CC7B5] bg-white hover:bg-[#F3FCFB] transition-all duration-200 cursor-pointer shadow-xs hover:shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#E8FAF7] group-hover:bg-[#2CC7B5] text-[#149A8B] group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#17171C] group-hover:text-[#149A8B] transition-colors">
                        Я участник студенческой команды
                      </h3>
                      <p className="text-xs text-[#667085] leading-relaxed mt-1.5">
                        Хочу найти практическую задачу и предложить своё решение.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F0F2F7] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#149A8B]">
                      Продолжить как команда
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#E8FAF7] group-hover:bg-[#2CC7B5] text-[#149A8B] group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white bg-gradient-to-br shadow-md shadow-purple-500/20 from-[#7047EB] to-[#5527D6]">
                  {selectedRole === 'business' ? <Building2 className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                </div>
                <h2 className="text-2xl font-black text-[#17171C] tracking-tight">
                  {selectedRole === 'business'
                    ? 'Как вы будете работать в TALAP'
                    : 'Как ваша команда работает в TALAP'}
                </h2>
                <p className="text-xs sm:text-sm text-[#667085]">
                  Всего три понятных шага от идеи до реализации
                </p>
              </div>

              {/* 3 Step Cards */}
              <div className="space-y-3 pt-1">
                {selectedRole === 'business' ? (
                  <>
                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#F8F9FD] border border-[#E2E5EE]">
                      <div className="w-9 h-9 rounded-lg bg-[#F0ECFF] text-[#7047EB] font-bold text-sm flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#17171C]">
                          Опишите проблему
                        </div>
                        <div className="text-xs text-[#667085] mt-0.5">
                          Расскажите о задаче простыми словами — TALAP поможет правильно её оформить.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#F8F9FD] border border-[#E2E5EE]">
                      <div className="w-9 h-9 rounded-lg bg-[#F0ECFF] text-[#7047EB] font-bold text-sm flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#17171C]">
                          Улучшите карточку
                        </div>
                        <div className="text-xs text-[#667085] mt-0.5">
                          Ответьте на уточняющие вопросы и повысьте готовность задачи до 70+ баллов.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#F8F9FD] border border-[#E2E5EE]">
                      <div className="w-9 h-9 rounded-lg bg-[#F0ECFF] text-[#7047EB] font-bold text-sm flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#17171C]">
                          Опубликуйте и выберите команду
                        </div>
                        <div className="text-xs text-[#667085] mt-0.5">
                          Получите предложения от студентов и выберите лучшую команду для пилота.
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#F8F9FD] border border-[#E2E5EE]">
                      <div className="w-9 h-9 rounded-lg bg-[#E8FAF7] text-[#149A8B] font-bold text-sm flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#17171C]">
                          Найдите задачу
                        </div>
                        <div className="text-xs text-[#667085] mt-0.5">
                          Изучите проверенные задачи от компаний с реальными данными и понятным результатом.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#F8F9FD] border border-[#E2E5EE]">
                      <div className="w-9 h-9 rounded-lg bg-[#E8FAF7] text-[#149A8B] font-bold text-sm flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#17171C]">
                          Предложите решение
                        </div>
                        <div className="text-xs text-[#667085] mt-0.5">
                          Опишите идею и простой план спринтов всего в 3 шага без лишней бюрократии.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#F8F9FD] border border-[#E2E5EE]">
                      <div className="w-9 h-9 rounded-lg bg-[#E8FAF7] text-[#149A8B] font-bold text-sm flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#17171C]">
                          Выполните подтверждённый этап
                        </div>
                        <div className="text-xs text-[#667085] mt-0.5">
                          Получайте баллы команды за каждый этап, подтверждённый представителем бизнеса.
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="text-xs font-bold text-[#667085] hover:text-[#17171C] transition-colors cursor-pointer"
                >
                  ← Выбрать другую роль
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleStart}
                  className={`h-11 px-6 rounded-xl font-bold text-xs text-white shadow-md flex items-center gap-2 cursor-pointer transition-all ${
                    selectedRole === 'business'
                      ? 'bg-[#7047EB] hover:bg-[#5E32DF] shadow-purple-500/25'
                      : 'bg-[#2CC7B5] hover:bg-[#20AE9D] shadow-teal-500/25'
                  }`}
                >
                  <span>Понятно, начать работу</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
