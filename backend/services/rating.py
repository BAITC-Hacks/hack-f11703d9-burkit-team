FIELD_WEIGHTS = {
    "context_need": 20,
    "data_materials": 20,
    "expected_result": 15,
    "success_criteria": 15,
    "constraints": 10,
    "target_users": 10,
    "business_contact": 10,
}

FIELD_NAMES_RU = {
    "context_need": "Контекст и потребность",
    "data_materials": "Данные и материалы",
    "expected_result": "Ожидаемый результат",
    "success_criteria": "Критерии успеха",
    "constraints": "Ограничения",
    "target_users": "Пользователи",
    "business_contact": "Связь с бизнесом",
}


def calculate_task_rating(task_data: dict) -> dict:
    """Считает рейтинг для полей backend и старого формата rating.py."""
    values = {
        "context_need": task_data.get("context_need")
        or _joined(task_data.get("context"), task_data.get("need")),
        "data_materials": task_data.get("data_materials")
        or task_data.get("data_description"),
        "expected_result": task_data.get("expected_result"),
        "success_criteria": task_data.get("success_criteria"),
        "constraints": task_data.get("constraints"),
        "target_users": task_data.get("target_users")
        or task_data.get("users"),
        "business_contact": task_data.get("business_contact")
        or _joined(task_data.get("contact"), task_data.get("interaction_format")),
    }
    score = 0
    missing_fields = []

    for field, weight in FIELD_WEIGHTS.items():
        value = values.get(field)
        if isinstance(value, str) and value.strip():
            score += weight
        else:
            missing_fields.append(
                {
                    "field": field,
                    "bonus": weight,
                    "hint": f"Заполните «{FIELD_NAMES_RU[field]}», чтобы получить еще +{weight} баллов",
                }
            )

    if score >= 90:
        status = "Приоритетная"
    elif score >= 70:
        status = "Готовая"
    elif score >= 40:
        status = "Рабочая"
    else:
        status = "Черновик"

    return {
        "score": score,
        "status": status,
        "readiness_level": status,
        "missing_fields": missing_fields,
    }


def _joined(*values: object) -> str | None:
    parts = [
        value.strip()
        for value in values
        if isinstance(value, str) and value.strip()
    ]
    return "\n".join(parts) if len(parts) == len(values) else None
