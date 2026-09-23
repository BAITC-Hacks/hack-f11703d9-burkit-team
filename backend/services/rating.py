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
        "missing_fields": missing_fields,
    }
