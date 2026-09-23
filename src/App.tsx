import React, { useState } from 'react';
import { INITIAL_TASKS, INITIAL_PROPOSALS } from './data/mockData';
import { Task, StudentProposal, ActiveScreen, UserRole, ProposalStatus, TeamLevelInfo } from './types';
import { calculateTeamProgress, getTeamLevelInfo } from './utils/teamProgress';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewScreen } from './components/OverviewScreen';
import { CatalogScreen } from './components/CatalogScreen';
import { CreateTaskScreen } from './components/CreateTaskScreen';
import { EditTaskScreen } from './components/EditTaskScreen';
import { StudentTaskScreen } from './components/StudentTaskScreen';
import { ProposalsScreen } from './components/ProposalsScreen';
import { MyProposalsScreen } from './components/MyProposalsScreen';
import { TeamProfileScreen } from './components/TeamProfileScreen';
import { TeamProgressScreen } from './components/TeamProgressScreen';
import { WelcomeModal } from './components/WelcomeModal';
import { LevelUpModal } from './components/ui/LevelUpModal';
import { ToastProvider } from './components/ui/Toast';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>('business');
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('overview');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [proposals, setProposals] = useState<StudentProposal[]>(INITIAL_PROPOSALS);
  const [activeTaskId, setActiveTaskId] = useState<string>('task-1');
  const [filterProposalsTaskId, setFilterProposalsTaskId] = useState<string>('all');
  
  // Level up modal celebration state
  const [levelUpInfo, setLevelUpInfo] = useState<{ isOpen: boolean; levelInfo: TeamLevelInfo | null }>({
    isOpen: false,
    levelInfo: null,
  });

  // Welcome role selection modal: show on first visit if not selected
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(() => {
    return !localStorage.getItem('talap_role_selected');
  });

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];

  // Role Switch Handler
  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (newRole === 'business') {
      if (currentScreen === 'my-proposals' || currentScreen === 'team-profile' || currentScreen === 'team-progress') {
        setCurrentScreen('overview');
      }
    } else {
      if (currentScreen === 'create' || currentScreen === 'edit' || currentScreen === 'proposals') {
        setCurrentScreen('overview');
      }
    }
  };

  const handleSelectRoleFromWelcome = (selectedRole: UserRole) => {
    setUserRole(selectedRole);
    localStorage.setItem('talap_role_selected', selectedRole);
    setShowWelcomeModal(false);
    setCurrentScreen('overview');
  };

  // Handler for saving/confirming task updates in EditTaskScreen
  const handleSaveTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  // Handler for creating a new task from CreateTaskScreen
  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    setActiveTaskId(newTask.id);
    setCurrentScreen('edit');
  };

  // Handler for submitting student proposal from StudentTaskScreen
  const handleSubmitProposal = (newProposal: StudentProposal) => {
    setProposals((prev) => [newProposal, ...prev]);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === newProposal.taskId
          ? { ...t, proposalsCount: t.proposalsCount + 1 }
          : t
      )
    );
  };

  // Handler for manual accept/reject in ProposalsScreen
  const handleUpdateProposalStatus = (
    proposalId: string,
    newStatus: ProposalStatus
  ) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId ? { ...p, status: newStatus } : p
      )
    );
  };

  // Handler for confirming milestones by business (Requirement 13 & 14)
  const handleMilestoneConfirmed = (proposalId: string, milestoneId: string, points: number) => {
    const oldProgress = calculateTeamProgress(proposals);
    const oldLevel = oldProgress.levelInfo.level;

    const updated = proposals.map((p) => {
      if (p.id !== proposalId) return p;
      const updatedMilestones = (p.milestones || []).map((m) => {
        if (m.id === milestoneId) {
          return { ...m, status: 'confirmed' as const };
        }
        return m;
      });
      return {
        ...p,
        milestones: updatedMilestones,
        teamProgressPoints: (p.teamProgressPoints || 0) + points,
      };
    });

    setProposals(updated);

    const newProgress = calculateTeamProgress(updated);
    if (newProgress.levelInfo.level > oldLevel) {
      setLevelUpInfo({
        isOpen: true,
        levelInfo: newProgress.levelInfo,
      });
    }
  };

  // Handler for student submitting milestone proof
  const handleMilestoneSubmitted = (proposalId: string, milestoneId: string, proofUrl: string) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        const updatedMilestones = (p.milestones || []).map((m) => {
          if (m.id === milestoneId) {
            return { ...m, status: 'submitted' as const, proofUrl };
          }
          return m;
        });
        return { ...p, milestones: updatedMilestones };
      })
    );
  };

  // Switch to specific task in catalog or editor
  const handleOpenTask = (task: Task) => {
    setActiveTaskId(task.id);
    if (userRole === 'business') {
      setCurrentScreen('edit');
    } else {
      setCurrentScreen('student');
    }
  };

  const handleEditTask = (task: Task) => {
    setActiveTaskId(task.id);
    setCurrentScreen('edit');
  };

  const pendingProposalsCount = proposals.filter((p) => p.status === 'new' || p.status === 'pending').length;

  return (
    <ToastProvider>
      <div className="min-h-screen xl:h-[100dvh] xl:overflow-hidden bg-[#F5F6FA] text-[#17171C] flex flex-col xl:grid xl:grid-cols-[256px_minmax(0,1fr)] font-sans antialiased">
        {/* 1. Left Sidebar */}
        <Sidebar
          currentScreen={currentScreen}
          userRole={userRole}
          onRoleChange={handleRoleChange}
          onNavigate={(screen) => {
            if (screen === 'proposals') {
              setFilterProposalsTaskId('all');
            }
            setCurrentScreen(screen);
          }}
          tasksCount={tasks.length}
          proposalsCount={proposals.length}
          pendingProposalsCount={pendingProposalsCount}
          myProposalsCount={proposals.length}
        />

        {/* 2. Main Content Column with fixed Header and independent workspace */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 xl:h-[100dvh] bg-[#F5F6FA] overflow-hidden">
          {/* Header */}
          <Header
            currentScreen={currentScreen}
            userRole={userRole}
            activeTaskTitle={activeTask?.title}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onNewTaskClick={() => setCurrentScreen('create')}
          />

          {/* Work area */}
          <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
            {/* Screen 1: Overview (Home) */}
            {currentScreen === 'overview' && (
              <OverviewScreen
                userRole={userRole}
                tasks={tasks}
                proposals={proposals}
                currentTask={activeTask}
                onNavigateToCatalog={() => setCurrentScreen('catalog')}
                onNavigateToCreate={() => setCurrentScreen('create')}
                onNavigateToEdit={(task) => {
                  setActiveTaskId(task.id);
                  setCurrentScreen('edit');
                }}
                onNavigateToProposals={() => {
                  setFilterProposalsTaskId('all');
                  setCurrentScreen('proposals');
                }}
                onNavigateToMyProposals={() => setCurrentScreen('my-proposals')}
                onNavigateToStudentTask={(task) => {
                  setActiveTaskId(task.id);
                  setCurrentScreen('student');
                }}
                onNavigateToProgress={() => setCurrentScreen('team-progress')}
              />
            )}

            {/* Screen 2: Catalog */}
            {currentScreen === 'catalog' && (
              <CatalogScreen
                tasks={tasks}
                userRole={userRole}
                onOpenTask={handleOpenTask}
                onEditTask={handleEditTask}
                onNavigateToCreate={() => setCurrentScreen('create')}
              />
            )}

            {/* Screen 3: Create Task */}
            {currentScreen === 'create' && (
              <CreateTaskScreen
                onTaskCreated={handleTaskCreated}
                onCancel={() => setCurrentScreen('overview')}
              />
            )}

            {/* Screen 4: Edit Task Card */}
            {currentScreen === 'edit' && activeTask && (
              <EditTaskScreen
                task={activeTask}
                onSaveTask={handleSaveTask}
                onPreviewStudent={() => setCurrentScreen('student')}
                onBackToCatalog={() => setCurrentScreen('catalog')}
              />
            )}

            {/* Screen 5: Student Task View */}
            {currentScreen === 'student' && activeTask && (
              <StudentTaskScreen
                task={activeTask}
                tasks={tasks}
                onSelectAnotherTask={(t) => setActiveTaskId(t.id)}
                onSubmitProposal={handleSubmitProposal}
                onBackToCatalog={() => setCurrentScreen('catalog')}
                onNavigateToMyProposals={() => setCurrentScreen('my-proposals')}
              />
            )}

            {/* Screen 6: Proposals & Team Selection */}
            {currentScreen === 'proposals' && (
              <ProposalsScreen
                proposals={proposals}
                tasks={tasks}
                initialFilterTaskId={filterProposalsTaskId}
                onUpdateProposalStatus={handleUpdateProposalStatus}
                onMilestoneConfirmed={handleMilestoneConfirmed}
                onNavigateToTask={(taskId) => {
                  setActiveTaskId(taskId);
                  setCurrentScreen('edit');
                }}
              />
            )}

            {/* Screen 7: Student My Proposals */}
            {currentScreen === 'my-proposals' && (
              <MyProposalsScreen
                proposals={proposals}
                onMilestoneSubmitted={handleMilestoneSubmitted}
                onOpenTask={(taskId) => {
                  const found = tasks.find((t) => t.id === taskId);
                  if (found) {
                    setActiveTaskId(taskId);
                    setCurrentScreen('student');
                  }
                }}
                onExploreCatalog={() => setCurrentScreen('catalog')}
              />
            )}

            {/* Screen 8: Team Progress (Requirement 11) */}
            {currentScreen === 'team-progress' && (
              <TeamProgressScreen
                proposals={proposals}
                onExploreCatalog={() => setCurrentScreen('catalog')}
                onOpenMyProposals={() => setCurrentScreen('my-proposals')}
              />
            )}

            {/* Screen 9: Team Profile */}
            {currentScreen === 'team-profile' && (
              <TeamProfileScreen
                proposals={proposals}
                onNavigateToProgress={() => setCurrentScreen('team-progress')}
              />
            )}
          </main>
        </div>

        {/* Welcome Role Selection Modal */}
        {showWelcomeModal && (
          <WelcomeModal
            isOpen={showWelcomeModal}
            onSelectRole={handleSelectRoleFromWelcome}
            onClose={() => setShowWelcomeModal(false)}
          />
        )}

        {/* Level Up Celebration Modal (Requirement 13) */}
        {levelUpInfo.isOpen && levelUpInfo.levelInfo && (
          <LevelUpModal
            isOpen={levelUpInfo.isOpen}
            levelInfo={levelUpInfo.levelInfo}
            onClose={() => setLevelUpInfo({ isOpen: false, levelInfo: null })}
            onViewProgress={() => {
              setLevelUpInfo({ isOpen: false, levelInfo: null });
              setCurrentScreen('team-progress');
            }}
          />
        )}
      </div>
    </ToastProvider>
  );
}
