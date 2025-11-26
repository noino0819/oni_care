# Supabase 설정 안내

## 1. Supabase 프로젝트 생성

1. https://supabase.com 접속 및 로그인
2. "New Project" 클릭
3. 프로젝트 이름: `greating-care` (또는 원하는 이름)
4. Database Password 설정 (안전하게 보관)
5. Region: `Northeast Asia (Seoul)` 선택 권장
6. 프로젝트 생성 완료 대기 (약 2분 소요)

## 2. API 키 확인

프로젝트 생성 후:
1. 좌측 메뉴 > `Settings` > `API` 클릭
2. **Project URL** 복사
3. **anon public** 키 복사

## 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성 및 다음 내용 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=<복사한 Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<복사한 anon key>
```

**주의:** `.env.local` 파일은 절대 Git에 커밋하지 마세요!

## 4. 데이터베이스 스키마 적용

1. Supabase Dashboard > 좌측 메뉴 > `SQL Editor` 클릭
2. `supabase/schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 `Run` 클릭
4. 테이블 생성 확인: 좌측 메뉴 > `Table Editor`

## 5. 이메일 인증 설정 (선택)

테스트를 위해 이메일 확인을 비활성화할 수 있습니다:
1. Supabase Dashboard > `Authentication` > `Providers` > `Email`
2. "Confirm email" 옵션 해제 (개발 중에만, 프로덕션에서는 활성화 필요)

## 6. 개발 서버 재시작

환경 변수를 추가한 후 Next.js 개발 서버를 재시작하세요:

```bash
# Ctrl+C로 서버 중지 후
npm run dev
```

완료 후 회원가입/로그인 기능을 테스트할 수 있습니다!
