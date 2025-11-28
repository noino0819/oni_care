-- ============================================
-- 쿠폰/포인트 및 회원관리 관련 Database Schema
-- MF_ME_01 ~ MF_ME_06 화면 지원
-- ============================================

-- ============================================
-- 1. 쿠폰 관련 테이블
-- ============================================

-- 1-1. 쿠폰 테이블
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coupon_name TEXT NOT NULL, -- 예: "그리팅 5,000원 상품권"
  coupon_type TEXT CHECK (coupon_type IN ('greating', 'cafeteria')) NOT NULL, -- 그리팅 / 카페테리아
  coupon_value INTEGER NOT NULL DEFAULT 0, -- 쿠폰 금액 (원)
  source TEXT NOT NULL, -- 획득 경로: challenge, signup, event 등
  source_detail TEXT, -- 상세 경로: "챌린지 성공", "회원가입" 등
  status TEXT CHECK (status IN ('pending', 'available', 'transferred', 'used', 'expired')) DEFAULT 'available',
  -- pending: 발급대기, available: 사용가능, transferred: 전환됨, used: 사용됨, expired: 만료
  transferred_account TEXT, -- 전환된 계정 (예: gre***)
  transferred_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 쿠폰 RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupons" 
  ON public.coupons 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coupons" 
  ON public.coupons 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coupons" 
  ON public.coupons 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 쿠폰 인덱스
CREATE INDEX IF NOT EXISTS idx_coupons_user_id ON public.coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON public.coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON public.coupons(created_at DESC);

-- 1-2. 포인트 내역 테이블 (상세 기록)
CREATE TABLE IF NOT EXISTS public.point_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL, -- 양수: 적립, 음수: 사용/소멸
  transaction_type TEXT CHECK (transaction_type IN ('earn', 'use', 'transfer', 'expire')) NOT NULL,
  -- earn: 적립, use: 사용, transfer: 전환, expire: 소멸
  source TEXT NOT NULL, -- 출처
  source_detail TEXT, -- 상세 설명
  text1 TEXT, -- 내역 기록 TEXT1
  text2 TEXT, -- 내역 기록 TEXT2
  balance_after INTEGER NOT NULL DEFAULT 0, -- 거래 후 잔액
  expires_at TIMESTAMP WITH TIME ZONE, -- 포인트 만료일
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 포인트 내역 RLS
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own point history" 
  ON public.point_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own point history" 
  ON public.point_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 포인트 내역 인덱스
CREATE INDEX IF NOT EXISTS idx_point_history_user_id ON public.point_history(user_id);
CREATE INDEX IF NOT EXISTS idx_point_history_type ON public.point_history(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_history_created_at ON public.point_history(created_at DESC);

-- ============================================
-- 2. 계정 연동 관련 테이블
-- ============================================

-- 2-1. 연동 계정 테이블
CREATE TABLE IF NOT EXISTS public.linked_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_type TEXT CHECK (account_type IN ('greating_mall', 'h_cafeteria', 'offline_counseling')) NOT NULL,
  -- greating_mall: 그리팅몰, h_cafeteria: H-cafeteria, offline_counseling: 오프라인 상담
  account_id TEXT, -- 연동된 계정 ID (마스킹됨)
  is_linked BOOLEAN DEFAULT false,
  linked_at TIMESTAMP WITH TIME ZONE,
  unlinked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, account_type)
);

-- 연동 계정 RLS
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own linked accounts" 
  ON public.linked_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own linked accounts" 
  ON public.linked_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own linked accounts" 
  ON public.linked_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================
-- 3. 사업장 코드 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.business_codes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- 6자리 사업장 코드
  name TEXT NOT NULL, -- 사업장명
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사업장 코드 샘플 데이터
INSERT INTO public.business_codes (code, name) VALUES
  ('214567', '본사'),
  ('199868', '그리팅 케어'),
  ('199879', '카페테리아'),
  ('198875', '그리팅몰')
ON CONFLICT (code) DO NOTHING;

-- 사업장 코드 RLS (모두 조회 가능)
ALTER TABLE public.business_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view business codes" 
  ON public.business_codes 
  FOR SELECT 
  USING (is_active = true);

-- ============================================
-- 4. 회원 확장 정보 테이블
-- ============================================

-- 기존 users 테이블에 컬럼 추가
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_code TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS diseases TEXT[] DEFAULT '{}'; -- 질병 목록
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}'; -- 관심사 목록
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS marketing_push_agreed BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS marketing_sms_agreed BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS push_agreed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS sms_agreed_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 5. 회원탈퇴 기록 테이블 (법적 요구사항)
-- ============================================

CREATE TABLE IF NOT EXISTS public.withdrawal_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_user_id UUID NOT NULL, -- 탈퇴한 사용자의 원래 ID
  email_hash TEXT, -- 이메일 해시 (재가입 방지용)
  withdrawal_reason TEXT, -- 탈퇴 사유
  withdrawal_reason_category TEXT, -- 탈퇴 사유 카테고리
  withdrawn_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  can_rejoin_at TIMESTAMP WITH TIME ZONE, -- 재가입 가능 시점 (30일 후)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 회원탈퇴 기록 RLS (관리자만 접근)
ALTER TABLE public.withdrawal_records ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. 마케팅 수신동의 내역 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.marketing_consent_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT CHECK (consent_type IN ('app_push', 'marketing_sms')) NOT NULL,
  is_agreed BOOLEAN NOT NULL,
  agreed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 마케팅 수신동의 내역 RLS
ALTER TABLE public.marketing_consent_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent history" 
  ON public.marketing_consent_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent history" 
  ON public.marketing_consent_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. 포인트 전환 가능 목록 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.point_conversion_options (
  id SERIAL PRIMARY KEY,
  option_type TEXT NOT NULL, -- greating_hpoint, greenery_point, greating_coupon, greating_spoon
  option_name TEXT NOT NULL, -- 그리팅 H.point, 그리너리 포인트, 그리팅 상품권, 그리팅 스푼
  min_points INTEGER DEFAULT 5000, -- 최소 전환 포인트
  max_points INTEGER DEFAULT 10000, -- 최대 전환 포인트
  requires_membership BOOLEAN DEFAULT false, -- 특정 회원만 가능 여부
  membership_type TEXT, -- 필요한 회원 유형 (예: hpoint_member)
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 포인트 전환 옵션 샘플 데이터
INSERT INTO public.point_conversion_options (option_type, option_name, min_points, max_points, requires_membership, membership_type, display_order) VALUES
  ('greating_hpoint', '그리팅 H.point', 5000, 10000, true, 'hpoint_member', 1),
  ('greenery_point', '그리너리 포인트', 5000, 10000, false, NULL, 2),
  ('greating_coupon', '그리팅 상품권', 5000, 10000, false, NULL, 3),
  ('greating_spoon', '그리팅 스푼', 5000, 10000, false, NULL, 4)
ON CONFLICT DO NOTHING;

-- 포인트 전환 옵션 RLS
ALTER TABLE public.point_conversion_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view conversion options" 
  ON public.point_conversion_options 
  FOR SELECT 
  USING (is_active = true);

-- ============================================
-- 8. 트리거 추가
-- ============================================

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linked_accounts_updated_at
  BEFORE UPDATE ON public.linked_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

