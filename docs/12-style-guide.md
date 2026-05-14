# TodoListApp - 프론트엔드 스타일 가이드

> 참조 UI: 네이버 캘린더 스크린샷  
> 적용 화면: docs/10-wireframe.md 기준 7개 화면

---

## 목차

1. [디자인 원칙](#1-디자인-원칙)
2. [색상 시스템](#2-색상-시스템)
3. [다크모드](#3-다크모드)
4. [타이포그래피](#4-타이포그래피)
5. [간격 시스템](#5-간격-시스템)
6. [레이아웃 & 그리드](#6-레이아웃--그리드)
7. [컴포넌트 스타일](#7-컴포넌트-스타일)
8. [상태 표시](#8-상태-표시)
9. [애니메이션](#9-애니메이션)
10. [아이콘](#10-아이콘)
11. [반응형 브레이크포인트](#11-반응형-브레이크포인트)
12. [Tailwind CSS 설정 참조](#12-tailwind-css-설정-참조)

---

## 1. 디자인 원칙

네이버 캘린더 UI에서 추출한 핵심 설계 철학을 TodoListApp에 적용한다.

| 원칙 | 설명 |
|------|------|
| **단순 & 명확** | 핵심 기능만 노출, 불필요한 장식 배제 |
| **정보 계층** | 타이포그래피·색상으로 중요도를 시각적으로 분리 |
| **색상 코딩** | 카테고리별 구분색으로 빠른 스캔 지원 |
| **여백 중심** | 충분한 여백으로 콘텐츠 가독성 확보 |
| **일관된 패턴** | 동일한 인터랙션 패턴 반복 적용으로 학습 비용 최소화 |

---

## 2. 색상 시스템

### 2.1 주요 색상 팔레트

```
Primary   #2563EB  ████  주요 액션 버튼, 포커스 링, 활성 링크
Success   #16A34A  ████  완료 상태, 성공 토스트, 체크 아이콘
Danger    #DC2626  ████  삭제 버튼, 에러 토스트, 경고 텍스트
Warning   #D97706  ████  경고 배지, 알림 아이콘
```

### 2.2 중립 색상 (Gray Scale)

```
Gray-50   #F9FAFB  ████  페이지 배경, 사이드바 배경
Gray-100  #F3F4F6  ████  카드 배경, 호버 상태 배경
Gray-200  #E5E7EB  ████  구분선(divider), 비활성 입력 테두리
Gray-400  #9CA3AF  ████  플레이스홀더 텍스트, 비활성 아이콘
Gray-600  #4B5563  ████  보조 텍스트 (날짜, 뱃지)
Gray-900  #111827  ████  주요 텍스트 (제목, 본문)
```

### 2.3 카테고리 구분색

네이버 캘린더의 카테고리 색상 체계를 참조, 6가지 미리 정의된 팔레트를 사용한다.  
사용자가 직접 색상을 선택하지 않으므로 기본값 3개 + 사용자 추가 카테고리 순환 적용.

```
Cat-Blue    #2563EB  ████  (기본) 일반
Cat-Green   #16A34A  ████  (기본) 업무
Cat-Purple  #7C3AED  ████  (기본) 개인
Cat-Teal    #0D9488  ████  사용자 정의 1번
Cat-Rose    #E11D48  ████  사용자 정의 2번
Cat-Amber   #D97706  ████  사용자 정의 3번
```

### 2.4 배경 / 표면 색상

```
Surface-Page     #FFFFFF   메인 콘텐츠 영역 배경
Surface-Sidebar  #F9FAFB   사이드바 배경 (네이버 캘린더 좌측 패널 참조)
Surface-Card     #FFFFFF   카드, 필터 패널
Surface-Overlay  rgba(0,0,0,0.4)  모달 오버레이
```

### 2.5 다크모드 색상 변수

라이트/다크 전환은 CSS 커스텀 프로퍼티(변수)로 관리한다. `<html>` 요소에 `.dark` 클래스가 추가되면 `.dark` 블록의 값으로 전환된다.

| 변수명 | 라이트 | 다크 | 용도 |
|--------|--------|------|------|
| `--color-bg` | `#ffffff` | `#111827` | 메인 배경 |
| `--color-bg-sub` | `#F9FAFB` | `#1F2937` | 사이드바·보조 배경 |
| `--color-border` | `#E5E7EB` | `#374151` | 구분선·테두리 |
| `--color-text-primary` | `#111827` | `#F9FAFB` | 주요 텍스트 |
| `--color-text-secondary` | `#4B5563` | `#D1D5DB` | 보조 텍스트 |
| `--color-text-muted` | `#9CA3AF` | `#6B7280` | 희미한 텍스트 |
| `--color-input-bg` | `#ffffff` | `#1F2937` | 입력 필드 배경 |
| `--color-hover` | `#F3F4F6` | `#374151` | 호버 배경 |
| `--color-nav-active-bg` | `#DBEAFE` | `#1e3a5f` | 사이드바 활성 메뉴 배경 |
| `--color-nav-active-text` | `#1D4ED8` | `#93C5FD` | 사이드바 활성 메뉴 텍스트 |
| `--color-nav-text` | `#4B5563` | `#9CA3AF` | 사이드바 비활성 메뉴 텍스트 |

카테고리 구분색(배지·사이드바 dot)과 Primary/Danger 버튼 색상은 다크모드에서도 동일하게 유지한다.

### 2.6 색상 사용 규칙

- 빨간색(`Danger`)은 삭제·탈퇴 등 **비가역적 액션**에만 사용
- 초록색(`Success`)은 완료 체크, 성공 피드백에만 사용
- 카테고리 구분색은 **좌측 사이드바의 색상 점(dot)**, **할일 목록의 카테고리 뱃지**에만 적용
- 파란색(`Primary`)은 CTA 버튼 1개 화면 원칙 (화면당 Primary 버튼 최대 1개)

---

## 3. 다크모드

### 3.1 개요

사용자가 헤더의 토글 버튼으로 라이트/다크 모드를 직접 선택할 수 있다. 선택 상태는 `localStorage`의 `theme` 키에 저장되어 새로고침 후에도 유지된다.

### 3.2 동작 방식

1. 페이지 로드 시 `localStorage.getItem('theme')`을 확인하여 `<html>` 요소에 `.dark` 클래스를 즉시 추가한다 (깜빡임 방지).
2. `useTheme()` 훅이 테마 상태를 관리하고 토글 함수를 제공한다.
3. Layout에서 `useTheme()`을 호출하여 Header에 `theme`과 `onToggleTheme` prop을 전달한다.

```typescript
// src/hooks/useTheme.ts
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}
```

### 3.3 Tailwind v4 다크모드 설정

`src/index.css`에 `@custom-variant`를 선언하여 `dark:` 유틸리티 클래스가 `.dark` 클래스 기반으로 동작하게 한다.

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

### 3.4 토글 버튼 (Header)

- 위치: 헤더 우측, 로그아웃 버튼 왼쪽
- 아이콘: 라이트 모드 → `Moon` (다크로 전환 예고), 다크 모드 → `Sun` (라이트로 전환 예고)
- `aria-label`: `"다크모드 켜기"` / `"라이트모드 켜기"`

### 3.5 색상 적용 원칙

- inline `style`로 하드코딩된 색상은 모두 CSS 변수(`var(--color-xxx)`)로 교체한다.
- Tailwind 유틸리티 클래스의 색상은 `dark:` variant를 추가한다.
- 카테고리 배지·사이드바 dot 색상은 컬러풀한 강조색으로 다크에서도 동일하게 유지한다.

---

## 4. 타이포그래피

### 3.1 폰트 패밀리

```css
font-family: 'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 
             'Segoe UI', sans-serif;
```

> Pretendard: 한국어 웹 폰트 중 렌더링 품질이 가장 우수하며 네이버 캘린더와 유사한 느낌을 제공한다.

### 3.2 타입 스케일

| 토큰 | 크기 | 두께 | 줄 높이 | 용도 |
|------|------|------|---------|------|
| `text-app-title` | 20px | 700 | 1.3 | 앱 로고·제목 (헤더) |
| `text-page-title` | 18px | 600 | 1.4 | 페이지 제목 (예: "카테고리 관리") |
| `text-section` | 14px | 600 | 1.5 | 섹션 헤딩 (예: "이름 변경") |
| `text-body` | 14px | 400 | 1.6 | 일반 본문, 할일 제목 |
| `text-label` | 13px | 500 | 1.5 | 폼 라벨, 필터 라벨 |
| `text-small` | 12px | 400 | 1.5 | 날짜, 카테고리 뱃지, 글자 수 카운터 |
| `text-helper` | 12px | 400 | 1.4 | 인라인 에러·도움말 메시지 |

### 3.3 완료 항목 텍스트 처리

```css
/* 완료된 할일 */
.todo-completed {
  text-decoration: line-through;
  color: #9CA3AF; /* Gray-400 */
}
```

---

## 5. 간격 시스템

4px 기본 단위의 8pt 그리드 시스템을 사용한다.

| 토큰 | 값 | 주요 용도 |
|------|-----|---------|
| `space-1` | 4px | 아이콘-텍스트 간격 |
| `space-2` | 8px | 인라인 요소 간격 |
| `space-3` | 12px | 폼 필드 내부 패딩 |
| `space-4` | 16px | 컴포넌트 내부 패딩, 섹션 내 항목 간격 |
| `space-5` | 20px | 카드 패딩 |
| `space-6` | 24px | 섹션 간 간격 |
| `space-8` | 32px | 페이지 레벨 간격 |
| `space-12` | 48px | 인증 화면 상단 여백 |

---

## 6. 레이아웃 & 그리드

### 5.1 전체 레이아웃 구조

네이버 캘린더의 **좌측 고정 패널 + 우측 메인 콘텐츠** 구조를 채택한다.

```
┌─────────────────────────────────────────────┐
│          Header (height: 56px, sticky)       │
├─────────────┬───────────────────────────────┤
│             │                               │
│   Sidebar   │       Main Content            │
│  (250px,    │   (flex: 1, overflow-y:auto)  │
│   fixed)    │                               │
│             │                               │
└─────────────┴───────────────────────────────┘
```

### 5.2 Header

```
height: 56px
background: #FFFFFF
border-bottom: 1px solid #E5E7EB
padding: 0 24px
position: sticky; top: 0; z-index: 50
```

내부 구성:
- 좌: 로고 (20px bold, Primary 색상 아이콘 + 앱명)
- 우: 사용자명 + 계정 설정 버튼 + 로그아웃 버튼

### 5.3 Sidebar

```
width: 250px
background: #F9FAFB
border-right: 1px solid #E5E7EB
padding: 24px 16px
position: fixed; left: 0; top: 56px; height: calc(100vh - 56px)
overflow-y: auto
```

내부 구성 (네이버 캘린더 사이드바 참조):
```
[카테고리 섹션]
─────────────────────
● 일반        (Cat-Blue dot)
● 업무        (Cat-Green dot)
● 개인        (Cat-Purple dot)
● 공부        (Cat-Teal dot)

[네비게이션 섹션]
─────────────────────
📝 할일 목록
⚙️  카테고리 관리
👤 내 정보
```

### 5.4 Main Content

```
margin-left: 250px
padding: 32px
min-height: calc(100vh - 56px)
background: #FFFFFF
```

### 5.5 모바일 레이아웃 (767px 이하)

- Header: 햄버거(☰) + 로고 + 닫기(✕)
- Sidebar: `position: fixed; left: -250px` → 햄버거 클릭 시 `left: 0` 슬라이드인
- Main Content: `margin-left: 0; padding: 16px`
- Overlay: `position: fixed; inset: 0; background: rgba(0,0,0,0.4)`

---

## 7. 컴포넌트 스타일

### 6.1 버튼

네이버 캘린더의 버튼 스타일에서 영감을 얻어 4가지 변형을 정의한다.

#### Primary 버튼
```css
background: #2563EB;
color: #FFFFFF;
border: none;
border-radius: 6px;
padding: 8px 20px;
font-size: 14px;
font-weight: 600;
cursor: pointer;
transition: background 150ms;

:hover  { background: #1D4ED8; }
:active { background: #1E40AF; }
:disabled { background: #93C5FD; cursor: not-allowed; }
```

#### Secondary 버튼
```css
background: #FFFFFF;
color: #374151;
border: 1px solid #D1D5DB;
border-radius: 6px;
padding: 8px 20px;

:hover  { background: #F3F4F6; }
:active { background: #E5E7EB; }
```

#### Danger 버튼
```css
background: #DC2626;
color: #FFFFFF;
border: none;
border-radius: 6px;
padding: 8px 20px;

:hover  { background: #B91C1C; }
:active { background: #991B1B; }
:disabled { background: #FCA5A5; cursor: not-allowed; }
```

#### Ghost 버튼 (링크형)
```css
background: transparent;
color: #2563EB;
border: none;
padding: 4px 8px;
font-size: 14px;
text-decoration: underline;

:hover { color: #1D4ED8; }
```

#### 버튼 최소 크기 (모바일 터치 타겟)
```
min-height: 44px
min-width: 44px
```

### 6.2 입력 필드

```css
/* 기본 상태 */
.input {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
  color: #111827;
  background: #FFFFFF;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}

/* 포커스 */
.input:focus {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

/* 에러 */
.input.error {
  border-color: #DC2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.10);
}

/* 비활성 */
.input:disabled {
  background: #F3F4F6;
  color: #9CA3AF;
  cursor: not-allowed;
}

/* 플레이스홀더 */
.input::placeholder { color: #9CA3AF; }
```

#### 비밀번호 입력 (가시성 토글)

`type="password"`인 Input 컴포넌트는 오른쪽에 Eye/EyeOff 아이콘 버튼이 자동 추가된다.  
버튼을 **누르고 있는 동안만** 비밀번호가 보이고, 손을 떼면 즉시 마스킹된다 (mousedown/mouseup/touchstart/touchend 이벤트 기반).

```tsx
<Input type="password" label="비밀번호" ... />
// → 자동으로 Eye/EyeOff 토글 버튼 렌더링
```

#### 텍스트에리어 (설명 필드)
```css
height: auto;
min-height: 80px;
resize: vertical;
/* 나머지는 input과 동일 */
```

### 6.3 폼 그룹 구조

```html
<div class="form-group">
  <label class="form-label">제목 <span class="required">*</span></label>
  <input class="input [error]" />
  <p class="form-helper [error|success|info]">인라인 메시지</p>
</div>
```

```css
.form-group    { display: flex; flex-direction: column; gap: 4px; }
.form-label    { font-size: 13px; font-weight: 500; color: #374151; }
.required      { color: #DC2626; margin-left: 2px; }
.form-helper   { font-size: 12px; }
.form-helper.error   { color: #DC2626; }
.form-helper.success { color: #16A34A; }
.form-helper.info    { color: #2563EB; }
```

### 6.4 드롭다운(Select)

```css
.select {
  /* input과 동일한 기본 스타일 */
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* 화살표 아이콘 */
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}
```

### 6.5 체크박스 (할일 완료 토글)

네이버 캘린더의 카테고리 체크박스에서 영감을 얻은 스타일.

```css
.todo-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid #D1D5DB;
  cursor: pointer;
  transition: all 150ms;
  flex-shrink: 0;
}

.todo-checkbox:checked {
  background: #16A34A;
  border-color: #16A34A;
  /* ✓ 아이콘 표시 */
}
```

### 6.6 카드 / 패널

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 20px;
}

.card-section {
  /* 내 정보 수정 화면의 섹션 카드 */
  margin-bottom: 16px;
}

.card-section + .card-section {
  border-top: 1px solid #E5E7EB;
  padding-top: 20px;
}

/* 위험 영역 카드 (계정 탈퇴) */
.card.danger {
  border-color: #FECACA;
  background: #FFF5F5;
}
```

### 6.7 할일 목록 아이템

```css
.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #F3F4F6;
  transition: background 100ms;
}

.todo-item:hover {
  background: #F9FAFB;
  margin: 0 -8px;
  padding: 12px 8px;
  border-radius: 6px;
}

/* 완료 항목 */
.todo-item.completed .todo-title {
  text-decoration: line-through;
  color: #9CA3AF;
}
```

### 6.8 카테고리 뱃지

```css
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 카테고리별 색상 */
.badge-blue   { background: #DBEAFE; color: #1D4ED8; }
.badge-green  { background: #DCFCE7; color: #15803D; }
.badge-purple { background: #EDE9FE; color: #6D28D9; }
.badge-teal   { background: #CCFBF1; color: #0F766E; }
.badge-rose   { background: #FFE4E6; color: #BE123C; }
.badge-amber  { background: #FEF3C7; color: #B45309; }
```

### 6.9 사이드바 카테고리 항목

네이버 캘린더의 색상 점(dot) + 카테고리명 패턴 적용.

```css
.sidebar-category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 100ms;
}

.sidebar-category-item:hover { background: #E5E7EB; }

.category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
```

### 6.10 필터 패널

```css
.filter-panel {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 24px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
```

### 6.11 모달

```css
/* 오버레이 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

/* 모달 박스 */
.modal {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  min-width: 320px;
  max-width: 480px;
  width: calc(100% - 32px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}
```

### 6.12 Toast 알림

네이버 캘린더의 팝업 카드 스타일에서 영감.

```css
.toast {
  position: fixed;
  top: 72px;   /* header(56px) + 16px */
  right: 16px;
  z-index: 200;
  min-width: 280px;
  max-width: 400px;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  background: #FFFFFF;
}

/* 타입별 스타일 */
.toast.success { border-left-color: #16A34A; color: #15803D; }
.toast.error   { border-left-color: #DC2626; color: #B91C1C; }
.toast.warning { border-left-color: #D97706; color: #B45309; }
.toast.info    { border-left-color: #2563EB; color: #1D4ED8; }
```

### 6.13 네비게이션 링크 (사이드바)

```css
.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #4B5563;
  text-decoration: none;
  transition: background 100ms, color 100ms;
}

.nav-link:hover   { background: #E5E7EB; color: #111827; }
.nav-link.active  { background: #DBEAFE; color: #1D4ED8; font-weight: 600; }
```

### 6.14 스켈레톤 로딩

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #E5E7EB 25%,
    #F3F4F6 50%,
    #E5E7EB 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 8. 상태 표시

### 7.1 인라인 유효성 검사

| 상태 | 아이콘 | 색상 | 예시 |
|------|--------|------|------|
| 에러 | ✕ | `#DC2626` | ✕ 이메일 형식이 올바르지 않습니다 |
| 성공 | ✓ | `#16A34A` | ✓ 사용 가능한 이메일입니다 |
| 도움말 | ℹ | `#2563EB` | ℹ 최소 8자, 영문+숫자 포함 |

### 7.2 빈 상태 (Empty State)

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  color: #9CA3AF;
  text-align: center;
}

.empty-state-icon  { font-size: 48px; margin-bottom: 16px; }
.empty-state-title { font-size: 16px; font-weight: 600; color: #4B5563; margin-bottom: 8px; }
.empty-state-desc  { font-size: 14px; color: #9CA3AF; margin-bottom: 20px; }
```

### 7.3 로딩 버튼 상태

```css
.btn-loading {
  position: relative;
  color: transparent; /* 텍스트 숨김 */
}

.btn-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 7.4 비활성 카테고리 삭제 버튼 (기본 카테고리)

```css
.btn-delete-disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}
```

---

## 9. 애니메이션

| 요소 | 종류 | 시간 | 이징 |
|------|------|------|------|
| 버튼 호버 | 배경색 변화 | 150ms | ease |
| 입력 포커스 | 테두리·그림자 변화 | 150ms | ease |
| 모달 진입 | 페이드인 + 스케일업 | 200ms | ease-out |
| 드로어 슬라이드 | translateX | 250ms | ease-out |
| 토스트 진입 | 슬라이드인 (오른쪽에서) | 200ms | ease-out |
| 토스트 퇴장 | 슬라이드아웃 + 페이드 | 200ms | ease-in |
| 스켈레톤 shimmer | 좌우 그라디언트 | 1.5s | linear |
| 사이드바 항목 호버 | 배경색 변화 | 100ms | ease |

```css
/* 모달 진입 */
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
.modal { animation: modal-in 200ms ease-out; }

/* 드로어 슬라이드 */
@keyframes drawer-in {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}

/* 토스트 슬라이드인 */
@keyframes toast-in {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
```

---

## 10. 아이콘

**lucide-react** 라이브러리 사용 (stroke width: 1.5, 크기: 18px 기본).

| 용도 | 아이콘 이름 | 크기 |
|------|------------|------|
| 앱 로고 | `CheckSquare` | 24px |
| 할일 목록 메뉴 | `ListTodo` | 18px |
| 카테고리 관리 메뉴 | `Tag` | 18px |
| 내 정보 메뉴 | `User` | 18px |
| 로그아웃 | `LogOut` | 18px |
| 다크모드 전환 (라이트→다크) | `Moon` | 18px |
| 라이트모드 전환 (다크→라이트) | `Sun` | 18px |
| 설정 | `Settings` | 18px |
| 할일 추가 | `Plus` | 18px |
| 수정 | `Pencil` | 16px |
| 삭제 | `Trash2` | 16px |
| 체크 (완료) | `Check` | 14px |
| 닫기 | `X` | 18px |
| 햄버거 메뉴 | `Menu` | 22px |
| 에러 | `AlertCircle` | 14px |
| 성공 | `CheckCircle` | 14px |
| 정보 | `Info` | 14px |
| 경고 | `AlertTriangle` | 14px |
| 빈 상태 | `Inbox` | 48px |
| 비밀번호 보기 | `Eye` | 16px |
| 비밀번호 숨기기 | `EyeOff` | 16px |

---

## 11. 반응형 브레이크포인트

docs/10-wireframe.md 기준과 동일.

| 이름 | 범위 | 주요 변화 |
|------|------|---------|
| **Mobile** | 320px ~ 767px | 사이드바 숨김(드로어), 1컬럼 레이아웃, 패딩 16px |
| **Tablet** | 768px ~ 1023px | 사이드바 숨김(드로어), 필터 2컬럼, 패딩 24px |
| **Desktop** | 1024px+ | 사이드바 고정 표시, 완전한 2컬럼 레이아웃 |

```css
/* Tailwind 기준 */
sm:   640px
md:   768px
lg:  1024px   ← 사이드바 표시 기준
xl:  1280px
```

### 모바일 최적화 규칙

- 터치 타겟 최소: **44px × 44px** (WCAG 2.5.5)
- 모바일 폰트 최소: **16px** (iOS 자동 줌 방지)
- 이메일 입력: `type="email"` (모바일 키보드 전환)
- 날짜 입력: `type="date"` (네이티브 날짜 피커)
- 비밀번호 입력: `type="password"` (자동 마스킹)

---

## 12. Tailwind CSS 설정 참조

`tailwind.config.ts` 커스텀 확장 예시:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover:   '#1D4ED8',
          active:  '#1E40AF',
          light:   '#DBEAFE',
        },
        success: {
          DEFAULT: '#16A34A',
          light:   '#DCFCE7',
        },
        danger: {
          DEFAULT: '#DC2626',
          light:   '#FEF2F2',
        },
        warning: {
          DEFAULT: '#D97706',
          light:   '#FEF3C7',
        },
        category: {
          blue:   '#2563EB',
          green:  '#16A34A',
          purple: '#7C3AED',
          teal:   '#0D9488',
          rose:   '#E11D48',
          amber:  '#D97706',
        },
        sidebar: '#F9FAFB',
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        card:   '8px',
        badge:  '12px',
        input:  '6px',
        button: '6px',
      },
      boxShadow: {
        modal:  '0 20px 60px rgba(0, 0, 0, 0.15)',
        toast:  '0 4px 16px rgba(0, 0, 0, 0.12)',
        card:   '0 1px 4px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'modal-in':  'modal-in 200ms ease-out',
        'toast-in':  'toast-in 200ms ease-out',
        'skeleton':  'skeleton-shimmer 1.5s infinite',
        'spin-fast': 'spin 0.6s linear infinite',
      },
      keyframes: {
        'modal-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'toast-in': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        'skeleton-shimmer': {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 참조 문서

- `docs/10-wireframe.md` — 화면별 ASCII 와이어프레임
- `docs/11-front-intergration.md` — 백엔드 API 연동 가이드
- `docs/4-prd.md` — 제품 요구사항 (UC-01 ~ UC-12)
- `docs/6-project-principle.md` — 프론트엔드 아키텍처 원칙
