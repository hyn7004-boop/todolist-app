# TodoListApp 프로젝트 구조 설계 원칙

---

## 문서 메타데이터

| 항목 | 내용 |
|------|------|
| 문서명 | TodoListApp 프로젝트 구조 설계 원칙 |
| 버전 | 1.0.0 |
| 작성일 | 2026-05-13 |
| 작성자 | youngnam.her |
| 상태 | Draft |
| 참조 문서 | docs/4-prd.md |

### Changelog

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-05-13 | youngnam.her | 최초 작성 (PRD v1.0.0 기반) |

---

## 섹션 1: 공통 최상위 원칙

---

### 1-1. 모노레포(Monorepo) 구조 채택

**Why:** 단일 개발자가 FE/BE를 동시에 개발하는 소규모 프로젝트에서는 하나의 저장소로 관리할 때 컨텍스트 전환 비용이 줄고, 타입 공유 및 의존성 일관성 유지가 용이하기 때문이다.

**상세 설명:**
- 루트 디렉토리 아래에 `backend/`와 `frontend/` 디렉토리를 두는 단순 모노레포 구조를 채택한다.
- Nx, Turborepo 등 별도의 모노레포 도구는 사용하지 않는다. 3일 일정의 소규모 프로젝트에서 도구 학습 비용이 오히려 오버헤드가 된다.
- 루트에는 `package.json`(스크립트 진입점), `.gitignore`, `.eslintrc` 등 공통 설정 파일만 배치한다.
- FE와 BE는 각자 독립적인 `package.json`과 `node_modules`를 갖는다. 루트 workspace 연동은 선택적으로 추가할 수 있다.

```
todolist-app/          ← git 루트 (모노레포)
├── backend/           ← Node.js + Express 서버
├── frontend/          ← React 19 + Vite SPA
├── docs/              ← 설계 문서
├── .gitignore
└── README.md
```

---

### 1-2. 단일 책임 원칙(SRP) 적용 범위

**Why:** 하나의 파일·함수·클래스가 하나의 역할만 담당해야 수정 범위가 명확해지고, 버그 발생 시 원인 추적이 빨라지기 때문이다.

**상세 설명:**
- **파일 단위:** 하나의 파일은 하나의 도메인 역할(예: `todoService.js`, `userRepository.js`)만 담당한다.
- **함수 단위:** 함수는 한 가지 작업만 수행한다. 유효성 검사, DB 쿼리, 응답 포맷팅을 한 함수 안에 섞지 않는다.
- **레이어 단위:** Controller는 요청/응답만, Service는 비즈니스 로직만, Repository는 DB 쿼리만 담당한다. 레이어를 건너뛰는 직접 호출(예: Controller에서 pg Pool 직접 접근)은 금지한다.
- **컴포넌트 단위(FE):** UI 렌더링과 데이터 페칭 로직을 분리한다. 페칭 로직은 커스텀 훅으로, 렌더링은 컴포넌트로 분리한다.

---

### 1-3. 환경 변수 관리 방침

**Why:** DB 접속 정보, JWT Secret 등 민감한 값을 소스 코드에 하드코딩하면 git 히스토리에 영구 노출되며 보안 사고의 직접 원인이 되기 때문이다.

**상세 설명:**

`.env` 파일 구조:
- `backend/.env` — BE 전용 환경 변수 (DB 접속, JWT 설정, 서버 포트)
- `frontend/.env` — FE 전용 환경 변수 (API Base URL 등)
- `backend/.env.example` / `frontend/.env.example` — 실제 값 없이 키 목록만 기재한 예시 파일. git에 커밋하여 팀원(또는 미래의 자신)이 필요한 환경 변수를 파악할 수 있도록 한다.

비밀값 처리 원칙:
- `.env` 파일은 반드시 `.gitignore`에 등록한다.
- 소스 코드 내 어떤 위치에도 실제 비밀값을 하드코딩하지 않는다.
- `process.env.변수명`으로만 접근하며, 설정 파일(`config/env.js`)에서 한 곳에서 수집하여 검증 후 export한다.
- 배포 환경(Railway/Render/EC2)에서는 플랫폼의 환경 변수 설정 기능을 사용한다.

---

### 1-4. 코드 공유 정책 (FE/BE 간 타입 공유)

**Why:** FE와 BE가 동일한 API 응답 타입을 각각 별도로 정의하면 변경 시 양쪽을 모두 수동으로 동기화해야 해서 실수가 발생하기 쉽기 때문이다.

**상세 설명:**
- 이 프로젝트는 3일 단기 일정이므로 별도 공유 패키지(`packages/shared`)를 구성하는 복잡한 방식은 사용하지 않는다.
- 대신 `docs/` 또는 `backend/src/types/` 아래에 정의된 API 응답 타입을 참조 기준으로 삼고, FE의 `frontend/src/types/`에서 동일한 인터페이스를 직접 정의한다.
- API 응답 형식(`ApiResponse<T>`, `ErrorResponse` 등)은 FE/BE 모두 동일한 구조로 정의하며, BE가 스펙의 기준이 된다.
- 추후 규모가 커질 경우 루트 `packages/shared/` 패키지를 추가하여 타입을 공유할 수 있도록 디렉토리 구조를 설계 단계부터 확장 가능하게 유지한다.

---

### 1-5. Git 브랜치 전략 (단일 개발자 기준)

**Why:** 소규모 단일 개발자 프로젝트에서 복잡한 Git Flow는 불필요한 오버헤드이므로, 단순하고 일관된 브랜치 전략으로 이력을 명확히 관리한다.

**상세 설명:**

```
main           ← 배포 가능한 안정 브랜치 (직접 commit 지양)
├── feat/uc-01-signup       ← UC별 기능 개발 브랜치
├── feat/uc-02-login
├── feat/be-todo-api        ← 기능 묶음 브랜치 (시간 절약)
├── fix/jwt-middleware-bug  ← 버그 수정 브랜치
└── chore/env-setup         ← 설정, 문서 등 기타 작업
```

- 브랜치 명칭 규칙: `{type}/{짧은-설명}` (type: feat, fix, chore, docs, refactor)
- 3일 일정 특성상 feature 브랜치에서 작업 후 main으로 squash merge 또는 일반 merge하여 완료한다.
- 커밋 메시지는 `[UC-01] 회원가입 API 구현` 형식으로 UC-ID 또는 컨텍스트를 접두사로 붙인다.
- `.env` 파일은 어떤 브랜치에서도 절대 커밋하지 않는다.

---

## 섹션 2: 의존성 / 레이어 원칙

---

### 2-1. BE 레이어 구조: Router → Controller → Service → Repository → DB

**Why:** 레이어 간 명확한 역할 분리는 변경 영향 범위를 최소화하고, 각 레이어를 독립적으로 테스트할 수 있게 하기 때문이다.

**레이어별 역할과 허용 의존성:**

| 레이어 | 역할 | 허용 의존 방향 | 금지 사항 |
|--------|------|----------------|-----------|
| Router (`routes/`) | Express 라우터 정의, 미들웨어 연결, HTTP 메서드/경로 매핑 | Controller 호출 | 비즈니스 로직, DB 접근 금지 |
| Controller (`controllers/`) | req/res 파싱, 입력값 1차 유효성 검사, 응답 포맷팅 | Service 호출 | 직접 DB 접근, 비즈니스 규칙 금지 |
| Service (`services/`) | 비즈니스 규칙 검증, 핵심 로직 수행, 트랜잭션 관리 | Repository 호출, 다른 Service 호출 가능 | 직접 pg Pool 접근, req/res 객체 접근 금지 |
| Repository (`repositories/`) | SQL 쿼리 실행, 결과 매핑, pg Pool 사용 | pg Pool 직접 사용 | 비즈니스 로직, HTTP 관련 코드 금지 |
| DB | PostgreSQL 17 실제 데이터 저장 | - | - |

의존성 방향은 단방향으로만 흐른다: `Router → Controller → Service → Repository → DB`

역방향 의존(예: Repository가 Service를 import)은 절대 허용하지 않는다.

---

### 2-2. Repository 레이어에서 pg 직접 사용 원칙 (ORM 금지)

**Why:** ORM(Prisma, Sequelize 등)은 편리하지만 복잡한 JOIN이나 조건 필터링 쿼리를 생성할 때 예측 불가한 SQL을 만들 수 있으며, 이 프로젝트는 쿼리 최적화와 인덱스 활용이 명시적으로 요구되기 때문이다.

**상세 설명:**
- `pg.Pool`을 `config/db.js`에서 단일 인스턴스로 생성하고 모든 Repository가 이 인스턴스를 import하여 사용한다.
- 파라미터화된 쿼리(`$1, $2, ...`)를 반드시 사용하여 SQL Injection을 방지한다.
- 쿼리 결과(`rows`, `rowCount`)를 Repository 내부에서 도메인 객체 형태로 변환하여 반환한다. Service에서 `rows[0]` 같은 pg 내부 구조를 직접 다루지 않도록 한다.

```javascript
// 올바른 예 (repositories/todoRepository.js)
async function findByUserId(userId, filters) {
  const { rows } = await pool.query(
    'SELECT * FROM todos WHERE user_id = $1',
    [userId]
  );
  return rows; // camelCase 변환 필요 시 여기서 처리
}

// 잘못된 예 (Service에서 pg 직접 사용 - 금지)
async function getTodos(userId) {
  const { rows } = await pool.query(...); // Service에서 금지
}
```

---

### 2-3. Service 레이어에서 비즈니스 규칙 검증 위치

**Why:** 비즈니스 규칙은 특정 HTTP 프로토콜이나 DB 구현에 종속되지 않는 순수 로직이므로, 이를 Service에 집중시켜야 규칙 변경 시 한 곳만 수정하면 되기 때문이다.

**상세 설명:**
- Controller는 HTTP 입력값의 형식 검증(필수 필드 존재 여부, 타입, 길이)만 담당한다.
- 비즈니스 규칙 검증은 Service에서 수행한다.

| 검증 위치 | 검증 내용 예시 |
|-----------|----------------|
| Controller | email 필드 존재 여부, title 200자 이하, due_date YYYY-MM-DD 형식 |
| Service | 이메일 중복 여부(BR-03), KST 기준 날짜 유효성(BR-07), 소유권 확인(BR-02), 기본 카테고리 여부(BR-05), 카테고리에 할일 연결 여부(BR-06) |
| Repository | 없음 (쿼리 실행 결과 반환만 담당) |

비밀번호 정책 검증(BR-10)은 순수 문자열 검사이므로 `utils/passwordValidator.js`에 분리하고, Controller 또는 Service에서 호출한다.

---

### 2-4. 트랜잭션 처리 위치 (UC-01: User + Category 3개 동시 생성)

**Why:** 트랜잭션은 여러 DB 작업의 원자성을 보장하는 비즈니스 요구사항이므로, 비즈니스 로직 레이어인 Service에서 관리해야 하며, Repository가 트랜잭션 경계를 결정하면 레이어 역할 혼란이 발생하기 때문이다.

**상세 설명:**

UC-01 회원가입 시 User 생성 + 기본 Category 3개 생성은 단일 트랜잭션으로 처리해야 하며, 중간에 실패하면 전체 롤백된다.

트랜잭션 처리 패턴:
- Service에서 `pool.connect()`로 클라이언트를 획득하고, `BEGIN` / `COMMIT` / `ROLLBACK`을 직접 실행한다.
- Repository 함수는 선택적으로 `client` 파라미터를 받을 수 있도록 설계하여, 트랜잭션 컨텍스트에서도 동일한 Repository 함수를 재사용할 수 있게 한다.

```javascript
// services/authService.js
async function signup(email, password, name) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const user = await userRepository.create(client, { email, passwordHash, name });
    await categoryRepository.createDefaults(client, user.userId);
    await client.query('COMMIT');
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

---

### 2-5. FE 레이어 구조: Pages → Components → Hooks → API 클라이언트

**Why:** FE에서도 관심사 분리를 적용해야 컴포넌트 재사용성이 높아지고, API 변경이 발생할 때 수정 범위를 API 클라이언트 레이어로 국한할 수 있기 때문이다.

**레이어별 역할:**

| 레이어 | 역할 |
|--------|------|
| Pages (`pages/`) | 라우트에 대응하는 최상위 컴포넌트. 레이아웃 조립, 훅 호출, 페이지 수준 상태 관리 |
| Components (`components/`) | 재사용 가능한 UI 단위. 비즈니스 로직 없이 props로만 동작 |
| Hooks (`hooks/`) | TanStack Query 기반 서버 데이터 페칭/뮤테이션 커스텀 훅. 컴포넌트에서 분리 |
| API 클라이언트 (`api/`) | Axios 인스턴스, 엔드포인트별 함수, 공통 인터셉터 |

---

### 2-6. Zustand Store와 TanStack Query의 역할 분리 원칙

**Why:** 서버 상태(API 응답 데이터)와 클라이언트 상태(UI 상태, 인증 정보)를 같은 도구로 관리하면 캐싱, 동기화, 무효화 로직이 복잡해지기 때문이다.

**상세 설명:**

| 도구 | 관리 대상 | 예시 |
|------|-----------|------|
| Zustand | 클라이언트 전역 상태 (메모리 전용) | 로그인 사용자 정보(userId, name, token), 인증 여부, 로그아웃 액션 |
| TanStack Query | 서버 데이터 상태 | Todo 목록, Category 목록, API 캐싱/무효화/재요청 |

- 할일 목록, 카테고리 목록은 TanStack Query로 관리하며, Zustand에 복사하지 않는다.
- 인증 토큰(JWT)은 **Zustand 스토어 메모리에만** 저장한다. `localStorage`, `sessionStorage`, `Cookie` 등 브라우저 영속 저장소는 사용하지 않는다. 페이지 새로고침 시 토큰이 초기화되므로 재로그인이 필요하다.
- API 클라이언트의 Axios 인터셉터가 Zustand 메모리에서 토큰을 읽어 `Authorization: Bearer <token>` 헤더에 자동 첨부한다.
- 로그아웃 시 Zustand store를 초기화하고, TanStack Query의 `queryClient.clear()`를 호출하여 캐시도 제거한다.

---

### 2-7. API 클라이언트 레이어 위치와 공통 처리

**Why:** JWT 헤더 첨부, 401 리다이렉트, 에러 파싱 등 공통 처리를 각 컴포넌트에서 중복 구현하면 일관성이 깨지고 유지보수 비용이 증가하기 때문이다.

**상세 설명:**
- `frontend/src/api/client.ts`에 Axios 인스턴스를 생성하고 공통 인터셉터를 등록한다.
- **Request 인터셉터:** Zustand auth store에서 token을 읽어 `Authorization: Bearer <token>` 헤더를 자동 첨부한다.
- **Response 인터셉터:** HTTP 401 응답 수신 시 Zustand store 초기화 후 `/login`으로 리다이렉트한다. 기타 에러는 error 객체를 표준 형식으로 가공하여 throw한다.
- 엔드포인트별 함수(`api/authApi.ts`, `api/todoApi.ts` 등)는 이 공통 클라이언트를 사용하며, 응답에서 `data.data` 추출까지 담당한다.

---

## 섹션 3: 코드 / 네이밍 원칙

---

### 3-1. 파일명 규칙

**Why:** 일관된 파일명 규칙은 파일 위치를 예측 가능하게 만들어 탐색 시간을 줄이기 때문이다.

**상세 설명:**

| 영역 | 규칙 | 예시 |
|------|------|------|
| BE 파일 전체 | camelCase | `todoService.js`, `authController.js`, `userRepository.js` |
| BE 라우터 파일 | camelCase + `Routes` 접미사 | `todoRoutes.js`, `authRoutes.js` |
| FE React 컴포넌트 | PascalCase | `TodoList.tsx`, `CategoryBadge.tsx` |
| FE 커스텀 훅 | camelCase + `use` 접두사 | `useTodos.ts`, `useAuth.ts` |
| FE Zustand 스토어 | camelCase + `Store` 접미사 | `authStore.ts` |
| FE API 파일 | camelCase + `Api` 접미사 | `todoApi.ts`, `authApi.ts` |
| FE 타입 파일 | camelCase 또는 `types.ts` | `todo.types.ts`, `types.ts` |
| FE 유틸 파일 | camelCase | `dateUtils.ts`, `validators.ts` |

---

### 3-2. 함수/변수 네이밍 규칙

**Why:** 일관된 네이밍 규칙은 코드를 읽는 사람이 함수의 목적과 반환 타입을 이름만으로 추론할 수 있게 하기 때문이다.

**상세 설명:**

| 구분 | 규칙 | 예시 |
|------|------|------|
| 변수/함수 | camelCase | `userId`, `createTodo`, `isCompleted` |
| 상수 (전역, 불변) | UPPER_SNAKE_CASE | `JWT_EXPIRES_IN`, `MAX_NAME_LENGTH` |
| 불리언 변수 | `is`, `has`, `can` 접두사 | `isCompleted`, `hasToken`, `canDelete` |
| 비동기 함수 | 동사 + 명사 조합 | `createUser`, `findTodoById`, `deleteCategory` |
| Repository 함수 | `find`, `create`, `update`, `delete` 접두사 | `findByEmail`, `createWithDefaults` |
| Service 함수 | 비즈니스 의미 동사 사용 | `signup`, `login`, `toggleCompletion` |
| React 컴포넌트 | PascalCase | `TodoItem`, `FilterPanel` |
| TanStack Query 훅 | `use` + 리소스 + 동작 | `useTodos`, `useCreateTodo`, `useDeleteCategory` |

---

### 3-3. DB 컬럼명과 API 응답 필드명 일관성 (snake_case vs camelCase 경계)

**Why:** DB는 snake_case 컨벤션을 따르고 JavaScript는 camelCase를 따르므로, 변환 경계를 명확히 정의하지 않으면 코드 전체에 두 방식이 혼재하여 혼란이 발생하기 때문이다.

**상세 설명:**

변환 경계: **Repository 레이어**

- DB → Application: Repository 함수가 `rows`를 반환할 때 snake_case를 camelCase로 변환한다.
- API 응답: camelCase를 기본으로 하되, 이 프로젝트의 PRD에서는 `user_id`, `category_id`, `todo_id`, `is_completed`, `due_date`, `created_at`, `updated_at` 등 snake_case를 API 응답 필드명으로 명시하고 있으므로 PRD 스펙을 우선하여 snake_case로 응답한다.

```
DB 컬럼:      user_id, is_completed, created_at    (snake_case)
API 응답:     user_id, is_completed, created_at    (PRD 스펙 준수, snake_case)
BE 내부 변수: userId, isCompleted, createdAt       (JS 컨벤션, camelCase)
FE 타입:      userId, isCompleted, createdAt       (TS 컨벤션, camelCase)
```

Repository 함수 내부에서 snake_case를 camelCase로 변환하여 Service/Controller로 전달하고, Controller에서 응답 직렬화 시 다시 snake_case로 변환하는 방식을 사용한다.

---

### 3-4. API 응답 공통 형식

**Why:** 일관된 응답 형식은 FE에서 에러 처리 로직을 단일 인터셉터로 통합할 수 있게 하며, API 소비자가 응답 구조를 예측할 수 있게 하기 때문이다.

**상세 설명:**

성공 응답:
```json
{ "success": true, "data": { ... } }
{ "success": true, "data": [ ... ] }
{ "success": true, "data": null }
```

실패 응답:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 표시할 메시지"
  }
}
```

- `success`: 항상 boolean으로 포함한다.
- `data`: 성공 시 실제 데이터. 삭제(204) 성공 시에는 body 자체가 없다.
- `error.code`: 기계가 읽는 에러 식별자. 대문자 SNAKE_CASE.
- `error.message`: 사람이 읽는 한국어 메시지. FE에서 직접 화면에 표시할 수 있다.

공통 응답 헬퍼 함수를 `utils/responseHelper.js`에 정의하여 Controller에서 일관되게 사용한다:
```javascript
// utils/responseHelper.js
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, code, message, status) => res.status(status).json({ success: false, error: { code, message } });
```

---

### 3-5. Error Code 상수 관리 방법

**Why:** 에러 코드를 문자열 리터럴로 직접 사용하면 오타가 발생해도 컴파일 타임에 발견할 수 없고, 중복 정의 또는 불일치 문제가 생기기 때문이다.

**상세 설명:**
- BE: `backend/src/constants/errorCodes.js`에 모든 에러 코드를 객체 상수로 정의한다.
- FE: `frontend/src/constants/errorCodes.ts`에 동일한 에러 코드를 TypeScript enum 또는 const 객체로 정의한다.

```javascript
// backend/src/constants/errorCodes.js
const ERROR_CODES = {
  // 인증
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  WRONG_CURRENT_PASSWORD: 'WRONG_CURRENT_PASSWORD',
  ALREADY_WITHDRAWN: 'ALREADY_WITHDRAWN',
  // 비밀번호
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  // 카테고리
  DUPLICATE_CATEGORY_NAME: 'DUPLICATE_CATEGORY_NAME',
  NAME_TOO_LONG: 'NAME_TOO_LONG',
  DEFAULT_CATEGORY_NOT_DELETABLE: 'DEFAULT_CATEGORY_NOT_DELETABLE',
  CATEGORY_HAS_TODOS: 'CATEGORY_HAS_TODOS',
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  // 할일
  INVALID_DUE_DATE: 'INVALID_DUE_DATE',
  INVALID_TITLE: 'INVALID_TITLE',
  INVALID_CATEGORY: 'INVALID_CATEGORY',
  TODO_NOT_FOUND: 'TODO_NOT_FOUND',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  // 서버
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};
module.exports = ERROR_CODES;
```

---

### 3-6. TypeScript 타입 정의 위치 및 공유 전략

**Why:** 타입 정의가 여러 파일에 분산되면 중복이 생기고, 변경 시 누락이 발생하여 타입 안전성이 무력화되기 때문이다.

**상세 설명:**

BE (`backend/src/types/`):
- `index.ts`: 공통 응답 타입, 미들웨어 확장 타입(예: `req.user`)
- `user.types.ts`: User 도메인 타입
- `todo.types.ts`: Todo 도메인 타입
- `category.types.ts`: Category 도메인 타입

FE (`frontend/src/types/`):
- `api.types.ts`: `ApiResponse<T>`, `ApiError` 공통 타입
- `user.types.ts`: User 관련 타입
- `todo.types.ts`: Todo 관련 타입
- `category.types.ts`: Category 관련 타입
- `auth.types.ts`: 인증 상태, 로그인 응답 타입

타입 공유 원칙:
- API 응답 타입은 BE의 `types/`가 기준 명세가 되고, FE는 해당 명세를 참고하여 독립적으로 정의한다.
- `any` 타입 사용을 금지한다. 불확실한 경우 `unknown`을 사용하고 타입 가드를 적용한다.
- 외부 라이브러리 응답(pg의 QueryResult 등)은 Repository 레이어에서 도메인 타입으로 변환하여 외부로 누출되지 않게 한다.

---

## 섹션 4: 테스트 / 품질 원칙

---

### 4-1. 3일 일정 현실적인 테스트 범위

**Why:** 3일이라는 제약된 일정에서 완전한 테스트 커버리지를 추구하면 실제 기능 구현이 미완성될 위험이 있으므로, 핵심 비즈니스 로직 보호에 집중한 선택적 테스트 전략이 필요하기 때문이다.

**테스트 대상 (진행):**

| 대상 | 방법 | 이유 |
|------|------|------|
| BE 핵심 비즈니스 로직 단위 테스트 | Jest (선택적) | 날짜 검증, 비밀번호 정책, 소유권 확인은 버그 발생 시 영향도가 크다 |
| BE API 전체 흐름 | Postman/Thunder Client 수동 검증 | UC-01~12 전체를 빠르게 E2E 검증 |
| FE 통합 테스트 | 브라우저 수동 검증 | E2E 시나리오 (회원가입→로그인→할일 CRUD→로그아웃) |

**테스트 생략 (일정 이유):**

| 생략 대상 | 사유 |
|-----------|------|
| Repository 레이어 단위 테스트 | DB 연동 테스트는 테스트 DB 설정이 필요하여 시간 소요 과다 |
| Controller 단위 테스트 | req/res mock 설정 복잡도 대비 효용 낮음 |
| FE 컴포넌트 단위 테스트 (jest, RTL) | 3일 일정에서 프로덕션 기능 구현을 우선한다 |
| 부하 테스트 (k6, Artillery) | MVP 완료 후 선택적으로 진행 |
| 보안 취약점 자동 스캔 | 수동 코드 리뷰로 대체 |

---

### 4-2. BE 우선 수동 검증 전략 (Postman/Thunder Client)

**Why:** API 서버가 완전히 검증되지 않은 상태에서 FE를 개발하면 FE 버그와 BE 버그가 혼재하여 디버깅이 어려워지기 때문에, BE 검증을 먼저 완료한 후 FE 연동을 진행한다.

**상세 설명:**
- Day 1 저녁, Day 2 저녁에 Postman/Thunder Client로 구현된 API를 전수 수동 검증한다.
- 각 UC에 대해 정상 케이스와 주요 실패 케이스(400, 401, 404, 409)를 모두 검증한다.
- 검증 순서: UC-01 (회원가입) → UC-02 (로그인, 토큰 획득) → 이후 모든 인증 API 순서대로 진행.
- JWT 토큰을 Postman 환경 변수에 저장하여 모든 인증 API 테스트에 자동 첨부한다.
- 검증 완료된 API는 체크리스트로 표시하여 진행 현황을 추적한다.

---

### 4-3. 핵심 비즈니스 로직 단위 테스트 대상

**Why:** 이 세 가지 로직은 버그 발생 시 보안 사고 또는 데이터 무결성 손상으로 이어지는 고영향도 코드이기 때문에 자동화 테스트로 경계값을 보호해야 한다.

**테스트 대상 목록:**

1. **날짜 검증 (`utils/dateUtils.js`)**
   - KST 기준 오늘 날짜 계산 정확성 (UTC+9 오프셋 처리)
   - 경계값: 당일(허용), 전일(거부), 익일(허용)
   - 날짜 형식 오류 처리 (YYYY-MM-DD 외 형식)
   - `due_date_from > due_date_to` 범위 오류

2. **비밀번호 정책 검증 (`utils/validators.js`)**
   - 8자 미만 거부
   - 영문 없는 경우 거부
   - 숫자 없는 경우 거부
   - 8자 이상, 영문+숫자 포함 시 허용
   - 경계값: 정확히 8자(허용), 7자(거부)

3. **소유권 검사 패턴**
   - 타인 리소스 접근 시 HTTP 404 반환 검증 (정보 노출 방지)
   - 탈퇴 사용자(status=withdrawn) 로그인 시도 거부

```javascript
// 예: 날짜 검증 테스트 (Jest)
describe('isValidDueDate (KST 기준)', () => {
  test('오늘 날짜는 허용한다', () => {
    const today = getTodayKST(); // 'YYYY-MM-DD' 형식
    expect(isValidDueDate(today)).toBe(true);
  });
  test('어제 날짜는 거부한다', () => {
    const yesterday = getYesterdayKST();
    expect(isValidDueDate(yesterday)).toBe(false);
  });
});
```

---

### 4-4. ESLint + Prettier 설정 원칙

**Why:** 코드 스타일 논쟁 없이 일관된 형식을 자동으로 강제하면 코드 리뷰 시 스타일 지적이 사라지고 실질적인 로직 리뷰에 집중할 수 있기 때문이다.

**상세 설명:**

ESLint 설정 원칙:
- `eslint:recommended` 기반으로 시작한다.
- TypeScript 사용 파일에는 `@typescript-eslint/recommended` 규칙을 추가한다.
- FE React 파일에는 `eslint-plugin-react`, `eslint-plugin-react-hooks` 규칙을 추가한다.
- `no-console` 규칙은 BE에서는 warn(개발 중 허용), FE에서는 error로 설정한다.
- `no-unused-vars`는 error로 설정하여 사용하지 않는 변수를 강제 정리한다.

Prettier 설정 원칙:
- 들여쓰기: 2 spaces (탭 금지)
- 세미콜론: 사용 (`semi: true`)
- 문자열: 작은따옴표 (`singleQuote: true`)
- 줄 길이: 100자 (`printWidth: 100`)
- 후행 쉼표: ES5 컨텍스트 (`trailingComma: 'es5'`)

저장 시 자동 포맷팅: VS Code의 `editor.formatOnSave: true` 설정을 `.vscode/settings.json`에 정의하여 팀원과 공유한다.

---

## 섹션 5: 설정 / 보안 / 운영 원칙

---

### 5-1. 환경 변수 목록 및 기본값

**Why:** 환경 변수 목록을 문서화해두지 않으면 새 환경 배포 시 누락된 변수로 인한 런타임 오류가 발생하기 때문이다.

**backend/.env.example:**
```env
# 서버 설정
PORT=3000
NODE_ENV=development

# PostgreSQL 연결
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist_db
DB_USER=todolist_user
DB_PASSWORD=your_password_here

# pg Connection Pool
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=5000

# JWT
JWT_SECRET=your_jwt_secret_here_minimum_32_characters
JWT_EXPIRES_IN=24h

# CORS (콤마 구분 허용 오리진)
# 개발 환경: FE Vite 포트(5173) + Swagger UI 포트(3000) 포함
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**frontend/.env.example:**
```env
# API 서버 Base URL
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

앱 시작 시 필수 환경 변수 존재 여부를 검증하는 코드를 `config/env.js`에 작성하여, 누락된 변수가 있을 경우 즉시 프로세스를 종료하고 오류 메시지를 출력한다:
```javascript
// config/env.js
const required = ['DB_HOST', 'DB_PASSWORD', 'JWT_SECRET'];
required.forEach(key => {
  if (!process.env[key]) {
    console.error(`환경 변수 누락: ${key}`);
    process.exit(1);
  }
});
```

---

### 5-2. JWT Secret 관리 원칙

**Why:** JWT Secret이 노출되면 공격자가 임의의 유효한 토큰을 위조할 수 있어 전체 인증 체계가 무너지기 때문이다.

**상세 설명:**
- **최소 길이:** 256비트(32바이트) 이상의 랜덤 문자열을 사용한다. 생성 방법: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- **저장:** 반드시 환경 변수(`JWT_SECRET`)로만 관리한다. 소스 코드, 주석, 로그에 절대 포함하지 않는다.
- **git 노출 방지:** `.env` 파일을 `.gitignore`에 등록하고, 커밋 전 `git status`로 확인한다.
- **만료 설정:** `JWT_EXPIRES_IN=24h`를 명시적으로 설정한다. 만료 없는 토큰 발급은 금지한다.
- **페이로드:** `{ user_id, status, iat, exp }`만 포함한다. 비밀번호 해시나 민감 정보를 페이로드에 포함하지 않는다.
- **알고리즘:** `HS256`을 사용한다. `none` 알고리즘 허용 설정을 금지한다.

---

### 5-3. bcrypt saltRounds 설정 기준

**Why:** saltRounds 값이 낮으면 무차별 대입 공격에 취약하고, 너무 높으면 로그인 API 응답 시간이 허용 한도를 초과하기 때문이다.

**상세 설명:**
- **라이브러리: `bcrypt 5.x`**
- **설정값: `saltRounds = 12`**
- 근거: 2025년 기준 서버 성능에서 saltRounds 12는 해시 생성에 약 200~300ms 소요되어, 무차별 대입 공격 비용이 충분히 높으면서도 로그인 응답 시간이 허용 범위(500ms 이내) 안에 든다.
- saltRounds 값은 환경 변수로 외부화하지 않고 상수로 코드에 정의한다. 이 값은 비밀이 아니며, 변경 시 기존 해시와의 비교에는 영향을 주지 않는다 (bcrypt는 해시 내부에 사용된 rounds를 저장한다).

```javascript
// utils/passwordUtils.js
const SALT_ROUNDS = 12;
const hash = (plain) => bcrypt.hash(plain, SALT_ROUNDS);
const compare = (plain, hashed) => bcrypt.compare(plain, hashed);
```

---

### 5-4. pg Pool 설정 값

**Why:** Connection Pool 설정이 적절하지 않으면 동시 접속 증가 시 DB 연결 고갈 또는 불필요한 연결 유지로 리소스가 낭비되기 때문이다.

**상세 설명:**

| 설정값 | 권장값 | 이유 |
|--------|--------|------|
| `max` | 10 | 300명 동시 접속 기준, 단일 서버에서 적정 수준. Railway/Render 무료 티어 PostgreSQL의 최대 연결 수 제한(25~100)을 고려하여 보수적으로 설정 |
| `idleTimeoutMillis` | 30000 (30초) | 유휴 연결을 빠르게 반환하여 DB 서버 리소스를 절약 |
| `connectionTimeoutMillis` | 5000 (5초) | 연결 획득 대기 시간 제한. 초과 시 빠르게 실패하여 요청이 무한 대기 상태에 빠지지 않도록 방지 |

```javascript
// config/db.js
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '5000', 10),
});
module.exports = pool;
```

---

### 5-5. CORS 설정 원칙

**Why:** CORS 설정이 과도하게 허용적이면(예: `*`) 크로스 오리진 공격에 취약해지고, 과도하게 제한적이면 정상적인 FE 클라이언트가 API를 호출하지 못하기 때문이다.

**상세 설명:**

개발 환경:
- 허용 오리진: `http://localhost:5173` (Vite 기본 포트), `http://localhost:3000` (Swagger UI 접근 용도)
- `CORS_ALLOWED_ORIGINS` 환경 변수로 관리하여 하드코딩 금지
- Swagger UI는 `http://localhost:3000/api-docs`로 노출되며 비운영 환경(`NODE_ENV !== 'production'`)에서만 활성화

운영 환경:
- 허용 오리진: 실제 FE 배포 도메인만 명시 (`https://todolist.example.com`)
- `*` 와일드카드 사용 금지
- `credentials: true`는 현재 로그인 방식(Authorization 헤더 방식)에서는 불필요하므로 설정하지 않는다.

```javascript
// middleware/cors.js
const cors = require('cors');
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '').split(',');
module.exports = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단된 오리진입니다.'));
    }
  },
});
```

---

### 5-6. 요청 크기 제한

**Why:** 요청 본문 크기 제한이 없으면 공격자가 대용량 페이로드를 전송하여 서버 메모리를 고갈시키는 DoS 공격이 가능하기 때문이다.

```javascript
// app.js
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
```

- `10kb` 제한은 이 앱의 최대 요청 본문(할일 제목 200자 + 설명 텍스트)을 충분히 수용하면서 비정상적으로 큰 요청을 차단한다.

---

### 5-7. 로깅 전략

**Why:** 개발 환경에서는 상세한 로그가 디버깅을 돕지만, 운영 환경에서는 불필요한 로그가 성능에 영향을 주고 민감 정보가 노출될 수 있기 때문이다.

**상세 설명:**

| 환경 | 로깅 방식 |
|------|-----------|
| 개발 (`NODE_ENV=development`) | `console.log/error`로 요청 경로, 응답 코드, 에러 스택 출력 |
| 운영 (`NODE_ENV=production`) | 오류 로그(`console.error`)만 출력. 요청/응답 상세 로그 비활성화 |

로깅 원칙:
- 비밀번호, JWT 토큰, 개인식별정보(email 등)를 로그에 포함하지 않는다.
- 전역 에러 핸들러 미들웨어에서 500 에러 발생 시 스택 트레이스를 서버 콘솔에만 기록하고 클라이언트에는 일반 메시지만 반환한다.
- Morgan 같은 HTTP 요청 로거는 개발 환경에서만 활성화한다: `if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));`

---

### 5-8. .gitignore 필수 포함 항목

**Why:** 민감한 파일이 실수로 git에 커밋되면 원격 저장소에 영구 기록되어 토큰 폐기와 재발급이 불가피한 보안 사고로 이어지기 때문이다.

```gitignore
# 환경 변수 (절대 커밋 금지)
.env
.env.local
.env.*.local
backend/.env
frontend/.env

# 의존성
node_modules/
backend/node_modules/
frontend/node_modules/

# 빌드 결과물
backend/dist/
frontend/dist/
frontend/build/

# 로그 파일
*.log
npm-debug.log*

# 운영체제 파일
.DS_Store
Thumbs.db

# 에디터 설정 (선택적 공유)
.vscode/
.idea/

# 테스트 커버리지
coverage/
```

---

## 섹션 6: 디렉토리 구조 (FE / BE 각각)

---

### 6-1. BE 디렉토리 구조

> **참고:** 아래 예시 코드는 모두 **JavaScript(`.js`) 기준**으로 작성되었습니다. TypeScript 선택 시 확장자를 `.ts`로 변경하고 타입 선언을 추가하세요.

```
backend/
├── src/
│   ├── app.js                        # Express 앱 초기화, 미들웨어 등록, 라우터 마운트
│   ├── server.js                     # HTTP 서버 실행 진입점 (app.js를 import하여 listen)
│   │
│   ├── config/
│   │   ├── env.js                    # 환경 변수 로드, 필수 변수 검증, export
│   │   └── db.js                     # pg Pool 인스턴스 생성 및 export (단일 인스턴스)
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT 검증, req.user 주입, 401 처리
│   │   ├── errorHandler.js           # 전역 에러 핸들러 (4개 인수: err, req, res, next)
│   │   └── requestLogger.js          # 개발 환경 전용 요청 로깅 (morgan 래퍼)
│   │
│   ├── routes/
│   │   ├── index.js                  # 전체 라우터 통합 (/api/v1 prefix 적용)
│   │   ├── authRoutes.js             # POST /auth/signup, /auth/login, /auth/logout
│   │   ├── userRoutes.js             # PATCH /users/me, DELETE /users/me
│   │   ├── categoryRoutes.js         # GET /categories, POST /categories, DELETE /categories/:categoryId
│   │   └── todoRoutes.js             # GET /todos, POST /todos, PATCH /todos/:todoId, DELETE /todos/:todoId, PATCH /todos/:todoId/toggle
│   │
│   ├── controllers/
│   │   ├── authController.js         # signup, login, logout 요청 처리 및 응답 반환
│   │   ├── userController.js         # updateMe, deleteMe 요청 처리 및 응답 반환
│   │   ├── categoryController.js     # getCategories, createCategory, deleteCategory 요청 처리
│   │   └── todoController.js         # getTodos, createTodo, updateTodo, deleteTodo, toggleTodo 요청 처리
│   │
│   ├── services/
│   │   ├── authService.js            # 회원가입(트랜잭션 포함), 로그인, 로그아웃 비즈니스 로직
│   │   ├── userService.js            # 개인정보 수정, 회원 탈퇴 비즈니스 로직
│   │   ├── categoryService.js        # 카테고리 목록 조회, 추가, 삭제 비즈니스 로직 및 규칙 검증
│   │   └── todoService.js            # 할일 CRUD, 완료 토글, 목록 필터 비즈니스 로직 및 규칙 검증
│   │
│   ├── repositories/
│   │   ├── userRepository.js         # users 테이블 CRUD (pg Pool 직접 사용)
│   │   ├── categoryRepository.js     # categories 테이블 CRUD, 기본 카테고리 일괄 생성
│   │   └── todoRepository.js         # todos 테이블 CRUD, 필터 기반 목록 조회
│   │
│   ├── types/                        # TypeScript 사용 시 타입 정의 (JS 사용 시 JSDoc으로 대체)
│   │   ├── index.d.ts                # Express Request 확장 타입 (req.user 추가)
│   │   ├── user.types.js             # User 도메인 타입 (JSDoc @typedef)
│   │   ├── todo.types.js             # Todo 도메인 타입
│   │   └── category.types.js         # Category 도메인 타입
│   │
│   ├── utils/
│   │   ├── responseHelper.js         # ok(), fail() 공통 응답 헬퍼 함수
│   │   ├── passwordUtils.js          # bcrypt hash, compare 래퍼. SALT_ROUNDS 상수 보유
│   │   ├── dateUtils.js              # KST 기준 오늘 날짜 계산, due_date 유효성 검증
│   │   └── validators.js             # 비밀번호 정책 검증, 이메일 형식 검증 등 순수 함수
│   │
│   └── constants/
│       └── errorCodes.js             # 모든 API 에러 코드 상수 객체 (DUPLICATE_EMAIL 등)
│
├── sql/
│   ├── 001_create_tables.sql         # users, categories, todos 테이블 DDL
│   └── 002_create_indexes.sql        # 인덱스 생성 DDL (UNIQUE INDEX, INDEX)
│
├── tests/                            # Jest 테스트 (supertest 기반 통합 + 단위)
│   ├── dateUtils.test.js             # KST 날짜 검증 경계값 테스트
│   ├── validators.test.js            # 비밀번호 정책 검증 테스트
│   ├── passwordUtils.test.js         # bcrypt hash/compare 테스트
│   ├── responseHelper.test.js        # ok/fail 응답 헬퍼 테스트
│   ├── config.test.js                # 환경 변수 설정 모듈 테스트
│   ├── app.test.js                   # Express 앱 초기화 및 헬스체크 테스트
│   ├── authMiddleware.test.js        # JWT 인증 미들웨어 테스트
│   ├── auth.test.js                  # 인증 API (signup/login/logout) 테스트
│   ├── user.test.js                  # 사용자 API (PATCH/DELETE /users/me) 테스트
│   ├── category.test.js              # 카테고리 API 테스트
│   ├── todo.test.js                  # 할일 API 테스트
│   └── integration.test.js          # UC-01~UC-12 전체 흐름 통합 테스트
│
├── .env                              # 실제 환경 변수 (gitignore 대상)
├── .env.example                      # 환경 변수 키 목록 예시 (git 커밋 대상)
├── .eslintrc.js                      # ESLint 설정
├── .prettierrc                       # Prettier 설정
├── .gitignore                        # node_modules, .env, dist 제외
├── package.json                      # 의존성, npm scripts (start, dev, test)
└── README.md                         # 로컬 실행 방법, 환경 변수 안내
```

**주요 파일 상세 예시:**

`src/routes/index.js`:
```javascript
const router = require('express').Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const todoRoutes = require('./todoRoutes');
const authMiddleware = require('../middleware/authMiddleware');

// 공개 라우트 (인증 불필요)
router.use('/auth', authRoutes);

// 보호 라우트 (JWT 인증 필요)
router.use('/users', authMiddleware, userRoutes);
router.use('/categories', authMiddleware, categoryRoutes);
router.use('/todos', authMiddleware, todoRoutes);

module.exports = router;
```

`src/app.js`:
```javascript
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require(path.join(__dirname, '../../swagger/swagger.json'));
const corsMiddleware = require('./middleware/cors');
const apiRouter = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(corsMiddleware);
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// 헬스체크
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Swagger UI (비운영 환경 한정)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use('/api/v1', apiRouter);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '요청하신 리소스를 찾을 수 없습니다.' } });
});

app.use(errorHandler);
module.exports = app;
```

---

### 6-2. FE 디렉토리 구조

```
frontend/
├── src/
│   ├── main.tsx                      # React 앱 진입점, QueryClientProvider, Router 설정
│   ├── App.tsx                       # 최상위 라우팅 정의 (react-router-dom)
│   │
│   ├── api/
│   │   ├── client.ts                 # Axios 인스턴스 생성, JWT 인터셉터, 401 리다이렉트 처리
│   │   ├── authApi.ts                # signup, login, logout API 호출 함수
│   │   ├── userApi.ts                # updateMe, deleteMe API 호출 함수
│   │   ├── categoryApi.ts            # getCategories, createCategory, deleteCategory 함수
│   │   └── todoApi.ts                # getTodos, createTodo, updateTodo, deleteTodo, toggleTodo 함수
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx            # 공통 버튼 컴포넌트 (variant: primary, danger, ghost)
│   │   │   ├── Input.tsx             # 공통 입력 필드 (에러 메시지 표시 포함)
│   │   │   ├── Modal.tsx             # 확인 다이얼로그 (할일 삭제, 회원 탈퇴 확인용)
│   │   │   ├── Toast.tsx             # 네트워크 오류 등 알림 메시지 표시
│   │   │   └── LoadingSpinner.tsx    # 로딩 상태 표시 공통 컴포넌트
│   │   ├── layout/
│   │   │   ├── Header.tsx            # 상단 네비게이션 (로그인 사용자 이름, 로그아웃 버튼)
│   │   │   ├── Sidebar.tsx           # 카테고리 목록 사이드바 (데스크탑)
│   │   │   └── Layout.tsx            # Header + Sidebar + 콘텐츠 영역 레이아웃 래퍼
│   │   ├── todo/
│   │   │   ├── TodoItem.tsx          # 개별 할일 항목 (완료 체크박스, 수정/삭제 버튼)
│   │   │   ├── TodoList.tsx          # 할일 목록 렌더링 (빈 상태 포함)
│   │   │   ├── TodoForm.tsx          # 할일 등록/수정 공통 폼 컴포넌트
│   │   │   └── TodoFilter.tsx        # 카테고리, 기간, 완료여부 필터 UI
│   │   └── category/
│   │       ├── CategoryItem.tsx      # 개별 카테고리 항목 (삭제 버튼, 기본 카테고리 표시)
│   │       └── CategoryForm.tsx      # 카테고리 추가 폼
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx             # /login — 로그인 폼, 회원가입 링크
│   │   ├── SignupPage.tsx            # /signup — 회원가입 폼
│   │   ├── TodoListPage.tsx          # / 또는 /todos — 할일 목록 메인 화면 (필터 포함)
│   │   ├── TodoCreatePage.tsx        # /todos/new — 할일 등록 폼 화면
│   │   ├── TodoEditPage.tsx          # /todos/:id/edit — 할일 수정 폼 화면
│   │   ├── CategoryPage.tsx          # /categories — 카테고리 관리 화면
│   │   └── SettingsPage.tsx          # /settings — 개인정보 수정, 회원 탈퇴
│   │
│   ├── hooks/
│   │   ├── useTodos.ts               # GET /todos TanStack Query 훅 (필터 파라미터 지원)
│   │   ├── useCreateTodo.ts          # POST /todos useMutation 훅
│   │   ├── useUpdateTodo.ts          # PATCH /todos/:todoId useMutation 훅
│   │   ├── useDeleteTodo.ts          # DELETE /todos/:todoId useMutation 훅 (캐시 무효화 포함)
│   │   ├── useToggleTodo.ts          # PATCH /todos/:todoId/toggle useMutation 훅
│   │   ├── useCategories.ts          # GET /categories TanStack Query 훅
│   │   ├── useCreateCategory.ts      # POST /categories useMutation 훅
│   │   ├── useDeleteCategory.ts      # DELETE /categories/:categoryId useMutation 훅
│   │   └── useAuth.ts                # Zustand auth store 접근 편의 훅 (login, logout, user)
│   │
│   ├── stores/
│   │   └── authStore.ts              # Zustand 인증 스토어 (token, user, isLoggedIn, login, logout 액션)
│   │
│   ├── types/
│   │   ├── api.types.ts              # ApiResponse<T>, ApiError 공통 응답/에러 타입
│   │   ├── user.types.ts             # User, UpdateUserRequest 타입
│   │   ├── todo.types.ts             # Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilter 타입
│   │   ├── category.types.ts         # Category, CreateCategoryRequest 타입
│   │   └── auth.types.ts             # LoginRequest, SignupRequest, AuthState 타입
│   │
│   ├── utils/
│   │   ├── dateUtils.ts              # YYYY-MM-DD 포맷 변환, KST 오늘 날짜 반환 함수
│   │   └── validators.ts             # 비밀번호 정책 클라이언트 검증, 이메일 형식 검증
│   │
│   └── constants/
│       └── errorCodes.ts             # API 에러 코드 상수 (BE와 동기화 유지)
│
├── public/
│   └── favicon.ico                   # 파비콘
│
├── index.html                        # Vite 진입 HTML
├── vite.config.ts                    # Vite 설정 (proxy, alias 등)
├── tsconfig.json                     # TypeScript 컴파일 설정
├── .env                              # FE 환경 변수 (gitignore 대상)
├── .env.example                      # FE 환경 변수 키 목록 예시
├── .eslintrc.js                      # ESLint 설정 (react, react-hooks 플러그인)
├── .prettierrc                       # Prettier 설정
├── .gitignore                        # node_modules, dist, .env 제외
└── package.json                      # 의존성, npm scripts (dev, build, preview)
```

**주요 파일 상세 예시:**

`src/api/client.ts`:
```typescript
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Request 인터셉터: JWT 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response 인터셉터: 401 리다이렉트
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

`src/stores/authStore.ts`:
```typescript
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: { userId: string; email: string; name: string } | null;
  isLoggedIn: boolean;
  login: (token: string, user: AuthState['user']) => void;
  logout: () => void;
}

// persist 미들웨어를 사용하지 않아 메모리에만 저장된다.
// 페이지 새로고침 시 토큰이 초기화되므로 재로그인이 필요하다.
export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  isLoggedIn: false,
  login: (token, user) => set({ token, user, isLoggedIn: true }),
  logout: () => set({ token: null, user: null, isLoggedIn: false }),
}));
```

`vite.config.ts` (개발 환경 프록시 설정):
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 부록: 레이어 간 데이터 흐름 요약

```
[HTTP 요청]
    ↓
[Router]         경로/메서드 매핑, authMiddleware 적용
    ↓
[Controller]     req 파싱, 형식 검증, Service 호출, res 반환
    ↓
[Service]        비즈니스 규칙 검증, Repository 호출, 트랜잭션 관리
    ↓
[Repository]     SQL 쿼리 실행 (pg Pool), rows → 도메인 객체 변환
    ↓
[PostgreSQL 17]  실제 데이터 조회/변경
```

```
[React 컴포넌트]
    ↓ 호출
[커스텀 훅 (TanStack Query)]    캐싱, 로딩/에러 상태 관리
    ↓ 호출
[API 클라이언트 함수]           Axios 요청, 응답 data 추출
    ↓ 자동 처리
[Axios 인터셉터]                JWT 첨부 (request), 401 리다이렉트 (response)
    ↓
[BE REST API]
```
