import { 
  ApiResponse, 
  CreateTaskPayload, 
  UpdateTaskPayload, 
  SubmitProposalPayload, 
  AIQuestionDto,
  SubmitMilestoneProofPayload,
  ConfirmMilestonePayload,
  RequestMilestoneRevisionPayload
} from './types';
import { Task, StudentProposal, ProposalStatus, RatingBreakdown } from '../types';
import { INITIAL_TASKS, INITIAL_PROPOSALS, SAMPLE_AI_QUESTIONS } from '../data/mockData';
import { calculateTaskRating } from '../utils/ratingCalculator';

/**
 * TALAP API Client & Frontend Adapter
 * Provides async operations with realistic contract models, error handling,
 * and unified server rating source.
 */

// In-memory data store replicating backend state for the session
let tasksDb: Task[] = [...INITIAL_TASKS];
let proposalsDb: StudentProposal[] = [...INITIAL_PROPOSALS];

export const talapApi = {
  /**
   * Fetch all active tasks with server rating
   */
  async fetchTasks(): Promise<ApiResponse<Task[]>> {
    try {
      return {
        success: true,
        data: [...tasksDb],
        isMock: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'Не удалось загрузить каталог задач' },
      };
    }
  },

  /**
   * Fetch single task by ID
   */
  async fetchTaskById(id: string): Promise<ApiResponse<Task>> {
    try {
      const task = tasksDb.find((t) => t.id === id);
      if (!task) {
        return {
          success: false,
          error: { message: `Задача с ID ${id} не найдена` },
        };
      }
      return {
        success: true,
        data: { ...task },
        isMock: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'Ошибка загрузки карточки задачи' },
      };
    }
  },

  /**
   * Create a new task and compute initial server rating
   */
  async createTask(payload: CreateTaskPayload): Promise<ApiResponse<Task>> {
    try {
      if (!payload.title?.trim()) {
        return {
          success: false,
          error: { message: 'Название задачи не может быть пустым' },
        };
      }
      if (!payload.need?.trim()) {
        return {
          success: false,
          error: { message: 'Укажите проблему или потребность бизнеса' },
        };
      }

      // Calculate official server rating
      const serverRating = calculateTaskRating({
        context: payload.context || payload.need,
        need: payload.need,
        targetUsers: payload.targetUsers,
        dataProvided: payload.dataProvided,
        constraints: payload.constraints,
        expectedResult: payload.expectedResult,
        successCriteria: payload.successCriteria,
        contact: payload.contact,
        interactionFormat: payload.interactionFormat,
      });

      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: payload.title.trim(),
        theme: payload.theme,
        company: {
          name: payload.company.name || 'Партнёр TALAP',
          industry: payload.company.industry || 'IT & Business Services',
          repName: payload.company.repName || 'Представитель компании',
          repRole: payload.company.repRole || 'Менеджер продукта',
          repContact: payload.company.repContact || '@business_rep',
        },
        cardColor: 'purple',
        updatedAt: 'Только что',
        proposalsCount: 0,
        context: payload.context || payload.need,
        need: payload.need,
        targetUsers: payload.targetUsers || '',
        dataProvided: payload.dataProvided || '',
        constraints: payload.constraints || '',
        expectedResult: payload.expectedResult || '',
        successCriteria: payload.successCriteria || '',
        contact: payload.contact || 'Представитель бизнеса, Telegram: @business_contact',
        interactionFormat: payload.interactionFormat || '',
        published: payload.published ?? true,
        rating: serverRating,
      };

      tasksDb = [newTask, ...tasksDb];

      return {
        success: true,
        data: newTask,
        isMock: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'Не удалось создать задачу' },
      };
    }
  },

  /**
   * Save task draft (without publishing)
   */
  async saveTaskDraft(id: string, payload: Partial<Task>): Promise<ApiResponse<Task>> {
    try {
      const index = tasksDb.findIndex((t) => t.id === id);
      if (index === -1) {
        return {
          success: false,
          error: { message: 'Задача не найдена для сохранения черновика' },
        };
      }

      const existing = tasksDb[index];
      const updatedFields = { ...existing, ...payload, published: false, updatedAt: 'Только что' };
      const rating = calculateTaskRating(updatedFields);
      const updatedTask: Task = { ...updatedFields, rating };

      tasksDb[index] = updatedTask;

      return {
        success: true,
        data: updatedTask,
        isMock: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'Ошибка сохранения черновика' },
      };
    }
  },

  /**
   * Update task fields & recalculate server rating
   */
  async updateTask(id: string, payload: Partial<Task>): Promise<ApiResponse<Task>> {
    try {
      const index = tasksDb.findIndex((t) => t.id === id);
      if (index === -1) {
        return {
          success: false,
          error: { message: 'Задача для обновления не найдена' },
        };
      }

      const existing = tasksDb[index];
      const merged = { ...existing, ...payload, updatedAt: 'Только что' };
      const newRating = calculateTaskRating(merged);
      const updatedTask: Task = { ...merged, rating: newRating };

      tasksDb[index] = updatedTask;

      return {
        success: true,
        data: updatedTask,
        isMock: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'Ошибка сохранения изменений' },
      };
    }
  },

  /**
   * Publish a task
   */
  async publishTask(id: string): Promise<ApiResponse<Task>> {
    return this.updateTask(id, { published: true });
  },

  /**
   * Fetch dynamic AI clarifying questions for task creation / refinement
   * Returns a dynamic set of 3-5 structured questions
   */
  async fetchAIQuestions(context?: { problem?: string; theme?: string }): Promise<ApiResponse<AIQuestionDto[]>> {
    try {
      // Return dynamic 3-5 structured questions matching API DTO
      const questions: AIQuestionDto[] = [
        {
          id: 'q_users',
          field: 'targetUsers',
          question: 'Кто будет пользоваться решением?',
          explanation: 'Понимание пользователей помогает студентам спроектировать правильный интерфейс и сценарий.',
          required: false,
          maxPoints: 10,
          exampleAnswer: 'Например: операторы поддержки, аналитики или клиенты мобильного приложения.',
          options: [
            'Внутренние сотрудники компании (операторы, товароведы, менеджеры)',
            'Конечные клиенты и покупатели в приложении или на сайте',
            'Аналитики и руководители для принятия решений',
            'Выездные специалисты и технические инженеры',
          ],
        },
        {
          id: 'q_data',
          field: 'dataProvided',
          question: 'Какие данные или примеры вы сможете предоставить?',
          explanation: 'Наличие реального датасета или примеров файлов ускоряет старт разработки в разы.',
          required: false,
          maxPoints: 20,
          exampleAnswer: 'Например: CSV-выгрузка за 3 месяца или 500 размеченных фотографий.',
          options: [
            'Обезличенная таблица Excel / CSV с историческими записями',
            'Тестовый REST API с демонстрационными данными и документацией',
            'Набор реальных файлов (фотографии, документы или отчёты)',
            'Несколько типовых примеров входных и выходных файлов',
          ],
        },
        {
          id: 'q_expected',
          field: 'expectedResult',
          question: 'Какой результат вы ожидаете получить в итоге?',
          explanation: 'Чёткий финал защищает от разногласий при приёмке работы.',
          required: false,
          maxPoints: 15,
          exampleAnswer: 'Например: работающий прототип с веб-интерфейсом и инструкция по запуску.',
          options: [
            'Рабочий прототип с простым веб-интерфейсом для демонстрации',
            'Автономный микросервис с инструкцией по запуску в Docker',
            'Алгоритмическая модель с аналитическим отчётом',
            'Интерактивный дашборд с визуализацией метрик',
          ],
        },
        {
          id: 'q_success',
          field: 'successCriteria',
          question: 'Как вы оцените качество и успех работы?',
          explanation: 'Критерии успеха дают студентам измеримый ориентир для тестирования.',
          required: false,
          maxPoints: 15,
          exampleAnswer: 'Например: точность не ниже 80% или ускорение обработки в 3 раза.',
          options: [
            'Точность решения выше 80% на тестовых данных бизнеса',
            'Сокращение времени ручной операции минимум в 2–3 раза',
            'Стабильный запуск без ошибок по инструкции за 10 минут',
            'Положительная оценка пилота нашими сотрудниками',
          ],
        },
        {
          id: 'q_format',
          field: 'interactionFormat',
          question: 'В каком формате вам удобно взаимодействовать с командой?',
          explanation: 'Регулярная синхронизация снижает риск отклонения от бизнес-цели.',
          required: false,
          maxPoints: 10,
          exampleAnswer: 'Например: короткий созвон раз в неделю + чат в Telegram.',
          options: [
            'Короткий созвон раз в неделю на 30 минут + чат в Telegram',
            'Два созвона в неделю для быстрой сверки планов',
            'Асинхронные ответы в чате по мере появления вопросов',
            'Промежуточный созвон в середине срока и финальное демо',
          ],
        },
      ];

      return {
        success: true,
        data: questions,
        isMock: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'Не удалось загрузить вопросы' },
      };
    }
  },

  /**
   * Calculate / Fetch official Server Task Rating
   */
  async fetchTaskRating(taskData: Partial<Task>): Promise<ApiResponse<RatingBreakdown>> {
    try {
      const serverRating = calculateTaskRating(taskData);
      return {
        success: true,
        data: serverRating,
        isMock: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'Ошибка вычисления рейтинга задачи' },
      };
    }
  },

  /**
   * Submit student proposal
   */
  async submitProposal(payload: SubmitProposalPayload): Promise<ApiResponse<StudentProposal>> {
    try {
      if (!payload.teamName?.trim()) {
        return {
          success: false,
          error: { message: 'Укажите название студенческой команды' },
        };
      }
      if (!payload.idea?.trim()) {
        return {
          success: false,
          error: { message: 'Опишите идею решения задачи' },
        };
      }

      const newProposal: StudentProposal = {
        id: `prop-${Date.now()}`,
        taskId: payload.taskId,
        taskTitle: payload.taskTitle,
        companyName: payload.companyName,
        teamName: payload.teamName.trim(),
        university: payload.university?.trim() || 'Вуз Казахстана',
        captain: payload.captain || 'Капитан команды',
        captainEmail: payload.captainEmail || 'team@univ.kz',
        captainTelegram: payload.captainTelegram || '@student_lead',
        membersCount: payload.membersCount || 4,
        techStack: payload.techStack || ['Python', 'FastAPI'],
        idea: payload.idea.trim(),
        sprintPlan: `• Этап 1: ${payload.firstMilestone || 'Подготовка базового прототипа'}\n• Этап 2: Доработка решения и тестирование\n• Этап 3: Финальный релиз и документация`,
        timeline: payload.timeline || '3-4 недели',
        prototypeUrl: payload.prototypeUrl || 'https://github.com/team/solution',
        submittedAt: 'Только что',
        status: 'new',
        teamProgressPoints: 0,
        milestones: [
          {
            id: `m-${Date.now()}-1`,
            title: 'Этап 1: Первый рабочий результат',
            description: payload.firstMilestone || 'Подготовка и валидация данных, базовый инференс прототипа.',
            deadline: 'Через 10 дней',
            points: 300,
            status: 'pending',
          },
          {
            id: `m-${Date.now()}-2`,
            title: 'Этап 2: Оптимизация решения и проверка метрик',
            description: 'Достижение заявленных критериев приёмки бизнеса.',
            deadline: 'Через 20 дней',
            points: 400,
            status: 'pending',
          },
          {
            id: `m-${Date.now()}-3`,
            title: 'Этап 3: Демонстрационный прототип и сдача пилота',
            description: 'Финальная демонстрация представителю компании.',
            deadline: 'Через 30 дней',
            points: 500,
            status: 'pending',
          },
        ],
      };

      proposalsDb = [newProposal, ...proposalsDb];

      // Update task proposals count
      const taskIndex = tasksDb.findIndex((t) => t.id === payload.taskId);
      if (taskIndex !== -1) {
        tasksDb[taskIndex] = {
          ...tasksDb[taskIndex],
          proposalsCount: tasksDb[taskIndex].proposalsCount + 1,
        };
      }

      return {
        success: true,
        data: newProposal,
        isMock: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'Не удалось отправить отклик' },
      };
    }
  },

  /**
   * Update student proposal status (accept team, reject, etc.)
   */
  async updateProposalStatus(
    proposalId: string,
    newStatus: ProposalStatus,
    reason?: string
  ): Promise<ApiResponse<StudentProposal>> {
    try {
      const index = proposalsDb.findIndex((p) => p.id === proposalId);
      if (index === -1) {
        return {
          success: false,
          error: { message: 'Отклик не найден' },
        };
      }

      const updated = {
        ...proposalsDb[index],
        status: newStatus,
        rejectionReason: reason || proposalsDb[index].rejectionReason,
      };

      proposalsDb[index] = updated;

      return {
        success: true,
        data: updated,
        isMock: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.message || 'Ошибка обновления статуса предложения' },
      };
    }
  },

  /**
   * Backend Readiness Diagnostics for Milestones & XP:
   * Explicitly documents which features have remote backend endpoints vs. pending backend integration.
   */
  capabilities: {
    hasTasksApi: true,
    hasProposalsApi: true,
    hasAIQuestionsApi: true,
    hasRatingApi: true,
    // Milestones and remote XP persistence are not yet deployed as dedicated microservice endpoints
    hasMilestonesRemoteApi: false,
    hasXpHistoryRemoteApi: false,
  },
};
