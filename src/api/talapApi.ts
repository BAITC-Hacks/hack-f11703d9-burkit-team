import { Task, StudentProposal, ProposalStatus, RatingBreakdown } from '../types';
import {
  ApiResponse,
  CreateTaskPayload,
  SubmitProposalPayload,
  AIQuestionDto,
} from './types';
import { calculateTaskRating } from '../utils/ratingCalculator';
import { api } from '../services/api';

const questionFieldMap: Record<string, keyof Task> = {
  users: 'targetUsers',
  data_description: 'dataProvided',
  expected_result: 'expectedResult',
  success_criteria: 'successCriteria',
  interaction_format: 'interactionFormat',
};

function errorResponse<T>(error: unknown, fallback: string): ApiResponse<T> {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : fallback,
    },
  };
}

export const talapApi = {
  async createTask(payload: CreateTaskPayload): Promise<ApiResponse<Task>> {
    try {
      if (!payload.title?.trim() || !payload.need?.trim()) {
        return { success: false, error: { message: 'Заполните название и описание задачи' } };
      }

      let task = payload.id
        ? await api.updateTaskFields(payload.id, {
            author_name: payload.company.name,
            description: payload.need,
          })
        : await api.createTask(payload.need, payload.company.name);

      task = await api.updateTaskFields(task.id, {
        title: payload.title.trim(),
        context: payload.context || payload.need,
        need: payload.need,
        users: payload.targetUsers || null,
        data_description: payload.dataProvided || null,
        constraints: payload.constraints || null,
        expected_result: payload.expectedResult || null,
        success_criteria: payload.successCriteria || null,
        contact: payload.contact || null,
        interaction_format: payload.interactionFormat || null,
      });

      if (payload.published) {
        task = await api.publishTask(task.id);
      }
      return { success: true, data: task, isMock: false };
    } catch (error) {
      return errorResponse(error, 'Не удалось сохранить задачу');
    }
  },

  async updateTask(id: string, payload: Partial<Task>): Promise<ApiResponse<Task>> {
    try {
      let task = await api.updateTask(id, payload);
      if (payload.published && !task.published) {
        task = await api.publishTask(id);
      }
      return { success: true, data: task, isMock: false };
    } catch (error) {
      return errorResponse(error, 'Ошибка сохранения задачи');
    }
  },

  async fetchAIQuestions(context?: {
    taskId?: string;
    problem?: string;
    theme?: string;
  }): Promise<ApiResponse<AIQuestionDto[]>> {
    try {
      if (!context?.taskId) {
        return { success: false, error: { message: 'Сначала создайте черновик задачи' } };
      }
      const response = await api.getQuestions(context.taskId);
      const questions: AIQuestionDto[] = response.questions.map(
        (question: { field: string; text: string }, index: number) => ({
          id: `q-${index}-${question.field}`,
          field: questionFieldMap[question.field] || (question.field as keyof Task),
          question: question.text,
          required: false,
          maxPoints: 10,
        }),
      );
      return {
        success: true,
        data: questions,
        isMock: response.provider === 'mock',
      };
    } catch (error) {
      return errorResponse(error, 'Не удалось загрузить вопросы');
    }
  },

  async fetchTaskRating(taskData: Partial<Task>): Promise<ApiResponse<RatingBreakdown>> {
    try {
      return { success: true, data: calculateTaskRating(taskData), isMock: true };
    } catch (error) {
      return errorResponse(error, 'Ошибка вычисления рейтинга задачи');
    }
  },

  async submitProposal(payload: SubmitProposalPayload): Promise<ApiResponse<StudentProposal>> {
    try {
      const proposal = await api.createProposal(payload.taskId, {
        teamName: payload.teamName.trim(),
        idea: payload.idea.trim(),
        sprintPlan: `Этап 1: ${payload.firstMilestone || 'Подготовка прототипа'}`,
        timeline: payload.timeline || '3-4 недели',
        prototypeUrl: payload.prototypeUrl || '',
      });
      return { success: true, data: proposal, isMock: false };
    } catch (error) {
      return errorResponse(error, 'Не удалось отправить отклик');
    }
  },

  async updateProposalStatus(
    proposalId: string,
    newStatus: ProposalStatus,
  ): Promise<ApiResponse<StudentProposal>> {
    try {
      const proposal = await api.decideProposal(
        proposalId,
        newStatus === 'accepted' ? 'selected' : 'rejected',
      );
      return { success: true, data: proposal, isMock: false };
    } catch (error) {
      return errorResponse(error, 'Ошибка обновления статуса предложения');
    }
  },

  capabilities: {
    hasTasksApi: true,
    hasProposalsApi: true,
    hasAIQuestionsApi: true,
    hasRatingApi: true,
    hasMilestonesRemoteApi: false,
    hasXpHistoryRemoteApi: false,
  },
};
