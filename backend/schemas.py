from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, StringConstraints, field_validator


Language = Literal["kk", "ru", "en"]
TaskStatus = Literal["draft", "open", "closed"]
ProposalStatus = Literal["pending", "selected", "rejected"]
ReadinessLevel = Literal["Черновик", "Рабочая", "Готовая", "Приоритетная"]
QuestionField = Literal[
    "context",
    "need",
    "users",
    "data_description",
    "constraints",
    "expected_result",
    "success_criteria",
    "contact",
    "interaction_format",
]

ShortText = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=200),
]
LongText = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=5000),
]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class TaskCreate(StrictModel):
    author_name: ShortText = Field(examples=["АО «Пример»"])
    description: LongText = Field(
        examples=["Нужно сократить время ручной проверки заявок."]
    )
    language: Language = Field(default="ru", examples=["ru"])


class TaskUpdate(StrictModel):
    author_name: ShortText | None = None
    language: Language | None = None
    description: LongText | None = None
    title: ShortText | None = None
    context: LongText | None = None
    need: LongText | None = None
    users: LongText | None = None
    data_description: LongText | None = None
    constraints: LongText | None = None
    expected_result: LongText | None = None
    success_criteria: LongText | None = None
    contact: ShortText | None = None
    interaction_format: ShortText | None = None

    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "title": "Автоматическая проверка заявок",
                "expected_result": "Прототип с отчётом о найденных ошибках",
                "success_criteria": "Не менее 80% корректно найденных ошибок",
            }
        },
    )


class ProposalCreate(StrictModel):
    team_name: ShortText = Field(examples=["Burkit Team"])
    idea: LongText = Field(examples=["Сервис проверки заявок с помощью LLM."])
    plan: LongText = Field(examples=["Подготовить данные, API и веб-интерфейс."])
    deadline: ShortText = Field(examples=["2026-09-30"])
    prototype_url: HttpUrl | None = Field(default=None, examples=["https://example.com/demo"])

    @field_validator("prototype_url", mode="before")
    @classmethod
    def empty_url_is_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value


class ProposalDecision(StrictModel):
    status: Literal["selected", "rejected"] = Field(examples=["selected"])


class MissingRatingField(BaseModel):
    field: str
    bonus: int
    hint: str


class RatingResponse(BaseModel):
    score: int = Field(ge=0, le=100)
    status: ReadinessLevel
    readiness_level: ReadinessLevel
    missing_fields: list[MissingRatingField]


class TaskResponse(BaseModel):
    id: int
    author_name: str
    language: Language
    description: str
    title: str | None
    context: str | None
    need: str | None
    users: str | None
    data_description: str | None
    constraints: str | None
    expected_result: str | None
    success_criteria: str | None
    contact: str | None
    interaction_format: str | None
    readiness_score: int
    readiness_level: ReadinessLevel
    status: TaskStatus
    published_at: str | None
    closed_at: str | None
    created_at: str
    updated_at: str


class TaskDetailResponse(TaskResponse):
    rating: RatingResponse


class ProposalResponse(BaseModel):
    id: int
    task_id: int
    team_name: str
    idea: str
    plan: str
    deadline: str
    prototype_url: str | None
    status: ProposalStatus
    created_at: str
    updated_at: str


class QuestionResponse(BaseModel):
    field: QuestionField
    text: str


class QuestionsResponse(BaseModel):
    provider: Literal["mock", "openai"]
    model: str | None = None
    task_id: int
    questions: list[QuestionResponse]


class HealthResponse(BaseModel):
    status: Literal["ok"]
    database: Literal["ok"]


class RootResponse(BaseModel):
    service: str
    docs: str
    health: str


class ErrorResponse(BaseModel):
    detail: str


class ValidationIssue(BaseModel):
    field: str
    message: str


class ValidationErrorResponse(ErrorResponse):
    errors: list[ValidationIssue] = Field(default_factory=list)
