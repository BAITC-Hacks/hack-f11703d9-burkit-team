# Burkit — AI Sana

Веб-сервис для создания, уточнения и публикации бизнес-задач, а также сбора откликов студенческих команд.

Проект состоит из:

- frontend на React;
- backend на FastAPI;
- базы данных SQLite;
- OpenAI-модуля для генерации уточняющих вопросов.

Состав объединённых веток, соответствия полей и оставшиеся нестыковки:
[состояние интеграции MVP](docs/MVP_INTEGRATION.md).

## Запуск frontend

Требуется Node.js.

```powershell
npm install
npm run dev
```

## Запуск backend

Требуется Python.

При первом запуске создайте виртуальное окружение:

```powershell
py -m venv .venv
```

Активируйте окружение, установите зависимости и запустите сервер:

```powershell
.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

После запуска backend доступны:

- API: <http://127.0.0.1:8000>
- Swagger: <http://127.0.0.1:8000/docs>
- проверка состояния: <http://127.0.0.1:8000/api/health>

База SQLite создаётся автоматически в `backend/data/app.db`. При первом
запуске полностью пустая база заполняется 10 задачами, 5 командами и 5
откликами из `backend/seed_data.py`. Повторный запуск не дублирует и не
перезаписывает данные.

## AI-режим

По умолчанию используется тестовый режим:

```powershell
$env:AI_MODE = "mock"
```

Для вызова OpenAI:

```powershell
$env:AI_MODE = "openai"
$env:OPENAI_API_KEY = "ваш-ключ"
$env:OPENAI_MODEL = "gpt-6-luna"

uvicorn backend.main:app --reload
```

Ключ хранится только в переменных окружения и не добавляется в Git.

## Основной API

- `POST /api/tasks` — создать черновик;
- `POST /api/tasks/{id}/questions` — получить уточняющие вопросы;
- `PATCH /api/tasks/{id}` — изменить карточку и пересчитать рейтинг;
- `POST /api/tasks/{id}/publish` — опубликовать задачу;
- `GET /api/tasks?status=open` — получить каталог;
- `POST /api/tasks/{id}/proposals` — отправить отклик;
- `GET /api/tasks/{id}/proposals` — получить отклики;
- `PATCH /api/proposals/{id}/decision` — выбрать или отклонить отклик;
- `POST /api/tasks/{id}/close` — закрыть задачу.

## Проверка backend

```powershell
python -m unittest discover -s tests -v
```

## Модули TeamLead

`rating.py` содержит формулу рейтинга: контекст — 10, потребность — 10,
данные — 20, ожидаемый результат — 15, критерии успеха — 15,
ограничения и сроки — 10, пользователи — 10, взаимодействие — 10 баллов.
Уровни: 0–39 — «Черновик», 40–69 — «Рабочая», 70–89 — «Готовая»,
90–100 — «Приоритетная». Рейтинг оценивает заполненность полей.

`seed_data.py` содержит исходные данные TeamLead: 5 черновиков, 5 карточек,
5 команд и 5 откликов. Backend адаптирует названия полей и статусы через
`backend/seed_data.py`, а рейтинг — через `backend/services/rating.py`.
Готовые баллы из исходных данных не используются: они пересчитываются.

## Публикация в Vercel

Проект публикуется из корня репозитория: Vite собирает frontend в `dist`,
а `api/index.py` запускает FastAPI. Конфигурация находится в `vercel.json`.
Загрузка исходников через Vercel Drop не заменяет сборку проекта.

Для production подключите Turso в разделе Storage проекта. Интеграция
должна добавить серверные переменные `TURSO_DATABASE_URL` и `TURSO_AUTH_TOKEN`.
При наличии этих переменных backend обращается к облачной SQLite; локально
без них используется `backend/data/app.db`. На Vercel запуск без облачной
базы завершается ошибкой, чтобы записи не терялись во временном файле.

Для публикации в существующий проект:

```powershell
npx vercel link --project hack-f11703d9-burkit-team --scope burkit
npx vercel deploy --prod --scope burkit
```

После публикации проверьте `/`, `/api/health`, `/api/tasks` и `/docs`.
Для реального AI задайте в Vercel `AI_MODE=openai`, `OPENAI_API_KEY`
и доступную вашему аккаунту модель `OPENAI_MODEL`, затем выполните новый деплой.
Без настройки AI используется явно обозначенный режим `mock`.

Текущие экраны frontend используют локальные моки. Публикация frontend и API
сама по себе не подключает формы к базе: интеграция экранов с API — отдельная
задача. У backend пока нет авторизации и проверки владельца задачи.
