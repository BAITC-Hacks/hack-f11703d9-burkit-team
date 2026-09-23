"""Адаптер общей формулы TeamLead к названиям полей backend."""

from rating import calculate_task_rating as calculate_team_rating


FIELD_ALIASES = {'deadline': 'constraints', 'target_users': 'users'}


def calculate_task_rating(task_data: dict) -> dict:
    fields = dict(task_data)
    for team_field, backend_field in FIELD_ALIASES.items():
        if backend_field in task_data:
            fields[team_field] = task_data[backend_field]
    rating = calculate_team_rating(fields)
    # status внутри rating оставлен для обратной совместимости API.
    # Статус публикации хранится отдельно в task.status.
    return {
        **rating,
        'status': rating['readiness_level'],
        'missing_fields': [
            {**item, 'field': FIELD_ALIASES.get(item['field'], item['field'])}
            for item in rating['missing_fields']
        ],
    }
