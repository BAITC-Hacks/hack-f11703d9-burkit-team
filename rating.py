FIELD_WEIGHTS = {
    "context": 10,
    "need": 10,
    "data_description": 20,
    "expected_result": 15,
    "success_criteria": 15,
    "deadline": 10,
    "target_users": 10,
    "interaction_format": 10,
}

FIELD_NAMES_RU = {
    "context": "Контекст",
    "need": "Потребность",
    "data_description": "Данные и материалы",
    "expected_result": "Ожидаемый результат",
    "success_criteria": "Критерии успеха",
    "deadline": "Ограничения и сроки",
    "target_users": "Пользователи",
    "interaction_format": "Формат взаимодействия",
}


def calculate_task_rating(task_data: dict) -> dict:
    score = 0
    missing_fields = []

    for field, weight in FIELD_WEIGHTS.items():
        value = task_data.get(field)
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
        readiness_level = "Приоритетная"
    elif score >= 70:
        readiness_level = "Готовая"
    elif score >= 40:
        readiness_level = "Рабочая"
    else:
        readiness_level = "Черновик"

    return {
        "score": score,
        "readiness_level": readiness_level,
        "missing_fields": missing_fields,
    }
