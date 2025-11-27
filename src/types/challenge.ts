// 챌린지 관련 타입 정의

// 챌린지 유형
export type ChallengeType =
  | 'attendance'           // 출석체크 (룰렛)
  | 'steps'                // 걸음수
  | 'meal'                 // 식사기록
  | 'supplement'           // 영양제 기록
  | 'nutrition_diagnosis'  // 영양진단
  | 'health_habit'         // 건강습관 (수기인증)
  | 'quiz';                // 퀴즈

// 인증 방식
export type VerificationMethod = 'roulette' | 'auto' | 'manual';

// 참여 상태
export type ParticipationStatus = 'participating' | 'completed' | 'cancelled' | 'expired';

// 챌린지 상태
export type ChallengeStatus =
  | 'before_recruitment'   // 모집전
  | 'recruiting'           // 모집중
  | 'recruitment_closed'   // 모집완료
  | 'participating'        // 참여중
  | 'completed'            // 완료
  | 'ended'                // 종료
  | 'expired';             // 기간만료

// 보상 유형
export type RewardType = 'stamp' | 'coupon' | 'point';

// 퀴즈 유형
export type QuizType = 'multiple_choice' | 'ox';

// 시간대 슬롯
export interface TimeSlot {
  start: string;  // HH:MM
  end: string;    // HH:MM
  label: string;  // 예: "아침", "점심", "저녁"
}

// 챌린지 기본 정보
export interface Challenge {
  id: string;
  challenge_type: ChallengeType;
  verification_method: VerificationMethod;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  detail_images: string[];
  
  // 기간
  display_start_date: string | null;
  display_end_date: string | null;
  recruitment_start_date: string | null;
  recruitment_end_date: string | null;
  operation_start_date: string | null;
  operation_end_date: string | null;
  challenge_duration_days: number;
  
  // 인증 설정
  daily_verification_count: number;
  verification_time_slots: TimeSlot[] | null;
  
  // 보상
  reward_type: RewardType | null;
  total_reward: string | null;
  daily_reward: string | null;
  single_reward: string | null;
  total_stamp_count: number;
  
  // 스탬프 이미지
  stamp_empty_image: string | null;
  stamp_filled_image: string | null;
  
  // 참여
  max_participants: number | null;
  current_participants: number;
  
  // 버튼
  verification_button_text: string;
  
  // 상태
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

// 챌린지 (클라이언트용 확장)
export interface ChallengeWithStatus extends Challenge {
  status: ChallengeStatus;
  statusTag: {
    text: string;
    color: 'gray' | 'purple' | 'green';
  };
  participation: Participation | null;
  dday: number | null;
  achievementRate: number;
}

// 참여자 정보
export interface Participation {
  id: string;
  challenge_id: string;
  user_id: string;
  status: ParticipationStatus;
  start_date: string;
  end_date: string;
  total_verification_count: number;
  total_required_count: number;
  achievement_rate: number;
  today_verification_count: number;
  last_verification_date: string | null;
  is_reward_claimed: boolean;
  reward_claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

// 인증 기록
export interface Verification {
  id: string;
  challenge_id: string;
  participant_id: string;
  user_id: string;
  verification_date: string;
  verification_time: string;
  verification_slot: number;
  is_verified: boolean;
  verification_data: Record<string, any>;
  created_at: string;
}

// 스탬프
export interface Stamp {
  id: string;
  participant_id: string;
  user_id: string;
  challenge_id: string;
  stamp_date: string | null;
  stamp_number: number;
  is_achieved: boolean;
  achieved_at: string | null;
  created_at: string;
}

// 퀴즈
export interface Quiz {
  id: string;
  challenge_id: string;
  quiz_type: QuizType;
  question: string;
  options: string[];
  correct_answers: (number | string)[];
  hint: string | null;
  display_order: number;
  created_at: string;
}

// 퀴즈 시도
export interface QuizAttempt {
  id: string;
  quiz_id: string;
  participant_id: string;
  user_id: string;
  attempt_date: string;
  selected_answer: any;
  is_correct: boolean;
  attempt_count: number;
  created_at: string;
}

// 룰렛 세그먼트
export interface RouletteSegment {
  label: string;
  probability: number;
  reward_type: RewardType;
  reward_value: number;
  image_url?: string;
}

// 룰렛 설정
export interface RouletteSettings {
  id: string;
  challenge_id: string;
  segments: RouletteSegment[];
  roulette_image_url: string | null;
  created_at: string;
}

// 룰렛 스핀
export interface RouletteSpin {
  id: string;
  challenge_id: string;
  participant_id: string;
  user_id: string;
  spin_date: string;
  won_segment: RouletteSegment;
  created_at: string;
}

// 랭킹
export interface Ranking {
  id: string;
  challenge_id: string;
  user_id: string;
  participant_id: string;
  rank_position: number;
  achievement_rate: number;
  completed_at: string | null;
  updated_at: string;
}

// 랭킹 (클라이언트용)
export interface RankingWithUser extends Ranking {
  rank: number;
  maskedName: string;
  isCurrentUser: boolean;
}

// API 응답 타입
export interface ChallengeListResponse {
  challenges: ChallengeWithStatus[];
  participatingChallenges: ChallengeWithStatus[];
  otherChallenges: ChallengeWithStatus[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ChallengeDetailResponse {
  challenge: ChallengeWithStatus;
  participation: Participation | null;
  stamps: Stamp[];
  todayVerifications: Verification[];
  quizzes: Quiz[];
  rouletteSettings: RouletteSettings | null;
  todaySpun: boolean;
  dday: number | null;
  remainingDays: number | null;
  completedDays: number;
}

export interface VerificationResponse {
  success: boolean;
  verification: Verification;
  todayVerificationCount: number;
  dailyGoalMet: boolean;
  totalVerificationCount: number;
  achievementRate: number;
  stampAwarded: boolean;
  isCompleted: boolean;
  message: string;
}

export interface QuizResponse {
  success: boolean;
  isCorrect: boolean;
  correctAnswers?: (number | string)[];
  hint?: string;
  canRetry: boolean;
  attemptCount: number;
  message: string;
}

export interface RouletteResponse {
  success: boolean;
  wonSegment: RouletteSegment;
  wonIndex: number;
  message: string;
  achievementRate: number;
  totalVerificationCount: number;
}

export interface RankingResponse {
  rankings: RankingWithUser[];
  myRanking: RankingWithUser | null;
  totalParticipants: number;
}

