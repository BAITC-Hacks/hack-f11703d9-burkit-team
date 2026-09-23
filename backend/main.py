from __future__ import annotations

import sqlite3
from contextlib import asynccontextmanager
from typing import Any

from fastapi import Body, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from backend.database import connect, fetch_all, fetch_one, initialize_database
from backend.services.ai_service import AIUnavailableError, generate_questions


ALLOWED_LANGUAGES = {"kk", "ru", "en"}
TASK_STATUSES = {"draft", "open", "closed"}
EDITABLE_TASK_FIELDS = {
    "author_name",
    "language",
    "description",
    "title",
    "context",
    "need",
    "users",
    "data_description",
    "constraints",
    "expected_result",
    "success_criteria",
    "contact",
    "interaction_format",
}


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="Burkit API",
    description="Backend для бизнес-задач, уточняющих вопросов и откликов команд.",
    version="0.1.0",
    lifespan=lifespan,
)

# Для локальной разработки frontend может запускаться на другом порту.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def required_text(payload: dict[str, Any], field: str, label: str) -> str:
    value = payload.get(field)
    if not isinstance(value, str) or not value.strip():
        raise HTTPException(status_code=422, detail=f"Поле «{label}» обязательно.")
    return value.strip()


def task_or_404(task_id: int) -> dict[str, Any]:
    task = fetch_one("SELECT * FROM tasks WHERE id = ?", (task_id,))
    if task is None:
        raise HTTPException(status_code=404, detail="Задача не найдена.")
    return task


def proposal_or_404(proposal_id: int) -> dict[str, Any]:
    proposal = fetch_one("SELECT * FROM proposals WHERE id = ?", (proposal_id,))
    if proposal is None:
        raise HTTPException(status_code=404, detail="Отклик не найден.")
    return proposal


@app.get("/", tags=["Сервис"])
def root() -> dict[str, str]:
    return {"service": "Burkit API", "docs": "/docs", "health": "/api/health"}


@app.get("/api/health", tags=["Сервис"])
def health() -> dict[str, str]:
    try:
        with connect() as connection:
            connection.execute("SELECT 1")
    except sqlite3.Error as error:
        raise HTTPException(status_code=503, detail="База данных недоступна.") from error
    return {"status": "ok", "database": "ok"}


@app.post("/api/tasks", status_code=status.HTTP_201_CREATED, tags=["Задачи"])
def create_task(payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
    description = required_text(payload, "description", "Описание")
    author_name = required_text(payload, "author_name", "Автор")
    language = payload.get("language", "ru")
    if language not in ALLOWED_LANGUAGES:
        raise HTTPException(status_code=422, detail="Допустимые языки: kk, ru, en.")

    with connect() as connection:
        cursor = connection.execute(
            "INSERT INTO tasks (author_name, language, description) VALUES (?, ?, ?)",
            (author_name, language, description),
        )
        task_id = cursor.lastrowid
    return task_or_404(task_id)


@app.get("/api/tasks", tags=["Задачи"])
def list_tasks(
    task_status: str | None = Query(default=None, alias="status"),
) -> list[dict[str, Any]]:
    if task_status is not None and task_status not in TASK_STATUSES:
        raise HTTPException(status_code=422, detail="Неизвестный статус задачи.")
    if task_status is None:
        return fetch_all(
            "SELECT * FROM tasks ORDER BY readiness_score DESC, created_at DESC"
        )
    return fetch_all(
        "SELECT * FROM tasks WHERE status = ? "
        "ORDER BY readiness_score DESC, published_at DESC, created_at DESC",
        (task_status,),
    )


@app.get("/api/tasks/{task_id}", tags=["Задачи"])
def get_task(task_id: int) -> dict[str, Any]:
    return task_or_404(task_id)


@app.patch("/api/tasks/{task_id}", tags=["Задачи"])
def update_task(
    task_id: int, payload: dict[str, Any] = Body(...)
) -> dict[str, Any]:
    task_or_404(task_id)
    if not payload:
        raise HTTPException(status_code=422, detail="Нет полей для изменения.")

    unknown_fields = set(payload) - EDITABLE_TASK_FIELDS
    if unknown_fields:
        fields = ", ".join(sorted(unknown_fields))
        raise HTTPException(status_code=422, detail=f"Нельзя изменить поля: {fields}.")
    if "language" in payload and payload["language"] not in ALLOWED_LANGUAGES:
        raise HTTPException(status_code=422, detail="Допустимые языки: kk, ru, en.")
    if "description" in payload:
        payload["description"] = required_text(payload, "description", "Описание")
    if "author_name" in payload:
        payload["author_name"] = required_text(payload, "author_name", "Автор")

    assignments = ", ".join(f"{field} = ?" for field in payload)
    values = list(payload.values())
    with connect() as connection:
        connection.execute(
            f"UPDATE tasks SET {assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (*values, task_id),
        )
    return task_or_404(task_id)


@app.post("/api/tasks/{task_id}/questions", tags=["AI"])
def get_questions(task_id: int) -> dict[str, Any]:
    task = task_or_404(task_id)
    try:
        return generate_questions(task)
    except AIUnavailableError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@app.post("/api/tasks/{task_id}/publish", tags=["Задачи"])
def publish_task(task_id: int) -> dict[str, Any]:
    task = task_or_404(task_id)
    if task["status"] == "open":
        raise HTTPException(status_code=409, detail="Задача уже опубликована.")
    if task["status"] == "closed":
        raise HTTPException(status_code=409, detail="Закрытую задачу нельзя опубликовать повторно.")
    if not task["title"]:
        raise HTTPException(status_code=422, detail="Перед публикацией укажите название задачи.")

    with connect() as connection:
        connection.execute(
            "UPDATE tasks SET status = 'open', published_at = CURRENT_TIMESTAMP, "
            "updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (task_id,),
        )
    return task_or_404(task_id)


@app.post("/api/tasks/{task_id}/close", tags=["Задачи"])
def close_task(task_id: int) -> dict[str, Any]:
    task = task_or_404(task_id)
    if task["status"] != "open":
        raise HTTPException(status_code=409, detail="Закрыть можно только открытую задачу.")

    with connect() as connection:
        connection.execute(
            "UPDATE tasks SET status = 'closed', closed_at = CURRENT_TIMESTAMP, "
            "updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (task_id,),
        )
    return task_or_404(task_id)


@app.post(
    "/api/tasks/{task_id}/proposals",
    status_code=status.HTTP_201_CREATED,
    tags=["Отклики"],
)
def create_proposal(
    task_id: int, payload: dict[str, Any] = Body(...)
) -> dict[str, Any]:
    task = task_or_404(task_id)
    if task["status"] != "open":
        raise HTTPException(status_code=409, detail="Отклики принимаются только на открытые задачи.")

    team_name = required_text(payload, "team_name", "Название команды")
    idea = required_text(payload, "idea", "Идея решения")
    plan = required_text(payload, "plan", "План")
    deadline = required_text(payload, "deadline", "Срок")
    prototype_url = payload.get("prototype_url")
    if prototype_url is not None and not isinstance(prototype_url, str):
        raise HTTPException(status_code=422, detail="Ссылка на прототип должна быть строкой.")

    with connect() as connection:
        cursor = connection.execute(
            "INSERT INTO proposals "
            "(task_id, team_name, idea, plan, deadline, prototype_url) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (task_id, team_name, idea, plan, deadline, prototype_url),
        )
        proposal_id = cursor.lastrowid
    return proposal_or_404(proposal_id)


@app.get("/api/tasks/{task_id}/proposals", tags=["Отклики"])
def list_proposals(task_id: int) -> list[dict[str, Any]]:
    task_or_404(task_id)
    return fetch_all(
        "SELECT * FROM proposals WHERE task_id = ? ORDER BY created_at DESC",
        (task_id,),
    )


@app.patch("/api/proposals/{proposal_id}/decision", tags=["Отклики"])
def decide_proposal(
    proposal_id: int, payload: dict[str, Any] = Body(...)
) -> dict[str, Any]:
    proposal_or_404(proposal_id)
    decision = payload.get("status")
    if decision not in {"selected", "rejected"}:
        raise HTTPException(
            status_code=422,
            detail="Решение должно иметь значение selected или rejected.",
        )

    with connect() as connection:
        connection.execute(
            "UPDATE proposals SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (decision, proposal_id),
        )
    return proposal_or_404(proposal_id)
