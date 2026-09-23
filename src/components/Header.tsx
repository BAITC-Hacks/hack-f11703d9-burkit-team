import React from 'react';
import { ActiveScreen, UserRole } from '../types';
import { Plus, ArrowLeft, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  currentScreen: ActiveScreen;
  userRole: UserRole;
  activeTaskTitle?: string;
  onNavigate: (screen: ActiveScreen) => void;
  onNewTaskClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  userRole,
  activeTaskTitle,
  onNavigate,
  onNewTaskClick,
}) => {
  const getBreadcrumbs = () => {
    const rolePrefix = userRole === 'business' ? 'Бизнес' : 'Студенты';
    switch (currentScreen) {
      case 'overview':
        return `${rolePrefix} / Обзор`;
      case 'catalog':
        return `${rolePrefix} / Каталог задач`;
      case 'create':
        return 'Бизнес / Новая задача';
      case 'edit':
        return 'Бизнес / Карточка задачи';
      case 'student':
        return 'Студенты / Карточка задачи';
      case 'proposals':
        return 'Бизнес / Отклики команд';
      case 'my-proposals':
        return 'Студенты / Мои отклики';
      case 'team-progress':
        return 'Студенты / Прогресс команды';
      case 'team-profile':
        return 'Студенты / Профиль команды';
    }
  };

  const getSectionLabel = () => {
    switch (currentScreen) {
      case 'overview':
        return userRole === 'business' ? 'Кабинет бизнеса' : 'Кабинет студенческой команды';
      case 'catalog':
        return 'Каталог практических задач';
      case 'create':
        return 'Формулирование новой задачи';
      case 'edit':
        return activeTaskTitle ? `Карточка: ${activeTaskTitle.slice(0, 45)}${activeTaskTitle.length > 45 ? '...' : ''}` : 'Карточка задачи';
      case 'student':
        return activeTaskTitle ? `Задача: ${activeTaskTitle.slice(0, 45)}${activeTaskTitle.length > 45 ? '...' : ''}` : 'Карточка задачи';
      case 'proposals':
        return 'Отклики и предложения';
      case 'my-proposals':
        return 'Отклики команды';
      case 'team-progress':
        return 'Опыт и развитие команды';
      case 'team-profile':
        return 'Профиль команды';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E5EE] px-8 flex items-center justify-between shrink-0 z-10">
      {/* Breadcrumb & Section indicator (Requirement 2: No duplicate H1) */}
      <div className="min-w-0 pr-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#667085]">
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="hover:text-[#7047EB] transition-colors cursor-pointer font-bold text-[#17171C]"
          >
            TALAP
          </button>
          <span>/</span>
          <span className="text-[#667085] truncate">{getBreadcrumbs()}</span>
        </div>
        <div className="text-sm font-extrabold text-[#17171C] truncate max-w-xl">
          {getSectionLabel()}
        </div>
      </div>

      {/* Action Zone */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Role indicator pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#F4F5F9] rounded-xl border border-[#E2E5EE] text-xs font-bold">
          {userRole === 'business' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#7047EB]" />
              <span className="text-[#17171C]">Кабинет бизнеса</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#2CC7B5]" />
              <span className="text-[#17171C]">Кабинет команды</span>
            </>
          )}
        </div>

        {userRole === 'business' && currentScreen !== 'create' && (
          <button
            type="button"
            onClick={onNewTaskClick || (() => onNavigate('create'))}
            className="h-10 px-4 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Создать задачу</span>
          </button>
        )}

        {currentScreen === 'student' && (
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="h-10 px-4 bg-white border border-[#E2E5EE] hover:bg-[#F4F5F9] text-[#17171C] text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#667085]" />
            <span>Каталог задач</span>
          </button>
        )}

        {currentScreen === 'edit' && (
          <button
            type="button"
            onClick={() => onNavigate('student')}
            className="h-10 px-4 bg-white border border-[#E2E5EE] hover:bg-[#F4F5F9] text-[#17171C] text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Eye className="w-4 h-4 text-[#7047EB]" />
            <span>Студенческий вид</span>
          </button>
        )}
      </div>
    </header>
  );
};
