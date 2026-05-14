-- ============================================================
-- 001_create_tables.sql
-- TodoListApp 테이블 생성 DDL
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    user_id       UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email         VARCHAR(255)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    name          VARCHAR(50)   NOT NULL,
    status        VARCHAR(20)   NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'withdrawn')),
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    withdrawn_at  TIMESTAMPTZ   NULL,
    CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS categories (
    category_id UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID         NOT NULL REFERENCES users(user_id),
    name        VARCHAR(50)  NOT NULL,
    is_default  BOOLEAN      NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS todos (
    todo_id      UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id      UUID          NOT NULL REFERENCES users(user_id),
    category_id  UUID          NOT NULL REFERENCES categories(category_id),
    title        VARCHAR(200)  NOT NULL,
    description  TEXT          NULL,
    due_date     DATE          NOT NULL,
    is_completed BOOLEAN       NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
