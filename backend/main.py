from __future__ import annotations

import sqlite3
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.database import connect, fetch_all, fetch_one, initialize_database
from backend.schemas import (
    ErrorResponse,
    HealthResponse,
    ProposalCreate,
    ProposalDecision,
    ProposalResponse,
    QuestionsResponse,
    RootResponse,
    TaskCreate,
    TaskDetailResponse,
    TaskResponse,
    TaskStatus,
    TaskUpdate,
    ValidationErrorResponse,
)
from backend.services.ai_service import (
    AIResponseError,
    AIUnavailableError,
    generate_questions,
    get_ai_runtime_info,
)
from backend.services.rating import calculate_task_rating


COMMON_RESPONSES = {
    404: {"model": ErrorResponse, "description": "Ресурс не найден"},
    409: {"model": ErrorResponse, "description": "Действие невозможно в текущем статусе"},
    422: {"model": ValidationErrorResponse, "description": "Некорректные данные запроса"},
}


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="Burkit API",
    description=(
        "Контракт backend для создания и публикации бизнес-задач, "
        "AI-уточнений, рейтинга готовности и откликов команд."
    ),
    version="1.0.0",
    lifespan=lifespan,
    openapi_tags=[
        {"name": "Сервис", "description": "Проверка доступности backend и базы данных."},
        {"name": "Задачи", "description": "Карточка задачи и её жизненный цикл."},
        {"name": "AI", "description": "Структурированные уточняющие вопросы к задаче."},
        {"name": "Отклики", "description": "Отклики команд и решение автора задачи."},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


VALIDATION_MESSAGES = {
    "missing": "Обязательное поле не заполнено.",
    "string_type": "Ожидается строка.",
    "string_too_short": "Поле не может быть пустым.",
    "string_too_long": "Значение поля слишком длинное.",
    "literal_error": "Передано недопустимое значение.",
    "extra_forbidden": "Неизвестное поле.",
    "url_parsing": "Укажите корректную ссылку http:// или https://.",
    "int_parsing": "Ожидается целое число.",
}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Any, error: RequestValidationError) -> JSONResponse:
    errors = []
    for item in error.errors():
        location = [
            str(part)
            for part in item.get("loc", ())
            if part not in {"body", "query", "path"}
        ]
        errors.append(
            {
                "field": ".".join(location) or "request",
                "message": VALIDATION_MESSAGES.get(
                    item.get("type"),
                    "Некорректное значение.",
                ),
            }
        )

    return JSONResponse(
        status_code=422,
        content={"detail": "Проверьте данные запроса.", "errors": errors},
    )


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


def calculate_and_save_rating(task_id: int) -> dict[str, Any]:
    task = task_or_404(task_id)
    rating = calculate_task_rating(task)
    with connect() as connection:
        connection.execute(
            """
            UPDATE tasks
            SET readiness_score = ?, readiness_level = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (rating["score"], rating["readiness_level"], task_id),
        )
    return rating


def task_with_rating(task_id: int) -> dict[str, Any]:
    rating = calculate_and_save_rating(task_id)
    task = task_or_404(task_id)
    task["rating"] = rating
    return task


@app.get("/", tags=["Сервис"], response_model=RootResponse)
def root() -> dict[str, str]:
    return {"service": "Burkit API", "docs": "/docs", "health": "/api/health"}


@app.get(
    "/api/health",
    tags=["Сервис"],
    response_model=HealthResponse,
    responses={503: {"model": ErrorResponse, "description": "База данных недоступна"}},
)
def health() -> dict[str, Any]:
    try:
        with connect() as connection:
            connection.execute("SELECT 1")
    except sqlite3.Error as error:
        raise HTTPException(status_code=503, detail="База данных недоступна.") from error
    ai = get_ai_runtime_info()
    return {
        "status": "ok",
        "database": "ok",
        "ai_mode": ai["mode"],
        "ai_ready": ai["ready"],
        "ai_model": ai["model"],
    }


@app.post(
    "/api/tasks",
    status_code=status.HTTP_201_CREATED,
    tags=["Задачи"],
    summary="Создать черновик задачи",
    response_model=TaskDetailResponse,
    responses=COMMON_RESPONSES,
)
def create_task(payload: TaskCreate) -> dict[str, Any]:
    with connect() as connection:
        cursor = connection.execute(
            "INSERT INTO tasks (author_name, language, description) VALUES (?, ?, ?)",
            (payload.author_name, payload.language, payload.description),
        )
        task_id = cursor.lastrowid
    return task_with_rating(task_id)


@app.get(
    "/api/tasks",
    tags=["Задачи"],
    summary="Получить каталог задач",
    response_model=list[TaskResponse],
    responses={422: COMMON_RESPONSES[422]},
)
def list_tasks(
    task_status: TaskStatus | None = Query(default=None, alias="status"),
) -> list[dict[str, Any]]:
    if task_status is None:
        return fetch_all("SELECT * FROM tasks ORDER BY readiness_score DESC, created_at DESC")
    return fetch_all(
        """
        SELECT * FROM tasks
        WHERE status = ?
        ORDER BY readiness_score DESC, published_at DESC, created_at DESC
        """,
        (task_status,),
    )


@app.get(
    "/api/tasks/{task_id}",
    tags=["Задачи"],
    summary="Получить задачу",
    response_model=TaskDetailResponse,
    responses=COMMON_RESPONSES,
)
def get_task(task_id: int) -> dict[str, Any]:
    return task_with_rating(task_id)


@app.patch(
    "/api/tasks/{task_id}",
    tags=["Задачи"],
    summary="Изменить карточку и пересчитать рейтинг",
    response_model=TaskDetailResponse,
    responses=COMMON_RESPONSES,
)
def update_task(task_id: int, payload: TaskUpdate) -> dict[str, Any]:
    task = task_or_404(task_id)
    if task["status"] == "closed":
        raise HTTPException(status_code=409, detail="Закрытую задачу нельзя редактировать.")

    changes = payload.model_dump(exclude_unset=True, mode="json")
    if not changes:
        raise HTTPException(status_code=422, detail="Нет полей для изменения.")

    for field, label in (
        ("author_name", "Автор"),
        ("description", "Описание"),
        ("language", "Язык"),
    ):
        if field in changes and changes[field] is None:
            raise HTTPException(status_code=422, detail=f"Поле «{label}» нельзя очистить.")

    assignments = ", ".join(f"{field} = ?" for field in changes)
    with connect() as connection:
        connection.execute(
            f"UPDATE tasks SET {assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (*changes.values(), task_id),
        )
    return task_with_rating(task_id)


@app.post(
    "/api/tasks/{task_id}/questions",
    tags=["AI"],
    summary="Сгенерировать уточняющие вопросы",
    response_model=QuestionsResponse,
    responses={
        **COMMON_RESPONSES,
        502: {"model": ErrorResponse, "description": "AI вернул некорректный ответ"},
        503: {"model": ErrorResponse, "description": "AI временно недоступен"},
    },
)
def get_questions(task_id: int) -> dict[str, Any]:
    task = task_or_404(task_id)
    if task["status"] == "closed":
        raise HTTPException(status_code=409, detail="Закрытую задачу нельзя уточнять.")
    try:
        return generate_questions(task)
    except AIResponseError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    except AIUnavailableError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@app.post(
    "/api/tasks/{task_id}/publish",
    tags=["Задачи"],
    summary="Опубликовать черновик",
    response_model=TaskDetailResponse,
    responses=COMMON_RESPONSES,
)
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
            """
            UPDATE tasks
            SET status = 'open', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (task_id,),
        )
    return task_with_rating(task_id)


@app.post(
    "/api/tasks/{task_id}/close",
    tags=["Задачи"],
    summary="Закрыть опубликованную задачу",
    response_model=TaskDetailResponse,
    responses=COMMON_RESPONSES,
)
def close_task(task_id: int) -> dict[str, Any]:
    task = task_or_404(task_id)
    if task["status"] != "open":
        raise HTTPException(status_code=409, detail="Закрыть можно только открытую задачу.")

    with connect() as connection:
        connection.execute(
            """
            UPDATE tasks
            SET status = 'closed', closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (task_id,),
        )
    return task_with_rating(task_id)


@app.post(
    "/api/tasks/{task_id}/proposals",
    status_code=status.HTTP_201_CREATED,
    tags=["Отклики"],
    summary="Отправить отклик на открытую задачу",
    response_model=ProposalResponse,
    responses=COMMON_RESPONSES,
)
def create_proposal(task_id: int, payload: ProposalCreate) -> dict[str, Any]:
    task = task_or_404(task_id)
    if task["status"] != "open":
        raise HTTPException(status_code=409, detail="Отклики принимаются только на открытые задачи.")

    values = payload.model_dump(mode="json")
    with connect() as connection:
        cursor = connection.execute(
            """
            INSERT INTO proposals (task_id, team_name, idea, plan, deadline, prototype_url)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                task_id,
                values["team_name"],
                values["idea"],
                values["plan"],
                values["deadline"],
                values["prototype_url"],
            ),
        )
        proposal_id = cursor.lastrowid
    return proposal_or_404(proposal_id)


@app.get(
    "/api/tasks/{task_id}/proposals",
    tags=["Отклики"],
    summary="Получить отклики на задачу",
    response_model=list[ProposalResponse],
    responses=COMMON_RESPONSES,
)
def list_proposals(task_id: int) -> list[dict[str, Any]]:
    task_or_404(task_id)
    return fetch_all(
        "SELECT * FROM proposals WHERE task_id = ? ORDER BY created_at DESC",
        (task_id,),
    )


@app.patch(
    "/api/proposals/{proposal_id}/decision",
    tags=["Отклики"],
    summary="Выбрать или отклонить отклик",
    response_model=ProposalResponse,
    responses=COMMON_RESPONSES,
)
def decide_proposal(proposal_id: int, payload: ProposalDecision) -> dict[str, Any]:
    proposal = proposal_or_404(proposal_id)
    task = task_or_404(proposal["task_id"])
    if task["status"] != "open":
        raise HTTPException(status_code=409, detail="Решение можно принять только по открытой задаче.")
    if proposal["status"] != "pending":
        raise HTTPException(status_code=409, detail="Решение по этому отклику уже принято.")

    with connect() as connection:
        connection.execute(
            "UPDATE proposals SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (payload.status, proposal_id),
        )
    return proposal_or_404(proposal_id)
