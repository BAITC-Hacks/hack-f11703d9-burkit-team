from __future__ import annotations

import os
from typing import Any


class AIUnavailableError(RuntimeError):
    """AI-провайдер отключён или недоступен."""


SYSTEM_PROMPT = """
Ты анализируешь черновик бизнес-задачи.
Определи недостающие сведения и задай от трёх до пяти уместных вопросов.
Каждый вопрос должен быть связан ровно с одним полем карточки.
Не добавляй факты, которых нет в исходном тексте.
Верни только JSON с массивом questions.
Допустимые значения field: context, need, users, data_description,
constraints, expected_result, success_criteria, contact, interaction_format.
""".strip()


def build_questions_prompt(task: dict[str, Any]) -> dict[str, str]:
    """Готовит данные для будущего вызова внешнего AI API."""
    return {
        "system": SYSTEM_PROMPT,
        "user": (
            f"Язык ответа: {task['language']}\n"
            f"Черновик бизнес-задачи: {task['description']}"
        ),
    }


def generate_questions(task: dict[str, Any]) -> dict[str, Any]:
    """Возвращает мок-вопросы; реальный провайдер пока не подключён."""
    mode = os.getenv("AI_MODE", "mock").lower()
    if mode != "mock":
        raise AIUnavailableError(
            "AI-сервис сейчас недоступен. Черновик сохранён; повторите запрос позже."
        )

    questions = {
        "ru": [
            {"field": "users", "text": "Кто будет пользоваться результатом решения?"},
            {"field": "data_description", "text": "Какие данные или материалы уже доступны?"},
            {"field": "success_criteria", "text": "По каким измеримым признакам вы примете результат?"},
        ],
        "kk": [
            {"field": "users", "text": "Шешім нәтижесін кім пайдаланады?"},
            {"field": "data_description", "text": "Қандай деректер немесе материалдар қолжетімді?"},
            {"field": "success_criteria", "text": "Нәтижені қандай өлшенетін белгілер бойынша қабылдайсыз?"},
        ],
        "en": [
            {"field": "users", "text": "Who will use the result of the solution?"},
            {"field": "data_description", "text": "What data or materials are already available?"},
            {"field": "success_criteria", "text": "Which measurable criteria will be used to accept the result?"},
        ],
    }
    return {
        "provider": "mock",
        "task_id": task["id"],
        "questions": questions[task["language"]],
    }
