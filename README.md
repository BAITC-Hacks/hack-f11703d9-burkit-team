# Burkit — AI Sana

Веб-сервис для создания, уточнения и публикации бизнес-задач, а также сбора откликов студенческих команд.

Проект состоит из:

- frontend на React;
- backend на FastAPI;
- базы данных SQLite;
- OpenAI-модуля для генерации уточняющих вопросов.

## Запуск frontend

Требуется Node.js.

```powershell
npm install
npm run dev
```

## Запуск backend

Требуется Python.

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

После запуска доступны:

- API: <http://127.0.0.1:8000>
- Swagger: <http://127.0.0.1:8000/docs>
- проверка состояния: <http://127.0.0.1:8000/api/health>

SQLite создаётся автоматически в `backend/data/app.db`.

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