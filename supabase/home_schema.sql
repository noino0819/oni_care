-- ============================================
-- Home Screen Schema (MF_HO_01)
-- ============================================

-- ============================================
-- 1. 식품 관련 명언 테이블
-- ============================================
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

-- ============================================
-- 2. 건강 목표/질병 정보 테이블
-- ============================================
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

-- ============================================
-- 3. 영양소 상태 테이블
-- ============================================
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

-- ============================================
-- 4. 걸음수 기록 테이블
-- ============================================
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

-- ============================================
-- 5. 챌린지 테이블
-- ============================================
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

-- ============================================
-- 6. 사용자 챌린지 진행 상태 테이블
-- ============================================
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

-- ============================================
-- 7. 사용자 포인트 테이블
-- ============================================
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

-- ============================================
-- 8. 영양 진단 결과 테이블
-- ============================================
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
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_health_goals_user_id ON public.user_health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_status_user_id ON public.nutrition_status(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_status_date ON public.nutrition_status(status_date);
CREATE INDEX IF NOT EXISTS idx_step_records_user_id ON public.step_records(user_id);
CREATE INDEX IF NOT EXISTS idx_step_records_date ON public.step_records(record_date);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON public.user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_date ON public.user_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_nutrition_diagnosis_user_id ON public.nutrition_diagnosis(user_id);

-- ============================================
-- Triggers for Updated At
-- ============================================
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
