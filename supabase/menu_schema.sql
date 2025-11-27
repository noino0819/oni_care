-- ============================================
-- 메뉴 관련 Database Schema
-- 공지사항, 알림, FAQ, 1:1 문의하기
-- ============================================

-- ============================================
-- 1. 공지사항 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT, -- 첨부 이미지
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 공지사항 RLS
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active notices" 
  ON public.notices 
  FOR SELECT 
  USING (is_active = true);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON public.notices(created_at DESC);

-- 샘플 데이터
INSERT INTO public.notices (title, content) VALUES
  ('식사기록 업데이트 안내', '기존 식사기록에서 찾아보기 어려웠던 프렌차이즈 데이터를 업데이트 하였습니다. 많은 이용부탁드립니다.'),
  ('APP 이용 안내', '앱 이용 안내 내용입니다. 새로운 기능이 추가되었습니다.')
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. 알림 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  icon_url TEXT, -- 알림 아이콘 이미지
  link_url TEXT, -- 클릭 시 이동할 URL
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 알림 RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================
-- 3. FAQ 카테고리 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.faq_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT, -- 아이콘 이름
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ 카테고리 샘플 데이터
INSERT INTO public.faq_categories (name, icon, display_order) VALUES
  ('인기질문', 'chat', 1),
  ('포인트 관련', 'star', 2),
  ('계정 연동', 'user', 3),
  ('쿠폰사용', 'coupon', 4)
ON CONFLICT DO NOTHING;

-- FAQ 카테고리 RLS
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view faq categories" 
  ON public.faq_categories 
  FOR SELECT 
  USING (is_active = true);

-- ============================================
-- 4. FAQ 질문/답변 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id INT REFERENCES public.faq_categories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ 샘플 데이터
INSERT INTO public.faqs (category_id, question, answer, display_order) VALUES
  (1, '걸음수 연동이 안돼요!', '걸음수 연동을 위해서는 건강 앱 연동 설정이 필요합니다. 설정 > 개인정보 > 건강 앱에서 그리팅 케어를 허용해주세요.', 1),
  (1, '기본 설문은 꼭 해야하나요?', '기본 설문은 맞춤 건강 서비스를 제공하기 위해 필요합니다. 설문 결과에 따라 개인화된 영양 정보와 추천을 받으실 수 있습니다.', 2),
  (1, '그리팅몰 연동하면 어떤점이 좋은가요?', '그리팅몰 연동 시 구매한 제품에 대한 복용 리마인더, 영양제 기록 자동화, 포인트 적립 등의 혜택을 받으실 수 있습니다.', 3),
  (1, '그리팅 케어 포인트는 어디에 쓸 수 있어요?', '그리팅 케어 포인트는 그리팅 몰 또는 카페테리아 포인트로 전환하여 사용하실 수 있어요! 그리팅몰은...', 4),
  (2, '포인트는 어떻게 적립하나요?', '챌린지 참여, 출석체크, 식사 기록 등 다양한 활동을 통해 포인트를 적립하실 수 있습니다.', 1),
  (2, '포인트 유효기간이 있나요?', '포인트는 적립일로부터 1년간 유효합니다. 만료 예정 포인트는 미리 알림을 통해 안내드립니다.', 2),
  (3, '네이버 계정 연동은 어떻게 하나요?', '설정 > 계정 연동 관리에서 네이버 계정을 연동하실 수 있습니다.', 1),
  (4, '쿠폰은 어디서 사용할 수 있나요?', '쿠폰은 그리팅몰에서 상품 구매 시 사용 가능합니다.', 1)
ON CONFLICT DO NOTHING;

-- FAQ RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active faqs" 
  ON public.faqs 
  FOR SELECT 
  USING (is_active = true);

-- ============================================
-- 5. 1:1 문의하기 테이블
-- ============================================

-- 문의 유형 테이블
CREATE TABLE IF NOT EXISTS public.inquiry_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 문의 유형 샘플 데이터
INSERT INTO public.inquiry_types (name, display_order) VALUES
  ('계정 연동 문제', 1),
  ('포인트 사용 문의', 2),
  ('쿠폰 관련 문의', 3),
  ('영양진단 관련 문의', 4),
  ('기타', 5)
ON CONFLICT DO NOTHING;

-- 문의 유형 RLS
ALTER TABLE public.inquiry_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view inquiry types" 
  ON public.inquiry_types 
  FOR SELECT 
  USING (is_active = true);

-- 1:1 문의 테이블
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  inquiry_type_id INT REFERENCES public.inquiry_types(id),
  content TEXT NOT NULL, -- 문의 내용
  answer TEXT, -- 답변 내용
  status TEXT CHECK (status IN ('pending', 'answered')) DEFAULT 'pending', -- pending: 미답변, answered: 답변완료
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1:1 문의 RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inquiries" 
  ON public.inquiries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inquiries" 
  ON public.inquiries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending inquiries" 
  ON public.inquiries 
  FOR UPDATE 
  USING (auth.uid() = user_id AND status = 'pending');

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON public.inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- Updated At 트리거
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

