import React from 'react';
import { ActiveScreen, UserRole } from '../types';
import { Plus, ArrowLeft, Eye } from 'lucide-react';

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
      case 'catalog':
        return `${rolePrefix} / Каталог практических задач`;
      case 'create':
        return 'Бизнес / Создание задачи с AI';
      case 'edit':
        return 'Бизнес / Редактирование паспорта задачи';
      case 'student':
        return 'Студенты / Паспорт задачи и отклик';
      case 'proposals':
        return 'Бизнес / Отбор предложений команд';
      case 'my-proposals':
        return 'Студенты / Мои отклики на задачи';
      case 'team-profile':
        return 'Студенты / Профиль команды';
    }
  };

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'catalog':
        return 'Каталог практических задач';
      case 'create':
        return 'Новая задача';
      case 'edit':
        return activeTaskTitle ? `Паспорт задачи: ${activeTaskTitle}` : 'Паспорт задачи';
      case 'student':
        return activeTaskTitle ? `Задача: ${activeTaskTitle}` : 'Страница задачи';
      case 'proposals':
        return 'Предложения студенческих команд';
      case 'my-proposals':
        return 'Мои поданные отклики';
      case 'team-profile':
        return 'Профиль студенческой команды';
    }
  };

  return (
    <header className="bg-white border-b border-[#E5E7EF] px-8 py-4 flex items-center justify-between">
      {/* Title & Path */}
      <div className="min-w-0 pr-4">
        <div className="text-xs font-semibold text-[#667085] mb-0.5">
          {getBreadcrumbs()}
        </div>
        <h1 className="text-xl font-extrabold text-[#17171C] truncate max-w-2xl">
          {getScreenTitle()}
        </h1>
      </div>

      {/* Action Zone */}
      <div className="flex items-center gap-3 shrink-0">
        {userRole === 'business' && currentScreen !== 'create' && (
          <button
            type="button"
            onClick={onNewTaskClick || (() => onNavigate('create'))}
            className="h-11 px-4 bg-[#7047EB] hover:bg-[#5b32d6] text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Создать задачу</span>
          </button>
        )}

        {currentScreen === 'student' && (
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="h-11 px-4 bg-white border border-[#E5E7EF] hover:bg-[#F5F6FA] text-[#17171C] text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#667085]" />
            <span>Вернуться в каталог</span>
          </button>
        )}

        {currentScreen === 'edit' && (
          <button
            type="button"
            onClick={() => onNavigate('student')}
            className="h-11 px-4 bg-white border border-[#E5E7EF] hover:bg-[#F5F6FA] text-[#17171C] text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#667085]" />
            <span>Вид для студентов</span>
          </button>
        )}
      </div>
    </header>
  );
};
