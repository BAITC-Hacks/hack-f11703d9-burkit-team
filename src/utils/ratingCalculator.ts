import { RatingBreakdown, RatingCriteria, ReadinessLevel, Task } from '../types';

export function calculateTaskRating(task: Partial<Task>): RatingBreakdown {
  const context = (task.context || '').trim();
  const need = (task.need || '').trim();
  const users = (task.targetUsers || '').trim();
  const data = (task.dataProvided || '').trim();
  const constraints = (task.constraints || '').trim();
  const expected = (task.expectedResult || '').trim();
  const success = (task.successCriteria || '').trim();
  const contact = (task.contact || '').trim();
  const interaction = (task.interactionFormat || '').trim();

  // 1. Context completeness (max 15)
  let c1 = 0;
  if (context.length > 20) c1 += 5;
  if (context.length > 80) c1 += 5;
  if (users.length > 15) c1 += 5;

  // 2. Problem clarity (max 15)
  let c2 = 0;
  if (need.length > 20) c2 += 5;
  if (need.length > 70) c2 += 5;
  if (need.toLowerCase().includes('почему') || need.toLowerCase().includes('проблем') || need.toLowerCase().includes('боль') || need.toLowerCase().includes('сейчас')) c2 += 5;
  else if (need.length > 120) c2 += 5;

  // 3. Data readiness (max 15)
  let c3 = 0;
  if (data.length > 15) c3 += 4;
  if (data.toLowerCase().includes('csv') || data.toLowerCase().includes('api') || data.toLowerCase().includes('json') || data.toLowerCase().includes('баз') || data.toLowerCase().includes('датасет') || data.toLowerCase().includes('лог')) c3 += 5;
  if (data.toLowerCase().includes('аноним') || data.toLowerCase().includes('пример') || data.toLowerCase().includes('схем') || data.toLowerCase().includes('доступ') || data.toLowerCase().includes('sandbox')) c3 += 6;
  else if (data.length > 100) c3 += 4;

  // 4. Feasibility & constraints (max 15)
  let c4 = 0;
  if (constraints.length > 15) c4 += 5;
  if (constraints.toLowerCase().includes('стек') || constraints.toLowerCase().includes('python') || constraints.toLowerCase().includes('react') || constraints.toLowerCase().includes('docker') || constraints.toLowerCase().includes('gpu') || constraints.toLowerCase().includes('лиценз')) c4 += 5;
  if (constraints.length > 80) c4 += 5;

  // 5. Measurable outcome (max 15)
  let c5 = 0;
  if (expected.length > 20) c5 += 5;
  if (success.length > 15) c5 += 4;
  if (/\d+%|\d+\s*(мс|ms|сек|sec|руб|тг|тенге|кпи|kpi|f1|accuracy|roc)/i.test(success) || success.toLowerCase().includes('метрика') || success.toLowerCase().includes('точност')) {
    c5 += 6;
  } else if (success.length > 80) {
    c5 += 3;
  }

  // 6. Mentorship & interaction format (max 15)
  let c6 = 0;
  if (contact.length > 10) c6 += 5;
  if (interaction.length > 20) c6 += 5;
  if (interaction.toLowerCase().includes('синк') || interaction.toLowerCase().includes('еженедельн') || interaction.toLowerCase().includes('демо') || interaction.toLowerCase().includes('чат') || interaction.toLowerCase().includes('ментор')) c6 += 5;

  // 7. Educational & portfolio value (max 10)
  let c7 = 0;
  if (expected.toLowerCase().includes('репозитор') || expected.toLowerCase().includes('github') || expected.toLowerCase().includes('демо') || expected.toLowerCase().includes('docker') || expected.toLowerCase().includes('прототип') || expected.toLowerCase().includes('сервис')) c7 += 5;
  else if (expected.length > 50) c7 += 3;
  if ((c1 + c2 + c3 + c4 + c5) > 50) c7 += 5;
  else c7 += 2;

  // Cap each criteria
  c1 = Math.min(15, c1);
  c2 = Math.min(15, c2);
  c3 = Math.min(15, c3);
  c4 = Math.min(15, c4);
  c5 = Math.min(15, c5);
  c6 = Math.min(15, c6);
  c7 = Math.min(10, c7);

  const totalScore = Math.min(100, Math.max(0, c1 + c2 + c3 + c4 + c5 + c6 + c7));

  let readinessLevel: ReadinessLevel = 'draft';
  let readinessLabel = 'Черновик задачи';
  if (totalScore >= 86) {
    readinessLevel = 'gold';
    readinessLabel = 'Высший стандарт TALAP';
  } else if (totalScore >= 71) {
    readinessLevel = 'ready';
    readinessLabel = 'Готово к публикации';
  } else if (totalScore >= 41) {
    readinessLevel = 'basic';
    readinessLabel = 'Базовая проработка';
  }

  const criteria: RatingCriteria[] = [
    {
      id: 'context',
      name: 'Полнота контекста',
      score: c1,
      maxScore: 15,
      description: 'Понятны ли бизнес-окружение и целевая аудитория',
      hint: c1 < 12 ? 'Уточните, кто именно будет пользоваться результатом и в каких условиях' : 'Контекст и пользователи подробно описаны'
    },
    {
      id: 'need',
      name: 'Чёткость проблемы',
      score: c2,
      maxScore: 15,
      description: 'Ясна ли корневая боль бизнеса и текущее несовершенство',
      hint: c2 < 12 ? 'Объясните, почему текущий способ не подходит и чем это грозит' : 'Бизнес-потребность четко сформулирована'
    },
    {
      id: 'data',
      name: 'Доступность данных',
      score: c3,
      maxScore: 15,
      description: 'Предоставлены ли форматы, схема или тестовый датасет',
      hint: c3 < 12 ? 'Укажите формат (CSV, JSON, API) и наличие тестовой/анонимизированной выборки' : 'Данные и доступ готовы к передаче студентам'
    },
    {
      id: 'constraints',
      name: 'Реалистичность ограничений',
      score: c4,
      maxScore: 15,
      description: 'Зафиксирован ли технологический стек и системные рамки',
      hint: c4 < 12 ? 'Укажите допустимый стек (например, Python/Docker) и рамки по железу' : 'Ограничения реалистичны для студенческого хакатона'
    },
    {
      id: 'outcome',
      name: 'Измеримость результата',
      score: c5,
      maxScore: 15,
      description: 'Заданы ли числовые критерии приёмки и формат артефактов',
      hint: c5 < 12 ? 'Добавьте числовые KPI (например, F1 > 0.85, отклик < 300мс)' : 'Метрики приёмки прозрачны и измеримы'
    },
    {
      id: 'mentorship',
      name: 'Менторская поддержка',
      score: c6,
      maxScore: 15,
      description: 'Указаны ли контакты, регулярность встреч и фидбека',
      hint: c6 < 12 ? 'Зафиксируйте формат связи (еженедельный синк, Slack/Telegram чат)' : 'Регулярный контакт и менторство подтверждены'
    },
    {
      id: 'value',
      name: 'Ценность для студентов',
      score: c7,
      maxScore: 10,
      description: 'Понятность итогового кейса для резюме и портфолио',
      hint: c7 < 8 ? 'Опишите финальный артефакт (готовый сервис или open-source модуль)' : 'Отличный практический кейс для портфолио команды'
    }
  ];

  // Missing fields determination
  const missingFields: string[] = [];
  if (c3 < 10) missingFields.push('Не описан формат входных данных или структура тестового датасета');
  if (c5 < 10) missingFields.push('Критерии успеха не содержат оцифрованных KPI или понятных метрик приёмки');
  if (c4 < 10) missingFields.push('Не очерчены технические ограничения по стеку, зависимостям или окружению');
  if (c6 < 10) missingFields.push('Не указан график консультаций (например, еженедельный демо-синк)');
  if (c1 < 10) missingFields.push('Недостаточно подробно описаны целевые пользователи решения');

  // Suggestions for quick boosts
  const suggestions = [];
  if (c3 < 15) {
    suggestions.push({
      id: 'add_data_schema',
      text: 'Добавить спецификацию датасета (CSV/REST API, 50k строк, анонимизированные логи)',
      field: 'dataProvided',
      pointsAdd: 8,
      sampleValue: (task.dataProvided ? task.dataProvided + '\n' : '') + '• Формат: CSV + REST API Sandbox\n• Объём: 50 000 обезличенных записей за 3 месяца\n• Схема: id, timestamp, category_id, user_hash, feature_vector, target_event'
    });
  }
  if (c5 < 15) {
    suggestions.push({
      id: 'add_kpi_metrics',
      text: 'Задать конкретные числовые KPI (F1-score > 0.82, время инференса < 150 мс)',
      field: 'successCriteria',
      pointsAdd: 7,
      sampleValue: (task.successCriteria ? task.successCriteria + '\n' : '') + '• Качество: ROC-AUC > 0.84 или F1-score > 0.80 на отложенной выборке\n• Производительность: среднее время ответа микросервиса < 200 мс\n• Код: unit-тесты с покрытием > 70% и Dockerfile'
    });
  }
  if (c6 < 15) {
    suggestions.push({
      id: 'add_mentor_schedule',
      text: 'Зафиксировать график менторства (еженедельный 30-мин синк по вторникам)',
      field: 'interactionFormat',
      pointsAdd: 6,
      sampleValue: (task.interactionFormat ? task.interactionFormat + '\n' : '') + '• Еженедельный 45-минутный синк по вторникам в 17:00 (Google Meet)\n• Закрытый Telegram-чат с техлидом для оперативных вопросов\n• Финальное очное/онлайн демо перед продуктовой командой'
    });
  }
  if (c4 < 15) {
    suggestions.push({
      id: 'add_tech_stack',
      text: 'Уточнить рекомендованный стек и ограничения развёртывания',
      field: 'constraints',
      pointsAdd: 5,
      sampleValue: (task.constraints ? task.constraints + '\n' : '') + '• Стек: Python 3.11+, FastAPI / PyTorch / LightGBM\n• Запуск: готовый docker-compose up без платных облачных сервисов\n• Лицензии: только permissive open-source (MIT / Apache 2.0)'
    });
  }

  return {
    totalScore,
    readinessLevel,
    readinessLabel,
    criteria,
    missingFields,
    suggestions: suggestions.slice(0, 3)
  };
}
