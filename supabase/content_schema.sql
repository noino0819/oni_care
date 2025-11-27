-- ============================================
-- 컨텐츠 관련 테이블 스키마 (중복 실행 가능)
-- ============================================
-- 이 파일은 여러 번 실행해도 안전합니다.
-- ============================================

-- 7-1. 카테고리 마스터 테이블
CREATE TABLE IF NOT EXISTS public.content_categories (
  id SERIAL PRIMARY KEY,
  category_type VARCHAR(20) NOT NULL CHECK (category_type IN ('interest', 'disease', 'exercise')),
  category_name VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 초기 카테고리 데이터 (중복 방지를 위해 UNIQUE 제약 추가)
DO $$
BEGIN
  -- 카테고리 UNIQUE 제약 추가 (없으면)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'content_categories_type_name_unique'
  ) THEN
    ALTER TABLE public.content_categories 
    ADD CONSTRAINT content_categories_type_name_unique 
    UNIQUE (category_type, category_name);
  END IF;
END $$;

-- 카테고리 데이터 삽입
INSERT INTO public.content_categories (category_type, category_name, display_order) VALUES
-- 관심사
('interest', '면역력', 1),
('interest', '눈건강', 2),
('interest', '뼈관절건강', 3),
('interest', '근력', 4),
('interest', '체중조절', 5),
('interest', '두뇌활동', 6),
('interest', '피로회복', 7),
('interest', '모발건강', 8),
('interest', '혈행개선', 9),
('interest', '피부건강', 10),
('interest', '갱년기', 11),
('interest', '소화기/장건강', 12),
-- 질병
('disease', '당뇨', 1),
('disease', '고혈압', 2),
('disease', '고중성지방혈증', 3),
('disease', '고콜레스테롤혈증', 4),
('disease', '지방간', 5),
('disease', '골다공증', 6),
('disease', '비만', 7),
-- 운동
('exercise', '운동법', 1),
('exercise', '운동종류', 2),
('exercise', '운동시간', 3)
ON CONFLICT (category_type, category_name) DO NOTHING;

-- RLS 활성화 (이미 활성화되어 있으면 무시됨)
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (기존 정책 삭제 후 재생성)
DROP POLICY IF EXISTS "Anyone can view content categories" ON public.content_categories;
CREATE POLICY "Anyone can view content categories" 
  ON public.content_categories 
  FOR SELECT 
  USING (true);

-- 7-2. 세분류 테이블 (2depth)
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
CREATE POLICY "Anyone can view content subcategories" 
  ON public.content_subcategories 
  FOR SELECT 
  USING (true);

-- 7-3. 컨텐츠 본문 테이블
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

ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published contents" ON public.contents;
CREATE POLICY "Anyone can view published contents" 
  ON public.contents 
  FOR SELECT 
  USING (is_published = true);

-- 7-4. 컨텐츠 미디어 테이블 (이미지/영상)
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
CREATE POLICY "Anyone can view content media" 
  ON public.content_media 
  FOR SELECT 
  USING (true);

-- 7-5. 좋아요 테이블
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

CREATE POLICY "Users can view own likes" 
  ON public.content_likes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own likes" 
  ON public.content_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" 
  ON public.content_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 7-6. 리뷰 테이블
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

CREATE POLICY "Users can view own reviews" 
  ON public.content_reviews 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews" 
  ON public.content_reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 7-7. 읽음 히스토리 테이블
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

CREATE POLICY "Users can view own read history" 
  ON public.content_read_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own read history" 
  ON public.content_read_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own read history" 
  ON public.content_read_history 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 인덱스 생성 (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_contents_category_id ON public.contents(category_id);
CREATE INDEX IF NOT EXISTS idx_contents_subcategory_id ON public.contents(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_contents_published ON public.contents(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_content_media_content_id ON public.content_media(content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_content_id ON public.content_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_user_id ON public.content_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_content_reviews_content_id ON public.content_reviews(content_id);
CREATE INDEX IF NOT EXISTS idx_content_reviews_user_id ON public.content_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_content_read_history_user_id ON public.content_read_history(user_id);

-- 트리거 생성 (기존 트리거 삭제 후 재생성)
DROP TRIGGER IF EXISTS update_contents_updated_at ON public.contents;
CREATE TRIGGER update_contents_updated_at
  BEFORE UPDATE ON public.contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 샘플 컨텐츠 데이터 (테스트용)
-- title로 중복 체크를 위한 UNIQUE 제약 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contents_title_unique'
  ) THEN
    ALTER TABLE public.contents 
    ADD CONSTRAINT contents_title_unique UNIQUE (title);
  END IF;
END $$;

INSERT INTO public.contents (category_id, subcategory_id, title, thumbnail_url, background_color, card_style, is_published, published_at) VALUES
(5, NULL, '식사 순서만 바꿔도 살이 빠진다구요?', '/images/content-diet-1.png', '#FFE4E6', 'A', true, NOW()),
(1, NULL, '나에게 딱 맞는 탄수화물이 있다?', '/images/content-carbs-1.png', '#E0F2FE', 'A', true, NOW()),
(14, NULL, '고혈압 환자, 운동의 필요성', '/images/content-exercise-1.png', '#DBEAFE', 'A', true, NOW())
ON CONFLICT (title) DO NOTHING;

-- ============================================
-- 완료! 이 스크립트는 여러 번 실행해도 안전합니다.
-- ============================================

