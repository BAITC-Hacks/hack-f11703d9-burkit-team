import type {
  Task,
  StudentProposal,
  RatingBreakdown,
  ReadinessLevel,
  ProposalStatus,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Ошибка сервера' }));
    throw new Error(errorData.detail || `Ошибка ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

function mapReadinessLevel(backendLevel?: string): ReadinessLevel {
  switch (backendLevel) {
    case 'Приоритетная':
      return 'priority';
    case 'Готовая':
      return 'ready';
    case 'Рабочая':
      return 'working';
    case 'Черновик':
    default:
      return 'draft';
  }
}

export function adaptBackendTask(backendTask: any): Task {
  const ratingData = backendTask.rating || {
    score: backendTask.readiness_score || 0,
    readiness_level: backendTask.readiness_level || 'Черновик',
    missing_fields: [],
  };

  const totalScore = ratingData.score || 0;
  const readinessLevel = mapReadinessLevel(ratingData.readiness_level);

  const ratingBreakdown: RatingBreakdown = {
    totalScore,
    readinessLevel,
    readinessLabel: ratingData.readiness_level || 'Черновик',
    criteria: [],
    missions: [],
    wellFilled: [],
    canImprove: (ratingData.missing_fields || []).map((missing: any) => missing.hint),
    missingFields: (ratingData.missing_fields || []).map((missing: any) => missing.field),
    suggestions: (ratingData.missing_fields || []).map((missing: any, index: number) => ({
      id: `sug-${index}`,
      text: missing.hint,
      field: missing.field,
      pointsAdd: missing.bonus,
      sampleValue: '',
    })),
  };

  return {
    id: String(backendTask.id),
    title: backendTask.title || 'Без названия',
    theme: 'EdTech',
    company: {
      name: backendTask.author_name || 'Представитель бизнеса',
      industry: 'Образование',
      repName: backendTask.author_name || 'Представитель',
      repRole: 'Менеджер',
      repContact: backendTask.contact || backendTask.interaction_format || '',
    },
    cardColor: 'purple',
    updatedAt: backendTask.updated_at || new Date().toISOString(),
    proposalsCount: backendTask.proposals_count || 0,
    context: backendTask.context || '',
    need: backendTask.need || '',
    targetUsers: backendTask.users || '',
    dataProvided: backendTask.data_description || '',
    constraints: backendTask.constraints || '',
    expectedResult: backendTask.expected_result || '',
    successCriteria: backendTask.success_criteria || '',
    contact: backendTask.contact || '',
    interactionFormat: backendTask.interaction_format || '',
    rating: ratingBreakdown,
    published: backendTask.status === 'open',
  };
}

export function adaptFrontendTaskToBackend(task: Partial<Task>): Record<string, any> {
  const payload: Record<string, any> = {};
  if (task.title !== undefined) payload.title = task.title;
  if (task.context !== undefined) payload.context = task.context;
  if (task.need !== undefined) payload.need = task.need;
  if (task.targetUsers !== undefined) payload.users = task.targetUsers;
  if (task.dataProvided !== undefined) payload.data_description = task.dataProvided;
  if (task.constraints !== undefined) payload.constraints = task.constraints;
  if (task.expectedResult !== undefined) payload.expected_result = task.expectedResult;
  if (task.successCriteria !== undefined) payload.success_criteria = task.successCriteria;
  if (task.contact !== undefined) payload.contact = task.contact;
  if (task.interactionFormat !== undefined) payload.interaction_format = task.interactionFormat;
  if (task.company?.repName) payload.author_name = task.company.repName;
  return payload;
}

export function adaptBackendProposal(backendProp: any, taskTitle = ''): StudentProposal {
  let status: ProposalStatus = 'pending';
  if (backendProp.status === 'selected') status = 'accepted';
  else if (backendProp.status === 'rejected') status = 'rejected';
  else if (backendProp.status === 'pending') status = 'pending';

  return {
    id: String(backendProp.id),
    taskId: String(backendProp.task_id),
    taskTitle: taskTitle || `Задача #${backendProp.task_id}`,
    companyName: 'Бизнес',
    teamName: backendProp.team_name,
    university: 'ВУЗ',
    captain: 'Капитан команды',
    captainEmail: 'team@example.com',
    captainTelegram: '@team',
    membersCount: 4,
    idea: backendProp.idea,
    sprintPlan: backendProp.plan,
    timeline: backendProp.deadline,
    prototypeUrl: backendProp.prototype_url || '',
    submittedAt: backendProp.created_at || new Date().toISOString(),
    status,
    techStack: ['Python', 'React'],
  };
}

export const api = {
  async getTasks(status?: 'open' | 'draft' | 'closed'): Promise<Task[]> {
    const query = status ? `?status=${status}` : '';
    const rawTasks = await apiRequest<any[]>(`/tasks${query}`);
    return rawTasks.map(adaptBackendTask);
  },

  async getTask(id: string): Promise<Task> {
    const rawTask = await apiRequest<any>(`/tasks/${id}`);
    return adaptBackendTask(rawTask);
  },

  async createTask(description: string, authorName: string): Promise<Task> {
    const rawTask = await apiRequest<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ description, author_name: authorName, language: 'ru' }),
    });
    return adaptBackendTask(rawTask);
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const payload = adaptFrontendTaskToBackend(updates);
    const rawTask = await apiRequest<any>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return adaptBackendTask(rawTask);
  },

  async updateTaskFields(id: string, payload: Record<string, unknown>): Promise<Task> {
    const rawTask = await apiRequest<any>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return adaptBackendTask(rawTask);
  },

  async publishTask(id: string): Promise<Task> {
    const rawTask = await apiRequest<any>(`/tasks/${id}/publish`, {
      method: 'POST',
    });
    return adaptBackendTask(rawTask);
  },

  async getQuestions(taskId: string): Promise<any> {
    return apiRequest<any>(`/tasks/${taskId}/questions`, {
      method: 'POST',
    });
  },

  async getProposals(taskId: string): Promise<StudentProposal[]> {
    const rawProps = await apiRequest<any[]>(`/tasks/${taskId}/proposals`);
    return rawProps.map((proposal) => adaptBackendProposal(proposal));
  },

  async createProposal(
    taskId: string,
    proposal: {
      teamName: string;
      idea: string;
      sprintPlan: string;
      timeline: string;
      prototypeUrl: string;
    },
  ): Promise<StudentProposal> {
    const payload = {
      team_name: proposal.teamName,
      idea: proposal.idea,
      plan: proposal.sprintPlan,
      deadline: proposal.timeline,
      prototype_url: proposal.prototypeUrl || null,
    };
    const rawProp = await apiRequest<any>(`/tasks/${taskId}/proposals`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return adaptBackendProposal(rawProp);
  },

  async decideProposal(
    proposalId: string,
    status: 'selected' | 'rejected',
  ): Promise<StudentProposal> {
    const rawProp = await apiRequest<any>(`/proposals/${proposalId}/decision`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return adaptBackendProposal(rawProp);
  },
};
