"""Проверка объединённых модулей TeamLead и API на отдельной SQLite."""

import os
import unittest
from pathlib import Path
from uuid import uuid4
from unittest.mock import patch

from fastapi.testclient import TestClient
from backend.main import app


class MVPIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.path = Path('backend/data') / f'test-integration-{uuid4().hex}.db'
        self.env = patch.dict(os.environ, {
            'DATABASE_PATH': str(self.path), 'AI_MODE': 'mock',
            'TURSO_DATABASE_URL': '', 'VERCEL': '',
        })
        self.env.start()
        self.client = TestClient(app)
        self.client.__enter__()

    def tearDown(self):
        self.client.__exit__(None, None, None)
        self.env.stop()
        self.path.unlink(missing_ok=True)

    def test_teamlead_data_and_status_mapping(self):
        tasks = self.client.get('/api/tasks').json()
        self.assertEqual(len(tasks), 10)
        self.assertEqual(len(self.client.get('/api/tasks?status=open').json()), 3)
        task = self.client.get('/api/tasks/103').json()
        # В исходном seed записано 60, но общая формула даёт 85.
        self.assertEqual(task['readiness_score'], 85)
        self.assertEqual(task['readiness_level'], 'Готовая')
        self.assertEqual(task['constraints'], '1 месяц')
        proposals = self.client.get('/api/tasks/101/proposals').json()
        self.assertEqual({p['status'] for p in proposals}, {'selected', 'pending'})

    def test_api_flow_through_closure(self):
        response = self.client.post('/api/tasks', json={
            'author_name': 'Тест интеграции', 'description': 'Нужно учесть заявки.',
        })
        self.assertEqual(response.status_code, 201)
        task_id = response.json()['id']
        url = f'/api/tasks/{task_id}'
        questions = self.client.post(f'{url}/questions')
        self.assertEqual(questions.status_code, 200)
        self.assertEqual(questions.json()['provider'], 'mock')
        saved = self.client.patch(url, json={
            'title': 'Учёт заявок', 'context': 'Заявки теряются',
            'need': 'Общий список', 'users': 'Менеджеры',
            'data_description': 'CSV', 'constraints': 'Две недели',
            'expected_result': 'Сервис', 'success_criteria': 'Ноль потерь',
            'interaction_format': 'Созвон',
        })
        self.assertEqual(saved.status_code, 200)
        self.assertEqual(saved.json()['readiness_score'], 100)
        self.assertEqual(self.client.post(f'{url}/publish').status_code, 200)
        proposal = {'team_name': 'Команда', 'idea': 'Дашборд',
                    'plan': 'Собрать API', 'deadline': 'Две недели'}
        created = self.client.post(f'{url}/proposals', json=proposal)
        self.assertEqual(created.status_code, 201)
        proposal_id = created.json()['id']
        decision = self.client.patch(f'/api/proposals/{proposal_id}/decision',
                                     json={'status': 'selected'})
        self.assertEqual(decision.status_code, 200)
        self.assertEqual(decision.json()['status'], 'selected')
        self.assertEqual(self.client.post(f'{url}/close').status_code, 200)
        self.assertEqual(self.client.get(url).json()['status'], 'closed')
        self.assertEqual(self.client.post(f'{url}/proposals', json=proposal).status_code, 409)
