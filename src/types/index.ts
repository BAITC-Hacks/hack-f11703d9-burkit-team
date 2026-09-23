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
  | 'draft'       // 0 - 40
  | 'basic'       // 41 - 70
  | 'ready'       // 71 - 85
  | 'gold';       // 86 - 100

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
  
  // 10 core fields grouped into 5 logical sections
  // 1. Задача и контекст
  context: string;
  need: string;
  
  // 2. Пользователи и данные
  targetUsers: string;
  dataProvided: string;
  
  // 3. Ограничения
  constraints: string;
  
  // 4. Результат и критерии успеха
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
}

export type ActiveScreen = 
  | 'catalog'
  | 'create'
  | 'edit'
  | 'student'
  | 'proposals'
  | 'my-proposals'
  | 'team-profile';

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
