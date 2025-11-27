-- ============================================
-- Greating Care Database Schema
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
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON public.meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_meal_date ON public.meals(meal_date);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_id ON public.nutrition_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_date ON public.nutrition_logs(log_date);

-- ============================================
-- Trigger: Updated At
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_logs_updated_at
  BEFORE UPDATE ON public.nutrition_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
