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
    readiness_level TEXT NOT NULL DEFAULT 'Черновик'
        CHECK (readiness_level IN ('Черновик', 'Рабочая', 'Готовая', 'Приоритетная')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TEXT,
    closed_at TEXT
);

CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    interests TEXT NOT NULL,
    skills TEXT NOT NULL,
    technology TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    team_id INTEGER,
    team_name TEXT NOT NULL,
    idea TEXT NOT NULL,
    plan TEXT NOT NULL,
    deadline TEXT NOT NULL,
    prototype_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'selected', 'rejected')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id INTEGER NOT NULL,
    position INTEGER NOT NULL CHECK (position > 0),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    deadline TEXT NOT NULL,
    points INTEGER NOT NULL CHECK (points > 0),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'submitted', 'confirmed', 'revision_requested')),
    result_url TEXT,
    feedback TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TEXT,
    confirmed_at TEXT,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
    UNIQUE (proposal_id, position)
);

CREATE TABLE IF NOT EXISTS point_awards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    milestone_id INTEGER NOT NULL UNIQUE,
    proposal_id INTEGER NOT NULL,
    team_id INTEGER,
    team_name TEXT NOT NULL,
    points INTEGER NOT NULL CHECK (points > 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE RESTRICT,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_catalog
ON tasks(status, readiness_score DESC, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_proposals_task
ON proposals(task_id);

CREATE INDEX IF NOT EXISTS idx_milestones_proposal
ON milestones(proposal_id, position);

CREATE INDEX IF NOT EXISTS idx_point_awards_team
ON point_awards(team_id, team_name, created_at DESC);
