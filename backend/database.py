from __future__ import annotations

import json
import os
import sqlite3
from pathlib import Path
from typing import Any, Iterable

from backend.seed_data import SEED_DATA
from backend.services.rating import calculate_task_rating


BACKEND_DIR = Path(__file__).resolve().parent
DEFAULT_DATABASE_PATH = BACKEND_DIR / "data" / "app.db"
SCHEMA_PATH = BACKEND_DIR / "schema.sql"


def database_path() -> Path:
    """Возвращает путь к рабочей базе или к базе, указанной в окружении."""
    configured = os.getenv("DATABASE_PATH")
    return Path(configured) if configured else DEFAULT_DATABASE_PATH


def connect() -> sqlite3.Connection:
    """Открывает соединение с включёнными внешними ключами."""
    url = os.getenv("TURSO_DATABASE_URL")
    if url:
        from backend.cloud_database import CloudConnection

        token = os.getenv("TURSO_AUTH_TOKEN")
        if not token:
            raise sqlite3.OperationalError("Не задан TURSO_AUTH_TOKEN.")
        return CloudConnection(url, token)
    if os.getenv("VERCEL"):
        raise sqlite3.OperationalError("Для Vercel настройте облачную базу Turso.")
    path = database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize_database() -> None:
    """Создаёт таблицы и один раз заполняет полностью пустую базу."""
    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    connection = connect()
    try:
        with connection:
            connection.executescript(schema)
            migrate_existing_database(connection)
            seed_database(connection)
    finally:
        connection.close()


def migrate_existing_database(connection: sqlite3.Connection) -> None:
    """Добавляет новые поля в локальную базу из предыдущей версии."""
    task_columns = {
        row["name"]
        for row in connection.execute("PRAGMA table_info(tasks)")
    }
    if "readiness_level" not in task_columns:
        connection.execute(
            """
            ALTER TABLE tasks
            ADD COLUMN readiness_level TEXT NOT NULL DEFAULT 'Черновик'
            """
        )

    proposal_columns = {
        row["name"]
        for row in connection.execute("PRAGMA table_info(proposals)")
    }
    if "team_id" not in proposal_columns:
        connection.execute(
            "ALTER TABLE proposals ADD COLUMN team_id INTEGER"
        )


def seed_database(connection: sqlite3.Connection) -> bool:
    """Заполняет базу атомарно, только если все целевые таблицы пусты."""
    tables = ("tasks", "teams", "proposals")
    if any(
        connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        for table in tables
    ):
        return False

    for task in SEED_DATA["tasks"]:
        rating = calculate_task_rating(task)
        connection.execute(
            """
            INSERT INTO tasks (
                id, author_name, language, description, title, context,
                need, users, data_description, constraints,
                expected_result, success_criteria, contact,
                interaction_format, status, readiness_score,
                readiness_level, published_at
            ) VALUES (
                :id, :author_name, :language, :description, :title, :context,
                :need, :users, :data_description, :constraints,
                :expected_result, :success_criteria, :contact,
                :interaction_format, :status, :readiness_score,
                :readiness_level,
                CASE WHEN :status = 'open' THEN CURRENT_TIMESTAMP ELSE NULL END
            )
            """,
            {
                **task,
                "readiness_score": rating["score"],
                "readiness_level": rating["readiness_level"],
            },
        )

    for team in SEED_DATA["teams"]:
        connection.execute(
            """
            INSERT INTO teams (id, name, interests, skills, technology)
            VALUES (:id, :name, :interests, :skills, :technology)
            """,
            {
                **team,
                "interests": json.dumps(
                    team["interests"],
                    ensure_ascii=False,
                ),
                "skills": json.dumps(team["skills"], ensure_ascii=False),
            },
        )

    connection.executemany(
        """
        INSERT INTO proposals (
            id, task_id, team_id, team_name, idea, plan,
            deadline, prototype_url, status
        ) VALUES (
            :id, :task_id, :team_id, :team_name, :idea, :plan,
            :deadline, :prototype_url, :status
        )
        """,
        SEED_DATA["proposals"],
    )
    return True


def fetch_one(query: str, parameters: Iterable[Any] = ()) -> dict[str, Any] | None:
    with connect() as connection:
        row = connection.execute(query, tuple(parameters)).fetchone()
    return dict(row) if row else None


def fetch_all(query: str, parameters: Iterable[Any] = ()) -> list[dict[str, Any]]:
    with connect() as connection:
        rows = connection.execute(query, tuple(parameters)).fetchall()
    return [dict(row) for row in rows]
