-- ============================================================
-- TodoListApp Database Schema
-- PostgreSQL 17
-- ============================================================

-- 확장 모듈 활성화 (UUID 생성 함수 사용)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE users (
    user_id      UUID          NOT NULL DEFAULT gen_random_uuid(),
    email        VARCHAR(255)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name         VARCHAR(50)   NOT NULL,
    status       VARCHAR(20)   NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active', 'withdrawn')),
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    withdrawn_at TIMESTAMPTZ,

    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- ============================================================
-- 2. categories
-- ============================================================
CREATE TABLE categories (
    category_id UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL,
    name        VARCHAR(50)  NOT NULL,
    is_default  BOOLEAN      NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_categories PRIMARY KEY (category_id),
    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT uq_categories_user_name UNIQUE (user_id, name)
);

-- ============================================================
-- 3. todos
-- ============================================================
CREATE TABLE todos (
    todo_id     UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL,
    category_id UUID         NOT NULL,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    due_date    DATE         NOT NULL,
    is_completed BOOLEAN     NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_todos PRIMARY KEY (todo_id),
    CONSTRAINT fk_todos_user
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_todos_category
        FOREIGN KEY (category_id) REFERENCES categories (category_id)
);

-- ============================================================
-- 4. 인덱스
-- ============================================================

-- categories: 사용자별 목록 조회
CREATE INDEX idx_categories_user_id
    ON categories (user_id);

-- todos: 사용자별 목록 조회
CREATE INDEX idx_todos_user_id
    ON todos (user_id);

-- todos: 카테고리 필터 조회
CREATE INDEX idx_todos_user_category
    ON todos (user_id, category_id);

-- todos: 기간 필터 조회
CREATE INDEX idx_todos_user_due_date
    ON todos (user_id, due_date);

-- todos: 완료여부 필터 조회
CREATE INDEX idx_todos_user_is_completed
    ON todos (user_id, is_completed);
