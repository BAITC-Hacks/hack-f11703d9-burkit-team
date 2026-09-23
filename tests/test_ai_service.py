import json
import os
import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from backend.services.ai_service import (
    AIResponseError,
    AIUnavailableError,
    generate_questions,
    validate_questions,
)


TASK = {
    "id": 7,
    "language": "ru",
    "description": "Заявки клиентов теряются между разными каналами.",
    "context": None,
    "need": None,
    "users": None,
    "data_description": None,
    "constraints": None,
    "expected_result": None,
    "success_criteria": None,
    "contact": None,
    "interaction_format": None,
}


class AIServiceTests(unittest.TestCase):
    def test_mock_mode_returns_three_questions(self):
        with patch.dict(os.environ, {"AI_MODE": "mock"}, clear=True):
            result = generate_questions(TASK)

        self.assertEqual(result["provider"], "mock")
        self.assertEqual(len(result["questions"]), 3)

    def test_openai_mode_requires_api_key(self):
        with patch.dict(os.environ, {"AI_MODE": "openai"}, clear=True):
            with self.assertRaisesRegex(AIUnavailableError, "OPENAI_API_KEY"):
                generate_questions(TASK)

    def test_openai_mode_returns_validated_structured_questions(self):
        response_payload = {
            "questions": [
                {"field": "users", "text": "Кто будет пользоваться решением?"},
                {"field": "constraints", "text": "Какие есть ограничения?"},
                {
                    "field": "success_criteria",
                    "text": "Как будет измеряться результат?",
                },
            ]
        }
        fake_response = SimpleNamespace(
            status="completed",
            output_text=json.dumps(response_payload, ensure_ascii=False),
            model="gpt-6-luna",
        )
        fake_client = MagicMock()
        fake_client.responses.create.return_value = fake_response

        with patch.dict(
            os.environ,
            {
                "AI_MODE": "openai",
                "OPENAI_API_KEY": "test-key",
                "OPENAI_MODEL": "gpt-6-luna",
            },
            clear=True,
        ):
            with patch("openai.OpenAI", return_value=fake_client):
                result = generate_questions(TASK)

        self.assertEqual(result["provider"], "openai")
        self.assertEqual(result["questions"], response_payload["questions"])
        request = fake_client.responses.create.call_args.kwargs
        self.assertFalse(request["store"])
        self.assertTrue(request["text"]["format"]["strict"])

    def test_duplicate_question_fields_are_rejected(self):
        payload = {
            "questions": [
                {"field": "users", "text": "Первый вопрос"},
                {"field": "users", "text": "Повторный вопрос"},
                {"field": "constraints", "text": "Третий вопрос"},
            ]
        }

        with self.assertRaisesRegex(AIResponseError, "одного поля"):
            validate_questions(payload)


if __name__ == "__main__":
    unittest.main()
