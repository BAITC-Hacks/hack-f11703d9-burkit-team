from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Any, Iterable


BACKEND_DIR = Path(__file__).resolve().parent
DEFAULT_DATABASE_PATH = BACKEND_DIR / "data" / "app.db"
SCHEMA_PATH = BACKEND_DIR / "schema.sql"


def database_path() -> Path:
    """Возвращает путь к рабочей базе или к базе, указанной в окружении."""
    configured = os.getenv("DATABASE_PATH")
    return Path(configured) if configured else DEFAULT_DATABASE_PATH


def connect() -> sqlite3.Connection:
    """Открывает соединение с включёнными внешними ключами."""
    path = database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize_database() -> None:
    """Создаёт таблицы при первом запуске."""
    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    with connect() as connection:
        connection.executescript(schema)


def fetch_one(query: str, parameters: Iterable[Any] = ()) -> dict[str, Any] | None:
    with connect() as connection:
        row = connection.execute(query, tuple(parameters)).fetchone()
    return dict(row) if row else None


def fetch_all(query: str, parameters: Iterable[Any] = ()) -> list[dict[str, Any]]:
    with connect() as connection:
        rows = connection.execute(query, tuple(parameters)).fetchall()
    return [dict(row) for row in rows]

