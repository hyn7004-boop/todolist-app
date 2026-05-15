# ERD

```mermaid
erDiagram
    USERS ||--o{ CATEGORIES : owns
    USERS ||--o{ TODOS : owns
    CATEGORIES ||--o{ TODOS : contains

    USERS {
        UUID user_id PK "사용자 식별자"
        string email UK "로그인 이메일"
        string password_hash "bcrypt 해시 비밀번호"
        string name "사용자 이름"
        string status "active 또는 withdrawn"
        timestamp created_at "생성 일시"
        timestamp updated_at "수정 일시"
        timestamp withdrawn_at "탈퇴 일시 (NULL 가능)"
    }

    CATEGORIES {
        UUID category_id PK "카테고리 식별자"
        UUID user_id FK "소유 사용자"
        string name_ko "카테고리 이름 (한국어, 필수)"
        string name_en "카테고리 이름 (영어, 선택)"
        string name_zh "카테고리 이름 (중국어, 선택)"
        boolean is_default "기본 카테고리 여부"
        timestamp created_at "생성 일시"
    }

    TODOS {
        UUID todo_id PK "할일 식별자"
        UUID user_id FK "소유 사용자"
        UUID category_id FK "연결 카테고리"
        string title "할일 제목"
        text description "할일 설명 (NULL 가능)"
        date due_date "종료 예정일"
        boolean is_completed "완료 여부"
        timestamp created_at "생성 일시"
        timestamp updated_at "수정 일시"
    }
```

## 인덱스 전략

| 테이블 | 인덱스 컬럼 | 인덱스 유형 | 목적 |
|--------|-------------|-------------|------|
| users | email | UNIQUE INDEX | 중복 방지 및 로그인 조회 성능 |
| categories | (user_id, name_ko) | UNIQUE INDEX | 카테고리 한국어 이름 중복 방지 |
| categories | user_id | INDEX | 사용자별 카테고리 목록 조회 |
| todos | user_id | INDEX | 사용자별 할일 목록 조회 |
| todos | (user_id, category_id) | INDEX | 카테고리 필터 조회 |
| todos | (user_id, due_date) | INDEX | 기간 필터 조회 |
| todos | (user_id, is_completed) | INDEX | 완료여부 필터 조회 |
