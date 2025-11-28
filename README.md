# 🏥 ONI Care

건강 관리를 위한 모바일 웹 애플리케이션입니다.

## 📦 기술 스택

| 분류              | 기술                    |
| ----------------- | ----------------------- |
| **프레임워크**    | Next.js 14 (App Router) |
| **언어**          | TypeScript              |
| **데이터베이스**  | Supabase (PostgreSQL)   |
| **인증**          | Supabase Auth           |
| **스타일링**      | Tailwind CSS 4          |
| **상태관리/캐싱** | SWR                     |
| **UI 라이브러리** | Radix UI, Lucide Icons  |

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
```

> ⚠️ **주의:** `.env.local` 파일은 절대 Git에 커밋하지 마세요!

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. Dashboard > Settings > API에서 URL과 anon key 확인
3. Dashboard > SQL Editor에서 `supabase/schema.sql` 실행
4. (선택) Authentication > Providers > Email에서 "Confirm email" 비활성화 (개발용)

자세한 내용은 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)를 참고하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

## 📜 NPM 스크립트

| 명령어          | 설명                       |
| --------------- | -------------------------- |
| `npm run dev`   | 개발 서버 실행 (포트 3000) |
| `npm run build` | 프로덕션 빌드              |
| `npm run start` | 프로덕션 서버 실행         |
| `npm run lint`  | ESLint 검사                |

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지들
│   ├── api/               # API 라우트 (백엔드)
│   ├── auth/              # 인증 관련 (콜백, 소셜 로그인)
│   ├── challenge/         # 챌린지 기능
│   ├── content/           # 콘텐츠 페이지
│   ├── home/              # 홈 화면
│   ├── menu/              # 메뉴 (설정, 포인트, 공지 등)
│   ├── nutrition/         # 영양 관리 (식단, 영양제 등)
│   ├── signup/            # 회원가입 플로우
│   └── survey/            # 설문조사
│
├── components/            # 재사용 가능한 컴포넌트
│   ├── home/             # 홈 화면 관련 컴포넌트
│   ├── icons/            # 아이콘 컴포넌트
│   └── ui/               # 공통 UI 컴포넌트
│
├── hooks/                 # 커스텀 훅 (useAuth, useFetch 등)
├── lib/                   # 유틸리티, Supabase 클라이언트
└── types/                 # TypeScript 타입 정의

supabase/
└── schema.sql            # 데이터베이스 스키마 정의

public/
└── images/               # 이미지 에셋
```

## ✨ 주요 기능

### 🔐 인증

- 이메일 회원가입/로그인
- 네이버 소셜 로그인
- 비밀번호 찾기/재설정

### 📋 건강 설문조사

- 개인 건강 정보 수집
- 맞춤형 건강 분석

### 🥗 영양 관리

- 식단 기록 및 분석
- 영양제 추천
- 복용 루틴 관리

### 🏆 챌린지

- 건강 챌린지 참여
- 인증 및 보상 시스템

### 📚 콘텐츠

- 건강 관련 정보 제공
- 카테고리별 콘텐츠 탐색

### 💰 포인트 & 쿠폰

- 활동 보상 포인트
- 쿠폰 발급 및 사용

### 👤 마이페이지

- 프로필 관리
- 알림 설정
- 1:1 문의

## 📚 추가 문서

- [Supabase 설정 가이드](./SUPABASE_SETUP.md)
- [이메일 인증 설정](./SUPABASE_EMAIL_SETUP.md)

## 🛠️ 개발 환경

- Node.js 18.x 이상
- npm 9.x 이상

---

Made with by CHOI SI EON