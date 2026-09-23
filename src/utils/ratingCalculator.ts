import { RatingBreakdown, RatingCriteria, ReadinessLevel, Task, TaskMission } from '../types';

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

  // 1. Контекст и потребность (max 20)
  let c1 = 0;
  if (need.length > 15) c1 += 5;
  if (need.length > 60) c1 += 5;
  if (context.length > 20) c1 += 5;
  if (need.toLowerCase().includes('почему') || need.toLowerCase().includes('проблем') || need.toLowerCase().includes('сейчас') || need.toLowerCase().includes('боль') || need.length > 120) {
    c1 += 5;
  }
  c1 = Math.min(20, c1);

  // 2. Данные и материалы (max 20)
  let c2 = 0;
  if (data.length > 15) c2 += 5;
  if (data.toLowerCase().includes('csv') || data.toLowerCase().includes('api') || data.toLowerCase().includes('json') || data.toLowerCase().includes('баз') || data.toLowerCase().includes('датасет') || data.toLowerCase().includes('лог') || data.length > 60) {
    c2 += 7;
  }
  if (data.toLowerCase().includes('аноним') || data.toLowerCase().includes('пример') || data.toLowerCase().includes('схем') || data.toLowerCase().includes('доступ') || data.toLowerCase().includes('контур') || data.toLowerCase().includes('демо') || data.length > 110) {
    c2 += 8;
  }
  c2 = Math.min(20, c2);

  // 3. Ожидаемый результат (max 15)
  let c3 = 0;
  if (expected.length > 15) c3 += 5;
  if (expected.length > 60) c3 += 5;
  if (expected.toLowerCase().includes('прототип') || expected.toLowerCase().includes('сервис') || expected.toLowerCase().includes('результат') || expected.toLowerCase().includes('модель') || expected.toLowerCase().includes('демо')) {
    c3 += 5;
  }
  c3 = Math.min(15, c3);

  // 4. Критерии успеха (max 15)
  let c4 = 0;
  if (success.length > 15) c4 += 5;
  if (/\d+%|\d+\s*(мс|ms|сек|sec|руб|тг|тенге|кпи|kpi|f1|accuracy|точност)/i.test(success) || success.toLowerCase().includes('критерий') || success.toLowerCase().includes('метрик')) {
    c4 += 6;
  }
  if (success.length > 80) c4 += 4;
  c4 = Math.min(15, c4);

  // 5. Ограничения (max 10)
  let c5 = 0;
  if (constraints.length > 15) c5 += 5;
  if (constraints.toLowerCase().includes('стек') || constraints.toLowerCase().includes('python') || constraints.toLowerCase().includes('react') || constraints.toLowerCase().includes('docker') || constraints.length > 60) {
    c5 += 5;
  }
  c5 = Math.min(10, c5);

  // 6. Пользователи (max 10)
  let c6 = 0;
  if (users.length > 15) c6 += 5;
  if (users.length > 50 || users.toLowerCase().includes('клиент') || users.toLowerCase().includes('сотрудник') || users.toLowerCase().includes('менеджер') || users.toLowerCase().includes('пользовател')) {
    c6 += 5;
  }
  c6 = Math.min(10, c6);

  // 7. Связь с бизнесом (max 10)
  let c7 = 0;
  if (contact.length > 8) c7 += 5;
  if (interaction.length > 15 || interaction.toLowerCase().includes('синк') || interaction.toLowerCase().includes('встреч') || interaction.toLowerCase().includes('чат')) {
    c7 += 5;
  }
  c7 = Math.min(10, c7);

  const totalScore = Math.min(100, Math.max(0, c1 + c2 + c3 + c4 + c5 + c6 + c7));

  // 4 official levels:
  // 0–39 — Черновик
  // 40–69 — Рабочая
  // 70–89 — Готовая
  // 90–100 — Приоритетная
  let readinessLevel: ReadinessLevel = 'draft';
  let readinessLabel = 'Черновик';

  if (totalScore >= 90) {
    readinessLevel = 'priority';
    readinessLabel = 'Приоритетная';
  } else if (totalScore >= 70) {
    readinessLevel = 'ready';
    readinessLabel = 'Готовая';
  } else if (totalScore >= 40) {
    readinessLevel = 'working';
    readinessLabel = 'Рабочая';
  } else {
    readinessLevel = 'draft';
    readinessLabel = 'Черновик';
  }

  // 7 official criteria
  const criteria: RatingCriteria[] = [
    {
      id: 'need',
      name: 'Контекст и потребность',
      score: c1,
      maxScore: 20,
      description: 'Понятна ли суть проблемы и в чем состоит практическая потребность бизнеса',
      hint: c1 < 16 ? 'Опишите проблему так, как рассказали бы её коллеге' : 'Проблема и потребность бизнеса отлично сформулированы'
    },
    {
      id: 'data',
      name: 'Данные и материалы',
      score: c2,
      maxScore: 20,
      description: 'Указаны ли форматы данных, примеры или тестовый доступ для команды',
      hint: c2 < 16 ? 'Укажите, какие файлы, таблицы или примеры вы передадите студентам' : 'Материалы и данные описаны понятно и полно'
    },
    {
      id: 'expected',
      name: 'Ожидаемый результат',
      score: c3,
      maxScore: 15,
      description: 'Описано ли, что именно должна подготовить студенческая команда',
      hint: c3 < 12 ? 'Укажите понятный финал: веб-демо, прототип, алгоритм или аналитический отчёт' : 'Ожидаемый результат прозрачен'
    },
    {
      id: 'success',
      name: 'Критерии успеха',
      score: c4,
      maxScore: 15,
      description: 'Как бизнес поймёт, что задача решена качественно',
      hint: c4 < 12 ? 'Добавьте простые измеримые ориентиры (время, точность или процент улучшения)' : 'Критерии понятны и измеримы'
    },
    {
      id: 'constraints',
      name: 'Условия и ограничения',
      score: c5,
      maxScore: 10,
      description: 'Какие важные условия, требования или стек нужно учесть команде',
      hint: c5 < 8 ? 'Укажите важные технические или организационные рамки' : 'Ограничения реалистичны и прозрачны'
    },
    {
      id: 'users',
      name: 'Кто будет пользоваться',
      score: c6,
      maxScore: 10,
      description: 'Для кого создаётся решение (клиенты, операторы, менеджеры)',
      hint: c6 < 8 ? 'Расскажите, кто будет конечным пользователем' : 'Целевые пользователи определены'
    },
    {
      id: 'contact',
      name: 'Связь с бизнесом',
      score: c7,
      maxScore: 10,
      description: 'Контактное лицо и комфортный формат общения с командой',
      hint: c7 < 8 ? 'Укажите контакт и удобный ритм (например, синк раз в неделю)' : 'Контакт и формат связи зафиксированы'
    }
  ];

  // Helper for mission status
  const getMissionStatus = (score: number, max: number): 'not_started' | 'needs_clarification' | 'ready' | 'confirmed' => {
    if (score === 0) return 'not_started';
    const ratio = score / max;
    if (ratio < 0.65) return 'needs_clarification';
    if (ratio < 0.95) return 'ready';
    return 'confirmed';
  };

  const missions: TaskMission[] = [
    {
      id: 'm1',
      title: 'Объясните проблему',
      maxScore: 20,
      currentScore: c1,
      status: getMissionStatus(c1, 20),
      field: 'need',
      nextStepText: 'Опишите текущую проблему своими словами'
    },
    {
      id: 'm2',
      title: 'Добавьте данные и материалы',
      maxScore: 20,
      currentScore: c2,
      status: getMissionStatus(c2, 20),
      field: 'dataProvided',
      nextStepText: 'Укажите примеры файлов, таблиц или контур доступа'
    },
    {
      id: 'm3',
      title: 'Опишите ожидаемый результат',
      maxScore: 15,
      currentScore: c3,
      status: getMissionStatus(c3, 15),
      field: 'expectedResult',
      nextStepText: 'Уточните, что именно должна подготовить команда'
    },
    {
      id: 'm4',
      title: 'Задайте измеримые критерии',
      maxScore: 15,
      currentScore: c4,
      status: getMissionStatus(c4, 15),
      field: 'successCriteria',
      nextStepText: 'Добавьте 1-2 измеримых ориентира успешного решения'
    },
    {
      id: 'm5',
      title: 'Укажите ограничения',
      maxScore: 10,
      currentScore: c5,
      status: getMissionStatus(c5, 10),
      field: 'constraints',
      nextStepText: 'Назовите важные технические или организационные рамки'
    },
    {
      id: 'm6',
      title: 'Расскажите о пользователях',
      maxScore: 10,
      currentScore: c6,
      status: getMissionStatus(c6, 10),
      field: 'targetUsers',
      nextStepText: 'Укажите, кто будет работать с готовым решением'
    },
    {
      id: 'm7',
      title: 'Добавьте контакт и формат связи',
      maxScore: 10,
      currentScore: c7,
      status: getMissionStatus(c7, 10),
      field: 'contact',
      nextStepText: 'Оставьте контакт и выберите частоту общения'
    }
  ];

  // Well filled vs can improve
  const wellFilled: string[] = [];
  const canImprove: string[] = [];

  missions.forEach(m => {
    if (m.currentScore >= m.maxScore * 0.7) {
      wellFilled.push(`${m.title} (${m.currentScore}/${m.maxScore} б.)`);
    } else {
      canImprove.push(`${m.title} (сейчас ${m.currentScore}/${m.maxScore} б.)`);
    }
  });

  // Calculate Next Best Step (Requirement 8)
  let nextBestStep: RatingBreakdown['nextBestStep'] = undefined;
  if (totalScore >= 100) {
    nextBestStep = undefined;
  } else if (c2 < 16) {
    nextBestStep = {
      text: 'Добавьте описание доступных данных — до +20 баллов',
      field: 'dataProvided',
      pointsAdd: 20 - c2,
      sampleValue: (task.dataProvided ? task.dataProvided + '\n' : '') + '• Формат: CSV-таблица + тестовый REST API\n• Объём: 25 000 обезличенных записей за 3 месяца\n• Поля: id, timestamp, category, status, metric_value',
      buttonLabel: 'Добавить данные'
    };
  } else if (c4 < 12) {
    nextBestStep = {
      text: 'Задайте измеримые критерии успеха — до +15 баллов',
      field: 'successCriteria',
      pointsAdd: 15 - c4,
      sampleValue: (task.successCriteria ? task.successCriteria + '\n' : '') + '• Точность классификации / прогноза не менее 82%\n• Время ответа решения не более 300 мс\n• Понятная инструкция по запуску прототипа',
      buttonLabel: 'Задать критерии'
    };
  } else if (c3 < 12) {
    nextBestStep = {
      text: 'Опишите ожидаемый результат команды — до +15 баллов',
      field: 'expectedResult',
      pointsAdd: 15 - c3,
      sampleValue: (task.expectedResult ? task.expectedResult + '\n' : '') + '• Рабочий веб-прототип или микросервис\n• Исходный код с подробным описанием запуска\n• Короткая видеопрезентация работы решения',
      buttonLabel: 'Описать результат'
    };
  } else if (c1 < 16) {
    nextBestStep = {
      text: 'Уточните контекст и боль бизнеса — до +20 баллов',
      field: 'need',
      pointsAdd: 20 - c1,
      sampleValue: (task.need ? task.need + '\n' : '') + 'Сейчас процесс выполняется вручную, что приводит к задержкам и дополнительным издержкам. Автоматизация позволит снизить ошибки на 30%.',
      buttonLabel: 'Уточнить проблему'
    };
  } else if (c5 < 8) {
    nextBestStep = {
      text: 'Укажите ограничения и условия — до +10 баллов',
      field: 'constraints',
      pointsAdd: 10 - c5,
      sampleValue: (task.constraints ? task.constraints + '\n' : '') + '• Стек: свободный выбор современных open-source библиотек (Python/JS)\n• Запуск без платных облачных подписок',
      buttonLabel: 'Указать ограничения'
    };
  } else if (c6 < 8) {
    nextBestStep = {
      text: 'Расскажите о пользователях решения — до +10 баллов',
      field: 'targetUsers',
      pointsAdd: 10 - c6,
      sampleValue: (task.targetUsers ? task.targetUsers + '\n' : '') + 'Операторы контакт-центра, аналитики и внутренние менеджеры компании.',
      buttonLabel: 'Указать пользователей'
    };
  } else if (c7 < 8) {
    nextBestStep = {
      text: 'Добавьте контакт и формат общения — до +10 баллов',
      field: 'interactionFormat',
      pointsAdd: 10 - c7,
      sampleValue: (task.interactionFormat ? task.interactionFormat + '\n' : '') + '• Еженедельный созвон на 30 минут для ответов на вопросы\n• Чат в Telegram для быстрой координации',
      buttonLabel: 'Указать формат связи'
    };
  }

  // Suggestions for backwards compatibility
  const suggestions = [];
  if (nextBestStep) {
    suggestions.push({
      id: `sug_${nextBestStep.field}`,
      text: nextBestStep.text,
      field: nextBestStep.field,
      pointsAdd: nextBestStep.pointsAdd,
      sampleValue: nextBestStep.sampleValue
    });
  }

  const missingFields: string[] = [];
  if (c2 < 12) missingFields.push('Мало информации о данных и примерах для команды');
  if (c4 < 10) missingFields.push('Не хватает измеримых критериев успеха');
  if (c3 < 10) missingFields.push('Ожидаемый результат описан слишком кратко');
  if (c7 < 6) missingFields.push('Не указан контакт или регулярность общения');

  return {
    totalScore,
    readinessLevel,
    readinessLabel,
    criteria,
    missions,
    wellFilled,
    canImprove,
    nextBestStep,
    missingFields,
    suggestions
  };
}
