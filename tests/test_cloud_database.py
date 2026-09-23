"""Проверка адаптера и SQL-сценариев с локальным DB-API соединением."""

import unittest
import sqlite3
from pathlib import Path
from uuid import uuid4
from unittest.mock import patch

from backend.cloud_database import CloudConnection
from backend.database import initialize_database, fetch_all


class CloudDatabaseTests(unittest.TestCase):
    def setUp(self):
        self.path = Path('backend/data') / f'test-cloud-{uuid4().hex}.db'
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.driver_patch = patch(
            'backend.cloud_database.turso_serverless.connect',
            side_effect=lambda *args, **kwargs: sqlite3.connect(self.path),
        )
        self.driver_patch.start()
        self.connection = lambda: CloudConnection('libsql://test.turso.io', 'test')

    def tearDown(self):
        self.driver_patch.stop()
        self.path.unlink(missing_ok=True)

    def test_seed_read_and_repeat(self):
        with patch('backend.database.connect', self.connection):
            initialize_database()
            initialize_database()
            tasks = fetch_all('SELECT * FROM tasks')
            self.assertEqual(len(tasks), 10)
            self.assertEqual(len(fetch_all('SELECT * FROM proposals')), 5)
            with self.connection() as connection:
                cursor = connection.execute(
                    'INSERT INTO tasks (author_name, description) VALUES (?, ?)',
                    ('Автор', 'Описание'),
                )
                task_id = cursor.lastrowid
            self.assertIsInstance(task_id, int)
            self.assertEqual(fetch_all('SELECT * FROM tasks WHERE id = ?', (task_id,))[0]['description'], 'Описание')

    def test_failed_transaction_rolls_back(self):
        with patch('backend.database.connect', self.connection):
            initialize_database()
            with self.assertRaises(ValueError):
                with self.connection() as connection:
                    connection.execute('DELETE FROM proposals')
                    raise ValueError('Проверка отката')
            self.assertEqual(len(fetch_all('SELECT * FROM proposals')), 5)
