import React, { useState, useEffect } from 'react';
import { Task, StudentProposal, ActiveScreen, UserRole, ProposalStatus, TeamLevelInfo } from './types';
import { api } from './services/api';
import { calculateTeamProgress } from './utils/teamProgress';
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [proposals, setProposals] = useState<StudentProposal[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string>('');
  const [filterProposalsTaskId, setFilterProposalsTaskId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [levelUpInfo, setLevelUpInfo] = useState<{ isOpen: boolean; levelInfo: TeamLevelInfo | null }>({
    isOpen: false,
    levelInfo: null,
  });

  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(() => {
    return !localStorage.getItem('talap_role_selected');
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const loadedTasks = await api.getTasks();
      setTasks(loadedTasks);
      if (loadedTasks.length > 0) {
        setActiveTaskId(loadedTasks[0].id);
        const allPropsPromises = loadedTasks.map((task) => api.getProposals(task.id).catch(() => []));
        const propsResults = await Promise.all(allPropsPromises);
        setProposals(propsResults.flat());
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeTask = tasks.find((task) => task.id === activeTaskId) || tasks[0];

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (newRole === 'business') {
      if (
        currentScreen === 'my-proposals' ||
        currentScreen === 'team-profile' ||
        currentScreen === 'team-progress'
      ) {
        setCurrentScreen('overview');
      }
    } else if (currentScreen === 'create' || currentScreen === 'edit' || currentScreen === 'proposals') {
      setCurrentScreen('overview');
    }
  };

  const handleSelectRoleFromWelcome = (selectedRole: UserRole) => {
    setUserRole(selectedRole);
    localStorage.setItem('talap_role_selected', selectedRole);
    setShowWelcomeModal(false);
    setCurrentScreen('overview');
  };

  const handleSaveTask = async (updatedTask: Task) => {
    setTasks((previous) =>
      previous.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    );
  };

  const handleTaskCreated = async (newTask: Task) => {
    setTasks((previous) => [newTask, ...previous]);
    setActiveTaskId(newTask.id);
    setCurrentScreen('edit');
  };

  const handleSubmitProposal = async (newProposal: StudentProposal) => {
    setProposals((previous) => [newProposal, ...previous]);
    setTasks((previous) =>
      previous.map((task) =>
        task.id === newProposal.taskId
          ? { ...task, proposalsCount: task.proposalsCount + 1 }
          : task,
      ),
    );
  };

  const handleUpdateProposalStatus = async (
    proposalId: string,
    newStatus: ProposalStatus,
  ) => {
    setProposals((previous) =>
      previous.map((proposal) =>
        proposal.id === proposalId ? { ...proposal, status: newStatus } : proposal,
      ),
    );
  };

  const handleMilestoneConfirmed = (proposalId: string, milestoneId: string, points: number) => {
    const oldProgress = calculateTeamProgress(proposals);
    const oldLevel = oldProgress.levelInfo.level;

    const updated = proposals.map((proposal) => {
      if (proposal.id !== proposalId) return proposal;
      const updatedMilestones = (proposal.milestones || []).map((milestone) => {
        if (milestone.id === milestoneId) {
          return { ...milestone, status: 'confirmed' as const };
        }
        return milestone;
      });
      return {
        ...proposal,
        milestones: updatedMilestones,
        teamProgressPoints: (proposal.teamProgressPoints || 0) + points,
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

  const handleMilestoneSubmitted = (proposalId: string, milestoneId: string, proofUrl: string) => {
    setProposals((previous) =>
      previous.map((proposal) => {
        if (proposal.id !== proposalId) return proposal;
        const updatedMilestones = (proposal.milestones || []).map((milestone) => {
          if (milestone.id === milestoneId) {
            return { ...milestone, status: 'submitted' as const, proofUrl };
          }
          return milestone;
        });
        return { ...proposal, milestones: updatedMilestones };
      }),
    );
  };

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

  const pendingProposalsCount = proposals.filter(
    (proposal) => proposal.status === 'new' || proposal.status === 'pending',
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#7047EB] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Загрузка данных TALAP API...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl max-w-md text-center">
          <h3 className="font-bold text-lg mb-2">Ошибка подключения к API</h3>
          <p className="text-sm mb-4">{errorMessage}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-[#7047EB] text-white rounded-lg hover:bg-opacity-90 font-medium"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen xl:h-[100dvh] xl:overflow-hidden bg-[#F5F6FA] text-[#17171C] flex flex-col xl:grid xl:grid-cols-[256px_minmax(0,1fr)] font-sans antialiased">
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

        <div className="flex-1 flex flex-col min-w-0 min-h-0 xl:h-[100dvh] bg-[#F5F6FA] overflow-hidden">
          <Header
            currentScreen={currentScreen}
            userRole={userRole}
            activeTaskTitle={activeTask?.title}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onNewTaskClick={() => setCurrentScreen('create')}
          />

          <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
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

            {currentScreen === 'catalog' && (
              <CatalogScreen
                tasks={tasks}
                userRole={userRole}
                onOpenTask={handleOpenTask}
                onEditTask={handleEditTask}
                onNavigateToCreate={() => setCurrentScreen('create')}
              />
            )}

            {currentScreen === 'create' && (
              <CreateTaskScreen
                onTaskCreated={handleTaskCreated}
                onCancel={() => setCurrentScreen('overview')}
              />
            )}

            {currentScreen === 'edit' && activeTask && (
              <EditTaskScreen
                task={activeTask}
                onSaveTask={handleSaveTask}
                onPreviewStudent={() => setCurrentScreen('student')}
                onBackToCatalog={() => setCurrentScreen('catalog')}
              />
            )}

            {currentScreen === 'student' && activeTask && (
              <StudentTaskScreen
                task={activeTask}
                tasks={tasks}
                onSelectAnotherTask={(task) => setActiveTaskId(task.id)}
                onSubmitProposal={handleSubmitProposal}
                onBackToCatalog={() => setCurrentScreen('catalog')}
                onNavigateToMyProposals={() => setCurrentScreen('my-proposals')}
              />
            )}

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

            {currentScreen === 'my-proposals' && (
              <MyProposalsScreen
                proposals={proposals}
                onMilestoneSubmitted={handleMilestoneSubmitted}
                onOpenTask={(taskId) => {
                  const found = tasks.find((task) => task.id === taskId);
                  if (found) {
                    setActiveTaskId(taskId);
                    setCurrentScreen('student');
                  }
                }}
                onExploreCatalog={() => setCurrentScreen('catalog')}
              />
            )}

            {currentScreen === 'team-progress' && (
              <TeamProgressScreen
                proposals={proposals}
                onExploreCatalog={() => setCurrentScreen('catalog')}
                onOpenMyProposals={() => setCurrentScreen('my-proposals')}
              />
            )}

            {currentScreen === 'team-profile' && (
              <TeamProfileScreen
                proposals={proposals}
                onNavigateToProgress={() => setCurrentScreen('team-progress')}
              />
            )}
          </main>
        </div>

        {showWelcomeModal && (
          <WelcomeModal
            isOpen={showWelcomeModal}
            onSelectRole={handleSelectRoleFromWelcome}
            onClose={() => setShowWelcomeModal(false)}
          />
        )}

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
