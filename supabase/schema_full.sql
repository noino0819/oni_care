-- ============================================
-- Greating Care Database Schema (통합)
-- ============================================
-- 파일 구조:
--   PART 1: 기본 유틸리티 함수
--   PART 2: 사용자 관련 테이블
--   PART 3: 영양/식사 관련 테이블
--   PART 4: 약관 테이블
--   PART 5: 홈화면 관련 테이블
--   PART 6: 컨텐츠 관련 테이블
--   PART 7: 챌린지 관련 테이블
--   PART 8: 메뉴 관련 테이블 (공지/알림/FAQ/문의)
--   PART 9: 인덱스
--   PART 10: 트리거
--   PART 11: 유틸리티 함수
--   PART 12: 샘플 데이터
-- ============================================

-- ============================================
-- PART 1: 기본 유틸리티 함수
-- ============================================

-- Updated At 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 만료된 인증번호 자동 삭제 함수
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.phone_verifications WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- PART 2: 사용자 관련 테이블
-- ============================================

-- Users 확장 정보 테이블 (Supabase Auth의 auth.users와 연동)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  birth_date DATE,
  height DECIMAL(5, 2),
  weight DECIMAL(5, 2),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),
  weekly_goal TEXT,
  goal_weight DECIMAL(5, 2),
  provider TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- 사용자 포인트 테이블
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own points" ON public.user_points;
DROP POLICY IF EXISTS "Users can insert own points" ON public.user_points;
DROP POLICY IF EXISTS "Users can update own points" ON public.user_points;

CREATE POLICY "Users can view own points" ON public.user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own points" ON public.user_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own points" ON public.user_points FOR UPDATE USING (auth.uid() = user_id);

-- SMS 인증 테이블
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


-- ============================================
-- PART 3: 영양/식사 관련 테이블
-- ============================================

-- 식사 기록 테이블
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  food_name TEXT NOT NULL,
  calories INTEGER,
  carbs DECIMAL(5, 2),
  protein DECIMAL(5, 2),
  fat DECIMAL(5, 2),
  serving_size TEXT,
  meal_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can insert own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can update own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can delete own meals" ON public.meals;

CREATE POLICY "Users can view own meals" ON public.meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals" ON public.meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meals" ON public.meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals" ON public.meals FOR DELETE USING (auth.uid() = user_id);

-- 일일 영양 요약 테이블
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  total_calories INTEGER DEFAULT 0,
  total_carbs DECIMAL(5, 2) DEFAULT 0,
  total_protein DECIMAL(5, 2) DEFAULT 0,
  total_fat DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own nutrition logs" ON public.nutrition_logs;
DROP POLICY IF EXISTS "Users can insert own nutrition logs" ON public.nutrition_logs;
DROP POLICY IF EXISTS "Users can update own nutrition logs" ON public.nutrition_logs;

CREATE POLICY "Users can view own nutrition logs" ON public.nutrition_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition logs" ON public.nutrition_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition logs" ON public.nutrition_logs FOR UPDATE USING (auth.uid() = user_id);

-- 영양소 상태 테이블
CREATE TABLE IF NOT EXISTS public.nutrition_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nutrient_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('adequate', 'excessive', 'deficient')) NOT NULL,
  current_value DECIMAL(10, 2),
  recommended_min DECIMAL(10, 2),
  recommended_max DECIMAL(10, 2),
  score INTEGER DEFAULT 0,
  status_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nutrient_type, status_date)
);

ALTER TABLE public.nutrition_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own nutrition status" ON public.nutrition_status;
DROP POLICY IF EXISTS "Users can insert own nutrition status" ON public.nutrition_status;
DROP POLICY IF EXISTS "Users can update own nutrition status" ON public.nutrition_status;

CREATE POLICY "Users can view own nutrition status" ON public.nutrition_status FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition status" ON public.nutrition_status FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition status" ON public.nutrition_status FOR UPDATE USING (auth.uid() = user_id);

-- 영양 진단 결과 테이블
CREATE TABLE IF NOT EXISTS public.nutrition_diagnosis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  diagnosis_date DATE DEFAULT CURRENT_DATE,
  overall_score INTEGER,
  recommendations TEXT[],
  warning_nutrients TEXT[],
  diagnosis_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, diagnosis_date)
);

ALTER TABLE public.nutrition_diagnosis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own diagnosis" ON public.nutrition_diagnosis;
DROP POLICY IF EXISTS "Users can insert own diagnosis" ON public.nutrition_diagnosis;

CREATE POLICY "Users can view own diagnosis" ON public.nutrition_diagnosis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diagnosis" ON public.nutrition_diagnosis FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ============================================
-- PART 4: 약관 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view terms" ON public.terms;
CREATE POLICY "Anyone can view terms" ON public.terms FOR SELECT USING (true);


-- ============================================
-- PART 5: 홈화면 관련 테이블
-- ============================================

-- 식품 관련 명언 테이블
CREATE TABLE IF NOT EXISTS public.food_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  author TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.food_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view food quotes" ON public.food_quotes;
CREATE POLICY "Anyone can view food quotes" ON public.food_quotes FOR SELECT USING (true);

-- 건강 목표/질병 정보 테이블
CREATE TABLE IF NOT EXISTS public.user_health_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('weight_management', 'blood_sugar', 'muscle', 'general')) NOT NULL,
  diseases TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_health_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own health goals" ON public.user_health_goals;
DROP POLICY IF EXISTS "Users can insert own health goals" ON public.user_health_goals;
DROP POLICY IF EXISTS "Users can update own health goals" ON public.user_health_goals;

CREATE POLICY "Users can view own health goals" ON public.user_health_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health goals" ON public.user_health_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health goals" ON public.user_health_goals FOR UPDATE USING (auth.uid() = user_id);

-- 걸음수 기록 테이블
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

DROP POLICY IF EXISTS "Users can view own step records" ON public.step_records;
DROP POLICY IF EXISTS "Users can insert own step records" ON public.step_records;
DROP POLICY IF EXISTS "Users can update own step records" ON public.step_records;

CREATE POLICY "Users can view own step records" ON public.step_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own step records" ON public.step_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own step records" ON public.step_records FOR UPDATE USING (auth.uid() = user_id);


-- ============================================
-- PART 6: 컨텐츠 관련 테이블
-- ============================================

-- 카테고리 마스터 테이블
CREATE TABLE IF NOT EXISTS public.content_categories (
  id SERIAL PRIMARY KEY,
  category_type VARCHAR(20) NOT NULL CHECK (category_type IN ('interest', 'disease', 'exercise')),
  category_name VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UNIQUE 제약 추가
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_categories_type_name_unique') THEN
    ALTER TABLE public.content_categories ADD CONSTRAINT content_categories_type_name_unique UNIQUE (category_type, category_name);
  END IF;
END $$;

ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view content categories" ON public.content_categories;
CREATE POLICY "Anyone can view content categories" ON public.content_categories FOR SELECT USING (true);

-- 세분류 테이블
CREATE TABLE IF NOT EXISTS public.content_subcategories (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES public.content_categories(id) ON DELETE CASCADE,
  subcategory_name VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.content_subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view content subcategories" ON public.content_subcategories;
CREATE POLICY "Anyone can view content subcategories" ON public.content_subcategories FOR SELECT USING (true);

-- 컨텐츠 본문 테이블
CREATE TABLE IF NOT EXISTS public.contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id INT REFERENCES public.content_categories(id),
  subcategory_id INT REFERENCES public.content_subcategories(id),
  title VARCHAR(500) NOT NULL,
  thumbnail_url TEXT,
  background_color VARCHAR(20),
  card_style VARCHAR(20) DEFAULT 'A',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- title UNIQUE 제약 추가
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contents_title_unique') THEN
    ALTER TABLE public.contents ADD CONSTRAINT contents_title_unique UNIQUE (title);
  END IF;
END $$;

ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published contents" ON public.contents;
CREATE POLICY "Anyone can view published contents" ON public.contents FOR SELECT USING (is_published = true);

-- 컨텐츠 미디어 테이블
CREATE TABLE IF NOT EXISTS public.content_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  alt_text VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.content_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view content media" ON public.content_media;
CREATE POLICY "Anyone can view content media" ON public.content_media FOR SELECT USING (true);

-- 컨텐츠 좋아요 테이블
CREATE TABLE IF NOT EXISTS public.content_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

ALTER TABLE public.content_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own likes" ON public.content_likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON public.content_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.content_likes;

CREATE POLICY "Users can view own likes" ON public.content_likes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own likes" ON public.content_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.content_likes FOR DELETE USING (auth.uid() = user_id);

-- 컨텐츠 리뷰 테이블
CREATE TABLE IF NOT EXISTS public.content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.content_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reviews" ON public.content_reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON public.content_reviews;

CREATE POLICY "Users can view own reviews" ON public.content_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reviews" ON public.content_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 컨텐츠 읽음 히스토리 테이블
CREATE TABLE IF NOT EXISTS public.content_read_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

ALTER TABLE public.content_read_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own read history" ON public.content_read_history;
DROP POLICY IF EXISTS "Users can insert own read history" ON public.content_read_history;
DROP POLICY IF EXISTS "Users can update own read history" ON public.content_read_history;

CREATE POLICY "Users can view own read history" ON public.content_read_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own read history" ON public.content_read_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own read history" ON public.content_read_history FOR UPDATE USING (auth.uid() = user_id);


-- ============================================
-- PART 7: 챌린지 관련 테이블
-- ============================================

-- 기존 테이블 삭제 (의존성 순서대로)
DROP TABLE IF EXISTS public.roulette_spins CASCADE;
DROP TABLE IF EXISTS public.roulette_settings CASCADE;
DROP TABLE IF EXISTS public.challenge_quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.challenge_quizzes CASCADE;
DROP TABLE IF EXISTS public.challenge_rankings CASCADE;
DROP TABLE IF EXISTS public.challenge_stamps CASCADE;
DROP TABLE IF EXISTS public.challenge_verifications CASCADE;
DROP TABLE IF EXISTS public.challenge_participants CASCADE;
DROP TABLE IF EXISTS public.user_challenges CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;

-- 챌린지 마스터 테이블
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_type VARCHAR(50) NOT NULL CHECK (challenge_type IN (
    'attendance', 'steps', 'meal', 'supplement', 'nutrition_diagnosis', 'health_habit', 'quiz'
  )),
  verification_method VARCHAR(20) NOT NULL CHECK (verification_method IN ('roulette', 'auto', 'manual')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  detail_images JSONB DEFAULT '[]',
  display_start_date TIMESTAMP WITH TIME ZONE,
  display_end_date TIMESTAMP WITH TIME ZONE,
  recruitment_start_date TIMESTAMP WITH TIME ZONE,
  recruitment_end_date TIMESTAMP WITH TIME ZONE,
  operation_start_date TIMESTAMP WITH TIME ZONE,
  operation_end_date TIMESTAMP WITH TIME ZONE,
  challenge_duration_days INT DEFAULT 7,
  daily_verification_count INT DEFAULT 1,
  verification_time_slots JSONB DEFAULT '[]',
  reward_type VARCHAR(20) CHECK (reward_type IN ('stamp', 'coupon', 'point')),
  total_reward TEXT,
  daily_reward TEXT,
  single_reward TEXT,
  total_stamp_count INT DEFAULT 0,
  stamp_empty_image TEXT,
  stamp_filled_image TEXT,
  max_participants INT,
  current_participants INT DEFAULT 0,
  verification_button_text VARCHAR(100) DEFAULT '인증하기',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.challenges;
CREATE POLICY "Anyone can view active challenges" ON public.challenges FOR SELECT USING (is_active = true);

-- 챌린지 참여자 테이블
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'participating' CHECK (status IN ('participating', 'completed', 'cancelled', 'expired')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  total_verification_count INT DEFAULT 0,
  total_required_count INT DEFAULT 0,
  achievement_rate DECIMAL(5,2) DEFAULT 0,
  is_reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMP WITH TIME ZONE,
  today_verification_count INT DEFAULT 0,
  last_verification_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own participations" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can insert own participations" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can update own participations" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can delete own participations" ON public.challenge_participants;

CREATE POLICY "Users can view own participations" ON public.challenge_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own participations" ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participations" ON public.challenge_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own participations" ON public.challenge_participants FOR DELETE USING (auth.uid() = user_id);

-- 챌린지 인증 기록 테이블
CREATE TABLE IF NOT EXISTS public.challenge_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.challenge_participants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  verification_date DATE DEFAULT CURRENT_DATE,
  verification_time TIME DEFAULT CURRENT_TIME,
  verification_slot INT DEFAULT 1,
  is_verified BOOLEAN DEFAULT true,
  verification_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.challenge_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verifications" ON public.challenge_verifications;
DROP POLICY IF EXISTS "Users can insert own verifications" ON public.challenge_verifications;

CREATE POLICY "Users can view own verifications" ON public.challenge_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own verifications" ON public.challenge_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 챌린지 스탬프 기록 테이블
CREATE TABLE IF NOT EXISTS public.challenge_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES public.challenge_participants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  stamp_date DATE DEFAULT CURRENT_DATE,
  stamp_number INT NOT NULL,
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_id, stamp_number)
);

ALTER TABLE public.challenge_stamps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own stamps" ON public.challenge_stamps;
DROP POLICY IF EXISTS "Users can insert own stamps" ON public.challenge_stamps;
DROP POLICY IF EXISTS "Users can update own stamps" ON public.challenge_stamps;

CREATE POLICY "Users can view own stamps" ON public.challenge_stamps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stamps" ON public.challenge_stamps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stamps" ON public.challenge_stamps FOR UPDATE USING (auth.uid() = user_id);

-- 퀴즈 테이블
CREATE TABLE IF NOT EXISTS public.challenge_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  quiz_type VARCHAR(20) NOT NULL CHECK (quiz_type IN ('multiple_choice', 'ox')),
  question TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  correct_answers JSONB DEFAULT '[]',
  hint TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.challenge_quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view quizzes" ON public.challenge_quizzes;
CREATE POLICY "Anyone can view quizzes" ON public.challenge_quizzes FOR SELECT USING (true);

-- 퀴즈 시도 기록 테이블
CREATE TABLE IF NOT EXISTS public.challenge_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.challenge_quizzes(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.challenge_participants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  attempt_date DATE DEFAULT CURRENT_DATE,
  selected_answer JSONB NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  attempt_count INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.challenge_quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quiz attempts" ON public.challenge_quiz_attempts;
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON public.challenge_quiz_attempts;

CREATE POLICY "Users can view own quiz attempts" ON public.challenge_quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz attempts" ON public.challenge_quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 룰렛 설정 테이블
CREATE TABLE IF NOT EXISTS public.roulette_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL UNIQUE,
  segments JSONB NOT NULL DEFAULT '[]',
  roulette_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.roulette_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view roulette settings" ON public.roulette_settings;
CREATE POLICY "Anyone can view roulette settings" ON public.roulette_settings FOR SELECT USING (true);

-- 룰렛 스핀 기록 테이블
CREATE TABLE IF NOT EXISTS public.roulette_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.challenge_participants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spin_date DATE DEFAULT CURRENT_DATE,
  won_segment JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id, spin_date)
);

ALTER TABLE public.roulette_spins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own spins" ON public.roulette_spins;
DROP POLICY IF EXISTS "Users can insert own spins" ON public.roulette_spins;

CREATE POLICY "Users can view own spins" ON public.roulette_spins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spins" ON public.roulette_spins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 챌린지 랭킹 테이블
CREATE TABLE IF NOT EXISTS public.challenge_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.challenge_participants(id) ON DELETE CASCADE NOT NULL,
  rank_position INT,
  achievement_rate DECIMAL(5,2) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_rankings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view rankings" ON public.challenge_rankings;
DROP POLICY IF EXISTS "Users can insert own rankings" ON public.challenge_rankings;
DROP POLICY IF EXISTS "Users can update own rankings" ON public.challenge_rankings;

CREATE POLICY "Anyone can view rankings" ON public.challenge_rankings FOR SELECT USING (true);
CREATE POLICY "Users can insert own rankings" ON public.challenge_rankings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rankings" ON public.challenge_rankings FOR UPDATE USING (auth.uid() = user_id);


-- ============================================
-- PART 8: 메뉴 관련 테이블 (공지/알림/FAQ/문의)
-- ============================================

-- 공지사항 테이블
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active notices" ON public.notices;
CREATE POLICY "Anyone can view active notices" ON public.notices FOR SELECT USING (is_active = true);

-- 알림 테이블
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  icon_url TEXT,
  link_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- FAQ 카테고리 테이블
CREATE TABLE IF NOT EXISTS public.faq_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view faq categories" ON public.faq_categories;
CREATE POLICY "Anyone can view faq categories" ON public.faq_categories FOR SELECT USING (is_active = true);

-- FAQ 질문/답변 테이블
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id INT REFERENCES public.faq_categories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active faqs" ON public.faqs;
CREATE POLICY "Anyone can view active faqs" ON public.faqs FOR SELECT USING (is_active = true);

-- 문의 유형 테이블
CREATE TABLE IF NOT EXISTS public.inquiry_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.inquiry_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view inquiry types" ON public.inquiry_types;
CREATE POLICY "Anyone can view inquiry types" ON public.inquiry_types FOR SELECT USING (is_active = true);

-- 1:1 문의 테이블
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  inquiry_type_id INT REFERENCES public.inquiry_types(id),
  content TEXT NOT NULL,
  answer TEXT,
  status TEXT CHECK (status IN ('pending', 'answered')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can insert own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can update own pending inquiries" ON public.inquiries;

CREATE POLICY "Users can view own inquiries" ON public.inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inquiries" ON public.inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending inquiries" ON public.inquiries FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');


-- ============================================
-- PART 9: 인덱스
-- ============================================

-- 사용자 관련
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON public.phone_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires ON public.phone_verifications(expires_at);

-- 영양 관련
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON public.meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_meal_date ON public.meals(meal_date);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_id ON public.nutrition_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_date ON public.nutrition_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_user_health_goals_user_id ON public.user_health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_status_user_id ON public.nutrition_status(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_status_date ON public.nutrition_status(status_date);
CREATE INDEX IF NOT EXISTS idx_step_records_user_id ON public.step_records(user_id);
CREATE INDEX IF NOT EXISTS idx_step_records_date ON public.step_records(record_date);
CREATE INDEX IF NOT EXISTS idx_nutrition_diagnosis_user_id ON public.nutrition_diagnosis(user_id);

-- 컨텐츠 관련
CREATE INDEX IF NOT EXISTS idx_contents_category_id ON public.contents(category_id);
CREATE INDEX IF NOT EXISTS idx_contents_subcategory_id ON public.contents(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_contents_published ON public.contents(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_content_media_content_id ON public.content_media(content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_content_id ON public.content_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_user_id ON public.content_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_content_reviews_content_id ON public.content_reviews(content_id);
CREATE INDEX IF NOT EXISTS idx_content_reviews_user_id ON public.content_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_content_read_history_user_id ON public.content_read_history(user_id);

-- 챌린지 관련
CREATE INDEX IF NOT EXISTS idx_challenges_type ON public.challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_display_dates ON public.challenges(display_start_date, display_end_date);
CREATE INDEX IF NOT EXISTS idx_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON public.challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_status ON public.challenge_participants(status);
CREATE INDEX IF NOT EXISTS idx_verifications_participant ON public.challenge_verifications(participant_id);
CREATE INDEX IF NOT EXISTS idx_verifications_date ON public.challenge_verifications(verification_date);
CREATE INDEX IF NOT EXISTS idx_stamps_participant ON public.challenge_stamps(participant_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_challenge ON public.challenge_quizzes(challenge_id);
CREATE INDEX IF NOT EXISTS idx_rankings_challenge ON public.challenge_rankings(challenge_id);
CREATE INDEX IF NOT EXISTS idx_rankings_rate ON public.challenge_rankings(achievement_rate DESC);

-- 메뉴 관련
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON public.notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON public.inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);


-- ============================================
-- PART 10: 트리거
-- ============================================

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_nutrition_logs_updated_at ON public.nutrition_logs;
DROP TRIGGER IF EXISTS update_user_health_goals_updated_at ON public.user_health_goals;
DROP TRIGGER IF EXISTS update_nutrition_status_updated_at ON public.nutrition_status;
DROP TRIGGER IF EXISTS update_step_records_updated_at ON public.step_records;
DROP TRIGGER IF EXISTS update_user_points_updated_at ON public.user_points;
DROP TRIGGER IF EXISTS update_contents_updated_at ON public.contents;
DROP TRIGGER IF EXISTS update_challenges_updated_at ON public.challenges;
DROP TRIGGER IF EXISTS update_challenge_participants_updated_at ON public.challenge_participants;
DROP TRIGGER IF EXISTS update_challenge_rankings_updated_at ON public.challenge_rankings;
DROP TRIGGER IF EXISTS update_notices_updated_at ON public.notices;
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nutrition_logs_updated_at BEFORE UPDATE ON public.nutrition_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_health_goals_updated_at BEFORE UPDATE ON public.user_health_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nutrition_status_updated_at BEFORE UPDATE ON public.nutrition_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_step_records_updated_at BEFORE UPDATE ON public.step_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON public.user_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON public.contents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenge_participants_updated_at BEFORE UPDATE ON public.challenge_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenge_rankings_updated_at BEFORE UPDATE ON public.challenge_rankings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- PART 11: 유틸리티 함수
-- ============================================

-- 챌린지 상태 계산 함수
CREATE OR REPLACE FUNCTION get_challenge_status(
  p_challenge_id UUID,
  p_user_id UUID DEFAULT NULL
) RETURNS VARCHAR(20) AS $$
DECLARE
  v_challenge RECORD;
  v_participant RECORD;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  SELECT * INTO v_challenge FROM public.challenges WHERE id = p_challenge_id;
  
  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;
  
  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_participant 
    FROM public.challenge_participants 
    WHERE challenge_id = p_challenge_id AND user_id = p_user_id;
    
    IF FOUND AND v_participant.status = 'participating' THEN
      IF v_participant.achievement_rate >= 100 THEN
        RETURN 'completed';
      END IF;
      IF v_participant.end_date < CURRENT_DATE THEN
        RETURN 'expired';
      END IF;
      RETURN 'participating';
    END IF;
  END IF;
  
  IF v_challenge.operation_end_date IS NOT NULL AND v_challenge.operation_end_date < v_now THEN
    RETURN 'ended';
  END IF;
  
  IF v_challenge.recruitment_start_date IS NOT NULL AND v_challenge.recruitment_start_date > v_now THEN
    RETURN 'before_recruitment';
  END IF;
  
  IF v_challenge.recruitment_end_date IS NOT NULL AND v_challenge.recruitment_end_date < v_now THEN
    RETURN 'recruitment_closed';
  END IF;
  
  IF v_challenge.max_participants IS NOT NULL AND v_challenge.current_participants >= v_challenge.max_participants THEN
    RETURN 'recruitment_closed';
  END IF;
  
  RETURN 'recruiting';
END;
$$ LANGUAGE plpgsql;

-- 달성률 계산 및 업데이트 함수
CREATE OR REPLACE FUNCTION update_participant_achievement(
  p_participant_id UUID
) RETURNS void AS $$
DECLARE
  v_participant RECORD;
  v_challenge RECORD;
  v_total_verifications INT;
  v_required_count INT;
  v_achievement_rate DECIMAL(5,2);
BEGIN
  SELECT * INTO v_participant FROM public.challenge_participants WHERE id = p_participant_id;
  SELECT * INTO v_challenge FROM public.challenges WHERE id = v_participant.challenge_id;
  
  SELECT COUNT(*) INTO v_total_verifications
  FROM public.challenge_verifications
  WHERE participant_id = p_participant_id AND is_verified = true;
  
  v_required_count := v_challenge.challenge_duration_days * v_challenge.daily_verification_count;
  
  IF v_required_count > 0 THEN
    v_achievement_rate := (v_total_verifications::DECIMAL / v_required_count) * 100;
  ELSE
    v_achievement_rate := 0;
  END IF;
  
  UPDATE public.challenge_participants
  SET 
    total_verification_count = v_total_verifications,
    total_required_count = v_required_count,
    achievement_rate = LEAST(v_achievement_rate, 100),
    status = CASE WHEN v_achievement_rate >= 100 THEN 'completed' ELSE status END,
    updated_at = NOW()
  WHERE id = p_participant_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- PART 12: 샘플 데이터
-- ============================================

-- 약관 샘플 데이터
INSERT INTO public.terms (code, title, content, is_required, version) VALUES 
  ('terms_service', '이용약관', '제1조 (목적)\n본 약관은...', true, '1.0'),
  ('privacy_policy', '개인정보 수집 및 이용동의', '1. 수집하는 개인정보 항목\n- 필수항목: 이름, 휴대폰 번호...', true, '1.0'),
  ('sensitive_info', '민감정보 수집 및 이용동의', '1. 수집하는 민감정보 항목\n- 키, 체중, 질병...', true, '1.0'),
  ('marketing', '마케팅 정보 수신동의', '이벤트 정보 제공, 맞춤 건강관리 서비스 제공...', false, '1.0'),
  ('push_notification', '앱 푸시(광고성) 알림 동의', 'APP전용 혜택 안내...', false, '1.0')
ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, is_required = EXCLUDED.is_required;

-- 명언 샘플 데이터
INSERT INTO public.food_quotes (quote, author, display_order) VALUES
  ('약과 음식은 근원에서 같다.', '약식동원', 1),
  ('You are what you eat.', NULL, 2),
  ('음식으로는 못 고치는 병은 의사도 못 고친다', '히포크라테스', 3),
  ('잘 먹는 것은 결코 하찮은 기술이 아니다', NULL, 4),
  ('걷기는 사람에게 최고의 약이다', NULL, 5)
ON CONFLICT DO NOTHING;

-- 컨텐츠 카테고리 샘플 데이터
INSERT INTO public.content_categories (category_type, category_name, display_order) VALUES
  ('interest', '면역력', 1), ('interest', '눈건강', 2), ('interest', '뼈관절건강', 3),
  ('interest', '근력', 4), ('interest', '체중조절', 5), ('interest', '두뇌활동', 6),
  ('interest', '피로회복', 7), ('interest', '모발건강', 8), ('interest', '혈행개선', 9),
  ('interest', '피부건강', 10), ('interest', '갱년기', 11), ('interest', '소화기/장건강', 12),
  ('disease', '당뇨', 1), ('disease', '고혈압', 2), ('disease', '고중성지방혈증', 3),
  ('disease', '고콜레스테롤혈증', 4), ('disease', '지방간', 5), ('disease', '골다공증', 6), ('disease', '비만', 7),
  ('exercise', '운동법', 1), ('exercise', '운동종류', 2), ('exercise', '운동시간', 3)
ON CONFLICT (category_type, category_name) DO NOTHING;

-- 컨텐츠 샘플 데이터
INSERT INTO public.contents (category_id, subcategory_id, title, thumbnail_url, background_color, card_style, is_published, published_at) VALUES
  (5, NULL, '식사 순서만 바꿔도 살이 빠진다구요?', '/images/content-diet-1.png', '#FFE4E6', 'A', true, NOW()),
  (1, NULL, '나에게 딱 맞는 탄수화물이 있다?', '/images/content-carbs-1.png', '#E0F2FE', 'A', true, NOW()),
  (14, NULL, '고혈압 환자, 운동의 필요성', '/images/content-exercise-1.png', '#DBEAFE', 'A', true, NOW())
ON CONFLICT (title) DO NOTHING;

-- FAQ 카테고리 샘플 데이터
INSERT INTO public.faq_categories (name, icon, display_order) VALUES
  ('인기질문', 'chat', 1),
  ('포인트 관련', 'star', 2),
  ('계정 연동', 'user', 3),
  ('쿠폰사용', 'coupon', 4)
ON CONFLICT DO NOTHING;

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

-- 문의 유형 샘플 데이터
INSERT INTO public.inquiry_types (name, display_order) VALUES
  ('계정 연동 문제', 1),
  ('포인트 사용 문의', 2),
  ('쿠폰 관련 문의', 3),
  ('영양진단 관련 문의', 4),
  ('기타', 5)
ON CONFLICT DO NOTHING;

-- 공지사항 샘플 데이터
INSERT INTO public.notices (title, content) VALUES
  ('식사기록 업데이트 안내', '기존 식사기록에서 찾아보기 어려웠던 프렌차이즈 데이터를 업데이트 하였습니다. 많은 이용부탁드립니다.'),
  ('APP 이용 안내', '앱 이용 안내 내용입니다. 새로운 기능이 추가되었습니다.')
ON CONFLICT DO NOTHING;

-- 챌린지 샘플 데이터
INSERT INTO public.challenges (
  challenge_type, verification_method, title, description, thumbnail_url,
  display_start_date, display_end_date, recruitment_start_date, recruitment_end_date,
  operation_start_date, operation_end_date, challenge_duration_days,
  daily_verification_count, reward_type, total_reward, total_stamp_count,
  verification_button_text
) VALUES 
  ('attendance', 'roulette', '출석체크', '매일 출석체크하고 룰렛 돌려서 보상 받아가세요!', '/images/challenge/attendance.png',
   NOW(), NOW() + INTERVAL '3 months', NOW(), NOW() + INTERVAL '3 months',
   NOW(), NOW() + INTERVAL '3 months', 30, 1, 'point', '최대 100P', 30, '룰렛 돌리기'),
  ('steps', 'auto', '하루에 만보 걷기', '건강한 걷기 습관으로 만보를 달성해보세요!', '/images/challenge/steps.png',
   NOW(), NOW() + INTERVAL '1 month', NOW(), NOW() + INTERVAL '1 month',
   NOW(), NOW() + INTERVAL '1 month', 7, 1, 'stamp', '스탬프 2장', 7, '자동 인증'),
  ('health_habit', 'manual', '아침에 물마시기', '아침에 물 한 잔으로 건강한 하루를 시작해보세요!', '/images/challenge/water.png',
   NOW(), NOW() + INTERVAL '1 month', NOW(), NOW() + INTERVAL '1 month',
   NOW(), NOW() + INTERVAL '1 month', 14, 1, 'stamp', '스탬프 1장', 14, '물을 마셨어요!'),
  ('quiz', 'auto', '매일 퀴즈풀기', '건강 퀴즈를 풀고 지식도 쌓고 스탬프도 모아요!', '/images/challenge/quiz.png',
   NOW(), NOW() + INTERVAL '1 month', NOW(), NOW() + INTERVAL '1 month',
   NOW(), NOW() + INTERVAL '1 month', 7, 3, 'stamp', '스탬프 4장', 7, '퀴즈 풀기')
ON CONFLICT DO NOTHING;

-- 룰렛 설정 (출석체크용)
INSERT INTO public.roulette_settings (challenge_id, segments)
SELECT id, '[
  {"label": "1포인트", "probability": 30, "reward_type": "point", "reward_value": 1},
  {"label": "5포인트", "probability": 25, "reward_type": "point", "reward_value": 5},
  {"label": "10포인트", "probability": 20, "reward_type": "point", "reward_value": 10},
  {"label": "25포인트", "probability": 15, "reward_type": "point", "reward_value": 25},
  {"label": "50포인트", "probability": 7, "reward_type": "point", "reward_value": 50},
  {"label": "100포인트", "probability": 3, "reward_type": "point", "reward_value": 100}
]'::jsonb
FROM public.challenges WHERE challenge_type = 'attendance' LIMIT 1
ON CONFLICT DO NOTHING;

-- 퀴즈 데이터
INSERT INTO public.challenge_quizzes (challenge_id, quiz_type, question, options, correct_answers, hint, display_order)
SELECT id, 'multiple_choice',
  '뇌와 근육의 주요 에너지원으로 쓰이며 우리의 일상생활에 반드시 필요한 영양소의 이름은 무엇일까요?',
  '["포도당", "아미노산", "비타민C", "망간", "오메가-3"]'::jsonb,
  '[0]'::jsonb, '포도에서 최초로 발견된 성분이에요!', 1
FROM public.challenges WHERE challenge_type = 'quiz' LIMIT 1
ON CONFLICT DO NOTHING;


-- ============================================
-- 완료! 이 스크립트는 여러 번 실행해도 안전합니다.
-- ============================================

