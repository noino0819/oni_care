-- ============================================
-- Terms 테이블 (약관 관리)
-- ============================================
CREATE TABLE IF NOT EXISTS public.terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- e.g., 'terms_service', 'privacy_policy'
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- HTML or Markdown
  is_required BOOLEAN DEFAULT false,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Terms 테이블 RLS 활성화
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;

-- Terms 테이블 정책: 누구나 조회 가능 (로그인 전에도 약관은 봐야 함)
CREATE POLICY "Anyone can view terms" 
  ON public.terms 
  FOR SELECT 
  USING (true);

-- 관리자만 수정 가능하도록 정책 설정 (일단은 anon key로 insert/update 막음)
-- 서비스 운영 시에는 admin 권한이 필요함

-- ============================================
-- Terms 시드 데이터 (기획서 기반)
-- ============================================
INSERT INTO public.terms (code, title, content, is_required, version)
VALUES 
  ('terms_service', '이용약관', '제1조 (목적)\n본 약관은...', true, '1.0'),
  ('privacy_policy', '개인정보 수집 및 이용동의', '1. 수집하는 개인정보 항목\n- 필수항목: 이름, 휴대폰 번호...', true, '1.0'),
  ('sensitive_info', '민감정보 수집 및 이용동의', '1. 수집하는 민감정보 항목\n- 키, 체중, 질병...', true, '1.0'),
  ('marketing', '마케팅 정보 수신동의', '이벤트 정보 제공, 맞춤 건강관리 서비스 제공...', false, '1.0'),
  ('push_notification', '앱 푸시(광고성) 알림 동의', 'APP전용 혜택 안내...', false, '1.0')
ON CONFLICT (code) DO UPDATE 
SET 
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_required = EXCLUDED.is_required;
