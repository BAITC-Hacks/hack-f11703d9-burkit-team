# Контракт Burkit API

Swagger доступен по `/docs`, OpenAPI-схема — по `/openapi.json`. Все запросы и
ответы используют JSON. Неизвестные поля отклоняются, пробелы по краям текстовых
значений удаляются. Чтобы очистить необязательное поле через `PATCH`, передайте
`null`; обязательные `author_name`, `description` и `language` очистить нельзя.

## Статусы и ошибки

`status` описывает публикацию задачи: `draft` → `open` → `closed`.
`readiness_level` описывает качество заполнения карточки и не меняет её статус:
`Черновик`, `Рабочая`, `Готовая`, `Приоритетная`.

`GET /api/health` сообщает `ai_mode`, `ai_ready` и выбранную `ai_model`, но
никогда не возвращает API-ключ. Успешная генерация дополнительно содержит
`provider: openai` или `provider: mock`.

- `404` — задача или отклик не существует;
- `409` — действие запрещено в текущем статусе;
- `422` — запрос не соответствует схеме;
- `502` — AI вернул ответ неверного формата;
- `503` — AI или база данных недоступны.

Ошибка валидации имеет единый вид:

```json
{
  "detail": "Проверьте данные запроса.",
  "errors": [{"field": "description", "message": "Обязательное поле не заполнено."}]
}
```

## Сквозной сценарий

1. `POST /api/tasks` создаёт `draft` из `author_name`, `description`, `language`.
2. `POST /api/tasks/{id}/questions` возвращает вопросы с ключом `field`.
3. `PATCH /api/tasks/{id}` сохраняет ответы и возвращает пересчитанный `rating`.
4. `POST /api/tasks/{id}/publish` переводит `draft` в `open`; требуется `title`.
5. `POST /api/tasks/{id}/proposals` принимает отклик только для `open`.
6. `PATCH /api/proposals/{id}/decision` один раз принимает `selected` или `rejected`.
7. `POST /api/tasks/{id}/close` переводит `open` в `closed`.

Закрытую задачу нельзя редактировать, уточнять, публиковать повторно или принимать
на неё отклики. Полный состав полей и примеры запросов доступны в Swagger.

## Соответствие frontend и API

| Frontend | API | Примечание |
| --- | --- | --- |
| `id: string` | `id: integer` | В адаптере использовать `String(id)` только для UI. |
| `targetUsers` | `users` | Ответ на AI-вопрос с `field: users`. |
| `dataProvided` | `data_description` | Описание доступных данных. |
| `expectedResult` | `expected_result` | Ожидаемый результат задачи. |
| `successCriteria` | `success_criteria` | Измеримый критерий успеха. |
| `interactionFormat` | `interaction_format` | Формат работы бизнеса с командой. |
| `published` | `status` | `true` недостаточно: различать `draft`, `open`, `closed`. |
| UI-рейтинг | `readiness_score`, `readiness_level`, `rating` | Источник истины — ответ backend. |
| `sprintPlan` | `plan` | План из отклика команды. |
| `timeline` | `deadline` | Срок из отклика команды. |
| `prototypeUrl` | `prototype_url` | Только ссылка `http://` или `https://`. |
| `accepted` | `selected` | Статус выбранного отклика. |
| `new`, `pending` | `pending` | Новый отклик на рассмотрении. |

## Минимальные примеры

Создание черновика:

```json
{
  "author_name": "АО «Пример»",
  "description": "Нужно сократить время проверки заявок",
  "language": "ru"
}
```

Сохранение уточнений:

```json
{
  "title": "Автоматическая проверка заявок",
  "users": "Операторы отдела контроля",
  "expected_result": "Веб-сервис с отчётом об ошибках",
  "success_criteria": "Не менее 80% найденных ошибок"
}
```

Создание отклика:

```json
{
  "team_name": "Burkit Team",
  "idea": "Проверять заявки с помощью LLM",
  "plan": "Подготовить данные, API и интерфейс",
  "deadline": "2 недели",
  "prototype_url": "https://example.com/demo"
}
```
