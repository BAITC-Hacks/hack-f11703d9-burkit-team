"""Приведение исходных данных TeamLead к схеме FastAPI и SQLite."""

from seed_data import SEED_DATA as TEAM_SEED_DATA


TASK_FIELDS = (
    'title', 'context', 'need', 'description', 'data_description',
    'expected_result', 'success_criteria', 'author_name', 'interaction_format',
)


def normalize_task(source: dict, *, draft: bool = False) -> dict:
    task = {field: source.get(field) for field in TASK_FIELDS}
    task.update({
        'id': source['id'],
        'author_name': source.get('author_name') or 'Тестовый автор TeamLead',
        'language': source.get('language', 'ru'),
        'users': source.get('target_users'),
        'constraints': source.get('deadline'),
        'contact': source.get('contact'),
        'status': 'draft' if draft else source['status'],
    })
    return task


PROPOSAL_STATUSES = {
    'Выбрана': 'selected',
    'На рассмотрении': 'pending',
    'Отклонена': 'rejected',
}

SEED_DATA = {
    'tasks': [normalize_task(task, draft=True) for task in TEAM_SEED_DATA['drafts']]
    + [normalize_task(task) for task in TEAM_SEED_DATA['tasks']],
    'teams': [
        {**team, 'technology': team['tech']}
        for team in TEAM_SEED_DATA['teams']
    ],
    'proposals': [
        {**proposal, 'status': PROPOSAL_STATUSES[proposal['status']]}
        for proposal in TEAM_SEED_DATA['applications']
    ],
}
