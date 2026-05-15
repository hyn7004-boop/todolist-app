# TodoListApp 실행계획 (Execution Plan)

---

## 문서 메타데이터

| 항목      | 내용                                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| 문서명    | TodoListApp 실행계획                                                                                           |
| 버전      | 1.1.0                                                                                                          |
| 작성일    | 2026-05-15                                                                                                     |
| 작성자    | youngnam.her                                                                                                   |
| 상태      | Draft                                                                                                          |
| 참조 문서 | docs/3-domain-definition.md, docs/4-prd.md, docs/6-project-principle.md, docs/7-arch-diagram.md, docs/8-erd.md |

### Changelog

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.1.0 | 2026-05-15 | youngnam.her | 모든 Task 완료 체크; 배포 완료 반영; BUG-001 수정 및 신규 기능(완료된 할일 수정 불가) 추가 |
| 1.0.0 | 2026-05-13 | youngnam.her | 최초 작성 (3일 일정 기반) |

---

## 전체 Task 구조 요약

```
[데이터베이스]
  DB-01 → DB-02 → DB-03

[백엔드]
  BE-01 → BE-02 → BE-03 → BE-04
                          ↓
  BE-05 → BE-06 → BE-07 → BE-08 → BE-09 → BE-10

[프론트엔드]
  FE-01 → FE-02 → FE-03 → FE-04 → FE-05
                                    ↓
  FE-06 → FE-07 → FE-08 → FE-09 → FE-10 → FE-11 → FE-12 → FE-13 → FE-14
```

> **병렬 실행 가능 구간:**
>
> - DB-02 ~ DB-03: 동시 작성 가능
> - BE-03 (유틸/미들웨어)와 DB 작업: 동시 진행 가능
> - FE-01 ~ FE-05: BE API 완성과 병렬로 진행 가능 (Day 2 오후)
> - FE-08, FE-09, FE-10, FE-11: 각 화면은 병렬 구현 가능 (BE API 완성 후)

---

## 의존성 맵 (전체)

| Task  | 선행 의존 Task                                                | 설명                                  |
| ----- | ------------------------------------------------------------- | ------------------------------------- |
| DB-01 | 없음                                                          | 최초 시작점                           |
| DB-02 | DB-01                                                         | DB 생성 완료 후 DDL 실행              |
| DB-03 | DB-02                                                         | 테이블 생성 후 인덱스 생성            |
| BE-01 | 없음                                                          | DB와 독립적으로 시작 가능             |
| BE-02 | DB-01, BE-01                                                  | DB와 프로젝트 초기화 완료 후          |
| BE-03 | BE-01                                                         | 프로젝트 구조 생성 후                 |
| BE-04 | BE-01, BE-03                                                  | 유틸 완성 후 JWT 미들웨어 구현        |
| BE-05 | DB-02, DB-03, BE-02, BE-03, BE-04                             | DB 스키마 + 연결 + 공통 모듈 완성 후  |
| BE-06 | BE-05                                                         | 인증 API 완성 후 (JWT 미들웨어 활용)  |
| BE-07 | BE-05                                                         | 인증 API 완성 후                      |
| BE-08 | BE-06, BE-07                                                  | 사용자+카테고리 API 완성 후           |
| BE-09 | BE-03                                                         | 유틸 함수 구현 후 테스트 작성         |
| BE-10 | BE-08                                                         | 전체 BE API 완성 후 수동 검증         |
| FE-01 | 없음                                                          | DB/BE와 독립적으로 시작 가능          |
| FE-02 | FE-01                                                         | 프로젝트 초기화 후                    |
| FE-03 | FE-01, FE-02                                                  | 타입 정의 후 스토어/클라이언트 구현   |
| FE-04 | FE-03                                                         | Axios 클라이언트 완성 후              |
| FE-05 | FE-01                                                         | 프로젝트 초기화 후 공통 컴포넌트 구현 |
| FE-06 | FE-04, FE-05, BE-05                                           | 인증 API + 공통 컴포넌트 완성 후      |
| FE-07 | FE-04, BE-08                                                  | API 함수 + BE 전체 API 완성 후        |
| FE-08 | FE-07, FE-05                                                  | 훅 + 공통 컴포넌트 완성 후            |
| FE-09 | FE-07, FE-05                                                  | 훅 + 공통 컴포넌트 완성 후            |
| FE-10 | FE-07, FE-05                                                  | 훅 + 공통 컴포넌트 완성 후            |
| FE-11 | FE-04, FE-05, BE-06                                           | 사용자 API + 공통 컴포넌트 완성 후    |
| FE-12 | FE-06, FE-08                                                  | 기본 화면 완성 후                     |
| FE-13 | FE-08                                                         | 주요 화면 구현 후                     |
| FE-14 | FE-06, FE-07, FE-08, FE-09, FE-10, FE-11, FE-12, FE-13, BE-10 | 전체 구현 완성 후                     |

---

## Part 1. 데이터베이스 (Database)

---

### DB-01: PostgreSQL 환경 설정

**목표:** 로컬 개발 환경에 PostgreSQL 17을 설치하고 DB 및 사용자를 생성한다.

**관련 문서:** docs/4-prd.md §3.4, docs/6-project-principle.md §5-1

**의존성:** 없음 (최초 시작 Task)

**완료 조건:**

- [x] PostgreSQL 17.x 설치 완료 (`psql --version`으로 확인)
- [x] `todolist_db` 데이터베이스 생성 완료
- [x] `todolist_user` 사용자 생성 및 `todolist_db`에 대한 전체 권한 부여 완료
- [x] `backend/.env` 파일에 DB 접속 정보(DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD) 설정 완료
- [x] `backend/.env.example` 파일 생성 완료 (실제 값 없이 키 목록만)
- [x] `.gitignore`에 `backend/.env` 등록 확인 완료
- [x] `psql -U todolist_user -d todolist_db` 로컬 접속 성공 확인

---

### DB-02: 테이블 DDL 작성 및 실행

**목표:** `users`, `categories`, `todos` 3개 테이블을 ERD 명세에 따라 생성한다.

**관련 문서:** docs/8-erd.md, docs/4-prd.md §7.1

**의존성:** DB-01 완료

**완료 조건:**

- [x] `backend/sql/001_create_tables.sql` 파일 작성 완료
- [x] `users` 테이블 생성 완료
  - [x] `user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
  - [x] `email VARCHAR(255) UNIQUE NOT NULL`
  - [x] `password_hash VARCHAR(255) NOT NULL`
  - [x] `name VARCHAR(50) NOT NULL`
  - [x] `status VARCHAR(20) NOT NULL DEFAULT 'active'` (CHECK: active 또는 withdrawn)
  - [x] `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - [x] `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - [x] `withdrawn_at TIMESTAMPTZ NULL`
- [x] `categories` 테이블 생성 완료
  - [x] `category_id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
  - [x] `user_id UUID NOT NULL REFERENCES users(user_id)`
  - [x] `name VARCHAR(50) NOT NULL`
  - [x] `is_default BOOLEAN NOT NULL`
  - [x] `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- [x] `todos` 테이블 생성 완료
  - [x] `todo_id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
  - [x] `user_id UUID NOT NULL REFERENCES users(user_id)`
  - [x] `category_id UUID NOT NULL REFERENCES categories(category_id)`
  - [x] `title VARCHAR(200) NOT NULL`
  - [x] `description TEXT NULL`
  - [x] `due_date DATE NOT NULL`
  - [x] `is_completed BOOLEAN NOT NULL DEFAULT false`
  - [x] `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - [x] `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- [x] DDL `psql -f sql/001_create_tables.sql` 실행 성공 확인
- [x] `\dt` 명령어로 3개 테이블 존재 확인

---

### DB-03: 인덱스 생성 DDL 작성 및 실행

**목표:** 조회 성능 최적화와 제약 조건을 위한 인덱스를 생성한다.

**관련 문서:** docs/8-erd.md §인덱스 전략, docs/4-prd.md §7.2

**의존성:** DB-02 완료

**완료 조건:**

- [x] `backend/sql/002_create_indexes.sql` 파일 작성 완료
- [x] `users.email` UNIQUE INDEX 생성 완료 (로그인 조회 성능 + 중복 방지)
- [x] `categories(user_id, name)` UNIQUE INDEX 생성 완료 (동일 사용자 내 카테고리명 중복 방지 - BR-03)
- [x] `categories(user_id)` INDEX 생성 완료 (사용자별 카테고리 목록 조회)
- [x] `todos(user_id)` INDEX 생성 완료 (사용자별 할일 목록 조회)
- [x] `todos(user_id, category_id)` INDEX 생성 완료 (카테고리 필터 조회)
- [x] `todos(user_id, due_date)` INDEX 생성 완료 (기간 필터 조회)
- [x] `todos(user_id, is_completed)` INDEX 생성 완료 (완료여부 필터 조회)
- [x] DDL `psql -f sql/002_create_indexes.sql` 실행 성공 확인
- [x] `\di` 명령어로 7개 인덱스 존재 확인

---

## Part 2. 백엔드 (Backend)

---

### BE-01: 백엔드 프로젝트 초기 설정

**목표:** Node.js + Express 프로젝트를 생성하고 docs/6-project-principle.md에 명시된 디렉토리 구조를 세팅한다.

**관련 문서:** docs/6-project-principle.md §6-1, §1-3, §4-4

**의존성:** 없음 (DB-01과 병렬 진행 가능)

**완료 조건:**

- [x] `backend/` 디렉토리 구조 생성 완료 (src/config, middleware, routes, controllers, services, repositories, types, utils, constants, sql, tests)
- [x] `package.json` 생성 및 의존성 설치 완료
  - [x] `express 4.x`
  - [x] `pg 8.x` (ORM 사용 금지, pg 직접 사용 필수)
  - [x] `jsonwebtoken 9.x`
  - [x] `bcrypt 5.x`
  - [x] `cors`
  - [x] `dotenv`
  - [x] `morgan` (개발 환경 로깅)
  - [x] `swagger-ui-express 5.x` (Swagger UI 서빙, 비운영 환경 한정)
  - [x] devDependency: `jest`, `nodemon`, `supertest`
- [x] `src/app.js` 기본 구조 작성 완료 (Express 앱 초기화, 미들웨어 등록 골격)
  - [x] `GET /health` 헬스체크 엔드포인트 포함
  - [x] `GET /api-docs` Swagger UI 마운트 (비운영 환경 한정)
  - [x] 404 핸들러 미들웨어 (등록되지 않은 경로 처리)
- [x] `src/server.js` 작성 완료 (HTTP 서버 listen, DB 연결 테스트 포함)
- [x] `.eslintrc.js` + `.prettierrc` 설정 완료
- [x] `.gitignore` 작성 완료 (node_modules, .env, dist 포함)
- [x] `npm run dev` 로 서버 기동 확인 (`http://localhost:3000` 응답 확인)

---

### BE-02: DB 연결 설정 (pg Pool)

**목표:** pg Pool 단일 인스턴스를 생성하고 환경 변수 필수값 검증 로직을 구현한다.

**관련 문서:** docs/6-project-principle.md §5-1, §5-4, §2-2

**의존성:** DB-01 완료, BE-01 완료

**완료 조건:**

- [x] `src/config/env.js` 작성 완료
  - [x] 필수 환경 변수(DB_HOST, DB_PASSWORD, JWT_SECRET 등) 존재 여부 검증
  - [x] 누락 시 `process.exit(1)` + 오류 메시지 출력
- [x] `src/config/db.js` 작성 완료
  - [x] `pg.Pool` 단일 인스턴스 생성
  - [x] `max`, `idleTimeoutMillis`, `connectionTimeoutMillis` 설정 (환경 변수 기반)
  - [x] Pool 인스턴스 export
- [x] `npm run dev` 기동 시 DB 연결 성공 로그 확인
- [x] `pool.query('SELECT NOW()')` 테스트 쿼리 성공 확인

---

### BE-03: 공통 유틸 및 미들웨어 구현

**목표:** 전체 BE에서 공통으로 사용하는 유틸 함수, 에러 코드 상수, 응답 헬퍼, 미들웨어를 구현한다.

**관련 문서:** docs/6-project-principle.md §3-4, §3-5, §5-3, §5-5, §5-6, §5-7

**의존성:** BE-01 완료

**완료 조건:**

- [x] `src/constants/errorCodes.js` 작성 완료 (PRD 명세 전체 에러 코드 상수 포함)
  - [x] MISSING_REQUIRED_FIELD, DUPLICATE_EMAIL, INVALID_CREDENTIALS, UNAUTHORIZED
  - [x] WRONG_CURRENT_PASSWORD, ALREADY_WITHDRAWN, INVALID_PASSWORD
  - [x] DUPLICATE_CATEGORY_NAME, NAME_TOO_LONG, DEFAULT_CATEGORY_NOT_DELETABLE
  - [x] CATEGORY_HAS_TODOS, CATEGORY_NOT_FOUND
  - [x] INVALID_DUE_DATE, INVALID_TITLE, INVALID_CATEGORY, TODO_NOT_FOUND
  - [x] TODO_ALREADY_COMPLETED (신규: 완료된 할일 수정 불가)
  - [x] INVALID_DATE_FORMAT, INVALID_DATE_RANGE, INTERNAL_SERVER_ERROR
- [x] `src/utils/responseHelper.js` 작성 완료
  - [x] `ok(res, data, status = 200)` 함수 구현
  - [x] `fail(res, code, message, status)` 함수 구현
- [x] `src/utils/passwordUtils.js` 작성 완료
  - [x] `SALT_ROUNDS = 12` 상수 정의
  - [x] `hash(plain)` 함수 구현 (bcrypt)
  - [x] `compare(plain, hashed)` 함수 구현 (bcrypt)
- [x] `src/utils/dateUtils.js` 작성 완료
  - [x] `getTodayKST()` — KST(UTC+9) 기준 오늘 날짜 반환 (YYYY-MM-DD)
  - [x] `isValidDueDate(dateStr)` — 오늘 이상 여부 검증 (당일 허용, BR-07)
  - [x] `isValidDateFormat(dateStr)` — YYYY-MM-DD 형식 검증
  - [x] `isValidDateRange(from, to)` — from ≤ to 검증 (BR-12)
- [x] `src/utils/validators.js` 작성 완료
  - [x] `isValidPassword(password)` — 8자 이상, 영문+숫자 각 1자 이상 (BR-10)
  - [x] `isValidEmail(email)` — 이메일 형식 검증
- [x] `src/middleware/errorHandler.js` 작성 완료 (전역 에러 핸들러, 4-인수 함수)
  - [x] 500 에러 시 스택 트레이스 서버 콘솔 기록, 클라이언트에는 일반 메시지만 반환
- [x] `src/middleware/requestLogger.js` 작성 완료 (개발 환경 전용 morgan 래퍼)
- [x] `src/middleware/cors.js` 작성 완료
  - [x] `CORS_ALLOWED_ORIGINS` 환경 변수 기반 허용 오리진 설정
  - [x] `*` 와일드카드 미사용
- [x] `app.js`에 미들웨어 등록 완료 (`express.json({ limit: '10kb' })` 포함)

---

### BE-04: JWT 인증 미들웨어 구현

**목표:** Bearer JWT 검증 미들웨어를 구현하고 보호 라우트에 적용한다.

**관련 문서:** docs/4-prd.md §3.5, docs/6-project-principle.md §2-1

**의존성:** BE-03 완료

**완료 조건:**

- [x] `src/middleware/authMiddleware.js` 작성 완료
  - [x] `Authorization: Bearer <token>` 헤더 파싱
  - [x] JWT 서명 검증 (`jsonwebtoken.verify`)
  - [x] `status = active` 계정 여부 확인 (탈퇴 계정 접근 차단)
  - [x] 검증 성공 시 `req.user = { user_id, status }` 주입
  - [x] 토큰 없음/만료/무효 시 HTTP 401 + UNAUTHORIZED 에러 코드 반환
- [x] `src/routes/index.js` 작성 완료
  - [x] 공개 라우트 (`/auth`): authMiddleware 미적용
  - [x] 보호 라우트 (`/users`, `/categories`, `/todos`): authMiddleware 적용
- [x] JWT Secret 환경 변수(`JWT_SECRET`) 32자 이상 설정 확인
- [x] JWT 만료 시간(`JWT_EXPIRES_IN = 24h`) 설정 확인

---

### BE-05: 인증 API 구현 (UC-01, UC-02, UC-03)

**목표:** 회원가입(기본 카테고리 트랜잭션 포함), 로그인, 로그아웃 API를 구현한다.

**관련 문서:** docs/4-prd.md §UC-01, UC-02, UC-03, §6.1, docs/6-project-principle.md §2-4

**의존성:** DB-02, DB-03, BE-02, BE-03, BE-04 완료

**완료 조건:**

**Repository 레이어:**

- [x] `src/repositories/userRepository.js` 작성 완료
  - [x] `findByEmail(email)` — 이메일로 사용자 조회
  - [x] `create(client, { email, passwordHash, name })` — 트랜잭션 컨텍스트 지원
  - [x] `findById(userId)` — ID로 사용자 조회
- [x] `src/repositories/categoryRepository.js` 기본 작성 완료
  - [x] `createDefaults(client, userId)` — 기본 카테고리 3개(일반·업무·개인, is_default=true) 일괄 생성

**Service 레이어:**

- [x] `src/services/authService.js` 작성 완료
  - [x] `signup(email, password, name)` — 트랜잭션 처리 (User 생성 + Category 3개 동시 생성, BR-04)
    - [x] 이메일 중복 시 409 (BR-03)
    - [x] 탈퇴 계정 이메일 재가입 불가 (BR-09)
    - [x] 비밀번호 정책 검증 (BR-10)
    - [x] 트랜잭션 실패 시 전체 롤백
  - [x] `login(email, password)` — JWT 발급
    - [x] 이메일 미존재 또는 비밀번호 불일치 시 401
    - [x] 탈퇴 계정(status=withdrawn) 로그인 불가 (BR-09)
    - [x] JWT 페이로드: `{ user_id, status, iat, exp }`
  - [x] `logout()` — 서버 블랙리스트 미운용, 클라이언트 측 처리 안내 응답

**Controller & Route:**

- [x] `src/controllers/authController.js` 작성 완료 (signup, login, logout 핸들러)
- [x] `src/routes/authRoutes.js` 작성 완료
  - [x] `POST /auth/signup` → UC-01
  - [x] `POST /auth/login` → UC-02
  - [x] `POST /auth/logout` (authMiddleware 적용) → UC-03

**API 응답 검증:**

- [x] UC-01 정상: HTTP 201 + `{ success: true, data: { user_id, email, name, created_at } }`
- [x] UC-01 이메일 중복: HTTP 409 + DUPLICATE_EMAIL
- [x] UC-01 비밀번호 정책 위반: HTTP 400 + INVALID_PASSWORD
- [x] UC-02 정상: HTTP 200 + `{ success: true, data: { token, user: {...} } }`
- [x] UC-02 자격증명 불일치: HTTP 401 + INVALID_CREDENTIALS
- [x] UC-03 정상: HTTP 200 + `{ success: true, data: null }`
- [x] DB에 User 레코드 + Category 3개 레코드 생성 확인 (트랜잭션)

---

### BE-06: 사용자 API 구현 (UC-04, UC-05)

**목표:** 개인정보 수정(이름/비밀번호 변경)과 회원 탈퇴(소프트 삭제) API를 구현한다.

**관련 문서:** docs/4-prd.md §UC-04, UC-05, §6.2

**의존성:** BE-05 완료 (JWT 미들웨어 활용)

**완료 조건:**

**Repository 레이어:**

- [x] `userRepository.js` 추가 구현 완료
  - [x] `updateName(userId, name)` — 이름 변경 + updated_at 갱신
  - [x] `updatePassword(userId, passwordHash)` — 비밀번호 변경 + updated_at 갱신
  - [x] `withdraw(userId)` — status=withdrawn, withdrawn_at 현재 일시 설정 (소프트 삭제, BR-09)

**Service 레이어:**

- [x] `src/services/userService.js` 작성 완료
  - [x] `updateMe(userId, { name, currentPassword, newPassword })` 구현
    - [x] 이름 50자 초과 시 400 (BR-10)
    - [x] 비밀번호 변경 시 현재 비밀번호 일치 여부 확인 (HTTP 401)
    - [x] 신규 비밀번호 정책 검증 (BR-10)
  - [x] `deleteMe(userId)` 구현
    - [x] status=withdrawn 변경, withdrawn_at 기록 (BR-09)

**Controller & Route:**

- [x] `src/controllers/userController.js` 작성 완료 (updateMe, deleteMe 핸들러)
- [x] `src/routes/userRoutes.js` 작성 완료
  - [x] `PATCH /users/me` (authMiddleware) → UC-04
  - [x] `DELETE /users/me` (authMiddleware) → UC-05

**API 응답 검증:**

- [x] UC-04 이름 변경 정상: HTTP 200 + 수정된 사용자 정보
- [x] UC-04 현재 비밀번호 불일치: HTTP 401 + WRONG_CURRENT_PASSWORD
- [x] UC-04 신규 비밀번호 정책 위반: HTTP 400 + INVALID_PASSWORD
- [x] UC-05 정상: HTTP 200 + `{ success: true, data: null }` + DB status=withdrawn 확인
- [x] 탈퇴 후 해당 JWT로 보호 API 접근 시 401 반환 확인

---

### BE-07: 카테고리 API 구현 (GET /categories, UC-06, UC-07)

**목표:** 카테고리 목록 조회, 추가, 삭제 API를 구현한다.

**관련 문서:** docs/4-prd.md §UC-06, UC-07, §6.3

**의존성:** BE-05 완료

**완료 조건:**

**Repository 레이어:**

- [x] `categoryRepository.js` 추가 구현 완료
  - [x] `findAllByUserId(userId)` — 사용자 카테고리 전체 조회
  - [x] `findById(categoryId, userId)` — 소유권 포함 카테고리 조회 (타인 소유 → null)
  - [x] `create(userId, name)` — 사용자 정의 카테고리 생성 (is_default=false)
  - [x] `deleteById(categoryId)` — 카테고리 삭제
  - [x] `hasTodos(categoryId)` — 연결된 할일 존재 여부 확인 (BR-06)

**Service 레이어:**

- [x] `src/services/categoryService.js` 작성 완료
  - [x] `getCategories(userId)` — 사용자 카테고리 목록 반환
  - [x] `createCategory(userId, name)` 구현
    - [x] 이름 50자 초과 시 400
    - [x] 동일 사용자 내 이름 중복 시 409 (BR, UNIQUE INDEX 활용)
  - [x] `deleteCategory(userId, categoryId)` 구현
    - [x] 소유권 확인 (타인 소유 → 404, BR-02)
    - [x] 기본 카테고리(is_default=true) 삭제 불가 → 400 (BR-05)
    - [x] 연결된 할일 존재 시 삭제 불가 → 409 (BR-06)

**Controller & Route:**

- [x] `src/controllers/categoryController.js` 작성 완료 (getCategories, createCategory, deleteCategory)
- [x] `src/routes/categoryRoutes.js` 작성 완료
  - [x] `GET /categories` → 카테고리 목록 조회
  - [x] `POST /categories` → UC-06
  - [x] `DELETE /categories/:categoryId` → UC-07

**API 응답 검증:**

- [x] GET /categories 정상: HTTP 200 + 카테고리 배열
- [x] UC-06 정상: HTTP 201 + `{ category_id, name, is_default: false, created_at }`
- [x] UC-06 이름 중복: HTTP 409 + DUPLICATE_CATEGORY_NAME
- [x] UC-07 정상: HTTP 204 (No Content)
- [x] UC-07 기본 카테고리 삭제 시도: HTTP 400 + DEFAULT_CATEGORY_NOT_DELETABLE
- [x] UC-07 할일 연결된 카테고리 삭제 시도: HTTP 409 + CATEGORY_HAS_TODOS
- [x] UC-07 타인 소유 카테고리: HTTP 404 + CATEGORY_NOT_FOUND

---

### BE-08: 할일 API 구현 (UC-08 ~ UC-12)

**목표:** 할일 등록, 수정, 삭제, 완료 토글, 목록 조회(필터) API를 구현한다.

**관련 문서:** docs/4-prd.md §UC-08 ~ UC-12, §6.4

**의존성:** BE-06, BE-07 완료

**완료 조건:**

**Repository 레이어:**

- [x] `src/repositories/todoRepository.js` 작성 완료
  - [x] `create(userId, { title, categoryId, dueDate, description })` — 할일 생성
  - [x] `findById(todoId, userId)` — 소유권 포함 조회 (타인 소유 → null)
  - [x] `findAllByUserId(userId, filters)` — 필터 기반 목록 조회 (AND 조건)
    - [x] `category_id` 필터 지원
    - [x] `due_date_from`, `due_date_to` 기간 필터 지원
    - [x] `is_completed` 필터 지원 (생략 시 전체)
  - [x] `update(todoId, fields)` — 변경 필드만 업데이트 + updated_at 갱신
  - [x] `deleteById(todoId)` — 영구 삭제 (하드 삭제)
  - [x] `toggleCompleted(todoId, currentValue)` — is_completed 반전 + updated_at 갱신

**Service 레이어:**

- [x] `src/services/todoService.js` 작성 완료
  - [x] `createTodo(userId, { title, categoryId, dueDate, description })` 구현
    - [x] KST 기준 due_date 유효성 검증 (BR-07)
    - [x] 카테고리 소유권 및 유효성 확인 (BR-02)
  - [x] `updateTodo(userId, todoId, fields)` 구현
    - [x] 소유권 확인 (404, BR-02)
    - [x] **완료된 할일(is_completed=true) 수정 불가 (400 TODO_ALREADY_COMPLETED, BR-11)**
    - [x] due_date 변경 시 KST 기준 유효성 검증 (BR-07)
    - [x] 카테고리 변경 시 소유권 확인
  - [x] `deleteTodo(userId, todoId)` 구현 (소유권 확인 후 삭제)
  - [x] `toggleTodo(userId, todoId)` 구현 (BR-08: 완료 취소 가능)
  - [x] `getTodos(userId, filters)` 구현
    - [x] 날짜 형식 검증 (INVALID_DATE_FORMAT)
    - [x] 날짜 범위 검증 (INVALID_DATE_RANGE)
    - [x] 결과 없을 시 빈 배열 반환 (HTTP 200)

**Controller & Route:**

- [x] `src/controllers/todoController.js` 작성 완료 (getTodos, createTodo, updateTodo, deleteTodo, toggleTodo)
- [x] `src/routes/todoRoutes.js` 작성 완료
  - [x] `GET /todos` → UC-12
  - [x] `POST /todos` → UC-08
  - [x] `PATCH /todos/:todoId` → UC-09
  - [x] `DELETE /todos/:todoId` → UC-10
  - [x] `PATCH /todos/:todoId/toggle` → UC-11

**API 응답 검증:**

- [x] UC-08 정상: HTTP 201 + todo 전체 필드 반환 (is_completed=false)
- [x] UC-08 과거 due_date: HTTP 400 + INVALID_DUE_DATE
- [x] UC-09 정상: HTTP 200 + 수정된 todo 전체 반환
- [x] UC-09 타인 소유: HTTP 404 + TODO_NOT_FOUND
- [x] UC-10 정상: HTTP 204 (No Content)
- [x] UC-11 정상: HTTP 200 + `{ todo_id, is_completed: true/false, updated_at }`
- [x] UC-12 필터 없음: HTTP 200 + 전체 할일 배열
- [x] UC-12 복합 필터: HTTP 200 + AND 조건 적용 결과
- [x] UC-12 결과 없음: HTTP 200 + `{ success: true, data: [] }`
- [x] UC-12 날짜 형식 오류: HTTP 400 + INVALID_DATE_FORMAT

---

### BE-09: 핵심 비즈니스 로직 단위 테스트

**목표:** 보안 및 데이터 무결성에 직결되는 유틸 함수의 경계값 단위 테스트를 작성한다.

**관련 문서:** docs/6-project-principle.md §4-1, §4-3

**의존성:** BE-03 완료

**완료 조건:**

- [x] Jest 설정 완료 (`package.json` scripts에 `test --coverage` 추가)
- [x] `tests/dateUtils.test.js` 작성 완료
  - [x] 오늘 날짜 허용 (`isValidDueDate` → true)
  - [x] 어제 날짜 거부 (`isValidDueDate` → false)
  - [x] 내일 날짜 허용 (`isValidDueDate` → true)
  - [x] 잘못된 날짜 형식 거부 (`isValidDateFormat` → false)
  - [x] `due_date_from > due_date_to` 거부 (`isValidDateRange` → false)
  - [x] KST 기준 처리 (UTC+9 오프셋) 확인
- [x] `tests/validators.test.js` 작성 완료
  - [x] 7자 비밀번호 거부
  - [x] 정확히 8자(영문+숫자) 허용
  - [x] 영문 없는 비밀번호 거부
  - [x] 숫자 없는 비밀번호 거부
  - [x] 8자 이상 영문+숫자 포함 허용
- [x] `tests/passwordUtils.test.js` 작성 완료
  - [x] hash() 평문 비밀번호 해시 확인
  - [x] compare() 일치/불일치 케이스 확인
- [x] `tests/auth.test.js` 작성 완료 (인증 API 단위 테스트)
- [x] `tests/user.test.js` 작성 완료 (사용자 API 단위 테스트)
- [x] `tests/category.test.js` 작성 완료 (카테고리 API 단위 테스트)
- [x] `tests/todo.test.js` 작성 완료 (할일 API 단위 테스트)
- [x] `tests/authMiddleware.test.js` 작성 완료 (JWT 미들웨어 단위 테스트)
- [x] `tests/responseHelper.test.js` 작성 완료 (응답 헬퍼 단위 테스트)
- [x] `tests/config.test.js` 작성 완료 (설정 모듈 단위 테스트)
- [x] `tests/app.test.js` 작성 완료 (앱 초기화 단위 테스트)
- [x] `npm test` 실행 시 전체 테스트 통과 확인 (src/utils 커버리지 100% 달성)

---

### BE-10: 백엔드 전체 API 수동 검증 (Postman/Thunder Client)

**목표:** UC-01 ~ UC-12 전체 API의 정상 케이스와 주요 실패 케이스를 수동 검증한다.

**관련 문서:** docs/6-project-principle.md §4-2

**의존성:** BE-08 완료

**완료 조건:**

- [x] Postman/Thunder Client 시나리오를 대체하는 통합 테스트(`tests/integration.test.js`) 작성 완료
- [x] UC-01 회원가입 정상/이메일 중복/비밀번호 위반 검증 완료
- [x] UC-02 로그인 정상/자격증명 불일치/탈퇴 계정 검증 완료
- [x] UC-03 로그아웃 정상/만료 토큰 검증 완료
- [x] UC-04 이름 변경/비밀번호 변경/현재 비밀번호 불일치 검증 완료
- [x] UC-05 회원 탈퇴 정상/탈퇴 후 접근 차단 검증 완료
- [x] GET /categories 정상 (기본 카테고리 3개 포함) 검증 완료
- [x] UC-06 카테고리 추가 정상/이름 중복 검증 완료
- [x] UC-07 카테고리 삭제 정상/기본 카테고리/연결된 할일 검증 완료
- [x] UC-08 할일 등록 정상/과거 날짜/제목 미입력 검증 완료
- [x] UC-09 할일 수정 정상/타인 소유 접근/완료된 할일 수정 불가 검증 완료
- [x] UC-10 할일 삭제 정상 검증 완료
- [x] UC-11 완료 토글 정상/완료 취소 검증 완료
- [x] UC-12 필터 없음/단일 필터/복합 필터/결과 없음 검증 완료
- [x] 미인증 요청(Authorization 헤더 없음) → HTTP 401 검증 완료
- [x] 타인 소유 리소스 접근 → HTTP 404 (정보 노출 방지) 검증 완료
- [x] 전체 백엔드 테스트 커버리지 90% 이상 달성 및 125개 테스트 케이스 통과 확인

---

## Part 3. 프론트엔드 (Frontend)

---

### FE-01: 프론트엔드 프로젝트 초기 설정

**목표:** React 19 + TypeScript + Vite 6 프로젝트를 생성하고 디렉토리 구조를 세팅한다.

**관련 문서:** docs/6-project-principle.md §6-2, §4-4, docs/4-prd.md §3.2

**의존성:** 없음 (BE와 병렬 진행 가능)

**완료 조건:**

- [x] `npm create vite@latest frontend -- --template react-ts` 실행 완료
- [x] 의존성 설치 완료
  - [x] `react 19.x`, `react-dom 19.x`
  - [x] `typescript 5.x`
  - [x] `zustand 5.x`
  - [x] `@tanstack/react-query 5.x`
  - [x] `axios`
  - [x] `react-router-dom 6.x`
- [x] 디렉토리 구조 생성 완료 (src/api, components/common, components/layout, components/todo, components/category, pages, hooks, stores, types, utils, constants)
- [x] `vite.config.ts` 작성 완료 (개발 환경 API 프록시: `/api` → `http://localhost:3000`)
- [x] `tsconfig.json` 설정 완료 (strict 모드 활성화)
- [x] `.eslintrc.js` + `.prettierrc` 설정 완료
- [x] `frontend/.env` 및 `frontend/.env.example` 작성 완료 (`VITE_API_BASE_URL`)
- [x] `npm run dev` 실행 시 브라우저에서 기본 화면 확인

---

### FE-02: 공통 타입 및 에러 코드 상수 정의

**목표:** API 응답 타입, 도메인 타입, 에러 코드 상수를 정의한다.

**관련 문서:** docs/6-project-principle.md §3-6, §3-5

**의존성:** FE-01 완료

**완료 조건:**

- [x] `src/types/api.types.ts` 작성 완료
  - [x] `ApiResponse<T>`: `{ success: boolean; data: T }`
  - [x] `ApiError`: `{ success: false; error: { code: string; message: string } }`
- [x] `src/types/auth.types.ts` 작성 완료 (LoginRequest, SignupRequest, AuthState)
- [x] `src/types/user.types.ts` 작성 완료 (User, UpdateUserRequest)
- [x] `src/types/todo.types.ts` 작성 완료 (Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilter)
- [x] `src/types/category.types.ts` 작성 완료 (Category, CreateCategoryRequest)
- [x] `src/constants/errorCodes.ts` 작성 완료 (BE errorCodes.js와 동기화)
- [x] TypeScript 컴파일 에러 없음 확인

---

### FE-03: Zustand 인증 스토어 + Axios 클라이언트 구현

**목표:** JWT를 메모리에만 저장하는 인증 스토어와 공통 인터셉터가 적용된 Axios 클라이언트를 구현한다.

**관련 문서:** docs/6-project-principle.md §2-6, §2-7, docs/4-prd.md §3.5

**의존성:** FE-01, FE-02 완료

**완료 조건:**

- [x] `src/stores/authStore.ts` 작성 완료
  - [x] `token`, `user`, `isLoggedIn` 상태 정의
  - [x] `login(token, user)` 액션 구현
  - [x] `logout()` 액션 구현
  - [x] `persist` 미들웨어 미사용 (메모리에만 저장, localStorage/Cookie 미사용)
- [x] `src/api/client.ts` 작성 완료
  - [x] Axios 인스턴스 생성 (`baseURL: VITE_API_BASE_URL`, `timeout: 10000`)
  - [x] Request 인터셉터: Zustand authStore에서 token 읽어 `Authorization: Bearer <token>` 자동 첨부
  - [x] Response 인터셉터: HTTP 401 수신 시 authStore 초기화 + `/login` 리다이렉트
  - [x] 기타 에러 표준 형식으로 가공하여 throw
- [x] `src/hooks/useAuth.ts` 작성 완료 (authStore 접근 편의 훅)
- [x] `src/main.tsx`에 `QueryClientProvider` + `RouterProvider` 설정 완료

---

### FE-04: API 클라이언트 함수 구현 (엔드포인트별)

**목표:** 각 도메인별 API 호출 함수를 구현한다. BE API 완성 전에는 타입과 함수 시그니처만 작성해도 무방하다.

**관련 문서:** docs/6-project-principle.md §2-7, docs/4-prd.md §6

**의존성:** FE-03 완료

**완료 조건:**

- [x] `src/api/authApi.ts` 작성 완료
  - [x] `signup(data: SignupRequest)` → POST /auth/signup
  - [x] `login(data: LoginRequest)` → POST /auth/login
  - [x] `logout()` → POST /auth/logout
- [x] `src/api/userApi.ts` 작성 완료
  - [x] `updateMe(data: UpdateUserRequest)` → PATCH /users/me
  - [x] `deleteMe()` → DELETE /users/me
- [x] `src/api/categoryApi.ts` 작성 완료
  - [x] `getCategories()` → GET /categories
  - [x] `createCategory(name: string)` → POST /categories
  - [x] `deleteCategory(categoryId: string)` → DELETE /categories/:categoryId
- [x] `src/api/todoApi.ts` 작성 완료
  - [x] `getTodos(filters?: TodoFilter)` → GET /todos
  - [x] `createTodo(data: CreateTodoRequest)` → POST /todos
  - [x] `updateTodo(todoId: string, data: UpdateTodoRequest)` → PATCH /todos/:todoId
  - [x] `deleteTodo(todoId: string)` → DELETE /todos/:todoId
  - [x] `toggleTodo(todoId: string)` → PATCH /todos/:todoId/toggle
- [x] 각 함수에서 `response.data.data` 추출 후 반환 (ApiResponse 언래핑)
- [x] TypeScript 컴파일 에러 없음 확인

---

### FE-05: 공통 컴포넌트 구현

**목표:** 전체 화면에서 재사용되는 공통 UI 컴포넌트와 레이아웃을 구현한다.

**관련 문서:** docs/6-project-principle.md §6-2, docs/4-prd.md §8.3, §8.2

**의존성:** FE-01 완료

**완료 조건:**

- [x] `src/components/common/Button.tsx` 구현 완료 (variant: primary, danger, ghost; disabled 상태 지원)
- [x] `src/components/common/Input.tsx` 구현 완료 (label, errorMessage 인라인 표시 지원)
- [x] `src/components/common/Modal.tsx` 구현 완료 (확인/취소 버튼, 메시지 prop 지원)
- [x] `src/components/common/Toast.tsx` 구현 완료 (네트워크 오류 등 알림 메시지, 자동 사라짐)
- [x] `src/components/common/LoadingSpinner.tsx` 구현 완료
- [x] `src/components/layout/Header.tsx` 구현 완료 (사용자 이름 표시, 로그아웃 버튼)
- [x] `src/components/layout/Sidebar.tsx` 구현 완료 (카테고리 목록, 데스크탑 고정)
- [x] `src/components/layout/Layout.tsx` 구현 완료 (Header + Sidebar + 콘텐츠 영역 조립)
- [x] `src/App.tsx` 라우팅 설정 완료
  - [x] 공개 라우트: `/login`, `/signup`
  - [x] 보호 라우트 (미인증 시 `/login` 리다이렉트): `/`, `/todos`, `/todos/new`, `/todos/:id/edit`, `/categories`, `/settings`

---

### FE-06: 인증 화면 구현 (UC-01, UC-02, UC-03)

**목표:** 회원가입, 로그인 화면을 구현하고 BE 인증 API와 연동한다.

**관련 문서:** docs/4-prd.md §8.1, §8.3, docs/5-user-scenario.md §UC-01, UC-02, UC-03

**의존성:** FE-04, FE-05, BE-05 완료

**완료 조건:**

- [x] `src/pages/SignupPage.tsx` 구현 완료
  - [x] 이메일, 비밀번호, 이름 입력 폼
  - [x] 클라이언트 사이드 유효성 검사 (필수 입력, 비밀번호 정책, 이름 50자)
  - [x] 제출 시 authApi.signup 호출
  - [x] 성공 시 `/login`으로 이동 + 안내 메시지
  - [x] 이메일 중복(409) → 이메일 필드 인라인 에러 표시
  - [x] 비밀번호 정책 위반(400) → 비밀번호 필드 인라인 에러 표시
- [x] `src/pages/LoginPage.tsx` 구현 완료
  - [x] 이메일, 비밀번호 입력 폼
  - [x] 제출 시 authApi.login 호출
  - [x] 성공 시 Zustand authStore에 token/user 저장 → `/todos`로 이동
  - [x] 자격증명 불일치(401) → 폼 상단 에러 메시지 표시
  - [x] JWT는 Zustand 메모리에만 저장 (localStorage 미사용)
- [x] 로그아웃 기능 구현 (Header의 로그아웃 버튼)
  - [x] authApi.logout 호출 후 authStore 초기화
  - [x] queryClient.clear() 호출
  - [x] `/login`으로 이동
- [x] 새로고침 시 인증 상태 초기화 → `/login`으로 이동 동작 확인

---

### FE-07: 서버 상태 훅 구현 (TanStack Query)

**목표:** 할일 및 카테고리 관련 TanStack Query 훅을 구현한다.

**관련 문서:** docs/6-project-principle.md §2-6, §6-2

**의존성:** FE-04, BE-08 완료

**완료 조건:**

- [x] `src/hooks/useTodos.ts` 구현 완료 (`useQuery`, filters 파라미터 지원)
- [x] `src/hooks/useCreateTodo.ts` 구현 완료 (`useMutation`, 성공 시 todos 쿼리 무효화)
- [x] `src/hooks/useUpdateTodo.ts` 구현 완료 (`useMutation`, 성공 시 todos 쿼리 무효화)
- [x] `src/hooks/useDeleteTodo.ts` 구현 완료 (`useMutation`, 성공 시 todos 쿼리 무효화)
- [x] `src/hooks/useToggleTodo.ts` 구현 완료 (`useMutation`, 성공 시 todos 쿼리 무효화)
- [x] `src/hooks/useCategories.ts` 구현 완료 (`useQuery`)
- [x] `src/hooks/useCreateCategory.ts` 구현 완료 (`useMutation`, 성공 시 categories 쿼리 무효화)
- [x] `src/hooks/useDeleteCategory.ts` 구현 완료 (`useMutation`, 성공 시 categories 쿼리 무효화)
- [x] 로딩/에러 상태 반환 확인 (각 훅에서 `isLoading`, `error` 노출)
- [x] 401 응답 시 Axios 인터셉터에 의해 자동 로그아웃 + 리다이렉트 동작 확인

---

### FE-08: 할일 목록 화면 구현 (UC-12, UC-11, UC-10)

**목표:** 할일 목록 메인 화면을 구현한다. 필터링, 완료 토글, 삭제 기능을 포함한다.

**관련 문서:** docs/4-prd.md §8.1, §8.4, docs/5-user-scenario.md §UC-10, UC-11, UC-12

**의존성:** FE-07, FE-05 완료

**완료 조건:**

- [x] `src/components/todo/TodoFilter.tsx` 구현 완료
  - [x] 카테고리 선택 (useCategories 훅 사용)
  - [x] 기간 시작/종료 날짜 입력
  - [x] 완료 여부 선택 (전체/완료/미완료)
  - [x] 필터 적용 시 useTodos 쿼리 파라미터 갱신 (실시간 반영)
  - [x] 시작일 > 종료일 시 인라인 에러 메시지 표시
- [x] `src/components/todo/TodoItem.tsx` 구현 완료
  - [x] 완료 체크박스 (클릭 시 useToggleTodo 호출, 즉시 시각적 반영)
  - [x] 완료 시 제목 취소선 표시
  - [x] 수정 버튼 → `/todos/:id/edit` 이동
  - [x] 삭제 버튼 → 확인 Modal 표시 후 useDeleteTodo 호출
- [x] `src/components/todo/TodoList.tsx` 구현 완료
  - [x] useTodos 로딩 시 LoadingSpinner 표시
  - [x] 결과 없을 때 "조건에 맞는 할일이 없습니다." 빈 상태 메시지
- [x] `src/pages/TodoListPage.tsx` 구현 완료
  - [x] TodoFilter + TodoList 조합
  - [x] 할일 삭제 확인 다이얼로그 (Modal 컴포넌트 사용, BR-10)
  - [x] "새 할일" 버튼 → `/todos/new` 이동

---

### FE-09: 할일 등록/수정 화면 구현 (UC-08, UC-09)

**목표:** 할일 등록 및 수정 폼 화면을 구현한다.

**관련 문서:** docs/4-prd.md §8.1, docs/5-user-scenario.md §UC-08, UC-09

**의존성:** FE-07, FE-05 완료

**완료 조건:**

- [x] `src/components/todo/TodoForm.tsx` 구현 완료 (등록/수정 공통 폼)
  - [x] 제목 입력 (필수, 200자 제한)
  - [x] 카테고리 선택 드롭다운 (useCategories)
  - [x] 마감일 날짜 입력 (오늘 이상, 날짜 선택기)
  - [x] 설명 입력 (선택)
  - [x] 클라이언트 사이드 유효성 검사 (필수 필드, 날짜 오늘 이상)
- [x] `src/pages/TodoCreatePage.tsx` 구현 완료 (`/todos/new`)
  - [x] TodoForm을 사용하여 useCreateTodo 호출
  - [x] 성공 시 `/todos`으로 이동
  - [x] 과거 날짜 선택 시 인라인 에러 표시
  - [x] 제목 미입력 시 인라인 에러 표시
- [x] `src/pages/TodoEditPage.tsx` 구현 완료 (`/todos/:id/edit`)
  - [x] 기존 값 폼에 사전 입력 (getTodoById API 활용)
  - [x] TodoForm을 사용하여 useUpdateTodo 호출
  - [x] 성공 시 `/todos`으로 이동
  - [x] HTTP 404 시 목록으로 이동 + 안내 메시지

---

### FE-10: 카테고리 관리 화면 구현 (UC-06, UC-07)

**목표:** 카테고리 목록 조회, 추가, 삭제 화면을 구현한다.

**관련 문서:** docs/4-prd.md §8.1, docs/5-user-scenario.md §UC-06, UC-07

**의존성:** FE-07, FE-05 완료

**완료 조건:**

- [x] `src/components/category/CategoryItem.tsx` 구현 완료
  - [x] 카테고리 이름 및 기본 카테고리 여부 표시 (is_default 배지)
  - [x] 기본 카테고리: 삭제 버튼 비활성화 표시 (BR-05)
  - [x] 사용자 정의 카테고리: 삭제 버튼 활성화 (클릭 시 useDeleteCategory 호출)
  - [x] 할일 연결된 카테고리 삭제 시도 → 에러 메시지 표시 (409 CATEGORY_HAS_TODOS)
- [x] `src/components/category/CategoryForm.tsx` 구현 완료
  - [x] 카테고리 이름 입력 + "추가" 버튼
  - [x] 이름 미입력 시 인라인 에러
  - [x] 이름 중복(409) → 인라인 에러 "이미 존재하는 카테고리 이름입니다."
- [x] `src/pages/CategoryPage.tsx` 구현 완료 (`/categories`)
  - [x] 카테고리 목록 (useCategories)
  - [x] 카테고리 추가 폼 (useCreateCategory)
  - [x] 카테고리 삭제 (useDeleteCategory)

---

### FE-11: 내 정보/회원 탈퇴 화면 구현 (UC-04, UC-05)

**목표:** 이름 변경, 비밀번호 변경, 회원 탈퇴 화면을 구현한다.

**관련 문서:** docs/4-prd.md §8.1, §8.4, docs/5-user-scenario.md §UC-04, UC-05

**의존성:** FE-04, FE-05, BE-06 완료

**완료 조건:**

- [x] `src/pages/SettingsPage.tsx` 구현 완료 (`/settings`)
  - [x] **이름 변경 섹션**
    - [x] 현재 이름 표시 + 수정 입력 폼
    - [x] 50자 초과 시 인라인 에러
    - [x] 성공 시 authStore의 user.name 갱신 + 성공 메시지
  - [x] **비밀번호 변경 섹션**
    - [x] 현재 비밀번호 + 새 비밀번호 입력
    - [x] 현재 비밀번호 불일치(401) → 인라인 에러
    - [x] 신규 비밀번호 정책 위반(400) → 인라인 에러
    - [x] 성공 시 성공 메시지 표시
  - [x] **회원 탈퇴 섹션**
    - [x] "회원 탈퇴" 버튼 클릭 시 확인 Modal 표시
    - [x] Modal: "탈퇴 후에는 동일한 이메일로 재가입이 불가합니다." 안내
    - [x] "탈퇴 확인" 클릭 시 userApi.deleteMe 호출
    - [x] 성공 시 authStore 초기화 + queryClient.clear() + `/login` 이동

---

### FE-12: 에러 처리 UX 구현

**목표:** 네트워크 오류, API 오류, 401 자동 리다이렉트 등 전체 에러 처리 UX를 구현한다.

**관련 문서:** docs/4-prd.md §8.3, docs/3-domain-definition.md §10

**의존성:** FE-06, FE-08 완료

**완료 조건:**

- [x] 네트워크 오류 감지 시 Toast 표시 ("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.")
  - [x] 현재 입력 중인 폼 데이터 초기화 동작 확인 (BR-NFR-03)
- [x] 401 응답 시 자동 로그아웃 + `/login` 리다이렉트 동작 확인 (Axios 인터셉터)
- [x] 404 응답 시 "해당 항목을 찾을 수 없습니다." 안내 후 목록으로 이동
- [x] 500 응답 시 "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." Toast 표시
- [x] 폼 유효성 실패 시 해당 필드 인라인 에러 메시지 표시 (필드 근처)
- [x] API 오류(400, 409) 시 서버 반환 메시지를 폼 상단 또는 해당 필드에 표시
- [x] TanStack Query의 `onError` 콜백으로 에러 처리 통일

---

### FE-13: 반응형 레이아웃 적용

**목표:** 모바일(320px), 태블릿(768px), 데스크탑(1024px) 반응형 레이아웃을 적용한다.

**관련 문서:** docs/4-prd.md §8.2, §5.5

**의존성:** FE-08 완료 (주요 화면 구현 후)

**완료 조건:**

- [x] 모바일(320px~767px): 단일 컬럼, 햄버거 메뉴(사이드바 숨김) 레이아웃 적용
- [x] 태블릿(768px~1023px): 2컬럼 또는 단일 컬럼 레이아웃 적용
- [x] 데스크탑(1024px+): 고정 사이드바 + 콘텐츠 2컬럼 레이아웃 적용
- [x] 최소 지원 브라우저(Chrome, Firefox, Safari, Edge 최신) 각각에서 주요 화면 렌더링 확인
- [x] 폼 입력 필드, 버튼 등이 모바일에서 터치 조작 가능한 크기로 표시 확인
- [x] 할일 목록의 필터 패널이 모바일에서도 사용 가능한 형태로 표시 확인

---

### FE-14: E2E 통합 테스트 (전체 시나리오 검증)

**목표:** UC-01 ~ UC-12 전체 시나리오를 브라우저 수동 검증으로 확인한다.

**관련 문서:** docs/5-user-scenario.md (전체), docs/4-prd.md §9

**의존성:** FE-06, FE-07, FE-08, FE-09, FE-10, FE-11, FE-12, FE-13, BE-10 완료

**완료 조건:**

**골든 패스 시나리오 검증:**

- [x] 회원가입(UC-01) → 로그인(UC-02) → 할일 목록 화면 이동 전체 흐름 확인
- [x] 카테고리 추가(UC-06) → 할일 등록(UC-08, 해당 카테고리 선택) 흐름 확인
- [x] 할일 수정(UC-09) → 마감일/제목 변경 → 목록 반영 확인
- [x] 할일 완료 체크(UC-11) → 취소선 표시 → 완료 취소 → 원상 복구 확인
- [x] 할일 삭제(UC-10) → 확인 Modal → 삭제 완료 확인
- [x] 카테고리/기간/완료여부 필터 복합 적용(UC-12) → AND 조건 결과 확인
- [x] 개인정보 수정(UC-04) → 이름 변경 → Header 이름 즉시 반영 확인
- [x] 로그아웃(UC-03) → 인증 상태 초기화 → 보호 라우트 접근 시 `/login` 리다이렉트 확인
- [x] 회원 탈퇴(UC-05) → 확인 Modal → 탈퇴 완료 → 동일 이메일 재로그인 불가 확인

**엣지 케이스 검증:**

- [x] 새로고침 시 인증 상태 초기화 → 재로그인 유도 확인
- [x] 만료된 JWT(또는 임의 변조 토큰)로 API 호출 → 401 → 자동 로그아웃 확인
- [x] 기본 카테고리 삭제 시도 → 에러 메시지 표시, 삭제 버튼 비활성화 확인
- [x] 할일 있는 카테고리 삭제 시도 → 에러 메시지 표시 확인
- [x] 과거 날짜 마감일 입력 → 인라인 에러 표시 확인
- [x] 네트워크 차단 상태에서 API 호출 → Toast 오류 메시지 + 폼 초기화 확인
- [x] 모바일 화면(320px)에서 주요 화면 UI 깨짐 없음 확인

---

## 전체 Task 진행 현황 체크리스트

### 데이터베이스

- [x] DB-01: PostgreSQL 환경 설정
- [x] DB-02: 테이블 DDL 작성 및 실행
- [x] DB-03: 인덱스 생성 DDL 작성 및 실행

### 백엔드

- [x] BE-01: 백엔드 프로젝트 초기 설정
- [x] BE-02: DB 연결 설정 (pg Pool)
- [x] BE-03: 공통 유틸 및 미들웨어 구현
- [x] BE-04: JWT 인증 미들웨어 구현
- [x] BE-05: 인증 API 구현 (UC-01, UC-02, UC-03)
- [x] BE-06: 사용자 API 구현 (UC-04, UC-05)
- [x] BE-07: 카테고리 API 구현 (GET, UC-06, UC-07)
- [x] BE-08: 할일 API 구현 (UC-08 ~ UC-12)
- [x] BE-09: 핵심 비즈니스 로직 단위 테스트
- [x] BE-10: 백엔드 전체 API 수동 검증

### 프론트엔드

- [x] FE-01: 프론트엔드 프로젝트 초기 설정
- [x] FE-02: 공통 타입 및 에러 코드 상수 정의
- [x] FE-03: Zustand 인증 스토어 + Axios 클라이언트 구현
- [x] FE-04: API 클라이언트 함수 구현
- [x] FE-05: 공통 컴포넌트 구현
- [x] FE-06: 인증 화면 구현 (UC-01, UC-02, UC-03)
- [x] FE-07: 서버 상태 훅 구현 (TanStack Query)
- [x] FE-08: 할일 목록 화면 구현 (UC-12, UC-11, UC-10)
- [x] FE-09: 할일 등록/수정 화면 구현 (UC-08, UC-09) — 완료된 할일 진입 시 토스트 + 리다이렉트 구현
- [x] FE-10: 카테고리 관리 화면 구현 (UC-06, UC-07)
- [x] FE-11: 내 정보/회원 탈퇴 화면 구현 (UC-04, UC-05)
- [x] FE-12: 에러 처리 UX 구현
- [x] FE-13: 반응형 레이아웃 적용
- [x] FE-14: E2E 통합 테스트

---

## 3일 일정별 Task 배치 권장안

### Day 1 (오전~오후)

| 시간대    | Task                                                    |
| --------- | ------------------------------------------------------- |
| 오전      | **DB-01** PostgreSQL 환경 설정                          |
| 오전      | **BE-01** 백엔드 프로젝트 초기 설정 (DB-01과 병렬)      |
| 오전      | **DB-02** 테이블 DDL 작성 및 실행                       |
| 오전      | **DB-03** 인덱스 생성 DDL                               |
| 오전      | **BE-02** DB 연결 설정 (pg Pool)                        |
| 오후      | **BE-03** 공통 유틸 및 미들웨어 구현                    |
| 오후      | **BE-04** JWT 인증 미들웨어 구현                        |
| 오후~저녁 | **BE-05** 인증 API 구현 (UC-01~03)                      |
| 저녁      | **BE-06** 사용자 API 구현 (UC-04~05)                    |
| 저녁      | **BE-09** 핵심 비즈니스 로직 단위 테스트 (BE-03과 병렬) |

**Day 1 완료 기준:** UC-01 ~ UC-05 API 정상 동작, JWT 미들웨어 적용 완료

---

### Day 2 (오전~오후)

| 시간대 | Task                                                   |
| ------ | ------------------------------------------------------ |
| 오전   | **BE-07** 카테고리 API 구현 (UC-06~07)                 |
| 오전   | **BE-08** 할일 API 구현 (UC-08~12)                     |
| 오후   | **BE-10** 백엔드 전체 API 수동 검증 (Postman)          |
| 오후   | **FE-01** 프론트엔드 프로젝트 초기 설정 (BE-08과 병렬) |
| 오후   | **FE-02** 공통 타입 및 상수 정의                       |
| 오후   | **FE-03** Zustand 스토어 + Axios 클라이언트            |
| 오후   | **FE-04** API 클라이언트 함수 구현                     |
| 저녁   | **FE-05** 공통 컴포넌트 구현                           |
| 저녁   | **FE-06** 인증 화면 구현 (회원가입, 로그인, 로그아웃)  |

**Day 2 완료 기준:** UC-06 ~ UC-12 BE API 정상 동작, FE 프로젝트 기반 구성 완료, 로그인·회원가입 화면 연동 완료

---

### Day 3 (오전~저녁)

| 시간대 | Task                                                        |
| ------ | ----------------------------------------------------------- |
| 오전   | **FE-07** 서버 상태 훅 구현 (TanStack Query)                |
| 오전   | **FE-08** 할일 목록 화면 구현 (UC-12, UC-11, UC-10)         |
| 오전   | **FE-09** 할일 등록/수정 화면 (UC-08, UC-09) — FE-08과 병렬 |
| 오후   | **FE-10** 카테고리 관리 화면 (UC-06, UC-07)                 |
| 오후   | **FE-11** 내 정보/탈퇴 화면 (UC-04, UC-05) — FE-10과 병렬   |
| 오후   | **FE-12** 에러 처리 UX 구현                                 |
| 오후   | **FE-13** 반응형 레이아웃 적용                              |
| 저녁   | **FE-14** E2E 통합 테스트 (전체 시나리오 검증)              |

**Day 3 완료 기준:** UC-01 ~ UC-12 전체 화면 구현 및 통합 테스트 완료

---

_문서 끝_
