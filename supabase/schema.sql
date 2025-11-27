-- ============================================
-- Greating Care Database Schema (통합)
-- ============================================
-- 이 파일에 모든 테이블 스키마가 포함되어 있습니다.
-- 순서: 기본 테이블 → 약관 → 홈화면 → 인증
-- ============================================

-- ============================================
-- PART 1: 기본 테이블
-- ============================================

-- Users 확장 정보 테이블
-- Supabase Auth의 auth.users와 연동
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT, -- 휴대폰 번호 (아이디 찾기용)
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  birth_date DATE,
  height DECIMAL(5, 2), -- cm
  weight DECIMAL(5, 2), -- kg
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),
  weekly_goal TEXT,
  goal_weight DECIMAL(5, 2), -- kg
  provider TEXT DEFAULT 'email', -- 'email', 'naver', 'kakao' (SNS 가입 구분)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users 테이블 RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users 테이블 정책: 자기 자신의 데이터만 조회/수정 가능
CREATE POLICY "Users can view own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================
-- Meals 테이블 (식사 기록)
-- ============================================
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  food_name TEXT NOT NULL,
  calories INTEGER,
  carbs DECIMAL(5, 2), -- g
  protein DECIMAL(5, 2), -- g
  fat DECIMAL(5, 2), -- g
  serving_size TEXT,
  meal_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meals 테이블 RLS 활성화
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Meals 테이블 정책: 자기 자신의 데이터만 조회/수정/삭제 가능
CREATE POLICY "Users can view own meals" 
  ON public.meals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals" 
  ON public.meals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals" 
  ON public.meals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals" 
  ON public.meals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- Nutrition Logs 테이블 (일일 영양 요약)
-- ============================================
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  total_calories INTEGER DEFAULT 0,
  total_carbs DECIMAL(5, 2) DEFAULT 0, -- g
  total_protein DECIMAL(5, 2) DEFAULT 0, -- g
  total_fat DECIMAL(5, 2) DEFAULT 0, -- g
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- Nutrition Logs 테이블 RLS 활성화
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Nutrition Logs 테이블 정책
CREATE POLICY "Users can view own nutrition logs" 
  ON public.nutrition_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs" 
  ON public.nutrition_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs" 
  ON public.nutrition_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================
-- PART 2: 약관 테이블
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

-- Terms 시드 데이터
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

-- ============================================
-- PART 3: 홈화면 관련 테이블
-- ============================================

-- 3-1. 식품 관련 명언 테이블
CREATE TABLE IF NOT EXISTS public.food_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  author TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 초기 명언 데이터 삽입
INSERT INTO public.food_quotes (quote, author, display_order) VALUES
  ('약과 음식은 근원에서 같다.', '약식동원', 1),
  ('You are what you eat.', NULL, 2),
  ('음식으로는 못 고치는 병은 의사도 못 고친다', '히포크라테스', 3),
  ('잘 먹는 것은 결코 하찮은 기술이 아니다', NULL, 4),
  ('걷기는 사람에게 최고의 약이다', NULL, 5),
  ('당신의 음식이 당신의 약이 되게 하라', NULL, 6),
  ('음식에 대한 사랑보다 더 숨김없는 사랑은 없다', NULL, 7),
  ('자기가 먹는 음식이 자기의 운명을 좌우한다.', NULL, 8),
  ('먹는 것은 필수지만 현명하게 먹는 것은 예술이다.', NULL, 9),
  ('무엇을 먹는지 말하라. 그러면 당신이 어떤 사람인지 알 수 있다.', NULL, 10),
  ('우리가 먹는 것이 곧 우리 자신이 된다.', NULL, 11),
  ('잘 먹는 기술은 결코 하찮은 기술이 아니며, 그로 인한 기쁨은 작은 기쁨이 아니다.', NULL, 12),
  ('좋은 음식은 좋은 생각을 낳는다.', NULL, 13),
  ('건강한 몸에 건강한 정신이 깃든다.', NULL, 14),
  ('식탁이 곧 약국이다.', NULL, 15),
  ('천천히 먹는 것이 건강의 비결이다.', NULL, 16),
  ('제철 음식이 보약이다.', NULL, 17),
  ('과식은 병의 시작이다.', NULL, 18),
  ('좋은 아침 식사가 하루를 결정한다.', NULL, 19),
  ('물은 생명의 근원이다.', NULL, 20)
ON CONFLICT DO NOTHING;

-- 명언 테이블 RLS 활성화 (모든 사용자가 읽기 가능)
ALTER TABLE public.food_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view food quotes" 
  ON public.food_quotes 
  FOR SELECT 
  USING (true);

-- 3-2. 건강 목표/질병 정보 테이블
CREATE TABLE IF NOT EXISTS public.user_health_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('weight_management', 'blood_sugar', 'muscle', 'general')) NOT NULL,
  diseases TEXT[] DEFAULT '{}', -- 질병 목록: diabetes, obesity, hypertension, fatty_liver, hyperlipidemia, hyperthyroidism
  tags TEXT[] DEFAULT '{}', -- 표시할 태그: 비만, 당뇨병, 근력운동 등
  description TEXT, -- 개인화 메시지
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_health_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health goals" 
  ON public.user_health_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health goals" 
  ON public.user_health_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health goals" 
  ON public.user_health_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 3-3. 영양소 상태 테이블
CREATE TABLE IF NOT EXISTS public.nutrition_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nutrient_type TEXT NOT NULL, -- fat, saturated_fat, sugar, carbs, cholesterol, sodium, protein, fiber
  status TEXT CHECK (status IN ('adequate', 'excessive', 'deficient')) NOT NULL, -- 적정, 과다, 부족
  current_value DECIMAL(10, 2),
  recommended_min DECIMAL(10, 2),
  recommended_max DECIMAL(10, 2),
  score INTEGER DEFAULT 0, -- 점수 산출용
  status_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nutrient_type, status_date)
);

ALTER TABLE public.nutrition_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nutrition status" 
  ON public.nutrition_status 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition status" 
  ON public.nutrition_status 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition status" 
  ON public.nutrition_status 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 3-4. 걸음수 기록 테이블
CREATE TABLE IF NOT EXISTS public.step_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step_count INTEGER DEFAULT 0,
  goal_steps INTEGER DEFAULT 10000,
  record_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, record_date)
);

ALTER TABLE public.step_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own step records" 
  ON public.step_records 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own step records" 
  ON public.step_records 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own step records" 
  ON public.step_records 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 3-5. 챌린지 테이블
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT CHECK (challenge_type IN ('daily', 'weekly', 'monthly')) DEFAULT 'daily',
  target_count INTEGER DEFAULT 1,
  points INTEGER DEFAULT 10,
  icon_type TEXT, -- water, exercise, meal, vitamin 등
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 초기 챌린지 데이터
INSERT INTO public.challenges (title, description, challenge_type, target_count, points, icon_type) VALUES
  ('매일 한잔 물마시기', '하루에 물 8잔 마시기', 'daily', 8, 10, 'water'),
  ('아침 식사 기록하기', '매일 아침 식사를 기록해요', 'daily', 1, 5, 'meal'),
  ('10000걸음 걷기', '하루 만보 걷기 도전', 'daily', 10000, 20, 'steps'),
  ('영양제 복용하기', '매일 영양제 복용 기록', 'daily', 1, 5, 'vitamin')
ON CONFLICT DO NOTHING;

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges" 
  ON public.challenges 
  FOR SELECT 
  USING (true);

-- 3-6. 사용자 챌린지 진행 상태 테이블
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  challenge_date DATE DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id, challenge_date)
);

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges" 
  ON public.user_challenges 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" 
  ON public.user_challenges 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" 
  ON public.user_challenges 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 3-7. 사용자 포인트 테이블
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" 
  ON public.user_points 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points" 
  ON public.user_points 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own points" 
  ON public.user_points 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 3-8. 영양 진단 결과 테이블
CREATE TABLE IF NOT EXISTS public.nutrition_diagnosis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  diagnosis_date DATE DEFAULT CURRENT_DATE,
  overall_score INTEGER, -- 종합 점수
  recommendations TEXT[], -- 추천 사항 목록
  warning_nutrients TEXT[], -- 주의 영양소 목록
  diagnosis_type TEXT, -- 유형 분류
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, diagnosis_date)
);

ALTER TABLE public.nutrition_diagnosis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diagnosis" 
  ON public.nutrition_diagnosis 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnosis" 
  ON public.nutrition_diagnosis 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 4: SMS 인증 테이블
-- ============================================

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

-- ============================================
-- PART 5: 인덱스
-- ============================================
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON public.meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_meal_date ON public.meals(meal_date);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_id ON public.nutrition_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_date ON public.nutrition_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_user_health_goals_user_id ON public.user_health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_status_user_id ON public.nutrition_status(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_status_date ON public.nutrition_status(status_date);
CREATE INDEX IF NOT EXISTS idx_step_records_user_id ON public.step_records(user_id);
CREATE INDEX IF NOT EXISTS idx_step_records_date ON public.step_records(record_date);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON public.user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_date ON public.user_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_nutrition_diagnosis_user_id ON public.nutrition_diagnosis(user_id);

-- ============================================
-- PART 6: 트리거 함수 및 트리거
-- ============================================

-- Updated At 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_logs_updated_at
  BEFORE UPDATE ON public.nutrition_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_health_goals_updated_at
  BEFORE UPDATE ON public.user_health_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_status_updated_at
  BEFORE UPDATE ON public.nutrition_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_step_records_updated_at
  BEFORE UPDATE ON public.step_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_challenges_updated_at
  BEFORE UPDATE ON public.user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 만료된 인증번호 자동 삭제 함수 (선택사항)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.phone_verifications WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
