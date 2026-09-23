"""Контракт запросов, ошибок и переходов статусов Burkit API."""

import os
import unittest
from pathlib import Path
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient

from backend.main import app


class APIContractTests(unittest.TestCase):
    def setUp(self):
        self.path = Path("backend/data") / f"test-contract-{uuid4().hex}.db"
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

    def create_draft(self) -> dict:
        response = self.client.post(
            "/api/tasks",
            json={"author_name": "Бизнес", "description": "Нужен сервис."},
        )
        self.assertEqual(response.status_code, 201)
        return response.json()

    def test_validation_errors_are_structured_and_localized(self):
        missing = self.client.post("/api/tasks", json={"author_name": "Бизнес"})
        self.assertEqual(missing.status_code, 422)
        self.assertEqual(missing.json()["detail"], "Проверьте данные запроса.")
        self.assertEqual(missing.json()["errors"][0]["field"], "description")

        unknown = self.client.post(
            "/api/tasks",
            json={"author_name": "Бизнес", "description": "Задача", "score": 100},
        )
        self.assertEqual(unknown.status_code, 422)
        self.assertEqual(unknown.json()["errors"][0]["message"], "Неизвестное поле.")

        invalid_filter = self.client.get("/api/tasks?status=published")
        self.assertEqual(invalid_filter.status_code, 422)

    def test_not_found_and_invalid_transitions(self):
        self.assertEqual(self.client.get("/api/tasks/99999").status_code, 404)

        task = self.create_draft()
        task_url = f"/api/tasks/{task['id']}"
        proposal = {
            "team_name": "Команда",
            "idea": "Решение",
            "plan": "Собрать MVP",
            "deadline": "2 недели",
        }
        self.assertEqual(
            self.client.post(f"{task_url}/proposals", json=proposal).status_code,
            409,
        )
        self.assertEqual(self.client.post(f"{task_url}/close").status_code, 409)

        self.client.patch(task_url, json={"title": "Проверка переходов"})
        self.client.post(f"{task_url}/publish")
        created = self.client.post(f"{task_url}/proposals", json=proposal).json()
        decision_url = f"/api/proposals/{created['id']}/decision"
        self.assertEqual(
            self.client.patch(decision_url, json={"status": "selected"}).status_code,
            200,
        )
        self.assertEqual(
            self.client.patch(decision_url, json={"status": "rejected"}).status_code,
            409,
        )

        closed = self.client.post(f"{task_url}/close")
        self.assertEqual(closed.status_code, 200)
        self.assertEqual(closed.json()["status"], "closed")
        self.assertIn("rating", closed.json())
        self.assertEqual(self.client.patch(task_url, json={"title": "Новое"}).status_code, 409)
        self.assertEqual(self.client.post(f"{task_url}/questions").status_code, 409)

    def test_openapi_describes_actual_models_and_errors(self):
        schema = self.client.get("/openapi.json").json()
        create_task = schema["paths"]["/api/tasks"]["post"]
        request_ref = create_task["requestBody"]["content"]["application/json"]["schema"]["$ref"]
        response_ref = create_task["responses"]["201"]["content"]["application/json"]["schema"]["$ref"]

        self.assertTrue(request_ref.endswith("/TaskCreate"))
        self.assertTrue(response_ref.endswith("/TaskDetailResponse"))
        self.assertIn("422", create_task["responses"])
        self.assertIn("409", schema["paths"]["/api/tasks/{task_id}/publish"]["post"]["responses"])
        self.assertIn("readiness_level", schema["components"]["schemas"]["TaskResponse"]["properties"])
        self.assertIn("status", schema["components"]["schemas"]["TaskResponse"]["properties"])

    def test_ai_failure_keeps_draft_and_request_can_be_repeated(self):
        task = self.create_draft()
        task_url = f"/api/tasks/{task['id']}"

        with patch.dict(os.environ, {"AI_MODE": "disabled"}):
            failed = self.client.post(f"{task_url}/questions")

        self.assertEqual(failed.status_code, 503)
        self.assertIn("Черновик сохранён", failed.json()["detail"])
        self.assertEqual(self.client.get(task_url).json()["status"], "draft")

        repeated = self.client.post(f"{task_url}/questions")
        self.assertEqual(repeated.status_code, 200)
        self.assertEqual(repeated.json()["provider"], "mock")

    def test_health_reports_ai_mode_without_secrets(self):
        with patch.dict(
            os.environ,
            {
                "AI_MODE": "openai",
                "OPENAI_API_KEY": "secret-test-key",
                "OPENAI_MODEL": "gpt-5-mini",
            },
        ):
            health = self.client.get("/api/health")

        self.assertEqual(health.status_code, 200)
        self.assertEqual(health.json()["ai_mode"], "openai")
        self.assertTrue(health.json()["ai_ready"])
        self.assertEqual(health.json()["ai_model"], "gpt-5-mini")
        self.assertNotIn("secret-test-key", health.text)


if __name__ == "__main__":
    unittest.main()
