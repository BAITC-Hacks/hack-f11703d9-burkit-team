from __future__ import annotations

import os
import unittest
from pathlib import Path
from uuid import uuid4
from unittest.mock import patch

from backend.database import connect, initialize_database


class DatabaseSeedTests(unittest.TestCase):
    def setUp(self) -> None:
        self.database_path = (
            Path(__file__).resolve().parents[1]
            / "backend"
            / "data"
            / f"test-seed-{uuid4().hex}.db"
        )
        self.environment = patch.dict(
            os.environ,
            {"DATABASE_PATH": str(self.database_path)},
        )
        self.environment.start()

    def tearDown(self) -> None:
        self.environment.stop()
        self.database_path.unlink(missing_ok=True)

    def test_first_launch_populates_empty_database(self) -> None:
        initialize_database()

        connection = connect()
        try:
            counts = {
                table: connection.execute(
                    f"SELECT COUNT(*) FROM {table}"
                ).fetchone()[0]
                for table in ("tasks", "teams", "proposals")
            }
            task = connection.execute(
                """
                SELECT readiness_score, readiness_level
                FROM tasks
                WHERE id = 101
                """
            ).fetchone()
        finally:
            connection.close()

        self.assertEqual(
            counts,
            {"tasks": 10, "teams": 5, "proposals": 5},
        )
        self.assertEqual(task["readiness_score"], 100)
        self.assertEqual(task["readiness_level"], "Приоритетная")

    def test_repeated_launch_does_not_duplicate_data(self) -> None:
        initialize_database()
        initialize_database()

        connection = connect()
        try:
            counts = tuple(
                connection.execute(
                    f"SELECT COUNT(*) FROM {table}"
                ).fetchone()[0]
                for table in ("tasks", "teams", "proposals")
            )
        finally:
            connection.close()

        self.assertEqual(counts, (10, 5, 5))

    def test_existing_data_prevents_partial_seed(self) -> None:
        initialize_database()
        connection = connect()
        try:
            with connection:
                connection.execute("DELETE FROM proposals")
                connection.execute("DELETE FROM teams")
                connection.execute("DELETE FROM tasks")
                connection.execute(
                    """
                    INSERT INTO tasks (author_name, description)
                    VALUES ('Тестовый автор', 'Существующая задача')
                    """
                )
        finally:
            connection.close()

        initialize_database()

        connection = connect()
        try:
            counts = tuple(
                connection.execute(
                    f"SELECT COUNT(*) FROM {table}"
                ).fetchone()[0]
                for table in ("tasks", "teams", "proposals")
            )
        finally:
            connection.close()

        self.assertEqual(counts, (1, 0, 0))


if __name__ == "__main__":
    unittest.main()
