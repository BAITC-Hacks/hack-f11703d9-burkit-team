# Объединение веток Burkit

Общая ветка: `codex/mvp-integration`. База — актуальный `origin/main`.

## Что вошло

| Ветка | Результат |
| --- | --- |
| `codex/backend-fastapi-sqlite-scaffold` | Уже была в main: FastAPI, схема SQLite, задачи и отклики. |
| `codex/integrate-task-rating` | Уже была в истории main через подключение AI. |
| `codex/connect-openai-question-generation` | Уже была в main: структурированные вопросы, mock/OpenAI, ошибки. |
| `codex/initialize-sqlite-seed-data` | Уже была в main: инициализация данных без перезаписи существующих записей. |
| `codex/configure-vercel-deployment` | Объединена: Vercel, Turso, настройки сборки. |
| `Design-v2` | Объединена: обновлённые экраны, этапы выполнения и прогресс команды. |
| `TeamLead` | Объединена: актуальные исходные данные и общая Python-формула рейтинга. |

Конфликт README разрешён общей документацией. История всех веток сохранена.

## Что исправлено при объединении

- Backend использует `rating.py` TeamLead через адаптер имён полей.
- `backend/seed_data.py` приводит исходный `SEED_DATA` TeamLead к схеме БД.
- `target_users` преобразуется в `users`, `deadline` задачи — в `constraints`,
  `tech` команды — в `technology`, `applications` — в `proposals`.
- «Выбрана», «На рассмотрении», «Отклонена» преобразуются в
  `selected`, `pending`, `rejected` соответственно.
- Заданные в исходных данных баллы игнорируются: например, задача 103
  получает 85 по формуле, хотя в исходном словаре записано 60.
- Поле `contact` не выдумывается, если его нет в исходной карточке.
- Соединение с локальной SQLite закрывается после каждой транзакции.

В новой пустой базе 10 задач: 7 черновиков и 3 открытые задачи,
а также 5 команд и 5 откликов. У существующей базы набор записей сохраняется;
слияние веток не заменяет уже загруженные данные Turso.

## Оставшиеся нестыковки

| Проблема | Где | Необходимое действие |
| --- | --- | --- |
| Задачи и отклики хранятся в React, изменения теряются после обновления | `src/App.tsx` | Подключить загрузку и сохранение через API. |
| Вопросы фиксированные, создание не вызывает FastAPI | `src/components/CreateTaskScreen.tsx` | Создавать черновик, запрашивать вопросы, сохранять ответы по полю `field`. |
| Frontend начисляет баллы по длине и ключевым словам; backend — по заполненности | `src/utils/ratingCalculator.ts`, `rating.py` | Отображать рейтинг backend и адаптировать его к панели миссий. Пороги уровней уже одинаковые. |
| Названия и типы полей не совпадают | `src/types/index.ts`, API | Добавить единый frontend-адаптер вместо разрозненных преобразований. |
| Этапы, доказательства результата, XP и профиль команды существуют только в UI | `src/App.tsx`, экраны прогресса и профиля | Отдельно реализовать серверные сущности либо исключить эти действия из рабочего сценария. |
| Переключатель ролей не является авторизацией | Frontend и backend | Нельзя считать его проверкой владельца задачи. |

### Основные соответствия для frontend-адаптера

| Frontend | API |
| --- | --- |
| `id: string` | `id: integer` |
| `targetUsers` | `users` |
| `dataProvided` | `data_description` |
| `expectedResult` | `expected_result` |
| `successCriteria` | `success_criteria` |
| `interactionFormat` | `interaction_format` |
| `published: boolean` | `status: draft/open/closed` — boolean не различает черновик и закрытую задачу |
| `sprintPlan` отклика | `plan` |
| `timeline` отклика | `deadline` |
| `prototypeUrl` | `prototype_url` |
| `accepted` | `selected` |
| `new` / `pending` | `pending` |

## Проверка

`npm run lint` и `npm run build` проверяют TypeScript и production-сборку.
`python -m unittest discover -s tests -v` проверяет AI-модуль, сидирование,
адаптер облачной базы и интеграцию TeamLead с API.

`tests/test_mvp_integration.py` проверяет создание → вопросы mock →
редактирование и рейтинг → публикацию → отклик → выбор → закрытие,
а также запрет откликов на закрытую задачу. Используется отдельная локальная БД.
Это проверка API; сквозной браузерный сценарий ещё не подключён.

## Перенос в main

В GitHub Desktop опубликовать `codex/mvp-integration`, создать PR с base `main`
и проверить общий diff. Обновить production после слияния и проверки интеграции.
Существующий production-деплой не обновляется самим локальным merge.
