from __future__ import annotations

import json
import os
from typing import Any


class AIUnavailableError(RuntimeError):
    """AI-провайдер отключён или недоступен."""


class AIResponseError(RuntimeError):
    """AI-провайдер вернул ответ, который нельзя использовать."""


ALLOWED_QUESTION_FIELDS = {
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


SYSTEM_PROMPT = """
Ты анализируешь черновик бизнес-задачи.
Определи недостающие сведения и задай от трёх до пяти уместных вопросов.
Каждый вопрос должен быть связан ровно с одним полем карточки.
Не добавляй факты, которых нет в исходном тексте.
Не спрашивай повторно сведения, которые уже заполнены.
Пиши вопросы на языке, указанном пользователем: kk, ru или en.
Допустимые значения field: context, need, users, data_description,
constraints, expected_result, success_criteria, contact, interaction_format.
""".strip()


QUESTIONS_SCHEMA = {
    "type": "object",
    "properties": {
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "field": {
                        "type": "string",
                        "enum": sorted(ALLOWED_QUESTION_FIELDS),
                    },
                    "text": {
                        "type": "string",
                    },
                },
                "required": [
                    "field",
                    "text",
                ],
                "additionalProperties": False,
            },
        },
    },
    "required": [
        "questions",
    ],
    "additionalProperties": False,
}


def build_questions_prompt(
    task: dict[str, Any],
) -> dict[str, str]:
    """Готовит инструкции и данные задачи для AI."""
    task_fields = {
        field: task.get(field)
        for field in (
            "description",
            "context",
            "need",
            "users",
            "data_description",
            "constraints",
            "expected_result",
            "success_criteria",
            "contact",
            "interaction_format",
        )
    }

    return {
        "system": SYSTEM_PROMPT,
        "user": (
            f"Язык ответа: {task['language']}\n"
            "Текущие сведения задачи:\n"
            f"{json.dumps(task_fields, ensure_ascii=False)}"
        ),
    }


def mock_questions(
    task: dict[str, Any],
) -> dict[str, Any]:
    """Возвращает фиксированные вопросы для локальной разработки."""
    questions = {
        "ru": [
            {
                "field": "users",
                "text": "Кто будет пользоваться результатом решения?",
            },
            {
                "field": "data_description",
                "text": "Какие данные или материалы уже доступны?",
            },
            {
                "field": "success_criteria",
                "text": (
                    "По каким измеримым признакам "
                    "вы примете результат?"
                ),
            },
        ],
        "kk": [
            {
                "field": "users",
                "text": "Шешім нәтижесін кім пайдаланады?",
            },
            {
                "field": "data_description",
                "text": (
                    "Қандай деректер немесе материалдар "
                    "қолжетімді?"
                ),
            },
            {
                "field": "success_criteria",
                "text": (
                    "Нәтижені қандай өлшенетін белгілер "
                    "бойынша қабылдайсыз?"
                ),
            },
        ],
        "en": [
            {
                "field": "users",
                "text": "Who will use the result of the solution?",
            },
            {
                "field": "data_description",
                "text": (
                    "What data or materials "
                    "are already available?"
                ),
            },
            {
                "field": "success_criteria",
                "text": (
                    "Which measurable criteria will be "
                    "used to accept the result?"
                ),
            },
        ],
    }

    return {
        "provider": "mock",
        "task_id": task["id"],
        "questions": questions[task["language"]],
    }


def validate_questions(
    payload: Any,
) -> list[dict[str, str]]:
    """Проверяет структуру вопросов после ответа AI."""
    if (
        not isinstance(payload, dict)
        or not isinstance(payload.get("questions"), list)
    ):
        raise AIResponseError(
            "AI вернул ответ в неизвестном формате."
        )

    questions = payload["questions"]

    if not 3 <= len(questions) <= 5:
        raise AIResponseError(
            "AI должен вернуть от трёх до пяти вопросов."
        )

    validated: list[dict[str, str]] = []
    used_fields: set[str] = set()

    for question in questions:
        if not isinstance(question, dict):
            raise AIResponseError(
                "Один из вопросов имеет неверный формат."
            )

        field = question.get("field")
        text = question.get("text")

        if field not in ALLOWED_QUESTION_FIELDS:
            raise AIResponseError(
                "AI указал неизвестное поле карточки."
            )

        if field in used_fields:
            raise AIResponseError(
                "AI вернул несколько вопросов для одного поля."
            )

        if not isinstance(text, str) or not text.strip():
            raise AIResponseError(
                "AI вернул пустой вопрос."
            )

        used_fields.add(field)
        validated.append(
            {
                "field": field,
                "text": text.strip(),
            }
        )

    return validated


def openai_questions(
    task: dict[str, Any],
) -> dict[str, Any]:
    """Получает уточняющие вопросы через OpenAI Responses API."""
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise AIUnavailableError(
            "OPENAI_API_KEY не задан. "
            "Черновик сохранён; настройте ключ "
            "и повторите запрос."
        )

    try:
        from openai import OpenAI, OpenAIError
    except ImportError as error:
        raise AIUnavailableError(
            "Пакет openai не установлен. "
            "Установите зависимости backend."
        ) from error

    prompt = build_questions_prompt(task)

    try:
        response = OpenAI(
            api_key=api_key,
            timeout=20.0,
        ).responses.create(
            model=os.getenv(
                "OPENAI_MODEL",
                "gpt-6-luna",
            ),
            instructions=prompt["system"],
            input=prompt["user"],
            text={
                "format": {
                    "type": "json_schema",
                    "name": "clarifying_questions",
                    "strict": True,
                    "schema": QUESTIONS_SCHEMA,
                },
            },
            store=False,
        )
    except OpenAIError as error:
        raise AIUnavailableError(
            "Не удалось получить ответ от AI. "
            "Черновик сохранён; повторите запрос позже."
        ) from error

    if (
        response.status != "completed"
        or not response.output_text
    ):
        raise AIResponseError(
            "AI не вернул завершённый ответ с вопросами."
        )

    try:
        payload = json.loads(response.output_text)
    except json.JSONDecodeError as error:
        raise AIResponseError(
            "AI вернул некорректный JSON."
        ) from error

    return {
        "provider": "openai",
        "model": response.model,
        "task_id": task["id"],
        "questions": validate_questions(payload),
    }


def generate_questions(
    task: dict[str, Any],
) -> dict[str, Any]:
    """Выбирает реальный OpenAI или локальный мок."""
    mode = os.getenv(
        "AI_MODE",
        "mock",
    ).lower()

    if mode == "mock":
        return mock_questions(task)

    if mode == "openai":
        return openai_questions(task)

    if mode == "disabled":
        raise AIUnavailableError(
            "AI-сервис отключён. "
            "Черновик сохранён; повторите запрос "
            "после включения сервиса."
        )

    raise AIUnavailableError(
        "Неизвестное значение AI_MODE. "
        "Допустимые значения: mock, openai, disabled."
    )