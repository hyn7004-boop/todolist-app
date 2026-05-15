-- categories 테이블에 다국어 이름 컬럼 추가
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS name_ko VARCHAR(50),
  ADD COLUMN IF NOT EXISTS name_en VARCHAR(50),
  ADD COLUMN IF NOT EXISTS name_zh VARCHAR(50);

-- 기존 name 값을 name_ko로 마이그레이션
UPDATE categories SET name_ko = name WHERE name_ko IS NULL;

-- 기존 기본 카테고리에 번역 추가
UPDATE categories SET name_en = 'General', name_zh = '一般' WHERE name_ko = '일반' AND is_default = true;
UPDATE categories SET name_en = 'Work',    name_zh = '工作' WHERE name_ko = '업무' AND is_default = true;
UPDATE categories SET name_en = 'Personal',name_zh = '个人' WHERE name_ko = '개인' AND is_default = true;

-- name_ko NOT NULL 제약 추가
ALTER TABLE categories ALTER COLUMN name_ko SET NOT NULL;

-- 기존 unique 제약 교체
ALTER TABLE categories DROP CONSTRAINT IF EXISTS uq_categories_user_name;
ALTER TABLE categories ADD CONSTRAINT uq_categories_user_name_ko UNIQUE (user_id, name_ko);
