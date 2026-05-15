# TodoListApp 프론트엔드 통합 가이드

---

## 문서 메타데이터

| 항목 | 내용 |
|------|------|
| 문서명 | TodoListApp 프론트엔드 통합 가이드 |
| 버전 | 1.0.0 |
| 작성일 | 2026-05-14 |
| 작성자 | youngnam.her |
| 상태 | Draft |
| 참조 문서 | docs/4-prd.md, docs/6-project-principle.md, docs/9-execution-plan.md, swagger/swagger.json |

---

## 1. 개요

이 문서는 백엔드 API 서버(`backend/`)가 완성된 상태에서, 프론트엔드(`frontend/`) 개발자가 API를 연동할 때 필요한 모든 정보를 담고 있다.

### 1.1 백엔드 API 서버 정보

| 항목 | 값 |
|------|-----|
| 로컬 서버 URL | `http://localhost:3000` |
| API Base URL | `http://localhost:3000/api/v1` |
| Swagger UI | `http://localhost:3000/api-docs` (비운영 환경 한정) |
| 헬스체크 | `GET http://localhost:3000/health` |

### 1.2 FE 기술 스택

| 항목 | 기술 | 버전 |
|------|------|------|
| UI 프레임워크 | React | 19.x |
| 언어 | TypeScript | 5.x |
| 빌드 도구 | Vite | 6.x |
| 전역 상태 관리 | Zustand | 5.x |
| 서버 상태 관리 | TanStack Query | 5.x |
| HTTP 클라이언트 | Axios | - |
| 라우터 | react-router-dom | 6.x |

---

## 2. 개발 환경 설정

### 2.1 환경 변수

`frontend/.env` 파일을 생성한다.

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

> `.env`는 `.gitignore`에 포함한다. `frontend/.env.example`을 커밋하여 키 목록을 공유한다.

### 2.2 Vite 프록시 설정 (선택)

`vite.config.ts`에 개발 환경 프록시를 설정하면 CORS 없이 API를 호출할 수 있다.

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

> 프록시를 사용하면 `VITE_API_BASE_URL=/api/v1`으로 설정한다. 미사용 시 `http://localhost:3000/api/v1`을 그대로 사용한다.

### 2.3 백엔드 CORS 허용 오리진

백엔드 `backend/.env`의 `CORS_ALLOWED_ORIGINS`에 Vite 개발 서버 주소를 추가해야 한다.

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 3. 인증 전략

### 3.1 JWT Bearer Token

- 로그인 성공 시 서버가 JWT를 발급한다.
- 이후 모든 보호 API 호출 시 `Authorization: Bearer <token>` 헤더를 포함해야 한다.
- 토큰 만료 기간: **24시간** (`JWT_EXPIRES_IN=24h`)
- JWT 페이로드: `{ user_id, status, iat, exp }`
- 토큰 만료 또는 무효 토큰 → 서버는 **HTTP 401**을 반환한다.

### 3.2 토큰 저장 위치: Zustand 메모리 전용

```
JWT 저장: Zustand 스토어 메모리에만 저장
localStorage, sessionStorage, Cookie 사용 금지
페이지 새로고침 시 토큰 초기화 → 재로그인 필요
```

### 3.3 Zustand 인증 스토어

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: { user_id: string; email: string; name: string } | null;
  isLoggedIn: boolean;
  login: (token: string, user: AuthState['user']) => void;
  logout: () => void;
}

// persist 미들웨어 미사용: 메모리에만 저장
export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  isLoggedIn: false,
  login: (token, user) => set({ token, user, isLoggedIn: true }),
  logout: () => set({ token: null, user: null, isLoggedIn: false }),
}));
```

### 3.4 Axios 클라이언트 (인터셉터 포함)

```typescript
// src/api/client.ts
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

// Response 인터셉터: 401 자동 로그아웃 + 리다이렉트
// 단, 로그인/회원가입 엔드포인트에서 발생한 401은 제외 (잘못된 자격증명 → 폼 에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/signup');
      if (!isAuthEndpoint) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3.5 로그아웃 처리

서버는 블랙리스트를 운용하지 않는다. 로그아웃은 클라이언트 측에서만 처리한다.

```typescript
const handleLogout = async () => {
  await authApi.logout();           // POST /auth/logout (서버 호출)
  useAuthStore.getState().logout(); // Zustand 초기화
  queryClient.clear();              // TanStack Query 캐시 제거
  navigate('/login');
};
```

---

## 4. 공통 타입 정의

### 4.1 API 응답 형식

```typescript
// src/types/api.types.ts

// 성공 응답
interface ApiResponse<T> {
  success: true;
  data: T;
}

// 실패 응답
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

### 4.2 도메인 타입

```typescript
// src/types/user.types.ts
interface User {
  user_id: string;
  email: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface UpdateUserRequest {
  name?: string;
  current_password?: string;
  new_password?: string;
}
```

```typescript
// src/types/category.types.ts
interface Category {
  category_id: string;
  name_ko: string;       // 한국어 이름 (필수)
  name_en: string | null; // 영어 이름 (선택)
  name_zh: string | null; // 중국어 이름 (선택)
  is_default: boolean;
  created_at: string;
}

interface CreateCategoryRequest {
  name_ko: string;
  name_en: string;
  name_zh: string;
}
```

```typescript
// src/types/todo.types.ts
interface Todo {
  todo_id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  due_date: string;            // 'YYYY-MM-DD'
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateTodoRequest {
  title: string;
  category_id: string;
  due_date: string;            // 'YYYY-MM-DD'
  description?: string;
}

interface UpdateTodoRequest {
  title?: string;
  category_id?: string;
  due_date?: string;           // 'YYYY-MM-DD'
  description?: string | null;
}

interface TodoFilter {
  category_id?: string;
  due_date_from?: string;      // 'YYYY-MM-DD'
  due_date_to?: string;        // 'YYYY-MM-DD'
  is_completed?: boolean;
}
```

```typescript
// src/types/auth.types.ts
interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    user_id: string;
    email: string;
    name: string;
  };
}
```

---

## 5. 에러 코드 상수

BE와 동기화하여 관리한다.

```typescript
// src/constants/errorCodes.ts
export const ERROR_CODES = {
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
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
```

---

## 6. API 엔드포인트별 클라이언트 함수

### 6.1 인증 API (공개 — 토큰 불필요)

```typescript
// src/api/authApi.ts
import apiClient from './client';
import type { SignupRequest, LoginRequest, LoginResponse } from '../types/auth.types';
import type { User } from '../types/user.types';

export const authApi = {
  signup: async (data: SignupRequest): Promise<User> => {
    const res = await apiClient.post('/auth/signup', data);
    return res.data.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post('/auth/login', data);
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
```

**UC-01 회원가입**

```
POST /api/v1/auth/signup
Body: { email, password, name }
201: { success: true, data: { user_id, email, name, created_at } }
409: DUPLICATE_EMAIL
400: INVALID_PASSWORD | MISSING_REQUIRED_FIELD
```

**UC-02 로그인**

```
POST /api/v1/auth/login
Body: { email, password }
200: { success: true, data: { token, user: { user_id, email, name } } }
401: INVALID_CREDENTIALS
400: MISSING_REQUIRED_FIELD
```

**UC-03 로그아웃**

```
POST /api/v1/auth/logout
Header: Authorization: Bearer <token>
200: { success: true, data: null }
401: UNAUTHORIZED
```

---

### 6.2 사용자 API (인증 필요)

```typescript
// src/api/userApi.ts
import apiClient from './client';
import type { User, UpdateUserRequest } from '../types/user.types';

export const userApi = {
  updateMe: async (data: UpdateUserRequest): Promise<User> => {
    const res = await apiClient.patch('/users/me', data);
    return res.data.data;
  },

  deleteMe: async (): Promise<null> => {
    const res = await apiClient.delete('/users/me');
    return res.data.data;
  },
};
```

**UC-04 개인정보 수정**

```
PATCH /api/v1/users/me
Header: Authorization: Bearer <token>
Body: { name? } | { current_password, new_password } | 둘 다 포함 가능
200: { success: true, data: { user_id, email, name, updated_at } }
401: WRONG_CURRENT_PASSWORD
400: INVALID_PASSWORD | NAME_TOO_LONG | MISSING_REQUIRED_FIELD
```

> `new_password`만 전달하고 `current_password`를 생략하면 `400 MISSING_REQUIRED_FIELD` 반환.

**UC-05 회원 탈퇴**

```
DELETE /api/v1/users/me
Header: Authorization: Bearer <token>
200: { success: true, data: null }
400: ALREADY_WITHDRAWN
```

---

### 6.3 카테고리 API (인증 필요)

```typescript
// src/api/categoryApi.ts
import apiClient from './client';
import type { Category, CreateCategoryRequest } from '../types/category.types';

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get('/categories');
    return res.data.data;
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const res = await apiClient.post('/categories', data);
    return res.data.data;
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    await apiClient.delete(`/categories/${categoryId}`);
  },
};
```

**카테고리 목록 조회**

```
GET /api/v1/categories
Header: Authorization: Bearer <token>
200: { success: true, data: [ { category_id, name_ko, name_en, name_zh, is_default, created_at }, ... ] }
```

> 회원가입 시 자동 생성된 기본 카테고리 3개(일반·업무·개인, `is_default: true`)가 포함된다.  
> 기본 카테고리는 name_en, name_zh에 사전 정의된 번역이 포함된다.

**UC-06 카테고리 추가**

```
POST /api/v1/categories
Header: Authorization: Bearer <token>
Body: { name_ko, name_en?, name_zh? }
201: { success: true, data: { category_id, name_ko, name_en, name_zh, is_default: false, created_at } }
409: DUPLICATE_CATEGORY_NAME
400: NAME_TOO_LONG | MISSING_REQUIRED_FIELD
```

**UC-07 카테고리 삭제**

```
DELETE /api/v1/categories/:categoryId
Header: Authorization: Bearer <token>
204: (No Content)
400: DEFAULT_CATEGORY_NOT_DELETABLE
409: CATEGORY_HAS_TODOS
404: CATEGORY_NOT_FOUND
```

> 기본 카테고리(`is_default: true`)는 삭제 불가 → 삭제 버튼 비활성화 처리 권장.

---

### 6.4 할일 API (인증 필요)

```typescript
// src/api/todoApi.ts
import apiClient from './client';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilter } from '../types/todo.types';

export const todoApi = {
  getTodos: async (filters?: TodoFilter): Promise<Todo[]> => {
    const res = await apiClient.get('/todos', { params: filters });
    return res.data.data;
  },

  createTodo: async (data: CreateTodoRequest): Promise<Todo> => {
    const res = await apiClient.post('/todos', data);
    return res.data.data;
  },

  updateTodo: async (todoId: string, data: UpdateTodoRequest): Promise<Todo> => {
    const res = await apiClient.patch(`/todos/${todoId}`, data);
    return res.data.data;
  },

  deleteTodo: async (todoId: string): Promise<void> => {
    await apiClient.delete(`/todos/${todoId}`);
  },

  toggleTodo: async (todoId: string): Promise<Pick<Todo, 'todo_id' | 'is_completed' | 'updated_at'>> => {
    const res = await apiClient.patch(`/todos/${todoId}/toggle`);
    return res.data.data;
  },
};
```

**UC-12 할일 목록 조회**

```
GET /api/v1/todos
Header: Authorization: Bearer <token>
Query: category_id?, due_date_from?, due_date_to?, is_completed?
200: { success: true, data: [ ...todos ] }  // 결과 없으면 data: []
400: INVALID_DATE_FORMAT | INVALID_DATE_RANGE
```

> `is_completed` 쿼리 파라미터는 문자열 `"true"` 또는 `"false"`로 전달해야 한다. Axios의 `params`를 사용하면 자동 처리된다.

**UC-08 할일 등록**

```
POST /api/v1/todos
Header: Authorization: Bearer <token>
Body: { title, category_id, due_date, description? }
201: { success: true, data: { todo_id, title, description, category_id, due_date, is_completed: false, created_at, updated_at } }
400: INVALID_DUE_DATE | INVALID_TITLE | INVALID_CATEGORY | MISSING_REQUIRED_FIELD
```

> `due_date`는 `YYYY-MM-DD` 형식, KST 기준 오늘 날짜 이상이어야 한다.

**UC-09 할일 수정**

```
PATCH /api/v1/todos/:todoId
Header: Authorization: Bearer <token>
Body: { title?, category_id?, due_date?, description? }  // 변경할 필드만 포함
200: { success: true, data: { ...수정된 todo 전체 } }
400: INVALID_DUE_DATE | INVALID_TITLE
404: TODO_NOT_FOUND
```

> `description: null` 전달 시 설명이 삭제된다.

**UC-10 할일 삭제**

```
DELETE /api/v1/todos/:todoId
Header: Authorization: Bearer <token>
204: (No Content)
404: TODO_NOT_FOUND
```

**UC-11 완료 여부 토글**

```
PATCH /api/v1/todos/:todoId/toggle
Header: Authorization: Bearer <token>
Body: 없음
200: { success: true, data: { todo_id, is_completed, updated_at } }
404: TODO_NOT_FOUND
```

> 서버가 현재 `is_completed` 값을 반전 처리한다. 완료 취소도 동일한 엔드포인트를 사용한다.

---

## 7. TanStack Query 훅 구현

### 7.1 QueryClient 설정

```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5분
    },
  },
});
```

### 7.2 쿼리 키 규칙

```typescript
// src/constants/queryKeys.ts
export const QUERY_KEYS = {
  todos: (filters?: object) => ['todos', filters] as const,
  categories: () => ['categories'] as const,
};
```

### 7.3 카테고리 훅

```typescript
// src/hooks/useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../api/categoryApi';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useCategories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.categories(),
    queryFn: categoryApi.getCategories,
  });
};
```

```typescript
// src/hooks/useCreateCategory.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../api/categoryApi';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { CreateCategoryRequest } from '../types/category.types';

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories() });
    },
  });
};
```

```typescript
// src/hooks/useDeleteCategory.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../api/categoryApi';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => categoryApi.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories() });
    },
  });
};
```

### 7.4 할일 훅

```typescript
// src/hooks/useTodos.ts
import { useQuery } from '@tanstack/react-query';
import { todoApi } from '../api/todoApi';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { TodoFilter } from '../types/todo.types';

export const useTodos = (filters?: TodoFilter) => {
  return useQuery({
    queryKey: QUERY_KEYS.todos(filters),
    queryFn: () => todoApi.getTodos(filters),
  });
};
```

```typescript
// src/hooks/useCreateTodo.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../api/todoApi';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { CreateTodoRequest } from '../types/todo.types';

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTodoRequest) => todoApi.createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
```

```typescript
// src/hooks/useToggleTodo.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../api/todoApi';

export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (todoId: string) => todoApi.toggleTodo(todoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
```

```typescript
// src/hooks/useDeleteTodo.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../api/todoApi';

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (todoId: string) => todoApi.deleteTodo(todoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
```

---

## 8. 화면별 API 연동 가이드

### 8.1 회원가입 화면 (`/signup`)

| 단계 | 액션 | 처리 |
|------|------|------|
| 폼 제출 | `authApi.signup()` 호출 | 성공 시 `/login` 이동 |
| 이메일 중복 | 409 + `DUPLICATE_EMAIL` | 이메일 필드 인라인 에러 표시 |
| 비밀번호 정책 위반 | 400 + `INVALID_PASSWORD` | 비밀번호 필드 인라인 에러 표시 |
| 필수 필드 누락 | 400 + `MISSING_REQUIRED_FIELD` | 해당 필드 에러 표시 |

**클라이언트 사전 검증:**
- 이메일: 이메일 형식 확인
- 비밀번호: 8자 이상, 영문+숫자 각 1자 이상 (`/^(?=.*[A-Za-z])(?=.*\d).{8,}$/`)
- 이름: 필수, 최대 50자

### 8.2 로그인 화면 (`/login`)

```typescript
const handleLogin = async (data: LoginRequest) => {
  const result = await authApi.login(data);
  useAuthStore.getState().login(result.token, result.user);
  navigate('/todos');
};
```

| 단계 | 액션 | 처리 |
|------|------|------|
| 폼 제출 | `authApi.login()` 호출 | 성공 시 Zustand에 token/user 저장 후 `/todos` 이동 |
| 자격증명 불일치 | 401 + `INVALID_CREDENTIALS` | 폼 상단 에러 메시지 표시 |
| 탈퇴 계정 로그인 | 401 + `INVALID_CREDENTIALS` | 동일하게 처리 (보안상 이유로 서버가 구체적 이유를 노출하지 않음) |

### 8.3 할일 목록 화면 (`/todos`)

```typescript
// 필터 상태 관리 예시
const [filters, setFilters] = useState<TodoFilter>({});
const { data: todos, isLoading } = useTodos(filters);

// 필터 변경 시 TanStack Query가 자동으로 재조회
const handleFilterChange = (newFilter: Partial<TodoFilter>) => {
  setFilters(prev => ({ ...prev, ...newFilter }));
};
```

| 기능 | 훅 | 비고 |
|------|-----|------|
| 목록 조회 | `useTodos(filters)` | 필터 변경 시 자동 재조회 |
| 완료 토글 | `useToggleTodo()` | 체크박스 클릭 즉시 처리 |
| 삭제 | `useDeleteTodo()` | 확인 Modal 후 실행 |

**필터 파라미터 주의사항:**
- `is_completed`: boolean 타입으로 전달 (Axios가 `"true"`/`"false"` 문자열로 자동 변환)
- `due_date_from`, `due_date_to`: `YYYY-MM-DD` 형식만 허용
- `due_date_from > due_date_to`이면 서버에서 `400 INVALID_DATE_RANGE` 반환

### 8.4 할일 등록 화면 (`/todos/new`)

```typescript
const createTodo = useCreateTodo();

const handleSubmit = async (data: CreateTodoRequest) => {
  await createTodo.mutateAsync(data);
  navigate('/todos');
};
```

| 필드 | 유효성 규칙 | 에러 코드 |
|------|-------------|-----------|
| title | 필수, 최대 200자 | `INVALID_TITLE` |
| category_id | 필수, 자신 소유 카테고리 | `INVALID_CATEGORY` |
| due_date | 필수, `YYYY-MM-DD`, 오늘 이상 (KST) | `INVALID_DUE_DATE` |
| description | 선택 | - |

### 8.5 할일 수정 화면 (`/todos/:id/edit`)

- URL에서 `todoId`를 추출하여 기존 값을 폼에 사전 입력한다.
- 변경된 필드만 포함하여 PATCH 요청을 보낸다.
- 서버가 `404 TODO_NOT_FOUND` 반환 시 목록으로 이동 + 안내 메시지.

```typescript
const updateTodo = useUpdateTodo();

const handleSubmit = async (data: UpdateTodoRequest) => {
  await updateTodo.mutateAsync({ todoId, data });
  navigate('/todos');
};
```

### 8.6 카테고리 관리 화면 (`/categories`)

| 기능 | 처리 |
|------|------|
| 기본 카테고리 (`is_default: true`) | 삭제 버튼 비활성화 처리 |
| 사용자 정의 카테고리 삭제 | `409 CATEGORY_HAS_TODOS` 시 에러 메시지 표시 |
| 카테고리 추가 | `409 DUPLICATE_CATEGORY_NAME` 시 인라인 에러 |

### 8.7 내 정보 화면 (`/settings`)

**이름 변경:**
```
PATCH /api/v1/users/me
Body: { name: "새이름" }
성공 시: authStore의 user.name 갱신
```

**비밀번호 변경:**
```
PATCH /api/v1/users/me
Body: { current_password: "현재pw", new_password: "새pw" }
성공 시: 성공 메시지 표시
```

**이름 + 비밀번호 동시 변경:**
```
PATCH /api/v1/users/me
Body: { name: "새이름", current_password: "현재pw", new_password: "새pw" }
서버가 이름 먼저, 비밀번호 후 순서로 처리
```

**회원 탈퇴:**
```
DELETE /api/v1/users/me
성공 시: authStore 초기화 + queryClient.clear() + /login 이동
탈퇴 후 동일 이메일로 재가입 불가
```

---

## 9. 에러 처리 UX 가이드

### 9.1 에러 유형별 처리 방식

| 에러 유형 | HTTP 상태 | 처리 방식 |
|-----------|-----------|-----------|
| 폼 유효성 (클라이언트) | - | 제출 전 또는 blur 시 인라인 에러 표시 |
| 비즈니스 규칙 위반 | 400, 409 | 해당 필드 또는 폼 상단 서버 메시지 표시 |
| 자격증명 오류 | 401 (`/auth/login`) | 로그인 화면 상단 인라인 에러 (리다이렉트 없음) |
| 인증 만료/미인증 | 401 (보호 API) | Axios 인터셉터가 자동 로그아웃 + `/login` 리다이렉트 |
| 리소스 없음 | 404 | "찾을 수 없습니다" 안내 후 목록 이동 |
| 서버 오류 | 500 | Toast: "일시적인 오류가 발생했습니다." |
| 네트워크 단절 | - | Toast: "네트워크 오류가 발생했습니다." |

### 9.2 서버 에러 메시지 활용

API 오류 응답의 `error.message`는 한국어로 작성되어 있어 UI에 직접 표시할 수 있다.

```typescript
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message ?? '알 수 없는 오류가 발생했습니다.';
  }
  return '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
};
```

### 9.3 TanStack Query 에러 처리

```typescript
const createTodo = useCreateTodo();

// onError 콜백 활용
createTodo.mutate(data, {
  onError: (error) => {
    const message = getErrorMessage(error);
    setErrorMessage(message); // 폼 상단 에러 표시
  },
});
```

### 9.4 에러 코드별 필드 매핑

| 에러 코드 | 표시 위치 |
|-----------|-----------|
| `DUPLICATE_EMAIL` | 이메일 필드 하단 |
| `INVALID_PASSWORD` | 비밀번호 필드 하단 |
| `NAME_TOO_LONG` | 이름 필드 하단 |
| `WRONG_CURRENT_PASSWORD` | 현재 비밀번호 필드 하단 |
| `DUPLICATE_CATEGORY_NAME` | 카테고리 이름 필드 하단 |
| `DEFAULT_CATEGORY_NOT_DELETABLE` | 삭제 버튼 비활성화 (사전 방지) |
| `CATEGORY_HAS_TODOS` | 카테고리 항목 근처 에러 메시지 |
| `INVALID_DUE_DATE` | 마감일 필드 하단 |
| `INVALID_TITLE` | 제목 필드 하단 |
| `INVALID_DATE_FORMAT` | 날짜 필드 하단 |
| `INVALID_DATE_RANGE` | 종료 날짜 필드 하단 |

---

## 10. 다국어(i18n) 가이드

### 10.1 지원 언어

| 코드 | 언어 | 기본값 |
|------|------|--------|
| `ko` | 한국어 | ✅ (기본) |
| `en` | English | |
| `zh` | 中文 (간체) | |

언어 설정은 `localStorage`의 `language` 키에 저장된다.

### 10.2 useLanguage 훅

```typescript
// src/hooks/useLanguage.ts
import { useTranslation } from 'react-i18next';

export function useLanguage() {
  const { i18n } = useTranslation();
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    // <html lang="..."> 속성도 동기화
  };
  return { currentLanguage: i18n.language, changeLanguage };
}
```

### 10.3 카테고리 이름 표시

카테고리 이름은 현재 언어에 맞는 컬럼을 우선 표시하며, 해당 언어 번역이 없으면 한국어(`name_ko`)로 폴백한다.

```typescript
// src/utils/categoryUtils.ts
export function getCategoryName(category: Category, lang: string): string {
  if (lang === 'en' && category.name_en) return category.name_en;
  if (lang === 'zh' && category.name_zh) return category.name_zh;
  return category.name_ko;
}
```

### 10.4 번역 파일 위치

```
src/locales/
  ko.json   — 한국어 (기본)
  en.json   — 영어
  zh.json   — 중국어 (간체)
```

---

## 11. 라우팅 설정

```typescript
// src/App.tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  // 공개 라우트
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  // 보호 라우트
  {
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { path: '/', element: <Navigate to="/todos" replace /> },
      { path: '/todos', element: <TodoListPage /> },
      { path: '/todos/new', element: <TodoCreatePage /> },
      { path: '/todos/:id/edit', element: <TodoEditPage /> },
      { path: '/categories', element: <CategoryPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
]);
```

---

## 12. 주요 UX 원칙

| 기능 | UX 원칙 |
|------|---------|
| 완료 토글 | 목록에서 체크박스 클릭 즉시 처리 (별도 화면 이동 없음) |
| 할일 삭제 | 확인 Modal 표시 후 실행 (실수 방지) |
| 회원 탈퇴 | 확인 Modal + "탈퇴 후에는 동일한 이메일로 재가입이 불가합니다." 안내 |
| 필터 적용 | 필터 변경 즉시 목록 재조회 (TanStack Query 자동 처리) |
| 새로고침 | Zustand 메모리 초기화 → 자동으로 `/login`으로 이동 |
| 인증 만료 | Axios 인터셉터가 401 감지 → 자동 로그아웃 + `/login` 리다이렉트 |

---

## 13. 반응형 브레이크포인트

| 구분 | 화면 너비 | 레이아웃 |
|------|-----------|---------|
| 모바일 | 320px ~ 767px | 단일 컬럼, 햄버거 메뉴 (사이드바 숨김) |
| 태블릿 | 768px ~ 1023px | 2컬럼 또는 단일 컬럼 |
| 데스크탑 | 1024px 이상 | 고정 사이드바 + 콘텐츠 2컬럼 |

---

## 14. 개발 체크리스트

프론트엔드 개발 시 아래 항목을 순서대로 완료한다.

- [ ] `frontend/.env` 파일 생성 (`VITE_API_BASE_URL` 설정)
- [ ] `vite.config.ts` 프록시 설정 또는 백엔드 `CORS_ALLOWED_ORIGINS`에 `http://localhost:5173` 추가
- [ ] `src/stores/authStore.ts` 구현 (메모리 전용, persist 미사용)
- [ ] `src/api/client.ts` 구현 (JWT 인터셉터, 401 리다이렉트)
- [ ] `src/api/*.ts` 도메인별 API 함수 구현
- [ ] `src/hooks/*.ts` TanStack Query 훅 구현
- [ ] 보호 라우트 설정 (미인증 시 `/login` 리다이렉트)
- [ ] 로그아웃 시 `authStore.logout()` + `queryClient.clear()` 동시 호출 확인
- [ ] 401 응답 시 자동 로그아웃 동작 확인
- [ ] 기본 카테고리 삭제 버튼 비활성화 처리 확인 (`is_default: true`)
- [ ] 할일 삭제/회원 탈퇴 확인 Modal 구현
- [ ] 모든 API 오류에 대한 인라인 에러 또는 Toast 메시지 처리

---

*문서 끝*
