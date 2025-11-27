-- ============================================
-- Phone Verification Schema
-- SMS 인증번호 저장 테이블
-- ============================================

-- Phone Verifications 테이블 (SMS 인증번호)
CREATE TABLE IF NOT EXISTS public.phone_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT CHECK (purpose IN ('find_id', 'find_password', 'signup')) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON public.phone_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires ON public.phone_verifications(expires_at);

-- 만료된 인증번호 자동 삭제를 위한 함수 (선택사항)
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.phone_verifications WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Users 테이블에 provider 필드 추가 (SNS 가입 구분)
-- ============================================
-- 이미 테이블이 있는 경우 ALTER TABLE로 추가
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';
-- provider: 'email' (일반가입), 'naver' (네이버), 'kakao' (카카오톡)

-- ============================================
-- 서비스 역할로만 접근 가능하도록 설정
-- (API 서버에서만 사용)
-- ============================================
-- RLS는 service_role로 우회하므로 별도 정책 불필요

