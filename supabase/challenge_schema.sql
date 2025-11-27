-- ============================================
-- Greating Care 챌린지 확장 스키마
-- ============================================
-- 화면 ID: MF_CH (리스트), MF_CH_01~06 (상세/인증)
-- 화면명: 챌린지
-- ============================================

-- ============================================
-- PART 1: 챌린지 마스터 테이블 (기존 테이블 확장)
-- ============================================

-- 기존 challenges 테이블 삭제 후 재생성
DROP TABLE IF EXISTS public.user_challenges CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;

-- 챌린지 마스터 테이블
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 챌린지 유형
  challenge_type VARCHAR(50) NOT NULL CHECK (challenge_type IN (
    'attendance',           -- 출석체크 (룰렛)
    'steps',                -- 걸음수
    'meal',                 -- 식사기록
    'supplement',           -- 영양제 기록
    'nutrition_diagnosis',  -- 영양진단
    'health_habit',         -- 건강습관 (수기인증)
    'quiz'                  -- 퀴즈
  )),
  
  -- 인증 방식
  verification_method VARCHAR(20) NOT NULL CHECK (verification_method IN (
    'roulette',  -- 룰렛
    'auto',      -- 자동체크
    'manual'     -- 수기체크
  )),
  
  -- 기본 정보
  title VARCHAR(200) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  detail_images JSONB DEFAULT '[]',  -- 상세 이미지 배열
  
  -- 기간 설정
  display_start_date TIMESTAMP WITH TIME ZONE,      -- 노출 시작일
  display_end_date TIMESTAMP WITH TIME ZONE,        -- 노출 종료일
  recruitment_start_date TIMESTAMP WITH TIME ZONE,  -- 모집 시작일
  recruitment_end_date TIMESTAMP WITH TIME ZONE,    -- 모집 종료일
  operation_start_date TIMESTAMP WITH TIME ZONE,    -- 운영 시작일
  operation_end_date TIMESTAMP WITH TIME ZONE,      -- 운영 종료일
  challenge_duration_days INT DEFAULT 7,            -- 개인 챌린지 기간 (일)
  
  -- 인증 설정
  daily_verification_count INT DEFAULT 1,           -- 하루 인증 횟수 (최대 3)
  verification_time_slots JSONB DEFAULT '[]',       -- 인증 시간대 [{"start": "09:00", "end": "12:00"}, ...]
  
  -- 보상 설정
  reward_type VARCHAR(20) CHECK (reward_type IN ('stamp', 'coupon', 'point')),
  total_reward TEXT,                 -- 전체 보상 (예: "스탬프 4장", "1000P")
  daily_reward TEXT,                 -- 일일 보상
  single_reward TEXT,                -- 1회 보상
  total_stamp_count INT DEFAULT 0,   -- 전체 스탬프 개수
  
  -- 스탬프 이미지
  stamp_empty_image TEXT,            -- 미달성 스탬프 이미지
  stamp_filled_image TEXT,           -- 달성 스탬프 이미지
  
  -- 참여 설정
  max_participants INT,              -- 최대 참여자 수 (null이면 무제한)
  current_participants INT DEFAULT 0,
  
  -- 버튼 문구
  verification_button_text VARCHAR(100) DEFAULT '인증하기',  -- 인증하기 버튼 문구
  
  -- 상태
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 챌린지 테이블 RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges"
  ON public.challenges
  FOR SELECT
  USING (is_active = true);

-- ============================================
-- PART 2: 챌린지 참여자 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 참여 상태
  status VARCHAR(20) DEFAULT 'participating' CHECK (status IN (
    'participating',  -- 참여중
    'completed',      -- 완료 (전체 인증 완료)
    'cancelled',      -- 취소됨
    'expired'         -- 기간 만료
  )),
  
  -- 기간
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,  -- start_date + challenge_duration_days
  
  -- 달성 현황
  total_verification_count INT DEFAULT 0,    -- 전체 인증 횟수
  total_required_count INT DEFAULT 0,        -- 필요 인증 횟수
  achievement_rate DECIMAL(5,2) DEFAULT 0,   -- 달성률 (%)
  
  -- 보상
  is_reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMP WITH TIME ZONE,
  
  -- 오늘 인증 현황
  today_verification_count INT DEFAULT 0,
  last_verification_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own participations"
  ON public.challenge_participants
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own participations"
  ON public.challenge_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participations"
  ON public.challenge_participants
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own participations"
  ON public.challenge_participants
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 3: 챌린지 인증 기록 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.challenge_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.challenge_participants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  verification_date DATE DEFAULT CURRENT_DATE,
  verification_time TIME DEFAULT CURRENT_TIME,
  verification_slot INT DEFAULT 1,            -- 몇 회차 인증인지 (복수 인증 시 1, 2, 3)
  
  is_verified BOOLEAN DEFAULT true,
  verification_data JSONB DEFAULT '{}',       -- 인증 관련 추가 데이터 (걸음수, 퀴즈 답 등)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.challenge_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verifications"
  ON public.challenge_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications"
  ON public.challenge_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 4: 챌린지 스탬프 기록 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.challenge_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES public.challenge_participants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  
  stamp_date DATE DEFAULT CURRENT_DATE,
  stamp_number INT NOT NULL,          -- 몇 번째 스탬프인지 (1부터 시작)
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(participant_id, stamp_number)
);

ALTER TABLE public.challenge_stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stamps"
  ON public.challenge_stamps
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stamps"
  ON public.challenge_stamps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stamps"
  ON public.challenge_stamps
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 5: 퀴즈 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.challenge_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  
  quiz_type VARCHAR(20) NOT NULL CHECK (quiz_type IN ('multiple_choice', 'ox')),
  question TEXT NOT NULL,
  options JSONB DEFAULT '[]',                 -- ["포도당", "아미노산", "비타민C", ...] (다지선다용)
  correct_answers JSONB DEFAULT '[]',         -- [0] 또는 [0, 2] (인덱스, 복수 정답 가능) / ["O"] 또는 ["X"] (OX용)
  hint TEXT,
  
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.challenge_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quizzes"
  ON public.challenge_quizzes
  FOR SELECT
  USING (true);

-- ============================================
-- PART 6: 퀴즈 시도 기록 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.challenge_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.challenge_quizzes(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.challenge_participants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  attempt_date DATE DEFAULT CURRENT_DATE,
  selected_answer JSONB NOT NULL,             -- 선택한 답
  is_correct BOOLEAN DEFAULT false,
  attempt_count INT DEFAULT 1,                -- 시도 횟수
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.challenge_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts"
  ON public.challenge_quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON public.challenge_quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 7: 룰렛 설정 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.roulette_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- 최대 8개 세그먼트
  segments JSONB NOT NULL DEFAULT '[]',       -- [{label: "1포인트", probability: 30, reward_type: "point", reward_value: 1, image_url: "..."}, ...]
  roulette_image_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.roulette_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view roulette settings"
  ON public.roulette_settings
  FOR SELECT
  USING (true);

-- ============================================
-- PART 8: 룰렛 스핀 기록 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.roulette_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.challenge_participants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  spin_date DATE DEFAULT CURRENT_DATE,
  won_segment JSONB NOT NULL,                 -- 당첨된 세그먼트 정보
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(challenge_id, user_id, spin_date)   -- 하루에 1번만 스핀 가능
);

ALTER TABLE public.roulette_spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spins"
  ON public.roulette_spins
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spins"
  ON public.roulette_spins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 9: 챌린지 랭킹 테이블
-- ============================================

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

CREATE POLICY "Anyone can view rankings"
  ON public.challenge_rankings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own rankings"
  ON public.challenge_rankings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rankings"
  ON public.challenge_rankings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 10: 인덱스
-- ============================================

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

-- ============================================
-- PART 11: 트리거
-- ============================================

-- 참여자 updated_at 트리거
CREATE TRIGGER update_challenge_participants_updated_at
  BEFORE UPDATE ON public.challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 랭킹 updated_at 트리거
CREATE TRIGGER update_challenge_rankings_updated_at
  BEFORE UPDATE ON public.challenge_rankings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 챌린지 updated_at 트리거
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 12: 샘플 데이터
-- ============================================

-- 1. 출석체크 챌린지 (룰렛)
INSERT INTO public.challenges (
  challenge_type, verification_method, title, description, thumbnail_url,
  display_start_date, display_end_date, recruitment_start_date, recruitment_end_date,
  operation_start_date, operation_end_date, challenge_duration_days,
  daily_verification_count, reward_type, total_reward, total_stamp_count,
  verification_button_text
) VALUES (
  'attendance', 'roulette', '출석체크', '매일 출석체크하고 룰렛 돌려서 보상 받아가세요!', '/images/challenge/attendance.png',
  NOW(), NOW() + INTERVAL '3 months', NOW(), NOW() + INTERVAL '3 months',
  NOW(), NOW() + INTERVAL '3 months', 30,
  1, 'point', '최대 100P', 30,
  '룰렛 돌리기'
);

-- 2. 걸음수 챌린지
INSERT INTO public.challenges (
  challenge_type, verification_method, title, description, thumbnail_url,
  display_start_date, display_end_date, recruitment_start_date, recruitment_end_date,
  operation_start_date, operation_end_date, challenge_duration_days,
  daily_verification_count, reward_type, total_reward, total_stamp_count,
  stamp_empty_image, stamp_filled_image, verification_button_text
) VALUES (
  'steps', 'auto', '하루에 만보 걷기', '건강한 걷기 습관으로 만보를 달성해보세요!', '/images/challenge/steps.png',
  NOW(), NOW() + INTERVAL '1 month', NOW(), NOW() + INTERVAL '1 month',
  NOW(), NOW() + INTERVAL '1 month', 7,
  1, 'stamp', '스탬프 2장', 7,
  '/images/challenge/stamp-empty.png', '/images/challenge/stamp-filled.png',
  '자동 인증'
);

-- 3. 수기인증 챌린지 (아침에 물마시기)
INSERT INTO public.challenges (
  challenge_type, verification_method, title, description, thumbnail_url,
  display_start_date, display_end_date, recruitment_start_date, recruitment_end_date,
  operation_start_date, operation_end_date, challenge_duration_days,
  daily_verification_count, reward_type, total_reward, total_stamp_count,
  stamp_empty_image, stamp_filled_image, verification_button_text
) VALUES (
  'health_habit', 'manual', '아침에 물마시기', '아침에 물 한 잔으로 건강한 하루를 시작해보세요!', '/images/challenge/water.png',
  NOW(), NOW() + INTERVAL '1 month', NOW(), NOW() + INTERVAL '1 month',
  NOW(), NOW() + INTERVAL '1 month', 14,
  1, 'stamp', '스탬프 1장', 14,
  '/images/challenge/stamp-empty.png', '/images/challenge/stamp-filled.png',
  '물을 마셨어요!'
);

-- 4. 복수 수기인증 챌린지 (하루 세 번 물 마시기)
INSERT INTO public.challenges (
  challenge_type, verification_method, title, description, thumbnail_url,
  display_start_date, display_end_date, recruitment_start_date, recruitment_end_date,
  operation_start_date, operation_end_date, challenge_duration_days,
  daily_verification_count, verification_time_slots, reward_type, total_reward, total_stamp_count,
  stamp_empty_image, stamp_filled_image, verification_button_text
) VALUES (
  'health_habit', 'manual', '하루 세 번 물 마시기', '아침, 점심, 저녁 물을 마시고 건강을 지켜요!', '/images/challenge/water-triple.png',
  NOW(), NOW() + INTERVAL '1 month', NOW(), NOW() + INTERVAL '1 month',
  NOW(), NOW() + INTERVAL '1 month', 14,
  3, '[{"start": "06:00", "end": "10:00", "label": "아침"}, {"start": "11:00", "end": "14:00", "label": "점심"}, {"start": "18:00", "end": "22:00", "label": "저녁"}]',
  'stamp', '스탬프 1장', 14,
  '/images/challenge/stamp-empty.png', '/images/challenge/stamp-filled.png',
  '물을 마셨어요!'
);

-- 5. 식사기록 챌린지
INSERT INTO public.challenges (
  challenge_type, verification_method, title, description, thumbnail_url,
  display_start_date, display_end_date, recruitment_start_date, recruitment_end_date,
  operation_start_date, operation_end_date, challenge_duration_days,
  daily_verification_count, verification_time_slots, reward_type, total_reward, total_stamp_count,
  stamp_empty_image, stamp_filled_image, verification_button_text
) VALUES (
  'meal', 'auto', '매일 식사기록 하기', '꾸준한 식사 기록으로 건강한 식습관을 만들어요!', '/images/challenge/meal.png',
  NOW(), NOW() + INTERVAL '1 month', NOW(), NOW() + INTERVAL '1 month',
  NOW(), NOW() + INTERVAL '1 month', 7,
  3, '[{"start": "07:00", "end": "10:00", "label": "아침"}, {"start": "11:00", "end": "14:00", "label": "점심"}, {"start": "17:00", "end": "21:00", "label": "저녁"}]',
  'stamp', '스탬프 4장', 7,
  '/images/challenge/stamp-empty.png', '/images/challenge/stamp-filled.png',
  '식사 기록하기'
);

-- 6. 영양제 기록 챌린지
INSERT INTO public.challenges (
  challenge_type, verification_method, title, description, thumbnail_url,
  display_start_date, display_end_date, recruitment_start_date, recruitment_end_date,
  operation_start_date, operation_end_date, challenge_duration_days,
  daily_verification_count, reward_type, total_reward, total_stamp_count,
  stamp_empty_image, stamp_filled_image, verification_button_text
) VALUES (
  'supplement', 'auto', '매일 영양제 기록하기', '영양제 복용을 기록하고 건강을 챙기세요!', '/images/challenge/supplement.png',
  NOW(), NOW() + INTERVAL '1 month', NOW(), NOW() + INTERVAL '1 month',
  NOW(), NOW() + INTERVAL '1 month', 7,
  1, 'stamp', '스탬프 4장', 7,
  '/images/challenge/stamp-empty.png', '/images/challenge/stamp-filled.png',
  '영양제 기록하기'
);

-- 7. 퀴즈 챌린지
INSERT INTO public.challenges (
  challenge_type, verification_method, title, description, thumbnail_url,
  display_start_date, display_end_date, recruitment_start_date, recruitment_end_date,
  operation_start_date, operation_end_date, challenge_duration_days,
  daily_verification_count, reward_type, total_reward, total_stamp_count,
  stamp_empty_image, stamp_filled_image, verification_button_text
) VALUES (
  'quiz', 'auto', '매일 퀴즈풀기', '건강 퀴즈를 풀고 지식도 쌓고 스탬프도 모아요!', '/images/challenge/quiz.png',
  NOW(), NOW() + INTERVAL '1 month', NOW(), NOW() + INTERVAL '1 month',
  NOW(), NOW() + INTERVAL '1 month', 7,
  3, 'stamp', '스탬프 4장', 7,
  '/images/challenge/stamp-empty.png', '/images/challenge/stamp-filled.png',
  '퀴즈 풀기'
);

-- 퀴즈 데이터 삽입
INSERT INTO public.challenge_quizzes (challenge_id, quiz_type, question, options, correct_answers, hint, display_order)
SELECT 
  id,
  'multiple_choice',
  '뇌와 근육의 주요 에너지원으로 쓰이며 우리의 일상생활에 반드시 필요한 영양소의 이름은 무엇일까요?',
  '["포도당", "아미노산", "비타민C", "망간", "오메가-3"]',
  '[0]',
  '포도에서 최초로 발견된 성분이에요!',
  1
FROM public.challenges WHERE challenge_type = 'quiz' LIMIT 1;

INSERT INTO public.challenge_quizzes (challenge_id, quiz_type, question, options, correct_answers, hint, display_order)
SELECT 
  id,
  'ox',
  '뇌와 근육의 주요 에너지원으로 쓰이며 우리의 일상생활에 반드시 필요한 영양소의 이름은 포도당이다',
  '["O", "X"]',
  '["O"]',
  '포도에서 최초로 발견된 성분이에요!',
  2
FROM public.challenges WHERE challenge_type = 'quiz' LIMIT 1;

INSERT INTO public.challenge_quizzes (challenge_id, quiz_type, question, options, correct_answers, hint, display_order)
SELECT 
  id,
  'multiple_choice',
  '성인의 하루 권장 물 섭취량은 약 얼마일까요?',
  '["500ml", "1L", "2L", "3L", "4L"]',
  '[2]',
  '8컵 정도의 양이에요!',
  3
FROM public.challenges WHERE challenge_type = 'quiz' LIMIT 1;

-- 룰렛 설정 (출석체크용)
INSERT INTO public.roulette_settings (challenge_id, segments)
SELECT 
  id,
  '[
    {"label": "1포인트", "probability": 30, "reward_type": "point", "reward_value": 1},
    {"label": "5포인트", "probability": 25, "reward_type": "point", "reward_value": 5},
    {"label": "10포인트", "probability": 20, "reward_type": "point", "reward_value": 10},
    {"label": "25포인트", "probability": 15, "reward_type": "point", "reward_value": 25},
    {"label": "50포인트", "probability": 7, "reward_type": "point", "reward_value": 50},
    {"label": "100포인트", "probability": 3, "reward_type": "point", "reward_value": 100}
  ]'
FROM public.challenges WHERE challenge_type = 'attendance' LIMIT 1;

-- ============================================
-- PART 13: 유틸리티 함수
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
  -- 챌린지 정보 조회
  SELECT * INTO v_challenge FROM public.challenges WHERE id = p_challenge_id;
  
  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;
  
  -- 사용자 참여 정보 조회
  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_participant 
    FROM public.challenge_participants 
    WHERE challenge_id = p_challenge_id AND user_id = p_user_id;
    
    -- 참여중인 경우
    IF FOUND AND v_participant.status = 'participating' THEN
      -- 전체 인증 완료
      IF v_participant.achievement_rate >= 100 THEN
        RETURN 'completed';
      END IF;
      -- 인증기간 만료
      IF v_participant.end_date < CURRENT_DATE THEN
        RETURN 'expired';
      END IF;
      RETURN 'participating';
    END IF;
  END IF;
  
  -- 운영 종료
  IF v_challenge.operation_end_date IS NOT NULL AND v_challenge.operation_end_date < v_now THEN
    RETURN 'ended';
  END IF;
  
  -- 모집 전
  IF v_challenge.recruitment_start_date IS NOT NULL AND v_challenge.recruitment_start_date > v_now THEN
    RETURN 'before_recruitment';
  END IF;
  
  -- 모집 완료 (기간 종료 또는 인원 마감)
  IF v_challenge.recruitment_end_date IS NOT NULL AND v_challenge.recruitment_end_date < v_now THEN
    RETURN 'recruitment_closed';
  END IF;
  
  IF v_challenge.max_participants IS NOT NULL AND v_challenge.current_participants >= v_challenge.max_participants THEN
    RETURN 'recruitment_closed';
  END IF;
  
  -- 모집중
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
  -- 참여자 정보 조회
  SELECT * INTO v_participant FROM public.challenge_participants WHERE id = p_participant_id;
  SELECT * INTO v_challenge FROM public.challenges WHERE id = v_participant.challenge_id;
  
  -- 총 인증 횟수 계산
  SELECT COUNT(*) INTO v_total_verifications
  FROM public.challenge_verifications
  WHERE participant_id = p_participant_id AND is_verified = true;
  
  -- 필요 인증 횟수 계산
  v_required_count := v_challenge.challenge_duration_days * v_challenge.daily_verification_count;
  
  -- 달성률 계산
  IF v_required_count > 0 THEN
    v_achievement_rate := (v_total_verifications::DECIMAL / v_required_count) * 100;
  ELSE
    v_achievement_rate := 0;
  END IF;
  
  -- 업데이트
  UPDATE public.challenge_participants
  SET 
    total_verification_count = v_total_verifications,
    total_required_count = v_required_count,
    achievement_rate = LEAST(v_achievement_rate, 100),
    status = CASE 
      WHEN v_achievement_rate >= 100 THEN 'completed'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_participant_id;
END;
$$ LANGUAGE plpgsql;

