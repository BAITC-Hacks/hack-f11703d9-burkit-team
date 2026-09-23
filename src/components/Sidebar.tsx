import React, { useState } from 'react';
import { ActiveScreen, UserRole } from '../types';
import { TalapLogo } from './ui/TalapLogo';
import { BrandKitModal } from './BrandKitModal';
import { motion } from 'motion/react';
import { 
  LayoutDashboard,
  FolderKanban, 
  PlusCircle, 
  FileText, 
  Users, 
  Sparkles,
  Building2,
  GraduationCap,
  Send,
  UserCheck,
  Award,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  currentScreen: ActiveScreen;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigate: (screen: ActiveScreen) => void;
  tasksCount: number;
  proposalsCount: number;
  pendingProposalsCount: number;
  myProposalsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  userRole,
  onRoleChange,
  onNavigate,
  tasksCount,
  proposalsCount,
  pendingProposalsCount,
  myProposalsCount = 2,
}) => {
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);

  return (
    <>
      <aside className="w-64 min-w-[256px] max-w-[256px] bg-white border-r border-[#E2E5EE] flex flex-col justify-between shrink-0 select-none min-h-screen relative z-20 shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
        {/* Top Section: Logo & Role Switcher */}
        <div className="p-5 space-y-6">
          {/* Brand / Logo */}
          <div 
            onClick={() => setIsBrandKitOpen(true)}
            className="flex items-center gap-3 cursor-pointer group"
            title="Открыть логотипы и Brand Kit"
          >
            <div className="w-10 h-10 rounded-xl bg-[#150B2D] group-hover:scale-105 transition-transform flex items-center justify-center shadow-[0_4px_12px_rgba(112,71,235,0.25)] p-1 shrink-0">
              <TalapLogo size={32} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#17171C] group-hover:text-[#7047EB] transition-colors">
                  TALAP
                </span>
                <span className="text-[10px] font-bold text-[#7047EB] bg-[#7047EB]/10 border border-[#7047EB]/20 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-[#7047EB]" />
                  <span>AI</span>
                </span>
              </div>
              <p className="text-[11px] text-[#667085] font-semibold leading-none mt-0.5">
                Платформа задач бизнеса
              </p>
            </div>
          </div>

        {/* Clear Role Switcher Segmented Control */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
              Сменить режим
            </label>
            <span className="text-[10px] font-bold text-[#7047EB]">
              {userRole === 'business' ? 'Заказчик' : 'Команда'}
            </span>
          </div>

          <div className="p-1 bg-[#F4F5F9] border border-[#E2E5EE] rounded-xl grid grid-cols-2 gap-1 relative">
            <button
              type="button"
              onClick={() => onRoleChange('business')}
              className={`relative z-10 py-2 px-2.5 rounded-lg text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                userRole === 'business'
                  ? 'text-[#7047EB]'
                  : 'text-[#667085] hover:text-[#17171C]'
              }`}
            >
              {userRole === 'business' && (
                <motion.div
                  layoutId="role-pill"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-[#E2E5EE]"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Бизнес</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onRoleChange('student')}
              className={`relative z-10 py-2 px-2.5 rounded-lg text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                userRole === 'student'
                  ? 'text-[#2CC7B5]'
                  : 'text-[#667085] hover:text-[#17171C]'
              }`}
            >
              {userRole === 'student' && (
                <motion.div
                  layoutId="role-pill"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-[#E2E5EE]"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Студенты</span>
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          {userRole === 'business' ? (
            /* Business Navigation */
            <>
              {/* Item 1: Обзор */}
              <button
                type="button"
                onClick={() => onNavigate('overview')}
                className={`relative w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  currentScreen === 'overview'
                    ? 'text-[#7047EB] font-bold'
                    : 'text-[#475467] hover:text-[#17171C] hover:bg-[#F4F5F9]'
                }`}
              >
                {currentScreen === 'overview' && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-[#F0ECFF] rounded-xl border border-[#7047EB]/20"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <LayoutDashboard className={`w-4 h-4 ${currentScreen === 'overview' ? 'text-[#7047EB]' : 'text-[#667085]'}`} />
                  <span>Обзор</span>
                </div>
                <span className="relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F0ECFF] text-[#7047EB]">
                  Главная
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className={`relative w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  currentScreen === 'catalog'
                    ? 'text-[#7047EB] font-bold'
                    : 'text-[#475467] hover:text-[#17171C] hover:bg-[#F4F5F9]'
                }`}
              >
                {currentScreen === 'catalog' && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-[#F0ECFF] rounded-xl border border-[#7047EB]/20"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <FolderKanban className={`w-4 h-4 ${currentScreen === 'catalog' ? 'text-[#7047EB]' : 'text-[#667085]'}`} />
                  <span>Каталог задач</span>
                </div>
                <span className="relative z-10 text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-[#E2E5EE] text-[#667085] tabular-nums">
                  {tasksCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('create')}
                className={`relative w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  currentScreen === 'create'
                    ? 'text-[#7047EB] font-bold'
                    : 'text-[#475467] hover:text-[#17171C] hover:bg-[#F4F5F9]'
                }`}
              >
                {currentScreen === 'create' && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-[#F0ECFF] rounded-xl border border-[#7047EB]/20"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <PlusCircle className={`w-4 h-4 ${currentScreen === 'create' ? 'text-[#7047EB]' : 'text-[#667085]'}`} />
                  <span>Создать задачу</span>
                </div>
                <span className="relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#7047EB] text-white uppercase tracking-wider shadow-xs">
                  AI
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('edit')}
                className={`relative w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  currentScreen === 'edit'
                    ? 'text-[#7047EB] font-bold'
                    : 'text-[#475467] hover:text-[#17171C] hover:bg-[#F4F5F9]'
                }`}
              >
                {currentScreen === 'edit' && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-[#F0ECFF] rounded-xl border border-[#7047EB]/20"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <FileText className={`w-4 h-4 ${currentScreen === 'edit' ? 'text-[#7047EB]' : 'text-[#667085]'}`} />
                  <span>Карточка задачи</span>
                </div>
                <span className="relative z-10 text-[11px] font-semibold text-[#667085]">
                  Скоринг
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('proposals')}
                className={`relative w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  currentScreen === 'proposals'
                    ? 'text-[#7047EB] font-bold'
                    : 'text-[#475467] hover:text-[#17171C] hover:bg-[#F4F5F9]'
                }`}
              >
                {currentScreen === 'proposals' && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-[#F0ECFF] rounded-xl border border-[#7047EB]/20"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Users className={`w-4 h-4 ${currentScreen === 'proposals' ? 'text-[#7047EB]' : 'text-[#667085]'}`} />
                  <span>Отклики команд</span>
                </div>
                {pendingProposalsCount > 0 ? (
                  <span className="relative z-10 text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFC44D]/25 text-[#92400E] tabular-nums border border-[#FFC44D]/40">
                    +{pendingProposalsCount}
                  </span>
                ) : (
                  <span className="relative z-10 text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-[#E2E5EE] text-[#667085] tabular-nums">
                    {proposalsCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            /* Student Navigation */
            <>
              {/* Item 1: Обзор */}
              <button
                type="button"
                onClick={() => onNavigate('overview')}
                className={`relative w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  currentScreen === 'overview'
                    ? 'text-[#2CC7B5] font-bold'
                    : 'text-[#475467] hover:text-[#17171C] hover:bg-[#F4F5F9]'
                }`}
              >
                {currentScreen === 'overview' && (
                  <motion.div
                    layoutId="nav-active-student"
                    className="absolute inset-0 bg-[#2CC7B5]/10 rounded-xl border border-[#2CC7B5]/25"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <LayoutDashboard className={`w-4 h-4 ${currentScreen === 'overview' ? 'text-[#2CC7B5]' : 'text-[#667085]'}`} />
                  <span>Обзор</span>
                </div>
                <span className="relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E8FAF7] text-[#149A8B]">
                  Главная
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className={`relative w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  currentScreen === 'catalog' || currentScreen === 'student'
                    ? 'text-[#2CC7B5] font-bold'
                    : 'text-[#475467] hover:text-[#17171C] hover:bg-[#F4F5F9]'
                }`}
              >
                {(currentScreen === 'catalog' || currentScreen === 'student') && (
                  <motion.div
                    layoutId="nav-active-student"
                    className="absolute inset-0 bg-[#2CC7B5]/10 rounded-xl border border-[#2CC7B5]/25"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <FolderKanban className={`w-4 h-4 ${currentScreen === 'catalog' || currentScreen === 'student' ? 'text-[#2CC7B5]' : 'text-[#667085]'}`} />
                  <span>Каталог задач</span>
                </div>
                <span className="relative z-10 text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-[#E2E5EE] text-[#667085] tabular-nums">
                  {tasksCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('my-proposals')}
                className={`relative w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  currentScreen === 'my-proposals'
                    ? 'text-[#2CC7B5] font-bold'
                    : 'text-[#475467] hover:text-[#17171C] hover:bg-[#F4F5F9]'
                }`}
              >
                {currentScreen === 'my-proposals' && (
                  <motion.div
                    layoutId="nav-active-student"
                    className="absolute inset-0 bg-[#2CC7B5]/10 rounded-xl border border-[#2CC7B5]/25"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Send className={`w-4 h-4 ${currentScreen === 'my-proposals' ? 'text-[#2CC7B5]' : 'text-[#667085]'}`} />
                  <span>Мои отклики</span>
                </div>
                <span className="relative z-10 text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-[#E2E5EE] text-[#667085] tabular-nums">
                  {myProposalsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('team-progress')}
                className={`relative w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  currentScreen === 'team-progress'
                    ? 'text-[#2CC7B5] font-bold'
                    : 'text-[#475467] hover:text-[#17171C] hover:bg-[#F4F5F9]'
                }`}
              >
                {currentScreen === 'team-progress' && (
                  <motion.div
                    layoutId="nav-active-student"
                    className="absolute inset-0 bg-[#2CC7B5]/10 rounded-xl border border-[#2CC7B5]/25"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <TrendingUp className={`w-4 h-4 ${currentScreen === 'team-progress' ? 'text-[#2CC7B5]' : 'text-[#667085]'}`} />
                  <span>Прогресс команды</span>
                </div>
                <span className="relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E8FAF7] text-[#149A8B]">
                  XP
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('team-profile')}
                className={`relative w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  currentScreen === 'team-profile'
                    ? 'text-[#2CC7B5] font-bold'
                    : 'text-[#475467] hover:text-[#17171C] hover:bg-[#F4F5F9]'
                }`}
              >
                {currentScreen === 'team-profile' && (
                  <motion.div
                    layoutId="nav-active-student"
                    className="absolute inset-0 bg-[#2CC7B5]/10 rounded-xl border border-[#2CC7B5]/25"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <UserCheck className={`w-4 h-4 ${currentScreen === 'team-profile' ? 'text-[#2CC7B5]' : 'text-[#667085]'}`} />
                  <span>Профиль команды</span>
                </div>
                <span className="relative z-10 w-2 h-2 rounded-full bg-[#38BB78] ring-4 ring-[#38BB78]/20" />
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Bottom Section: Active Profile Card */}
      <div className="p-4 border-t border-[#E2E5EE] bg-[#F7F8FC] m-3 rounded-2xl border">
        {userRole === 'business' ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7047EB] to-[#4FA8FF] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              KG
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-extrabold text-[#17171C] truncate">
                  Kolesa Group
                </span>
                <Award className="w-3 h-3 text-[#FFC44D] shrink-0" />
              </div>
              <div className="text-[11px] text-[#667085] truncate font-medium">
                Генеральный партнёр
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2CC7B5] to-[#38BB78] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              VC
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-extrabold text-[#17171C] truncate">
                  VisionCraft KBTU
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BB78]" />
              </div>
              <div className="text-[11px] text-[#667085] truncate font-medium">
                Команда (4 инженера)
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>

    <BrandKitModal isOpen={isBrandKitOpen} onClose={() => setIsBrandKitOpen(false)} />
  </>
  );
};
