import React, { useState } from 'react';
import { INITIAL_TASKS, INITIAL_PROPOSALS } from './data/mockData';
import { Task, StudentProposal, ActiveScreen, UserRole, ProposalStatus } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CatalogScreen } from './components/CatalogScreen';
import { CreateTaskScreen } from './components/CreateTaskScreen';
import { EditTaskScreen } from './components/EditTaskScreen';
import { StudentTaskScreen } from './components/StudentTaskScreen';
import { ProposalsScreen } from './components/ProposalsScreen';
import { MyProposalsScreen } from './components/MyProposalsScreen';
import { TeamProfileScreen } from './components/TeamProfileScreen';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>('business');
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('catalog');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [proposals, setProposals] = useState<StudentProposal[]>(INITIAL_PROPOSALS);
  const [activeTaskId, setActiveTaskId] = useState<string>('task-1');
  const [filterProposalsTaskId, setFilterProposalsTaskId] = useState<string>('all');

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];

  // Role Switch Handler
  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (newRole === 'business') {
      if (currentScreen === 'my-proposals' || currentScreen === 'team-profile') {
        setCurrentScreen('catalog');
      }
    } else {
      if (currentScreen === 'create' || currentScreen === 'edit' || currentScreen === 'proposals') {
        setCurrentScreen('catalog');
      }
    }
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

  const handleViewProposals = (taskId: string) => {
    setFilterProposalsTaskId(taskId);
    setCurrentScreen('proposals');
  };

  const pendingProposalsCount = proposals.filter((p) => p.status === 'new' || p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-[#17171C] flex font-sans antialiased">
      {/* 1. Left Sidebar (Fixed width 256px, in natural layout) */}
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

      {/* 2. Main Content Layout (Non-overlapping, scrolls naturally) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F5F6FA]">
        {/* Header in normal page flow */}
        <Header
          currentScreen={currentScreen}
          userRole={userRole}
          activeTaskTitle={activeTask?.title}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onNewTaskClick={() => setCurrentScreen('create')}
        />

        {/* Content Viewport with generous spacing and max width 1320px */}
        <main className="flex-1 p-8 overflow-y-auto">
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
              onCancel={() => setCurrentScreen('catalog')}
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
              onSelectAnotherTask={(t) => setActiveTaskId(t.id)}
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
              onNavigateToTask={(taskId) => {
                setActiveTaskId(taskId);
                setCurrentScreen('edit');
              }}
            />
          )}

          {currentScreen === 'my-proposals' && (
            <MyProposalsScreen
              proposals={proposals}
              onOpenTask={(taskId) => {
                const found = tasks.find(t => t.id === taskId);
                if (found) {
                  setActiveTaskId(taskId);
                  setCurrentScreen('student');
                }
              }}
              onExploreCatalog={() => setCurrentScreen('catalog')}
            />
          )}

          {currentScreen === 'team-profile' && (
            <TeamProfileScreen />
          )}
        </main>
      </div>
    </div>
  );
}
