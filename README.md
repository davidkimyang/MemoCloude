# MemoCloud

MemoCloud는 Apple Notes 스타일의 사용 경험을 참고한 개인 메모 SaaS MVP입니다. Supabase Auth와 Database를 사용해 사용자별 폴더와 메모를 분리하고, RLS 정책으로 본인 데이터만 접근하도록 구성했습니다.

## 주요 기능

- 이메일 회원가입, 로그인, 로그아웃
- 사용자별 메모 생성, 수정, 휴지통 이동
- 휴지통 메모 복구, 영구 삭제
- 폴더 생성, 이름 변경, 삭제
- 폴더별 메모 보기
- 전체 메모, 고정 메모, 최근 메모, 휴지통 필터
- 제목/본문 검색
- 메모 고정
- 500ms debounce 자동 저장과 저장 상태 표시
- 데스크톱 3패널 레이아웃, 모바일 목록/편집 화면 전환

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 접속합니다.

```text
http://localhost:3000
```

## Supabase 설정

1. Supabase에서 새 프로젝트를 생성합니다.
2. Project Settings > API에서 Project URL과 anon public key를 확인합니다.
3. 프로젝트 루트에 `.env.local` 파일을 생성합니다.
4. 아래 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Supabase SQL Editor에서 `supabase/schema.sql` 내용을 실행합니다.
6. Authentication > Providers에서 Email 로그인을 활성화합니다.
7. 로컬 서버를 다시 실행합니다.

## 배포

Vercel에 배포할 수 있는 Next.js 구조입니다. Vercel 프로젝트 설정의 Environment Variables에 아래 값을 추가해야 합니다.

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 파일 구조

```text
app/
  app/page.tsx
  app/trash/page.tsx
  login/page.tsx
  signup/page.tsx
  settings/page.tsx
components/
  auth/AuthForm.tsx
  layout/AppShell.tsx
  layout/Sidebar.tsx
  layout/Topbar.tsx
  notes/NoteEditor.tsx
  notes/NoteList.tsx
hooks/
  useDebounce.ts
  useFolders.ts
  useNotes.ts
lib/
  supabase/client.ts
  supabase/server.ts
  types.ts
  utils.ts
supabase/
  schema.sql
```

