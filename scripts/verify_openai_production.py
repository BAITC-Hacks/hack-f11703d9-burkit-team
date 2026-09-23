"""Повторяемая проверка реальной генерации вопросов в опубликованном API."""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ALLOWED_FIELDS = {
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

CASES = [
    {
        "author_name": "Production smoke test RU",
        "language": "ru",
        "description": "Сотрудники вручную сверяют сотни счетов и часто пропускают ошибки.",
    },
    {
        "author_name": "Production smoke test KK",
        "language": "kk",
        "description": "Ауыл кәсіпкерлері субсидия өтінімдерінің күйін уақытында көрмейді.",
    },
    {
        "author_name": "Production smoke test EN",
        "language": "en",
        "description": "University mentors cannot quickly identify students who need support.",
    },
]


def request_json(base_url: str, path: str, method: str = "GET", payload: dict | None = None) -> Any:
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    request = Request(
        f"{base_url.rstrip('/')}{path}",
        data=body,
        method=method,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
    )
    try:
        with urlopen(request, timeout=70) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        response_body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{method} {path}: HTTP {error.code}: {response_body}") from error
    except URLError as error:
        raise RuntimeError(f"{method} {path}: API недоступен: {error.reason}") from error


def validate_questions(result: dict[str, Any]) -> None:
    if result.get("provider") != "openai":
        raise RuntimeError(f"Ожидался provider=openai, получено: {result.get('provider')!r}")
    questions = result.get("questions")
    if not isinstance(questions, list) or not 3 <= len(questions) <= 5:
        raise RuntimeError("Ответ должен содержать от 3 до 5 вопросов.")
    fields = [question.get("field") for question in questions if isinstance(question, dict)]
    if len(fields) != len(questions) or len(set(fields)) != len(fields):
        raise RuntimeError("Поля вопросов должны быть заполнены и не повторяться.")
    if not set(fields) <= ALLOWED_FIELDS:
        raise RuntimeError("Ответ содержит неизвестное поле карточки.")
    if any(not isinstance(question.get("text"), str) or not question["text"].strip() for question in questions):
        raise RuntimeError("Ответ содержит пустой вопрос.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("base_url", help="Production URL, например https://project.vercel.app")
    args = parser.parse_args()

    _, health = request_json(args.base_url, "/api/health")
    if health.get("ai_mode") != "openai" or health.get("ai_ready") is not True:
        raise RuntimeError(f"Production AI не готов: {json.dumps(health, ensure_ascii=False)}")

    report = {"health": health, "cases": []}
    for case in CASES:
        status, task = request_json(args.base_url, "/api/tasks", "POST", case)
        if status != 201 or task.get("status") != "draft":
            raise RuntimeError("Не удалось создать проверочный черновик.")
        _, result = request_json(
            args.base_url,
            f"/api/tasks/{task['id']}/questions",
            "POST",
        )
        validate_questions(result)
        _, saved = request_json(args.base_url, f"/api/tasks/{task['id']}")
        if saved.get("status") != "draft":
            raise RuntimeError("После AI-запроса черновик не сохранился.")
        report["cases"].append(
            {
                "language": case["language"],
                "description": case["description"],
                "model": result.get("model"),
                "questions": result["questions"],
                "draft_persisted": True,
            }
        )

    print(json.dumps(report, ensure_ascii=False, indent=2))
    print("\nПроверка пройдена. Просмотрите вопросы в отчёте и подтвердите их уместность.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except RuntimeError as error:
        print(f"Проверка не пройдена: {error}", file=sys.stderr)
        sys.exit(1)
