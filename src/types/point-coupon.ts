// 쿠폰 타입
export type CouponStatus = 'pending' | 'available' | 'transferred' | 'used' | 'expired';
export type CouponType = 'greating' | 'cafeteria';

export interface Coupon {
  id: string;
  user_id: string;
  coupon_name: string;
  coupon_type: CouponType;
  coupon_value: number;
  source: string;
  source_detail?: string;
  status: CouponStatus;
  transferred_account?: string;
  transferred_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// 포인트 내역 타입
export type PointTransactionType = 'earn' | 'use' | 'transfer' | 'expire';

export interface PointHistory {
  id: string;
  user_id: string;
  points: number;
  transaction_type: PointTransactionType;
  source: string;
  source_detail?: string;
  text1?: string;
  text2?: string;
  balance_after: number;
  expires_at?: string;
  created_at: string;
}

// 연동 계정 타입
export type LinkedAccountType = 'greating_mall' | 'h_cafeteria' | 'offline_counseling';

export interface LinkedAccount {
  id: string;
  user_id: string;
  account_type: LinkedAccountType;
  account_id?: string;
  is_linked: boolean;
  linked_at?: string;
  unlinked_at?: string;
  created_at: string;
  updated_at: string;
}

// 사업장 코드 타입
export interface BusinessCode {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

// 포인트 전환 옵션 타입
export interface PointConversionOption {
  id: number;
  option_type: string;
  option_name: string;
  min_points: number;
  max_points: number;
  requires_membership: boolean;
  membership_type?: string;
  is_active: boolean;
  display_order: number;
}

// 회원 확장 정보 타입
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  birth_date?: string;
  height?: number;
  weight?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  weekly_goal?: string;
  goal_weight?: number;
  provider?: string;
  business_code?: string;
  diseases?: string[];
  interests?: string[];
  marketing_push_agreed?: boolean;
  marketing_sms_agreed?: boolean;
  push_agreed_at?: string;
  sms_agreed_at?: string;
  created_at: string;
  updated_at: string;
}

// 자산 현황 타입
export interface AssetSummary {
  totalCoupons: number;
  totalPoints: number;
  thisMonthEarnedCoupons: number;
  thisMonthUsedCoupons: number;
  expiringCoupons30Days: number;
  thisMonthEarnedPoints: number;
  thisMonthTransferredPoints: number;
  expiringPoints30Days: number;
}

// 포인트 내역 필터 타입
export type PointHistoryFilter = 'all' | 'earn' | 'use' | 'expire';

// 쿠폰 내역 필터 타입
export type CouponHistoryFilter = 'all' | 'greating' | 'cafeteria';

// 탈퇴 사유 옵션
export const WITHDRAWAL_REASONS = [
  '서비스 이용이 복잡하고 어려워요',
  '다른 서비스가 더 좋아요',
  '사용빈도가 너무 낮아요',
  '콘텐츠가 유익하지 않아요',
  '서비스 장애와 오류가 많아요',
] as const;

export type WithdrawalReason = typeof WITHDRAWAL_REASONS[number];

// 활동량 옵션
export const ACTIVITY_LEVELS = [
  { value: 'extra_active', label: '매우 활동적' },
  { value: 'very_active', label: '활동적' },
  { value: 'moderately_active', label: '저활동적' },
  { value: 'sedentary', label: '비활동적' },
] as const;

// 질병 옵션
export const DISEASE_OPTIONS = [
  { value: 'none', label: '해당없음' },
  { value: 'obesity', label: '비만' },
  { value: 'fatty_liver', label: '지방간' },
  { value: 'diabetes', label: '당뇨' },
  { value: 'hypertension', label: '고혈압' },
  { value: 'osteoporosis', label: '골다공증' },
  { value: 'hypercholesterolemia', label: '고콜레스테롤 혈증' },
  { value: 'hypertriglyceridemia', label: '고중성지방 혈증' },
  { value: 'cancer', label: '암' },
] as const;

// 관심사 옵션
export const INTEREST_OPTIONS = [
  { value: 'immunity', label: '면역력' },
  { value: 'eye_health', label: '눈건강' },
  { value: 'bone_joint', label: '뼈관절건강' },
  { value: 'muscle', label: '근력' },
  { value: 'weight_control', label: '체중조절' },
  { value: 'brain_activity', label: '두뇌활동' },
  { value: 'fatigue_recovery', label: '피로회복' },
  { value: 'hair_health', label: '모발건강' },
  { value: 'blood_circulation', label: '혈행개선' },
  { value: 'skin_health', label: '피부건강' },
  { value: 'menopause', label: '갱년기' },
  { value: 'digestive_health', label: '소화기/장건강' },
] as const;

// 내역기록 규칙 (TEXT1 / TEXT2)
export const POINT_HISTORY_TEMPLATES = {
  challenge_round: {
    text1: (type: string, current: number, total: number) => `${type} ${current}/${total} 회차성공`,
    text2: '챌린지 달성',
  },
  challenge_daily: {
    text1: (type: string) => `${type} 일일 인증 성공`,
    text2: '챌린지 달성',
  },
  challenge_complete: {
    text1: (type: string) => `${type} 성공`,
    text2: null,
  },
  meal_record: {
    text1: '식사기록 완료',
    text2: '식사기록 수행',
  },
  supplement_record: {
    text1: '영양제 기록 완료',
    text2: '건강 미션 완료',
  },
  step_goal: {
    text1: '걸음수 목표달성',
    text2: '걸음수 목표달성',
  },
  account_link: {
    text1: (system: string) => `${system} 연동 완료`,
    text2: '회원 연동',
  },
  content_survey: {
    text1: '컨텐츠 의견보내기',
    text2: '컨텐츠 만족도',
  },
  signup: {
    text1: '회원가입 완료',
    text2: '회원가입',
  },
  notification_consent: {
    text1: (type: string) => `${type} 알림 동의 완료`,
    text2: '알림 동의',
  },
} as const;


