PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_name TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'ru' CHECK (language IN ('kk', 'ru', 'en')),
    description TEXT NOT NULL,
    title TEXT,
    context TEXT,
    need TEXT,
    users TEXT,
    data_description TEXT,
    constraints TEXT,
    expected_result TEXT,
    success_criteria TEXT,
    contact TEXT,
    interaction_format TEXT,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'open', 'closed')),
    readiness_score INTEGER NOT NULL DEFAULT 0
        CHECK (readiness_score BETWEEN 0 AND 100),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TEXT,
    closed_at TEXT
);

CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    team_name TEXT NOT NULL,
    idea TEXT NOT NULL,
    plan TEXT NOT NULL,
    deadline TEXT NOT NULL,
    prototype_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'selected', 'rejected')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_catalog
ON tasks(status, readiness_score DESC, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_proposals_task
ON proposals(task_id);
