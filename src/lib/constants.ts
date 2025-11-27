// ============================================
// 앱 전반에서 사용되는 상수 및 매핑
// ============================================

// 앱 테마 컬러
export const COLORS = {
  primary: "#9F85E3",
  primaryHover: "#8B74D1",
  primaryLight: "#B39DDB",
  secondary: "#7CB342",
  accent: "#FFD700",
  error: "#EF4444",
  success: "#22C55E",
  warning: "#F59E0B",
} as const;

// ============================================
// 영양소 관련
// ============================================

export const NUTRIENT_NAME_MAP: Record<string, string> = {
  fat: "지방",
  saturated_fat: "포화지방",
  sugar: "당류",
  carbs: "탄수화물",
  cholesterol: "콜레스테롤",
  sodium: "나트륨",
  protein: "단백질",
  fiber: "식이섬유",
  calories: "칼로리",
} as const;

export const NUTRIENT_COLORS: Record<string, string> = {
  fat: "#FF9800",
  saturated_fat: "#FF5722",
  sugar: "#E91E63",
  carbs: "#FFC107",
  cholesterol: "#4CAF50",
  sodium: "#2196F3",
  protein: "#673AB7",
  fiber: "#8BC34A",
} as const;

// 기본 영양소 목표치 (일일 권장량)
export const DEFAULT_NUTRITION_TARGETS = {
  calories: 2100,
  carbs: 300,
  protein: 100,
  fat: 70,
  sugar: 50,
  sodium: 2000,
  fiber: 25,
  cholesterol: 300,
} as const;

// ============================================
// 건강 목표 관련
// ============================================

export const GOAL_TYPE_MAP: Record<string, string> = {
  weight_management: "체중관리 필요형",
  blood_sugar: "혈당관리 필요형",
  muscle: "근력운동 필요형",
  general: "일반 관리형",
} as const;

export const DISEASE_MAP: Record<string, string> = {
  diabetes: "당뇨병",
  obesity: "비만",
  hypertension: "고혈압",
  fatty_liver: "지방간",
  hyperlipidemia: "고지혈증",
  hyperthyroidism: "갑상선항진증",
} as const;

// ============================================
// 챌린지 관련
// ============================================

export const CHALLENGE_TYPE_MAP: Record<string, string> = {
  attendance: "출석체크",
  steps: "걸음수",
  meal: "식사기록",
  supplement: "영양제 기록",
  nutrition_diagnosis: "영양진단",
  health_habit: "건강습관",
  quiz: "퀴즈",
} as const;

export const CHALLENGE_STATUS_MAP: Record<string, { text: string; color: "gray" | "purple" | "green" }> = {
  before_recruitment: { text: "모집전", color: "gray" },
  recruiting: { text: "모집중", color: "purple" },
  recruitment_closed: { text: "모집완료", color: "gray" },
  participating: { text: "참여중", color: "green" },
  completed: { text: "종료", color: "gray" },
  ended: { text: "종료", color: "gray" },
  expired: { text: "종료", color: "gray" },
} as const;

export const CHALLENGE_FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "participating", label: "참여중" },
  { value: "before_recruitment", label: "모집예정" },
  { value: "recruiting", label: "모집중" },
  { value: "recruitment_closed", label: "모집완료" },
  { value: "ended", label: "종료" },
] as const;

export const CHALLENGE_EMPTY_MESSAGES: Record<string, string> = {
  all: "챌린지가 없어요...",
  participating: "참여중인 챌린지가 없어요...\n챌린지에 참여하고 건강습관을 길러볼까요?",
  before_recruitment: "모집예정인 챌린지가 없어요...",
  recruiting: "모집중인 챌린지가 없어요...",
  recruitment_closed: "모집완료인 챌린지가 없어요...",
  ended: "종료된 챌린지가 없어요...",
} as const;

// ============================================
// 식사 관련
// ============================================

export const MEAL_TYPE_MAP: Record<string, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
} as const;

export const MEAL_TYPE_TIMES: Record<string, { start: string; end: string }> = {
  breakfast: { start: "06:00", end: "10:00" },
  lunch: { start: "11:00", end: "14:00" },
  dinner: { start: "17:00", end: "21:00" },
  snack: { start: "00:00", end: "23:59" },
} as const;

// ============================================
// 활동 레벨 관련
// ============================================

export const ACTIVITY_LEVEL_MAP: Record<string, string> = {
  sedentary: "비활동적",
  lightly_active: "가벼운 활동",
  moderately_active: "보통 활동",
  very_active: "활발한 활동",
  extra_active: "매우 활발한 활동",
} as const;

export const ACTIVITY_LEVEL_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
} as const;

// ============================================
// 네비게이션 관련
// ============================================

// 하단 네비게이션을 숨길 경로
export const HIDDEN_NAV_PATHS = [
  "/",
  "/signup",
  "/signup/terms",
  "/signup/verify",
  "/signup/complete",
  "/onboarding",
  "/find-account",
] as const;

// 컨텐츠 상세 페이지 패턴 (prefix match)
export const HIDDEN_NAV_PREFIXES = ["/content/"] as const;

// ============================================
// 컨텐츠 관련
// ============================================

export const CONTENT_CATEGORY_TYPE_MAP: Record<string, string> = {
  interest: "관심사",
  disease: "질병",
  exercise: "운동",
} as const;

export const CONTENT_CARD_STYLES = {
  A: "배경색 카드",
  B: "이미지 풀 카드",
} as const;

// ============================================
// 유효성 검사 관련
// ============================================

export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: false,
  },
} as const;

// ============================================
// 페이지네이션 기본값
// ============================================

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  contentLimit: 20,
  challengeLimit: 10,
  notificationLimit: 20,
} as const;

// ============================================
// 날짜/시간 포맷
// ============================================

export const DATE_FORMAT = {
  default: "YYYY-MM-DD",
  display: "YYYY년 M월 D일",
  short: "M/D",
  time: "HH:mm",
  datetime: "YYYY-MM-DD HH:mm",
} as const;

// ============================================
// 걸음수 관련
// ============================================

export const STEPS = {
  defaultGoal: 10000,
  minGoal: 1000,
  maxGoal: 30000,
} as const;

// ============================================
// 타입 헬퍼
// ============================================

export type NutrientType = keyof typeof NUTRIENT_NAME_MAP;
export type GoalType = keyof typeof GOAL_TYPE_MAP;
export type DiseaseType = keyof typeof DISEASE_MAP;
export type ChallengeType = keyof typeof CHALLENGE_TYPE_MAP;
export type MealType = keyof typeof MEAL_TYPE_MAP;
export type ActivityLevel = keyof typeof ACTIVITY_LEVEL_MAP;

