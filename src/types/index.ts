export type UserRole = 'business' | 'student';

export type TaskTheme = 
  | 'AI / ML'
  | 'FinTech'
  | 'E-commerce'
  | 'LogTech'
  | 'HealthTech'
  | 'GovTech'
  | 'EdTech';

export type ReadinessLevel = 
  | 'draft'       // 0 - 39: Черновик
  | 'working'     // 40 - 69: Рабочая
  | 'ready'       // 70 - 89: Готовая
  | 'priority'    // 90 - 100: Приоритетная
  | 'basic'       // fallback compatibility
  | 'gold';       // fallback compatibility

export type MissionStatus = 'not_started' | 'needs_clarification' | 'ready' | 'confirmed';

export interface TaskMission {
  id: string;
  title: string;
  maxScore: number;
  currentScore: number;
  status: MissionStatus;
  field: keyof Task;
  nextStepText: string;
}

export interface RatingCriteria {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  description: string;
  hint: string;
}

export interface RatingBreakdown {
  totalScore: number;
  readinessLevel: ReadinessLevel;
  readinessLabel: string;
  criteria: RatingCriteria[];
  missions: TaskMission[];
  wellFilled: string[];
  canImprove: string[];
  nextBestStep?: {
    text: string;
    field: keyof Task;
    pointsAdd: number;
    sampleValue: string;
    buttonLabel: string;
  };
  missingFields: string[];
  suggestions: {
    id: string;
    text: string;
    field: string;
    pointsAdd: number;
    sampleValue: string;
  }[];
}

export type ProposalStatus = 'new' | 'pending' | 'accepted' | 'rejected';

export type MilestoneStatus = 'pending' | 'submitted' | 'confirmed' | 'revision_requested';

export interface ProposalMilestone {
  id: string;
  title: string;
  description: string;
  deadline: string;
  points: number;
  status: MilestoneStatus;
  proofUrl?: string;
  submittedAt?: string;
  feedback?: string;
}

export type Milestone = ProposalMilestone;

export interface StudentProposal {
  id: string;
  taskId: string;
  taskTitle: string;
  companyName: string;
  teamName: string;
  university: string;
  captain: string;
  captainEmail: string;
  captainTelegram: string;
  membersCount: number;
  idea: string;
  sprintPlan: string;
  timeline: string;
  prototypeUrl: string;
  submittedAt: string;
  status: ProposalStatus;
  rejectionReason?: string;
  techStack: string[];
  milestones?: ProposalMilestone[];
  teamProgressPoints?: number;
}

export interface Task {
  id: string;
  title: string;
  theme: TaskTheme;
  company: {
    name: string;
    logo?: string;
    industry: string;
    repName: string;
    repRole: string;
    repContact: string;
  };
  cardColor: 'purple' | 'coral' | 'yellow' | 'green';
  updatedAt: string;
  proposalsCount: number;
  
  // 10 core fields grouped into logical sections
  // 1. Проблема и потребность
  context: string;
  need: string;
  
  // 2. Пользователи и данные
  targetUsers: string;
  dataProvided: string;
  
  // 3. Условия и ограничения
  constraints: string;
  
  // 4. Ожидаемый результат и критерии успеха
  expectedResult: string;
  successCriteria: string;
  
  // 5. Связь с бизнесом
  contact: string;
  interactionFormat: string;

  // Rating & Status
  rating: RatingBreakdown;
  published: boolean;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  explanation: string;
  field: keyof Task;
  options: string[];
  selectedOption?: string;
  customAnswer?: string;
  maxPoints?: number;
  exampleAnswer?: string;
}

export type ActiveScreen = 
  | 'overview'
  | 'catalog'
  | 'my-tasks'
  | 'create'
  | 'edit'
  | 'student'
  | 'proposals'
  | 'my-proposals'
  | 'team-progress'
  | 'team-profile';

export type TeamLevelNumber = 1 | 2 | 3 | 4 | 5;

export interface TeamLevelInfo {
  level: TeamLevelNumber;
  name: string;
  minXP: number;
  nextLevelXP: number | null;
  nextLevelName: string;
}

export interface TeamXpEvent {
  id: string;
  amount: number;
  title: string;
  date: string;
  taskId: string;
  taskTitle: string;
  companyName: string;
}

export interface TeamAchievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  iconName: string;
}

export interface StudentProfile {
  teamName: string;
  university: string;
  captain: string;
  telegram: string;
  email: string;
  membersCount: number;
  skills: string[];
  githubOrg: string;
  bio: string;
}
