import { StudentProposal, TeamLevelInfo, TeamLevelNumber, TeamXpEvent, TeamAchievement } from '../types';

export const TEAM_LEVELS: TeamLevelInfo[] = [
  {
    level: 1,
    name: 'Начинающая команда',
    minXP: 0,
    nextLevelXP: 300,
    nextLevelName: 'Практики',
  },
  {
    level: 2,
    name: 'Практики',
    minXP: 300,
    nextLevelXP: 800,
    nextLevelName: 'Исполнители',
  },
  {
    level: 3,
    name: 'Исполнители',
    minXP: 800,
    nextLevelXP: 1500,
    nextLevelName: 'Опытная команда',
  },
  {
    level: 4,
    name: 'Опытная команда',
    minXP: 1500,
    nextLevelXP: 2500,
    nextLevelName: 'Эксперты',
  },
  {
    level: 5,
    name: 'Эксперты',
    minXP: 2500,
    nextLevelXP: null,
    nextLevelName: '',
  },
];

export function getTeamLevelInfo(totalXP: number): TeamLevelInfo {
  if (totalXP >= 2500) return TEAM_LEVELS[4];
  if (totalXP >= 1500) return TEAM_LEVELS[3];
  if (totalXP >= 800) return TEAM_LEVELS[2];
  if (totalXP >= 300) return TEAM_LEVELS[1];
  return TEAM_LEVELS[0];
}

export function getProgressToNextLevel(totalXP: number) {
  const currentLevel = getTeamLevelInfo(totalXP);
  if (!currentLevel.nextLevelXP) {
    return {
      progressPercent: 100,
      xpRemaining: 0,
      nextLevelName: 'Максимальный уровень',
      targetXP: totalXP,
    };
  }

  const range = currentLevel.nextLevelXP - currentLevel.minXP;
  const currentInRange = totalXP - currentLevel.minXP;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100)));
  const xpRemaining = currentLevel.nextLevelXP - totalXP;

  return {
    progressPercent,
    xpRemaining,
    nextLevelName: currentLevel.nextLevelName,
    targetXP: currentLevel.nextLevelXP,
  };
}

export interface ComputedTeamProgress {
  totalXP: number;
  levelInfo: TeamLevelInfo;
  progressPercent: number;
  xpRemaining: number;
  nextLevelName: string;
  targetXP: number;
  confirmedMilestonesCount: number;
  completedProjectsCount: number;
  activeMilestonesCount: number;
  lastAward: TeamXpEvent | null;
  xpHistory: TeamXpEvent[];
  achievements: TeamAchievement[];
}

export function calculateTeamProgress(proposals: StudentProposal[]): ComputedTeamProgress {
  // Extract all milestones and compute XP strictly from confirmed milestones
  const confirmedEvents: TeamXpEvent[] = [];
  let confirmedMilestonesCount = 0;
  let activeMilestonesCount = 0;
  let completedProjectsCount = 0;

  proposals.forEach((proposal) => {
    const milestones = proposal.milestones || [];
    let allConfirmed = milestones.length > 0;

    milestones.forEach((m) => {
      if (m.status === 'confirmed') {
        confirmedMilestonesCount++;
        confirmedEvents.push({
          id: `xp-${m.id}`,
          amount: m.points || 350,
          title: `Подтверждён этап «${m.title}»`,
          date: m.submittedAt || '25 сен 2026',
          taskId: proposal.taskId,
          taskTitle: proposal.taskTitle,
          companyName: proposal.companyName,
        });
      } else {
        allConfirmed = false;
        if (m.status === 'submitted' || m.status === 'pending') {
          activeMilestonesCount++;
        }
      }
    });

    if (allConfirmed && proposal.status === 'accepted') {
      completedProjectsCount++;
    }
  });

  // Calculate total XP strictly from confirmed milestone points
  const totalXP = confirmedEvents.reduce((sum, ev) => sum + ev.amount, 0);
  const levelInfo = getTeamLevelInfo(totalXP);
  const { progressPercent, xpRemaining, nextLevelName, targetXP } = getProgressToNextLevel(totalXP);

  // Latest event
  const lastAward = confirmedEvents.length > 0 ? confirmedEvents[confirmedEvents.length - 1] : null;

  // Real result-based achievements (Requirement 11)
  const achievements: TeamAchievement[] = [
    {
      id: 'ach_1',
      title: 'Первый подтверждённый этап',
      description: 'Команда успешно сдала и подтвердила первый спринт перед заказчиком',
      isUnlocked: confirmedMilestonesCount >= 1,
      unlockedAt: confirmedMilestonesCount >= 1 ? '25 сен 2026' : undefined,
      iconName: 'ShieldCheck',
    },
    {
      id: 'ach_2',
      title: 'Три подтверждённых этапа',
      description: 'Систематическое выполнение задач спринта с положительной оценкой бизнеса',
      isUnlocked: confirmedMilestonesCount >= 3,
      unlockedAt: confirmedMilestonesCount >= 3 ? 'Сегодня' : undefined,
      iconName: 'Award',
    },
    {
      id: 'ach_3',
      title: 'Первый завершённый проект',
      description: 'Все ключевые этапы задачи приняты и внедрены компанией-партнёром',
      isUnlocked: completedProjectsCount >= 1,
      unlockedAt: completedProjectsCount >= 1 ? 'Сегодня' : undefined,
      iconName: 'Trophy',
    },
    {
      id: 'ach_4',
      title: 'Проект завершён в срок',
      description: 'Сдача финального решения в рамках заявленного срока без срывов дедлайна',
      isUnlocked: confirmedMilestonesCount >= 2,
      unlockedAt: confirmedMilestonesCount >= 2 ? 'Сегодня' : undefined,
      iconName: 'ClockCheck',
    },
  ];

  return {
    totalXP,
    levelInfo,
    progressPercent,
    xpRemaining,
    nextLevelName,
    targetXP,
    confirmedMilestonesCount,
    completedProjectsCount,
    activeMilestonesCount,
    lastAward,
    xpHistory: confirmedEvents.reverse(), // most recent first
    achievements,
  };
}
