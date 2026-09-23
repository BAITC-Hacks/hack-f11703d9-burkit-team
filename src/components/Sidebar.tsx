import React from 'react';
import { ActiveScreen, UserRole } from '../types';
import { 
  FolderKanban, 
  PlusCircle, 
  FileText, 
  Inbox, 
  Users, 
  Sparkles,
  Building2,
  GraduationCap,
  Send,
  UserCheck
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
  return (
    <aside className="w-64 min-w-[256px] max-w-[256px] bg-white border-r border-[#E5E7EF] flex flex-col justify-between shrink-0 select-none min-h-screen">
      {/* Top Section: Logo & Role Switcher */}
      <div className="p-5 space-y-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7047EB] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
            T
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[#17171C]">
                TALAP
              </span>
              <span className="text-[11px] font-bold text-[#7047EB] bg-[#F0ECFF] px-1.5 py-0.5 rounded-md">
                AI
              </span>
            </div>
            <p className="text-xs text-[#667085] font-medium leading-none">
              Платформа задач бизнеса
            </p>
          </div>
        </div>

        {/* Clear Role Switcher Segmented Control */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
            Ваша роль:
          </label>
          <div className="p-1 bg-[#F5F6FA] border border-[#E5E7EF] rounded-xl grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => onRoleChange('business')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                userRole === 'business'
                  ? 'bg-white text-[#7047EB] shadow-xs'
                  : 'text-[#667085] hover:text-[#17171C]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Бизнес</span>
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('student')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                userRole === 'student'
                  ? 'bg-white text-[#7047EB] shadow-xs'
                  : 'text-[#667085] hover:text-[#17171C]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Студенты</span>
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1.5">
          {userRole === 'business' ? (
            /* Business Navigation */
            <>
              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className={`w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  currentScreen === 'catalog'
                    ? 'bg-[#F0ECFF] text-[#7047EB] font-bold'
                    : 'text-[#17171C] hover:bg-[#F5F6FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderKanban className={`w-4 h-4 ${currentScreen === 'catalog' ? 'text-[#7047EB]' : 'text-[#667085]'}`} />
                  <span>Каталог</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E5E7EF] text-[#667085] tabular-nums">
                  {tasksCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('create')}
                className={`w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  currentScreen === 'create'
                    ? 'bg-[#F0ECFF] text-[#7047EB] font-bold'
                    : 'text-[#17171C] hover:bg-[#F5F6FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className={`w-4 h-4 ${currentScreen === 'create' ? 'text-[#7047EB]' : 'text-[#667085]'}`} />
                  <span>Создать задачу</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#7047EB] text-white uppercase tracking-wider">
                  AI
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('edit')}
                className={`w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  currentScreen === 'edit'
                    ? 'bg-[#F0ECFF] text-[#7047EB] font-bold'
                    : 'text-[#17171C] hover:bg-[#F5F6FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`w-4 h-4 ${currentScreen === 'edit' ? 'text-[#7047EB]' : 'text-[#667085]'}`} />
                  <span>Мои задачи</span>
                </div>
                <span className="text-xs font-semibold text-[#667085]">
                  Паспорт
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('proposals')}
                className={`w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  currentScreen === 'proposals'
                    ? 'bg-[#F0ECFF] text-[#7047EB] font-bold'
                    : 'text-[#17171C] hover:bg-[#F5F6FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${currentScreen === 'proposals' ? 'text-[#7047EB]' : 'text-[#667085]'}`} />
                  <span>Предложения команд</span>
                </div>
                {pendingProposalsCount > 0 ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F5B942]/20 text-[#B87C05] tabular-nums">
                    +{pendingProposalsCount}
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E5E7EF] text-[#667085] tabular-nums">
                    {proposalsCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            /* Student Navigation */
            <>
              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className={`w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  currentScreen === 'catalog' || currentScreen === 'student'
                    ? 'bg-[#F0ECFF] text-[#7047EB] font-bold'
                    : 'text-[#17171C] hover:bg-[#F5F6FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderKanban className={`w-4 h-4 ${currentScreen === 'catalog' || currentScreen === 'student' ? 'text-[#7047EB]' : 'text-[#667085]'}`} />
                  <span>Каталог задач</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E5E7EF] text-[#667085] tabular-nums">
                  {tasksCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('my-proposals')}
                className={`w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  currentScreen === 'my-proposals'
                    ? 'bg-[#F0ECFF] text-[#7047EB] font-bold'
                    : 'text-[#17171C] hover:bg-[#F5F6FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Send className={`w-4 h-4 ${currentScreen === 'my-proposals' ? 'text-[#7047EB]' : 'text-[#667085]'}`} />
                  <span>Мои отклики</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E5E7EF] text-[#667085] tabular-nums">
                  {myProposalsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('team-profile')}
                className={`w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  currentScreen === 'team-profile'
                    ? 'bg-[#F0ECFF] text-[#7047EB] font-bold'
                    : 'text-[#17171C] hover:bg-[#F5F6FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className={`w-4 h-4 ${currentScreen === 'team-profile' ? 'text-[#7047EB]' : 'text-[#667085]'}`} />
                  <span>Профиль команды</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#36B875]" />
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Bottom Section: User / Team Profile */}
      <div className="p-4 border-t border-[#E5E7EF] bg-[#F5F6FA]/50 m-3 rounded-2xl">
        {userRole === 'business' ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7047EB]/10 text-[#7047EB] flex items-center justify-center font-bold text-sm shrink-0">
              K
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[#17171C] truncate">
                Kolesa Group
              </div>
              <div className="text-xs text-[#667085] truncate">
                Бизнес-партнёр
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#36B875]/15 text-[#36B875] flex items-center justify-center font-bold text-sm shrink-0">
              VC
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[#17171C] truncate">
                VisionCraft KBTU
              </div>
              <div className="text-xs text-[#667085] truncate">
                Команда (4 чел.)
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
