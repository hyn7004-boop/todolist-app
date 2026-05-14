-- ============================================================
-- 002_create_indexes.sql
-- TodoListApp 인덱스 생성 DDL
-- ============================================================

-- users.email UNIQUE INDEX
-- (CREATE TABLE 시 UNIQUE CONSTRAINT로 이미 생성됨 — 재생성 불필요)

-- categories(user_id, name) UNIQUE INDEX: 동일 사용자 내 카테고리명 중복 방지 (BR-03)
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_user_id_name
    ON categories (user_id, name);

-- categories(user_id) INDEX: 사용자별 카테고리 목록 조회
CREATE INDEX IF NOT EXISTS idx_categories_user_id
    ON categories (user_id);

-- todos(user_id) INDEX: 사용자별 할일 목록 조회
CREATE INDEX IF NOT EXISTS idx_todos_user_id
    ON todos (user_id);

-- todos(user_id, category_id) INDEX: 카테고리 필터 조회
CREATE INDEX IF NOT EXISTS idx_todos_user_id_category_id
    ON todos (user_id, category_id);

-- todos(user_id, due_date) INDEX: 기간 필터 조회
CREATE INDEX IF NOT EXISTS idx_todos_user_id_due_date
    ON todos (user_id, due_date);

-- todos(user_id, is_completed) INDEX: 완료여부 필터 조회
CREATE INDEX IF NOT EXISTS idx_todos_user_id_is_completed
    ON todos (user_id, is_completed);
