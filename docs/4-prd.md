# TodoListApp PRD (Product Requirements Document)

---

## 1. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| 문서명 | TodoListApp PRD (Product Requirements Document) |
| 버전 | 1.0.0 |
| 작성일 | 2026-05-13 |
| 작성자 | youngnam.her |
| 상태 | Draft |
| 검토자 | 미지정 |
| 승인자 | 미지정 |
| 참조 문서 | docs/3-domain-definition.md (v1.0.0) |

### Changelog

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-05-13 | youngnam.her | 최초 작성 (도메인 정의서 v1.0.0 기반) |

---

## 2. 제품 개요

### 2.1 제품 목적 및 비전

TodoListApp은 인증된 사용자가 개인 할일을 카테고리별로 체계적으로 등록하고 관리할 수 있는 반응형 웹 애플리케이션이다. 복잡한 협업 도구 없이도 개인 생산성을 높이기 위한 단순하고 명확한 할일 관리 경험을 제공하는 것을 목표로 한다.

비전: "로그인 하나로 어디서든, 내 할일을 내 방식으로 관리한다."

### 2.2 목표 사용자 (페르소나)

#### 페르소나 A: 바쁜 직장인 (30대 중반)
- 이름: 이수현 (35세, 마케팅 팀장)
- 환경: 사무실 PC + 출퇴근 중 스마트폰 브라우저 사용
- 핵심 니즈:
  - 업무·개인 할일을 카테고리로 분리하여 혼용되지 않도록 관리하고 싶다
  - 오늘·이번 주 마감인 항목만 빠르게 필터링하여 집중하고 싶다
  - 완료한 항목도 되돌릴 수 있어야 한다 (실수로 완료 처리 시)
- 불편사항: 기존 메모 앱은 카테고리 분류가 불편하고, 협업 툴은 개인 용도에 과도하게 복잡하다

#### 페르소나 B: 자기계발 중인 직장인 (20대 후반)
- 이름: 박지훈 (28세, 개발자)
- 환경: 주로 노트북, 간헐적으로 태블릿 브라우저
- 핵심 니즈:
  - 사이드 프로젝트, 공부, 개인 일정을 각각 별도 카테고리로 구분하고 싶다
  - 기기 변경 시에도 데이터가 보존되어야 한다 (클라우드 기반)
  - 빠르게 할일을 추가하고 완료 체크하는 단순한 UX를 선호한다

#### 페르소나 C: 일정 관리가 필요한 중간 관리자 (40대)
- 이름: 김영숙 (43세, 부서장)
- 환경: 주로 회사 PC 브라우저
- 핵심 니즈:
  - 마감일 기준으로 할일을 정렬·필터링하여 우선순위를 파악하고 싶다
  - 직관적이고 학습 비용이 낮은 인터페이스가 필요하다
  - 완료된 항목과 미완료 항목을 구분하여 진행 현황을 파악하고 싶다

### 2.3 핵심 가치 제안

| 가치 | 설명 |
|------|------|
| 개인화된 분류 | 카테고리 기반 할일 관리로 맥락별 집중 가능 |
| 데이터 영속성 | 인증 기반 서버 저장으로 기기 변경 시에도 데이터 보존 |
| 단순한 UX | 핵심 기능에 집중한 낮은 학습 곡선 |
| 반응형 접근성 | PC·태블릿·모바일 브라우저 어디서든 동일한 경험 제공 |

### 2.4 제외 범위 (Out of Scope)

MVP 1차 출시에서 아래 기능은 제공하지 않는다.

| 제외 항목 | 사유 |
|-----------|------|
| 팀/공유 할일 | 협업 기능은 도메인 범위 외 |
| 알림·리마인더 (Push/Email) | 별도 인프라 필요, 2차 계획 |
| 외부 캘린더 연동 (Google, Outlook 등) | 외부 OAuth 복잡도, 2차 계획 |
| 다크 모드 | UI 추가 개발 공수, 2차 계획 |
| 다국어 지원 (i18n) | 초기 타겟은 한국어 사용자, 2차 계획 |
| OAuth Social 로그인 (Google, Facebook 등) | JWT 기반 1차 구현 후 2차 확장 |
| 할일 우선순위 (Priority 레벨) | 도메인 정의 범위 외 |
| 할일 첨부파일 | 스토리지 인프라 필요, 2차 계획 |

---

## 3. 기술 스택 및 아키텍처

### 3.1 전체 스택 개요

```
[브라우저 (반응형 Web)]
        |
  React 19 (FE SPA)
        |
  REST API (HTTPS/TLS 1.2+)
        |
  Node.js + Express (BE)
        |
  PostgreSQL 17 (DB)
```

인증 흐름: 클라이언트 → Bearer JWT → BE 검증 → 리소스 응답

### 3.2 FE 상세 기술 스택

| 항목 | 기술 | 버전 | 역할 |
|------|------|------|------|
| UI 프레임워크 | React | 19.x | SPA 렌더링, 컴포넌트 기반 UI |
| 언어 | TypeScript | 5.x | 타입 안전성 |
| 전역 상태 관리 | Zustand | 5.x | 인증 상태, 사용자 정보 전역 관리 |
| 서버 상태 관리 | TanStack Query | 5.x | API 캐싱, 데이터 동기화, 무효화 |
| HTTP 클라이언트 | Axios 또는 Fetch API | - | REST API 호출 |
| 빌드 도구 | Vite | 6.x | 개발 서버, 번들링 |

### 3.3 BE 상세 기술 스택

| 항목 | 기술 | 버전 | 역할 |
|------|------|------|------|
| 런타임 | Node.js | 22.x (LTS) | 서버 실행 환경 |
| 프레임워크 | Express | 4.x | REST API 라우팅, 미들웨어 |
| DB 연동 | pg (node-postgres) | 8.x | PostgreSQL 쿼리 (필수 사용) |
| 인증 | jsonwebtoken | 9.x | JWT 발급 및 검증 |
| 비밀번호 해시 | bcrypt | 5.x | 비밀번호 bcrypt 해시 처리 |
| API 문서 | swagger-ui-express | 5.x | Swagger UI 서빙 (비운영 환경 한정, `/api-docs`) |
| 언어 | JavaScript | - | Node.js 22 LTS 기준 CommonJS |

> 주의: PostgreSQL 연동 라이브러리는 반드시 `pg`를 사용한다. ORM(Sequelize, Prisma 등) 사용 불가.

### 3.4 DB 상세 기술 스택

| 항목 | 기술 | 버전 |
|------|------|------|
| RDBMS | PostgreSQL | 17.x |
| UUID 생성 | gen_random_uuid() (PostgreSQL 내장) | - |
| 시간대 | TIMESTAMP WITH TIME ZONE, 비즈니스 로직 KST 기준 처리 | - |

### 3.5 인증 방식

#### 1차 MVP: JWT (Bearer Token)

- 로그인 성공 시 서버가 JWT(Access Token)를 발급
- 클라이언트는 이후 모든 API 요청에 `Authorization: Bearer <token>` 헤더 포함
- 토큰 만료 시 HTTP 401 반환; 클라이언트는 재로그인 유도
- 토큰 저장 위치: Zustand 스토어 메모리 (localStorage/Cookie 미사용; 페이지 새로고침 시 초기화되어 재로그인 필요)
- 로그아웃: Zustand 스토어 초기화 + TanStack Query `queryClient.clear()` 호출 (서버 블랙리스트 미운용)

#### 2차 확장 계획: OAuth Social Login

- 지원 예정 공급자: Google, Facebook
- 구현 방식: OAuth 2.0 Authorization Code Flow
- 기존 JWT 인증 흐름과 통합하여 소셜 로그인 후 동일한 JWT 발급
- User 테이블에 `oauth_provider`, `oauth_id` 컬럼 추가 필요 (스키마 확장 설계 고려)

### 3.6 배포 및 인프라

소규모 개인 프로젝트 기준으로 단순한 구성을 우선한다.

| 항목 | 방안 |
|------|------|
| 호스팅 | 단일 서버 (예: Railway, Render, AWS EC2 t3.micro) |
| FE 배포 | 정적 빌드 후 CDN 배포 또는 BE 서버에서 정적 파일 서빙 |
| DB | 호스팅 서버의 PostgreSQL 또는 Neon/Supabase 등 관리형 서비스 |
| TLS | Let's Encrypt 또는 플랫폼 제공 TLS (TLS 1.2 이상 필수) |
| 환경 변수 | `.env` 파일 또는 플랫폼 환경 변수로 DB 접속정보, JWT Secret 관리 |

---

## 4. 기능 요구사항

MVP 1차 출시 기준으로 UC-01 ~ UC-12 전체를 포함한다. 우선순위는 모두 `필수(Must Have)`이다.

---

### UC-01 회원가입

| 항목 | 내용 |
|------|------|
| 기능 설명 | 비인증 사용자가 이메일, 비밀번호, 이름을 입력하여 계정을 생성하고, 기본 카테고리 3개(일반·업무·개인)가 자동으로 생성된다. |
| 액터 | 비인증 사용자 |
| 우선순위 | Must Have (MVP 1차) |

**입력**

| 필드 | 타입 | 필수 | 유효성 규칙 |
|------|------|------|-------------|
| email | String | Y | 이메일 형식, 시스템 내 유일 |
| password | String | Y | 최소 8자, 영문+숫자 각 1자 이상 포함 |
| name | String | Y | 최대 50자 |

**출력**

- 성공: HTTP 201, 생성된 사용자 정보 (user_id, email, name, created_at)
- 실패: 아래 오류 코드 참조

**비즈니스 규칙 참조**

| BR-ID | 규칙 요약 |
|-------|-----------|
| BR-03 | 이메일 중복 시 HTTP 409 반환 |
| BR-04 | 기본 카테고리(일반·업무·개인, is_default=true) 3개 자동 생성 |
| BR-09 | 탈퇴 계정(status=withdrawn) 이메일로 재가입 불가; HTTP 409 반환 |
| BR-10 | 비밀번호 정책 미충족 시 HTTP 400 반환 |

---

### UC-02 로그인

| 항목 | 내용 |
|------|------|
| 기능 설명 | 비인증 사용자가 이메일과 비밀번호를 입력하여 인증 후 JWT를 발급받는다. |
| 액터 | 비인증 사용자 |
| 우선순위 | Must Have (MVP 1차) |

**입력**

| 필드 | 타입 | 필수 |
|------|------|------|
| email | String | Y |
| password | String | Y |

**출력**

- 성공: HTTP 200, JWT Access Token, 사용자 기본 정보 (user_id, email, name)
- 실패: HTTP 401 (이메일 미존재, 비밀번호 불일치, 탈퇴 계정), HTTP 400 (필수값 누락)

**비즈니스 규칙 참조**

| BR-ID | 규칙 요약 |
|-------|-----------|
| BR-01 | 인증된(status=active) 사용자만 세션 발급 |
| BR-09 | 탈퇴 계정(status=withdrawn) 로그인 불가; HTTP 401 반환 |

---

### UC-03 로그아웃

| 항목 | 내용 |
|------|------|
| 기능 설명 | 인증된 사용자가 현재 세션(JWT)을 무효화하여 로그아웃한다. |
| 액터 | 인증 사용자 |
| 우선순위 | Must Have (MVP 1차) |

**입력**

- Authorization 헤더의 Bearer Token

**출력**

- 성공: HTTP 200
- 실패: HTTP 401 (이미 만료된 세션)

**비즈니스 규칙 참조**

| BR-ID | 규칙 요약 |
|-------|-----------|
| BR-01 | 인증된 사용자만 로그아웃 요청 가능 |

---

### UC-04 개인정보 수정

| 항목 | 내용 |
|------|------|
| 기능 설명 | 인증된 사용자가 자신의 이름 또는 비밀번호를 수정한다. 비밀번호 변경 시 현재 비밀번호 확인이 필요하다. |
| 액터 | 인증 사용자 |
| 우선순위 | Must Have (MVP 1차) |

**입력**

| 필드 | 타입 | 필수 | 조건 |
|------|------|------|------|
| name | String | N | 최대 50자; 변경 시에만 포함 |
| current_password | String | N (비밀번호 변경 시 Y) | 현재 비밀번호 |
| new_password | String | N (비밀번호 변경 시 Y) | 최소 8자, 영문+숫자 각 1자 이상 |

**출력**

- 성공: HTTP 200, 수정된 사용자 정보 (user_id, email, name, updated_at)
- 실패: HTTP 401 (현재 비밀번호 불일치), HTTP 400 (정책 위반, 이름 길이 초과)

**비즈니스 규칙 참조**

| BR-ID | 규칙 요약 |
|-------|-----------|
| BR-01 | 인증된 사용자만 사용 가능 |
| BR-02 | 자신의 계정 정보만 수정 가능 |
| BR-10 | 신규 비밀번호 정책 미충족 시 HTTP 400 |

---

### UC-05 회원 탈퇴

| 항목 | 내용 |
|------|------|
| 기능 설명 | 인증된 사용자가 탈퇴를 요청하면 계정이 소프트 삭제(status=withdrawn)되고 세션이 무효화된다. 탈퇴 계정으로 재가입은 불가하다. |
| 액터 | 인증 사용자 |
| 우선순위 | Must Have (MVP 1차) |

**입력**

- Authorization 헤더의 Bearer Token

**출력**

- 성공: HTTP 200
- 실패: HTTP 400 (이미 탈퇴된 계정)

**비즈니스 규칙 참조**

| BR-ID | 규칙 요약 |
|-------|-----------|
| BR-01 | 인증된 사용자만 사용 가능 |
| BR-02 | 자신의 계정만 탈퇴 처리 가능 |
| BR-09 | status=withdrawn으로 변경; withdrawn_at 기록; 해당 이메일 재가입 불가 |

---

### UC-06 카테고리 추가

| 항목 | 내용 |
|------|------|
| 기능 설명 | 인증된 사용자가 사용자 정의 카테고리(is_default=false)를 생성한다. |
| 액터 | 인증 사용자 |
| 우선순위 | Must Have (MVP 1차) |

**입력**

| 필드 | 타입 | 필수 | 유효성 규칙 |
|------|------|------|-------------|
| name | String | Y | 최대 50자, 동일 사용자 내 중복 불가 |

**출력**

- 성공: HTTP 201, 생성된 카테고리 정보 (category_id, name, is_default, created_at)
- 실패: HTTP 409 (카테고리명 중복), HTTP 400 (이름 누락, 50자 초과)

**비즈니스 규칙 참조**

| BR-ID | 규칙 요약 |
|-------|-----------|
| BR-01 | 인증된 사용자만 사용 가능 |
| BR-02 | 자신의 카테고리 목록 내에서 중복 여부 검사 |

---

### UC-07 카테고리 삭제

| 항목 | 내용 |
|------|------|
| 기능 설명 | 인증된 사용자가 자신 소유의 사용자 정의 카테고리(is_default=false)를 삭제한다. 기본 카테고리나 할일이 연결된 카테고리는 삭제 불가하다. |
| 액터 | 인증 사용자 |
| 우선순위 | Must Have (MVP 1차) |

**입력**

- Path Parameter: category_id (UUID)

**출력**

- 성공: HTTP 204 (No Content)
- 실패: HTTP 400 (기본 카테고리 삭제 시도), HTTP 404 (타인 소유 또는 존재하지 않는 카테고리), HTTP 409 (할일 연결된 카테고리)

**비즈니스 규칙 참조**

| BR-ID | 규칙 요약 |
|-------|-----------|
| BR-01 | 인증된 사용자만 사용 가능 |
| BR-02 | 타인 소유 카테고리 접근 시 HTTP 404 |
| BR-05 | 기본 카테고리(is_default=true) 삭제 불가; HTTP 400 |
| BR-06 | 할일 연결된 카테고리 삭제 불가; HTTP 409 |

---

### UC-08 할일 등록

| 항목 | 내용 |
|------|------|
| 기능 설명 | 인증된 사용자가 제목, 카테고리, 종료예정일을 필수로 입력하고 설명(선택)을 추가하여 할일을 등록한다. |
| 액터 | 인증 사용자 |
| 우선순위 | Must Have (MVP 1차) |

**입력**

| 필드 | 타입 | 필수 | 유효성 규칙 |
|------|------|------|-------------|
| title | String | Y | 최대 200자 |
| category_id | UUID | Y | 자신 소유의 유효한 카테고리 |
| due_date | Date (YYYY-MM-DD) | Y | KST 기준 오늘 날짜 이상 (당일 허용) |
| description | String | N | 제한 없음 (Nullable) |

**출력**

- 성공: HTTP 201, 생성된 할일 정보 (todo_id, title, description, category_id, due_date, is_completed, created_at)
- 실패: HTTP 400 (제목 누락·초과, 날짜 과거, 카테고리 유효하지 않음)

**비즈니스 규칙 참조**

| BR-ID | 규칙 요약 |
|-------|-----------|
| BR-01 | 인증된 사용자만 사용 가능 |
| BR-02 | 자신 소유의 카테고리만 선택 가능 |
| BR-07 | 종료예정일이 KST 기준 오늘보다 이전이면 HTTP 400 |

---

### UC-09 할일 수정

| 항목 | 내용 |
|------|------|
| 기능 설명 | 인증된 사용자가 자신 소유의 할일에서 제목, 설명, 종료예정일, 카테고리를 수정한다. |
| 액터 | 인증 사용자 |
| 우선순위 | Must Have (MVP 1차) |

**입력**

- Path Parameter: todo_id (UUID)

| 필드 | 타입 | 필수 | 유효성 규칙 |
|------|------|------|-------------|
| title | String | N | 최대 200자 |
| category_id | UUID | N | 자신 소유의 유효한 카테고리 |
| due_date | Date (YYYY-MM-DD) | N | KST 기준 오늘 날짜 이상 |
| description | String | N | Nullable |

**출력**

- 성공: HTTP 200, 수정된 할일 정보 전체
- 실패: HTTP 400 (제목 초과, 날짜 과거), HTTP 404 (타인 소유 또는 존재하지 않는 할일)

**비즈니스 규칙 참조**

| BR-ID | 규칙 요약 |
|-------|-----------|
| BR-01 | 인증된 사용자만 사용 가능 |
| BR-02 | 타인 소유 할일 접근 시 HTTP 404 |
| BR-07 | 종료예정일이 KST 기준 오늘보다 이전이면 HTTP 400 |

---

### UC-10 할일 삭제

| 항목 | 내용 |
|------|------|
| 기능 설명 | 인증된 사용자가 자신 소유의 할일을 영구 삭제한다. |
| 액터 | 인증 사용자 |
| 우선순위 | Must Have (MVP 1차) |

**입력**

- Path Parameter: todo_id (UUID)

**출력**

- 성공: HTTP 204 (No Content)
- 실패: HTTP 404 (타인 소유 또는 존재하지 않는 할일)

**비즈니스 규칙 참조**

| BR-ID | 규칙 요약 |
|-------|-----------|
| BR-01 | 인증된 사용자만 사용 가능 |
| BR-02 | 타인 소유 할일 접근 시 HTTP 404 |

---

### UC-11 할일 완료 처리

| 항목 | 내용 |
|------|------|
| 기능 설명 | 인증된 사용자가 자신 소유의 할일의 완료 여부를 토글한다. 완료(false→true) 및 완료 취소(true→false) 모두 가능하다. |
| 액터 | 인증 사용자 |
| 우선순위 | Must Have (MVP 1차) |

**입력**

- Path Parameter: todo_id (UUID)
- 별도 Body 없음 (현재 is_completed 값을 서버에서 반전 처리)

**출력**

- 성공: HTTP 200, 변경된 is_completed 값을 포함한 할일 정보
- 실패: HTTP 404 (타인 소유 또는 존재하지 않는 할일)

**비즈니스 규칙 참조**

| BR-ID | 규칙 요약 |
|-------|-----------|
| BR-01 | 인증된 사용자만 사용 가능 |
| BR-02 | 타인 소유 할일 접근 시 HTTP 404 |
| BR-08 | 완료된 할일도 완료 취소(토글) 가능 |

---

### UC-12 할일 목록 조회

| 항목 | 내용 |
|------|------|
| 기능 설명 | 인증된 사용자가 자신의 할일 목록을 조회한다. 카테고리, 기간, 완료여부 필터를 단독 또는 복합(AND 조건)으로 적용할 수 있다. |
| 액터 | 인증 사용자 |
| 우선순위 | Must Have (MVP 1차) |

**입력 (Query Parameters, 모두 선택)**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| category_id | UUID | 특정 카테고리에 속한 할일만 조회 |
| due_date_from | Date (YYYY-MM-DD) | 종료예정일 기간 시작 |
| due_date_to | Date (YYYY-MM-DD) | 종료예정일 기간 종료 |
| is_completed | Boolean | true: 완료 / false: 미완료 / 생략: 전체 |

**출력**

- 성공: HTTP 200, 할일 배열 (결과 없을 경우 빈 배열 `[]` 반환)
- 실패: HTTP 400 (날짜 형식 오류, due_date_from이 due_date_to보다 늦음)

**비즈니스 규칙 참조**

| BR-ID | 규칙 요약 |
|-------|-----------|
| BR-01 | 인증된 사용자만 사용 가능 |
| BR-02 | 자신 소유의 할일만 반환 |

---

## 5. 비기능 요구사항

### 5.1 성능

| 항목 | 요구사항 |
|------|----------|
| 동시 접속 | 300명 기준 정상 응답 |
| API 응답 목표 | 일반 CRUD 요청 500ms 이내 (목표), 목록 조회 1,000ms 이내 |
| DB 연결 | pg Pool 설정으로 Connection Pooling 적용 (max 연결 수 환경에 따라 조정) |

소규모 개인 프로젝트 기준으로 별도 로드밸런서나 스케일 아웃 구성 없이 단일 서버로 운영한다. 부하 테스트는 MVP 완료 후 선택적으로 진행한다.

### 5.2 보안

| 항목 | 요구사항 |
|------|----------|
| 인증 | JWT Bearer Token; 모든 보호 API에 토큰 검증 미들웨어 적용 |
| 비밀번호 | bcrypt 알고리즘으로 해시 저장 (평문 저장 절대 금지) |
| 전송 보안 | TLS 1.2 이상 (HTTPS 필수) |
| 인가 | 타인 소유 리소스 접근 시 존재 자체를 숨김 (HTTP 404, 정보 노출 방지) |
| 미인증 접근 | 보호 리소스 접근 시 HTTP 401 반환 |
| JWT Secret | 환경 변수로 관리; 소스 코드에 하드코딩 금지 |

### 5.3 데이터 정책

| 항목 | 처리 방식 |
|------|-----------|
| 회원 탈퇴 | 소프트 삭제: User.status=withdrawn, withdrawn_at 기록; 물리적 데이터는 유지 |
| 탈퇴 후 접근 | 탈퇴 즉시 세션 무효화로 접근 불가 처리; 탈퇴 이메일로 재가입 불가 |
| 할일 삭제 | 영구 삭제 (하드 삭제); 복구 불가 |
| 카테고리 삭제 | 영구 삭제 (하드 삭제); 연결된 할일 없을 때만 가능 |

탈퇴 사용자의 데이터(할일, 카테고리)는 소프트 삭제 정책상 DB에 잔류하나, 탈퇴 즉시 접근이 차단되어 사용자 관점에서는 즉시 삭제와 동일한 효과를 제공한다.

### 5.4 확장성 계획

| 항목 | 1차 MVP | 2차 확장 |
|------|---------|---------|
| 인증 | JWT | OAuth Social (Google, Facebook) |
| UI 테마 | 라이트 모드만 | 다크 모드 추가 |
| 다국어 | 한국어만 | 다국어 지원 (i18n) |
| 알림 | 없음 | Push/Email 리마인더 |
| 캘린더 연동 | 없음 | Google Calendar 등 |

### 5.5 접근성 및 UI

- 반응형 웹 UI: 모바일(320px 이상), 태블릿, 데스크탑 브라우저 지원
- 최소 지원 브라우저: Chrome 최신, Firefox 최신, Safari 최신, Edge 최신
- 입력 폼의 에러 메시지는 해당 필드 근처에 인라인으로 표시

---

## 6. API 설계 개요

Base URL: `/api/v1`

인증 필요 여부: `Y` = `Authorization: Bearer <token>` 헤더 필수, `N` = 불필요

---

### 6.0 공통 응답 형식

**성공 응답**
```json
{ "success": true, "data": { ... } }
```

**오류 응답**
```json
{
  "success": false,
  "error": { "code": "ERROR_CODE", "message": "사용자에게 표시할 메시지" }
}
```

**HTTP 상태 코드 정책**

| 코드 | 적용 시나리오 |
|------|---------------|
| 200 | 조회, 수정, 토글, 로그아웃 성공 |
| 201 | 생성 성공 (회원가입, 카테고리 추가, 할일 등록) |
| 204 | 삭제 성공 (카테고리 삭제, 할일 삭제) — 응답 Body 없음 |
| 400 | 필수값 누락, 형식 오류, 비즈니스 규칙 위반 |
| 401 | 미인증, 자격증명 불일치, 만료 세션 |
| 404 | 존재하지 않거나 타인 소유 리소스 |
| 409 | 이메일 중복, 카테고리명 중복, 연결된 카테고리 삭제 시도 |
| 500 | 서버 내부 오류 |

---

### 6.1 인증 (Auth)

#### UC-01 — POST /auth/signup (회원가입)

**Request Body**

| 필드 | 타입 | 필수 | 유효성 규칙 |
|------|------|------|-------------|
| email | string | Y | 이메일 형식, 시스템 내 유일 |
| password | string | Y | 최소 8자, 영문·숫자 각 1자 이상 (`/^(?=.*[A-Za-z])(?=.*\d).{8,}$/`) |
| name | string | Y | 최대 50자 |

```json
// Request
{ "email": "user@example.com", "password": "pass1234", "name": "홍길동" }
```

**Response**

```json
// 201 Created — 성공
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "홍길동",
    "created_at": "2026-05-13T10:00:00.000Z"
  }
}

// 409 — 이메일 중복
{ "success": false, "error": { "code": "DUPLICATE_EMAIL", "message": "이미 사용 중인 이메일입니다." } }

// 400 — 비밀번호 정책 위반
{ "success": false, "error": { "code": "INVALID_PASSWORD", "message": "비밀번호는 8자 이상, 영문과 숫자를 각 1자 이상 포함해야 합니다." } }

// 400 — 필수값 누락
{ "success": false, "error": { "code": "MISSING_REQUIRED_FIELD", "message": "필수 입력값이 누락되었습니다." } }
```

---

#### UC-02 — POST /auth/login (로그인)

**Request Body**

| 필드 | 타입 | 필수 |
|------|------|------|
| email | string | Y |
| password | string | Y |

```json
// Request
{ "email": "user@example.com", "password": "pass1234" }
```

**Response**

```json
// 200 OK — 성공
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "홍길동"
    }
  }
}

// 401 — 자격증명 불일치 또는 탈퇴 계정
{ "success": false, "error": { "code": "INVALID_CREDENTIALS", "message": "이메일 또는 비밀번호가 올바르지 않습니다." } }

// 400 — 필수값 누락
{ "success": false, "error": { "code": "MISSING_REQUIRED_FIELD", "message": "필수 입력값이 누락되었습니다." } }
```

> JWT 명세: 만료 24시간(`exp`), 페이로드 `{ user_id, status, iat, exp }`. 토큰은 Zustand 메모리에만 보관(localStorage/Cookie 미사용). 로그아웃 시 Zustand 초기화로 토큰 폐기 (서버 블랙리스트 미운용).

---

#### UC-03 — POST /auth/logout (로그아웃)

**Request Header**: `Authorization: Bearer <token>`  
**Request Body**: 없음

**Response**

```json
// 200 OK — 성공
{ "success": true, "data": null }

// 401 — 만료되거나 유효하지 않은 토큰
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "인증 정보가 유효하지 않습니다." } }
```

---

### 6.2 사용자 (Users)

#### UC-04 — PATCH /users/me (개인정보 수정)

**Request Header**: `Authorization: Bearer <token>`

**Request Body** — 변경할 필드만 포함 (name, 또는 비밀번호 변경 조합)

| 필드 | 타입 | 필수 | 조건 |
|------|------|------|------|
| name | string | N | 최대 50자; 이름 변경 시 포함 |
| current_password | string | 조건부 Y | `new_password` 포함 시 필수 |
| new_password | string | N | 최소 8자, 영문·숫자 각 1자 이상 |

```json
// Request — 이름 변경
{ "name": "김철수" }

// Request — 비밀번호 변경
{ "current_password": "pass1234", "new_password": "newPass99" }
```

**Response**

```json
// 200 OK — 성공
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "김철수",
    "updated_at": "2026-05-13T11:00:00.000Z"
  }
}

// 401 — 현재 비밀번호 불일치
{ "success": false, "error": { "code": "WRONG_CURRENT_PASSWORD", "message": "현재 비밀번호가 올바르지 않습니다." } }

// 400 — 신규 비밀번호 정책 위반
{ "success": false, "error": { "code": "INVALID_PASSWORD", "message": "비밀번호는 8자 이상, 영문과 숫자를 각 1자 이상 포함해야 합니다." } }

// 400 — 이름 50자 초과
{ "success": false, "error": { "code": "NAME_TOO_LONG", "message": "이름은 50자 이내로 입력해 주세요." } }
```

---

#### UC-05 — DELETE /users/me (회원 탈퇴)

**Request Header**: `Authorization: Bearer <token>`  
**Request Body**: 없음

**Response**

```json
// 200 OK — 성공 (status=withdrawn, 세션 무효화)
{ "success": true, "data": null }

// 400 — 이미 탈퇴된 계정
{ "success": false, "error": { "code": "ALREADY_WITHDRAWN", "message": "이미 탈퇴된 계정입니다." } }
```

---

### 6.3 카테고리 (Categories)

#### GET /categories (카테고리 목록 조회)

**Request Header**: `Authorization: Bearer <token>`  
**Query Parameters**: 없음

**Response**

```json
// 200 OK
{
  "success": true,
  "data": [
    { "category_id": "uuid-1", "name": "일반", "is_default": true, "created_at": "2026-05-13T10:00:00.000Z" },
    { "category_id": "uuid-2", "name": "업무", "is_default": true, "created_at": "2026-05-13T10:00:00.000Z" },
    { "category_id": "uuid-3", "name": "개인", "is_default": true, "created_at": "2026-05-13T10:00:00.000Z" },
    { "category_id": "uuid-4", "name": "사이드 프로젝트", "is_default": false, "created_at": "2026-05-13T12:00:00.000Z" }
  ]
}
```

---

#### UC-06 — POST /categories (카테고리 추가)

**Request Header**: `Authorization: Bearer <token>`

**Request Body**

| 필드 | 타입 | 필수 | 유효성 규칙 |
|------|------|------|-------------|
| name | string | Y | 최대 50자, 동일 사용자(user_id) 내 중복 불가 |

```json
// Request
{ "name": "사이드 프로젝트" }
```

**Response**

```json
// 201 Created — 성공
{
  "success": true,
  "data": {
    "category_id": "uuid-4",
    "name": "사이드 프로젝트",
    "is_default": false,
    "created_at": "2026-05-13T12:00:00.000Z"
  }
}

// 409 — 동일 사용자 내 카테고리명 중복
{ "success": false, "error": { "code": "DUPLICATE_CATEGORY_NAME", "message": "이미 존재하는 카테고리 이름입니다." } }

// 400 — 이름 50자 초과
{ "success": false, "error": { "code": "NAME_TOO_LONG", "message": "카테고리 이름은 50자 이내로 입력해 주세요." } }

// 400 — 이름 누락
{ "success": false, "error": { "code": "MISSING_REQUIRED_FIELD", "message": "카테고리 이름을 입력해 주세요." } }
```

---

#### UC-07 — DELETE /categories/:categoryId (카테고리 삭제)

**Request Header**: `Authorization: Bearer <token>`  
**Path Parameter**: `categoryId` (UUID)  
**Request Body**: 없음

**Response**

```json
// 204 No Content — 성공 (Body 없음)

// 400 — 기본 카테고리 삭제 시도
{ "success": false, "error": { "code": "DEFAULT_CATEGORY_NOT_DELETABLE", "message": "기본 카테고리는 삭제할 수 없습니다." } }

// 409 — 할일이 연결된 카테고리 삭제 시도
{ "success": false, "error": { "code": "CATEGORY_HAS_TODOS", "message": "할일이 등록된 카테고리는 삭제할 수 없습니다." } }

// 404 — 존재하지 않거나 타인 소유
{ "success": false, "error": { "code": "CATEGORY_NOT_FOUND", "message": "카테고리를 찾을 수 없습니다." } }
```

---

### 6.4 할일 (Todos)

#### UC-08 — POST /todos (할일 등록)

**Request Header**: `Authorization: Bearer <token>`

**Request Body**

| 필드 | 타입 | 필수 | 유효성 규칙 |
|------|------|------|-------------|
| title | string | Y | 최대 200자 |
| category_id | string (UUID) | Y | 자신 소유의 유효한 카테고리 |
| due_date | string | Y | `YYYY-MM-DD` 형식, KST 기준 오늘 날짜 이상 |
| description | string | N | 제한 없음 (생략 가능) |

```json
// Request
{
  "title": "PRD 1순위 수정 완료",
  "category_id": "uuid-2",
  "due_date": "2026-05-13",
  "description": "API JSON 스키마 추가"
}
```

**Response**

```json
// 201 Created — 성공
{
  "success": true,
  "data": {
    "todo_id": "uuid-todo-1",
    "title": "PRD 1순위 수정 완료",
    "description": "API JSON 스키마 추가",
    "category_id": "uuid-2",
    "due_date": "2026-05-13",
    "is_completed": false,
    "created_at": "2026-05-13T13:00:00.000Z",
    "updated_at": "2026-05-13T13:00:00.000Z"
  }
}

// 400 — 종료예정일이 오늘(KST) 이전
{ "success": false, "error": { "code": "INVALID_DUE_DATE", "message": "종료예정일은 오늘 날짜 이상이어야 합니다." } }

// 400 — 제목 누락 또는 200자 초과
{ "success": false, "error": { "code": "INVALID_TITLE", "message": "제목은 1자 이상 200자 이내로 입력해 주세요." } }

// 400 — 유효하지 않은 카테고리
{ "success": false, "error": { "code": "INVALID_CATEGORY", "message": "유효하지 않은 카테고리입니다." } }
```

---

#### UC-09 — PATCH /todos/:todoId (할일 수정)

**Request Header**: `Authorization: Bearer <token>`  
**Path Parameter**: `todoId` (UUID)

**Request Body** — 변경할 필드만 포함

| 필드 | 타입 | 필수 | 유효성 규칙 |
|------|------|------|-------------|
| title | string | N | 최대 200자 |
| category_id | string (UUID) | N | 자신 소유의 유효한 카테고리 |
| due_date | string | N | `YYYY-MM-DD` 형식, KST 기준 오늘 날짜 이상 |
| description | string \| null | N | null 전달 시 설명 삭제 |

```json
// Request
{ "title": "수정된 제목", "due_date": "2026-05-20" }
```

**Response**

```json
// 200 OK — 성공 (수정된 할일 전체 반환)
{
  "success": true,
  "data": {
    "todo_id": "uuid-todo-1",
    "title": "수정된 제목",
    "description": "API JSON 스키마 추가",
    "category_id": "uuid-2",
    "due_date": "2026-05-20",
    "is_completed": false,
    "created_at": "2026-05-13T13:00:00.000Z",
    "updated_at": "2026-05-13T14:00:00.000Z"
  }
}

// 400 — 종료예정일이 오늘(KST) 이전
{ "success": false, "error": { "code": "INVALID_DUE_DATE", "message": "종료예정일은 오늘 날짜 이상이어야 합니다." } }

// 400 — 제목 200자 초과
{ "success": false, "error": { "code": "INVALID_TITLE", "message": "제목은 200자 이내로 입력해 주세요." } }

// 404 — 존재하지 않거나 타인 소유
{ "success": false, "error": { "code": "TODO_NOT_FOUND", "message": "할일을 찾을 수 없습니다." } }
```

---

#### UC-10 — DELETE /todos/:todoId (할일 삭제)

**Request Header**: `Authorization: Bearer <token>`  
**Path Parameter**: `todoId` (UUID)  
**Request Body**: 없음

**Response**

```json
// 204 No Content — 성공 (Body 없음)

// 404 — 존재하지 않거나 타인 소유
{ "success": false, "error": { "code": "TODO_NOT_FOUND", "message": "할일을 찾을 수 없습니다." } }
```

---

#### UC-11 — PATCH /todos/:todoId/toggle (완료 여부 토글)

**Request Header**: `Authorization: Bearer <token>`  
**Path Parameter**: `todoId` (UUID)  
**Request Body**: 없음 (서버에서 현재 `is_completed` 값을 반전 처리)

**Response**

```json
// 200 OK — 성공
{
  "success": true,
  "data": {
    "todo_id": "uuid-todo-1",
    "is_completed": true,
    "updated_at": "2026-05-13T15:00:00.000Z"
  }
}

// 404 — 존재하지 않거나 타인 소유
{ "success": false, "error": { "code": "TODO_NOT_FOUND", "message": "할일을 찾을 수 없습니다." } }
```

---

#### UC-12 — GET /todos (할일 목록 조회)

**Request Header**: `Authorization: Bearer <token>`

**Query Parameters** — 모두 선택 (생략 시 전체 조회)

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| category_id | string (UUID) | 특정 카테고리에 속한 할일만 조회 |
| due_date_from | string (`YYYY-MM-DD`) | 종료예정일 ≥ 해당 날짜 |
| due_date_to | string (`YYYY-MM-DD`) | 종료예정일 ≤ 해당 날짜 |
| is_completed | `"true"` \| `"false"` | 완료 여부 필터; 생략 시 전체 반환 |

- 복수 파라미터 적용 시 AND 조건으로 처리
- 결과 없을 경우 HTTP 200 + `data: []` 반환

```
// 예시 요청
GET /api/v1/todos?category_id=uuid-2&due_date_from=2026-05-01&due_date_to=2026-05-31&is_completed=false
```

**Response**

```json
// 200 OK — 성공
{
  "success": true,
  "data": [
    {
      "todo_id": "uuid-todo-1",
      "title": "PRD 1순위 수정 완료",
      "description": "API JSON 스키마 추가",
      "category_id": "uuid-2",
      "due_date": "2026-05-13",
      "is_completed": false,
      "created_at": "2026-05-13T13:00:00.000Z",
      "updated_at": "2026-05-13T13:00:00.000Z"
    }
  ]
}

// 200 OK — 결과 없음
{ "success": true, "data": [] }

// 400 — 날짜 형식 오류
{ "success": false, "error": { "code": "INVALID_DATE_FORMAT", "message": "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)" } }

// 400 — 시작일이 종료일보다 늦음
{ "success": false, "error": { "code": "INVALID_DATE_RANGE", "message": "시작일은 종료일보다 이전이어야 합니다." } }
```

---

## 7. 데이터베이스 설계 개요

### 7.1 테이블 목록 및 주요 컬럼

#### users 테이블

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| user_id | UUID | PK, DEFAULT gen_random_uuid() | 사용자 식별자 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 로그인 이메일 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 해시 비밀번호 |
| name | VARCHAR(50) | NOT NULL | 사용자 이름 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | 'active' 또는 'withdrawn' |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성 일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정 일시 |
| withdrawn_at | TIMESTAMPTZ | NULL | 탈퇴 일시 |

#### categories 테이블

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| category_id | UUID | PK, DEFAULT gen_random_uuid() | 카테고리 식별자 |
| user_id | UUID | NOT NULL, FK → users.user_id | 소유 사용자 |
| name | VARCHAR(50) | NOT NULL | 카테고리 이름 |
| is_default | BOOLEAN | NOT NULL | 기본 카테고리 여부 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성 일시 |

- UNIQUE 제약: (user_id, name) 복합 유니크 인덱스로 동일 사용자 내 카테고리명 중복 방지

#### todos 테이블

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| todo_id | UUID | PK, DEFAULT gen_random_uuid() | 할일 식별자 |
| user_id | UUID | NOT NULL, FK → users.user_id | 소유 사용자 |
| category_id | UUID | NOT NULL, FK → categories.category_id | 연결 카테고리 |
| title | VARCHAR(200) | NOT NULL | 할일 제목 |
| description | TEXT | NULL | 할일 설명 |
| due_date | DATE | NOT NULL | 종료 예정일 |
| is_completed | BOOLEAN | NOT NULL, DEFAULT false | 완료 여부 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성 일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정 일시 |

### 7.2 인덱스 전략

| 테이블 | 인덱스 컬럼 | 인덱스 유형 | 목적 |
|--------|-------------|-------------|------|
| users | email | UNIQUE INDEX | 중복 방지 및 로그인 조회 성능 |
| categories | (user_id, name) | UNIQUE INDEX | 카테고리명 중복 방지 |
| categories | user_id | INDEX | 사용자별 카테고리 목록 조회 |
| todos | user_id | INDEX | 사용자별 할일 목록 조회 |
| todos | (user_id, category_id) | INDEX | 카테고리 필터 조회 |
| todos | (user_id, due_date) | INDEX | 기간 필터 조회 |
| todos | (user_id, is_completed) | INDEX | 완료여부 필터 조회 |

### 7.3 데이터 보존 정책

| 데이터 유형 | 정책 |
|-------------|------|
| 사용자 계정 | 소프트 삭제 (status=withdrawn); 물리적 데이터 보존 |
| 탈퇴 사용자의 할일/카테고리 | DB 잔류 (접근 차단으로 실질적 비활성화) |
| 할일 | 영구 삭제 (하드 삭제; 복구 불가) |
| 카테고리 | 영구 삭제 (하드 삭제; 연결된 할일 없을 때만 허용) |

---

## 8. UI/UX 요구사항

### 8.1 주요 화면 목록

| 화면명 | 경로 | 설명 | 인증 필요 |
|--------|------|------|-----------|
| 회원가입 | /signup | 이메일, 비밀번호, 이름 입력 폼 | N |
| 로그인 | /login | 이메일, 비밀번호 입력 폼 | N |
| 할일 목록 (메인) | / 또는 /todos | 할일 목록 + 필터 패널 | Y |
| 할일 등록 | /todos/new | 할일 등록 폼 (제목, 카테고리, 날짜, 설명) | Y |
| 할일 수정 | /todos/:id/edit | 기존 할일 수정 폼 | Y |
| 카테고리 관리 | /categories | 카테고리 목록 + 추가/삭제 | Y |
| 내 정보 수정 | /settings | 이름·비밀번호 변경, 회원 탈퇴 | Y |

### 8.2 반응형 브레이크포인트

| 구분 | 화면 너비 | 레이아웃 |
|------|-----------|---------|
| 모바일 | 320px ~ 767px | 단일 컬럼, 햄버거 메뉴 |
| 태블릿 | 768px ~ 1023px | 2컬럼 (사이드바 + 콘텐츠) 또는 단일 컬럼 |
| 데스크탑 | 1024px 이상 | 2컬럼 (고정 사이드바 + 콘텐츠) |

### 8.3 에러 처리 UX

| 오류 유형 | 처리 방식 |
|-----------|-----------|
| 폼 유효성 실패 (클라이언트) | 제출 즉시 또는 필드 포커스 아웃 시 인라인 에러 메시지 표시 |
| API 오류 (400, 409) | 해당 필드 근처 또는 폼 상단에 서버 반환 오류 메시지 표시 |
| 인증 오류 (401) | 로그인 화면으로 리다이렉트 + 안내 메시지 |
| 리소스 없음 (404) | "해당 항목을 찾을 수 없습니다." 안내 후 목록으로 이동 |
| 네트워크 단절 | Toast 또는 Banner로 "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." 표시 후 현재 입력 폼 초기화 |
| 서버 오류 (500) | "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." 안내 |

### 8.4 주요 UX 원칙

- 카테고리 필터, 기간 필터, 완료여부 필터는 할일 목록 화면에서 실시간 반영 (TanStack Query refetch)
- 할일 완료 토글은 목록에서 즉시 체크박스 클릭으로 처리 (별도 화면 이동 없음)
- 할일 삭제는 실수 방지를 위한 확인 다이얼로그(Confirm) 표시
- 회원 탈퇴는 별도 확인 다이얼로그 + 명시적 동의 액션 필요

### 8.5 1차 제외 항목

| 항목 | 사유 | 계획 |
|------|------|------|
| 다크 모드 | 추가 UI 개발 공수 | 2차 확장 |
| 다국어 지원 (i18n) | 초기 타겟 한국어 단일 | 2차 확장 |

---

## 9. 개발 일정 (3일)

3일 단기 개발 일정으로, 백엔드 우선 구현 후 프론트엔드를 연동하는 순서로 진행한다.

### Day 1: 환경 구성 + 백엔드 인증·사용자 API

| 시간대 | 작업 항목 |
|--------|-----------|
| 오전 | 프로젝트 초기 설정: Node.js + Express 프로젝트 구조 생성, PostgreSQL 17 설치 및 DB 생성, pg 연결 풀 설정, 환경 변수(.env) 구성 |
| 오전 | DB 스키마 생성: users, categories, todos 테이블 DDL 작성 및 실행, 인덱스 생성 |
| 오후 | 인증 API 구현: UC-01 회원가입 (bcrypt 해시, 기본 카테고리 3개 자동 생성), UC-02 로그인 (JWT 발급), UC-03 로그아웃 |
| 오후 | 사용자 API 구현: UC-04 개인정보 수정, UC-05 회원 탈퇴 (소프트 삭제) |
| 오후 | JWT 인증 미들웨어 구현 및 보호 라우트 적용 |
| 저녁 | API 단위 테스트 (Postman 또는 Thunder Client로 수동 검증) |

**Day 1 완료 기준**: UC-01 ~ UC-05 API 정상 동작, JWT 인증 미들웨어 적용 완료

---

### Day 2: 백엔드 카테고리·할일 API + 프론트엔드 기반 구성

| 시간대 | 작업 항목 |
|--------|-----------|
| 오전 | 카테고리 API 구현: UC-06 카테고리 추가, UC-07 카테고리 삭제 (기본 카테고리·연결 할일 검증), GET /categories 목록 조회 |
| 오전 | 할일 API 구현 (1): UC-08 할일 등록 (KST 날짜 검증), UC-09 할일 수정 |
| 오후 | 할일 API 구현 (2): UC-10 할일 삭제, UC-11 완료 토글, UC-12 할일 목록 조회 (필터 쿼리 처리) |
| 오후 | React 19 + TypeScript 프로젝트 생성 (Vite), Zustand 인증 스토어 설정, TanStack Query 초기 설정, 공통 API 클라이언트 (axios 등) 구성 |
| 저녁 | 회원가입·로그인·로그아웃 화면 구현 및 API 연동 |
| 저녁 | 백엔드 전체 API Postman 수동 검증 완료 |

**Day 2 완료 기준**: UC-06 ~ UC-12 API 정상 동작, FE 프로젝트 기반 구성 완료, 로그인·회원가입 화면 연동 완료

---

### Day 3: 프론트엔드 핵심 화면 구현 + 통합 테스트 + 배포

| 시간대 | 작업 항목 |
|--------|-----------|
| 오전 | 할일 목록 화면 구현: 목록 조회 (UC-12), 카테고리/기간/완료여부 필터 UI, 완료 토글 (UC-11), 삭제 확인 다이얼로그 (UC-10) |
| 오전 | 할일 등록·수정 화면 구현: 등록 폼 (UC-08), 수정 폼 (UC-09) |
| 오후 | 카테고리 관리 화면 구현 (UC-06, UC-07), 내 정보 수정·회원 탈퇴 화면 구현 (UC-04, UC-05) |
| 오후 | 에러 처리 UX 구현: 네트워크 오류 Toast, 폼 인라인 에러, 401 리다이렉트 |
| 오후 | 반응형 레이아웃 적용 (모바일·태블릿·데스크탑) |
| 저녁 | E2E 통합 테스트: 회원가입 → 로그인 → 카테고리 추가 → 할일 등록·수정·완료·삭제 → 로그아웃 전체 시나리오 검증 |
| 저녁 | 배포: BE + FE 빌드, 환경 변수 설정, TLS 적용, 서비스 기동 확인 |

**Day 3 완료 기준**: UC-01 ~ UC-12 전체 화면 구현 및 통합 테스트 완료, 배포 완료

---

## 10. 위험 요소 및 완화 방안

| # | 위험 요소 | 발생 가능성 | 영향도 | 완화 방안 |
|---|-----------|-------------|--------|-----------|
| R-01 | 3일 일정 내 전체 UC 구현 완료 불가 | 높음 | 높음 | Day 2 말까지 BE API 전체 완료를 필수 목표로 설정; FE는 핵심 화면(목록·등록·로그인) 우선 구현 후 세부 화면 순차 적용; 시간 부족 시 카테고리 관리·내 정보 수정 화면을 간소화하여 구현 |
| R-02 | KST 기준 날짜 검증 로직 오류 | 중간 | 중간 | BE에서 `due_date` 비교 시 Node.js의 시스템 시간대를 KST(UTC+9)로 설정하거나 명시적으로 UTC 기준 오프셋 계산; 단위 테스트 케이스 작성으로 경계값(당일, 전일) 검증 |
| R-03 | JWT 보안 설정 미흡 (Secret 노출, 만료 설정 누락) | 낮음 | 높음 | JWT Secret을 환경 변수로만 관리; 토큰 만료 시간 명시적 설정 (예: 24h); 소스 코드 커밋 전 `.env` 파일이 `.gitignore`에 포함되어 있는지 확인 |
| R-04 | 기본 카테고리 자동 생성 트랜잭션 실패 | 낮음 | 중간 | 회원가입 시 사용자 생성 + 기본 카테고리 3개 생성을 단일 DB 트랜잭션으로 처리; 트랜잭션 실패 시 전체 롤백하여 불완전한 사용자 레코드가 남지 않도록 구현 |
| R-05 | 반응형 UI 구현 시간 부족 | 중간 | 낮음 | CSS 프레임워크(Tailwind CSS 등) 또는 컴포넌트 라이브러리를 활용하여 반응형 레이아웃 구현 시간 단축; 모바일 레이아웃은 최소한의 가독성 확보 수준으로 우선 구현 후 데스크탑 최적화 |

---

## 11. 추적성 매트릭스

UC-ID, 기능 요구사항, API 엔드포인트, 연관 BR의 연결 관계를 정의한다.

| UC-ID | 기능명 | Method | API Endpoint | 인증 | 관련 BR |
|-------|--------|--------|--------------|------|---------|
| UC-01 | 회원가입 | POST | /api/v1/auth/signup | N | BR-03, BR-04, BR-09, BR-10 |
| UC-02 | 로그인 | POST | /api/v1/auth/login | N | BR-01, BR-09 |
| UC-03 | 로그아웃 | POST | /api/v1/auth/logout | Y | BR-01 |
| UC-04 | 개인정보 수정 | PATCH | /api/v1/users/me | Y | BR-01, BR-02, BR-10 |
| UC-05 | 회원 탈퇴 | DELETE | /api/v1/users/me | Y | BR-01, BR-02, BR-09 |
| UC-06 | 카테고리 추가 | POST | /api/v1/categories | Y | BR-01, BR-02 |
| UC-07 | 카테고리 삭제 | DELETE | /api/v1/categories/:categoryId | Y | BR-01, BR-02, BR-05, BR-06 |
| UC-08 | 할일 등록 | POST | /api/v1/todos | Y | BR-01, BR-02, BR-07 |
| UC-09 | 할일 수정 | PATCH | /api/v1/todos/:todoId | Y | BR-01, BR-02, BR-07 |
| UC-10 | 할일 삭제 | DELETE | /api/v1/todos/:todoId | Y | BR-01, BR-02 |
| UC-11 | 할일 완료 토글 | PATCH | /api/v1/todos/:todoId/toggle | Y | BR-01, BR-02, BR-08 |
| UC-12 | 할일 목록 조회 | GET | /api/v1/todos | Y | BR-01, BR-02 |

### BR 적용 범위 요약

| BR-ID | 규칙 요약 | 적용 UC |
|-------|-----------|---------|
| BR-01 | 인증된(status=active) 사용자만 사용 가능 | UC-02 ~ UC-12 전체 |
| BR-02 | 자신 소유 리소스만 접근 가능 (타인 리소스 HTTP 404) | UC-04 ~ UC-12 |
| BR-03 | 이메일 시스템 내 유일; 중복 시 HTTP 409 | UC-01 |
| BR-04 | 회원가입 시 기본 카테고리(일반·업무·개인) 3개 자동 생성 | UC-01 |
| BR-05 | 기본 카테고리(is_default=true) 삭제·수정 불가 | UC-07 |
| BR-06 | 할일 연결된 카테고리 삭제 불가; HTTP 409 | UC-07 |
| BR-07 | 종료예정일은 KST 기준 오늘 이상 (당일 허용) | UC-08, UC-09 |
| BR-08 | 완료된 할일도 완료 취소(토글) 가능 | UC-11 |
| BR-09 | 탈퇴 시 소프트 삭제; 탈퇴 이메일 재가입 불가 | UC-01, UC-02, UC-05 |
| BR-10 | 비밀번호 최소 8자, 영문+숫자 각 1자 이상 | UC-01, UC-04 |
