# Burkit — AI Sana

Веб-сервис для создания, уточнения и публикации бизнес-задач, а также сбора откликов студенческих команд.

Проект состоит из:

- frontend на React;
- backend на FastAPI;
- базы данных SQLite;
- AI-модуля для генерации уточняющих вопросов.

## Запуск frontend

Требуется Node.js.

```powershell
npm install
npm run dev
```

## Запуск backend

Требуется Python.

```powershell
.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

После запуска backend доступны:

- API: <http://127.0.0.1:8000>
- Swagger: <http://127.0.0.1:8000/docs>
- проверка состояния: <http://127.0.0.1:8000/api/health>

База SQLite создаётся автоматически в `backend/data/app.db`.

## Основной сценарий API

1. `POST /api/tasks` — создать черновик.
2. `POST /api/tasks/{id}/questions` — получить уточняющие вопросы.
3. `PATCH /api/tasks/{id}` — изменить карточку.
4. `POST /api/tasks/{id}/publish` — опубликовать задачу.
5. `GET /api/tasks?status=open` — получить каталог.
6. `POST /api/tasks/{id}/proposals` — отправить отклик.
7. `GET /api/tasks/{id}/proposals` — получить отклики.
8. `PATCH /api/proposals/{id}/decision` — выбрать или отклонить отклик.
9. `POST /api/tasks/{id}/close` — закрыть задачу.

## AI-режим

Сейчас backend использует режим `mock` и возвращает тестовые уточняющие вопросы. Подключение реального AI API выполняется отдельно.

API-ключ должен храниться только на backend и не должен попадать во frontend или Git.