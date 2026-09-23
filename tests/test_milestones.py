"""Переходы этапов, сохранение результатов и идемпотентное начисление XP."""

import os
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient

from backend.database import fetch_one
from backend.main import app


class MilestoneTests(unittest.TestCase):
    def setUp(self):
        self.path = Path("backend/data") / f"test-milestones-{uuid4().hex}.db"
        self.env = patch.dict(
            os.environ,
            {
                "DATABASE_PATH": str(self.path),
                "AI_MODE": "mock",
                "TURSO_DATABASE_URL": "",
                "VERCEL": "",
            },
        )
        self.env.start()
        self.client = TestClient(app)
        self.client.__enter__()

    def tearDown(self):
        self.client.__exit__(None, None, None)
        self.env.stop()
        self.path.unlink(missing_ok=True)

    def selected_proposal(self) -> tuple[int, int]:
        task = self.client.post(
            "/api/tasks",
            json={"author_name": "Бизнес", "description": "Нужен прототип."},
        ).json()
        task_id = task["id"]
        self.client.patch(f"/api/tasks/{task_id}", json={"title": "Тест этапов"})
        self.client.post(f"/api/tasks/{task_id}/publish")
        proposal = self.client.post(
            f"/api/tasks/{task_id}/proposals",
            json={
                "team_name": "Atomic Team",
                "idea": "Собрать прототип",
                "plan": "Три этапа",
                "deadline": "Три недели",
            },
        ).json()
        proposal_id = proposal["id"]
        decision = self.client.patch(
            f"/api/proposals/{proposal_id}/decision",
            json={"status": "selected"},
        )
        self.assertEqual(decision.status_code, 200)
        return task_id, proposal_id

    def create_milestone(self, proposal_id: int, number: int = 1) -> dict:
        response = self.client.post(
            f"/api/proposals/{proposal_id}/milestones",
            json={
                "title": f"Этап {number}",
                "description": "Показать проверяемый результат.",
                "deadline": f"Неделя {number}",
            },
        )
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()

    def test_only_selected_proposal_accepts_server_scored_milestones(self):
        task = self.client.post(
            "/api/tasks",
            json={"author_name": "Бизнес", "description": "Задача"},
        ).json()
        self.client.patch(f"/api/tasks/{task['id']}", json={"title": "Задача"})
        self.client.post(f"/api/tasks/{task['id']}/publish")
        proposal = self.client.post(
            f"/api/tasks/{task['id']}/proposals",
            json={"team_name": "Команда", "idea": "Идея", "plan": "План", "deadline": "Месяц"},
        ).json()
        payload = {"title": "Этап", "description": "Результат", "deadline": "Неделя"}
        self.assertEqual(
            self.client.post(f"/api/proposals/{proposal['id']}/milestones", json=payload).status_code,
            409,
        )
        self.client.patch(
            f"/api/proposals/{proposal['id']}/decision",
            json={"status": "selected"},
        )
        forbidden_points = self.client.post(
            f"/api/proposals/{proposal['id']}/milestones",
            json={**payload, "points": 99999},
        )
        self.assertEqual(forbidden_points.status_code, 422)

        milestones = [self.create_milestone(proposal["id"], number) for number in range(1, 4)]
        self.assertEqual([item["points"] for item in milestones], [300, 400, 500])

    def test_result_is_required_and_progress_survives_restart(self):
        task_id, proposal_id = self.selected_proposal()
        milestone = self.create_milestone(proposal_id)
        confirm_url = f"/api/milestones/{milestone['id']}/confirm"
        self.assertEqual(self.client.post(confirm_url).status_code, 409)

        submitted = self.client.post(
            f"/api/milestones/{milestone['id']}/submit",
            json={"result_url": "https://github.com/example/result"},
        )
        self.assertEqual(submitted.status_code, 200)
        self.assertEqual(submitted.json()["status"], "submitted")
        self.assertEqual(self.client.get(f"/api/tasks/{task_id}").json()["status"], "open")

        confirmed = self.client.post(confirm_url)
        self.assertEqual(confirmed.status_code, 200, confirmed.text)
        self.assertEqual(confirmed.json()["total_points"], 300)
        self.assertEqual(confirmed.json()["completion_percent"], 100)
        # Подтверждение этапа не закрывает бизнес-задачу.
        self.assertEqual(self.client.get(f"/api/tasks/{task_id}").json()["status"], "open")

        self.client.__exit__(None, None, None)
        self.client = TestClient(app)
        self.client.__enter__()
        restored = self.client.get(f"/api/proposals/{proposal_id}/progress")
        self.assertEqual(restored.status_code, 200)
        self.assertEqual(restored.json()["total_points"], 300)
        self.assertEqual(restored.json()["milestones"][0]["result_url"], "https://github.com/example/result")

    def test_revision_can_be_resubmitted(self):
        _, proposal_id = self.selected_proposal()
        milestone = self.create_milestone(proposal_id)
        submit_url = f"/api/milestones/{milestone['id']}/submit"
        self.client.post(submit_url, json={"result_url": "https://example.com/v1"})
        revision = self.client.post(
            f"/api/milestones/{milestone['id']}/revision",
            json={"feedback": "Добавьте инструкцию запуска."},
        )
        self.assertEqual(revision.status_code, 200)
        self.assertEqual(revision.json()["status"], "revision_requested")
        repeated = self.client.post(submit_url, json={"result_url": "https://example.com/v2"})
        self.assertEqual(repeated.status_code, 200)
        self.assertEqual(repeated.json()["status"], "submitted")
        self.assertIsNone(repeated.json()["feedback"])

    def test_concurrent_confirmation_awards_points_once(self):
        _, proposal_id = self.selected_proposal()
        milestone = self.create_milestone(proposal_id)
        self.client.post(
            f"/api/milestones/{milestone['id']}/submit",
            json={"result_url": "https://example.com/result"},
        )
        url = f"/api/milestones/{milestone['id']}/confirm"

        with ThreadPoolExecutor(max_workers=2) as executor:
            responses = list(executor.map(lambda _: self.client.post(url), range(2)))

        self.assertEqual([response.status_code for response in responses], [200, 200])
        progress = self.client.get(f"/api/proposals/{proposal_id}/progress").json()
        self.assertEqual(progress["total_points"], 300)
        self.assertEqual(progress["confirmed_milestones"], 1)
        award_count = fetch_one(
            "SELECT COUNT(*) AS count FROM point_awards WHERE milestone_id = ?",
            (milestone["id"],),
        )
        self.assertEqual(award_count["count"], 1)


if __name__ == "__main__":
    unittest.main()
