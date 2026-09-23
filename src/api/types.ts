import { Task, TaskTheme, StudentProposal, ProposalStatus, RatingBreakdown, ClarifyingQuestion, Milestone, MilestoneStatus } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: string;
  };
  isMock?: boolean;
}

export type ActionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = unknown> {
  status: ActionStatus;
  data?: T;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface CreateTaskPayload {
  id?: string;
  title: string;
  theme: TaskTheme;
  company: {
    name: string;
    industry?: string;
    repName?: string;
    repRole?: string;
    repContact?: string;
  };
  context: string;
  need: string;
  targetUsers?: string;
  dataProvided?: string;
  constraints?: string;
  expectedResult?: string;
  successCriteria?: string;
  contact?: string;
  interactionFormat?: string;
  published?: boolean;
}

export interface UpdateTaskPayload extends Partial<Task> {
  id: string;
}

export interface SubmitProposalPayload {
  taskId: string;
  taskTitle: string;
  companyName: string;
  teamName: string;
  university: string;
  captain: string;
  captainEmail: string;
  captainTelegram: string;
  membersCount: number;
  techStack: string[];
  idea: string;
  firstMilestone?: string;
  timeline: string;
  prototypeUrl?: string;
}

export interface AIQuestionDto {
  id: string;
  field: keyof Task;
  question: string;
  explanation?: string;
  required?: boolean;
  options?: string[];
  maxPoints?: number;
  exampleAnswer?: string;
}

export interface SubmitMilestoneProofPayload {
  proposalId: string;
  milestoneId: string;
  proofUrl: string;
}

export interface ConfirmMilestonePayload {
  proposalId: string;
  milestoneId: string;
  points: number;
}

export interface RequestMilestoneRevisionPayload {
  proposalId: string;
  milestoneId: string;
  feedback: string;
}
