import type { IconProps } from "./types";

// ============================================
// 네비게이션 아이콘들
// ============================================

export function HomeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 22V12H15V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MealRecordIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7V12L15 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 3L6 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 3L18 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function RecordIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12 5V19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SupplementIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <rect
        x="6"
        y="4"
        width="12"
        height="16"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M6 12H18" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function MenuIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M4 6H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 12H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 18H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================
// 메뉴 팝업 아이콘들
// ============================================

export function MealRecordMenuIcon({ className, size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      {/* 밥그릇 */}
      <ellipse cx="28" cy="44" rx="20" ry="10" fill="#E0E0E0" />
      <ellipse cx="28" cy="40" rx="18" ry="8" fill="#F5F5F5" />
      <ellipse cx="28" cy="38" rx="16" ry="6" fill="#FFFFFF" />
      <path d="M12 38C12 38 14 48 28 48C42 48 44 38 44 38" fill="#E0E0E0" />

      {/* 밥 */}
      <ellipse cx="28" cy="36" rx="12" ry="4" fill="#FAFAFA" />

      {/* 돋보기 */}
      <circle
        cx="48"
        cy="20"
        r="10"
        stroke="#9F85E3"
        strokeWidth="3"
        fill="white"
      />
      <path
        d="M55 27L62 34"
        stroke="#9F85E3"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="48" cy="20" r="5" fill="#E8E0F7" />
    </svg>
  );
}

export function SupplementRecordIcon({ className, size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      {/* 알약 1 (큰 것) */}
      <ellipse cx="22" cy="32" rx="12" ry="18" fill="#4DD0E1" />
      <ellipse cx="22" cy="24" rx="12" ry="10" fill="#80DEEA" />
      <ellipse cx="22" cy="40" rx="12" ry="10" fill="#9F85E3" />

      {/* 알약 2 (작은 것) */}
      <ellipse cx="46" cy="36" rx="9" ry="14" fill="#9F85E3" />
      <ellipse cx="46" cy="29" rx="9" ry="7" fill="#B39DDB" />

      {/* 하이라이트 */}
      <ellipse cx="18" cy="22" rx="3" ry="4" fill="white" opacity="0.5" />
      <ellipse cx="43" cy="28" rx="2" ry="3" fill="white" opacity="0.5" />
    </svg>
  );
}

export function NutritionDiagnosisIcon({ className, size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      {/* 문서 */}
      <rect
        x="12"
        y="6"
        width="40"
        height="52"
        rx="4"
        fill="#F5F5F5"
        stroke="#E0E0E0"
        strokeWidth="2"
      />
      <rect x="12" y="6" width="40" height="12" rx="4" fill="#E8E0F7" />

      {/* 차트 라인 */}
      <path
        d="M20 36L28 28L36 34L44 22"
        stroke="#9F85E3"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 텍스트 라인 */}
      <rect x="20" y="44" width="24" height="3" rx="1.5" fill="#E0E0E0" />
      <rect x="20" y="50" width="16" height="3" rx="1.5" fill="#E0E0E0" />

      {/* 심전도 아이콘 */}
      <path
        d="M20 12L24 12L26 8L30 16L34 10L38 12L44 12"
        stroke="#9F85E3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AttendanceIcon({ className, size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      {/* 머리 */}
      <circle cx="32" cy="18" r="10" fill="#E8D5B7" />

      {/* 몸통 */}
      <ellipse cx="32" cy="44" rx="18" ry="14" fill="#9F85E3" />
      <ellipse cx="32" cy="42" rx="16" ry="12" fill="#B39DDB" />

      {/* 체크마크 */}
      <circle cx="46" cy="46" r="12" fill="#9F85E3" />
      <path
        d="M40 46L44 50L52 42"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StepsMenuIcon({ className, size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      {/* 운동화/발 모양 */}
      <path
        d="M16 28C16 22 22 16 30 16C38 16 42 20 44 24L48 28L46 36L42 38L38 36L32 38L26 36L20 38L16 36V28Z"
        fill="#9F85E3"
      />
      <path
        d="M18 30C18 26 22 20 30 20C36 20 40 22 42 26"
        stroke="#B39DDB"
        strokeWidth="2"
      />

      {/* 발가락 부분 */}
      <ellipse cx="22" cy="24" rx="4" ry="3" fill="#B39DDB" />
      <ellipse cx="30" cy="22" rx="4" ry="3" fill="#B39DDB" />

      {/* 밑창 */}
      <path
        d="M14 38L18 36L24 38L32 36L40 38L46 36L50 38L48 46C48 50 42 54 32 54C22 54 16 50 16 46L14 38Z"
        fill="#7E57C2"
      />

      {/* 하이라이트 */}
      <ellipse cx="24" cy="42" rx="6" ry="2" fill="#9575CD" />
    </svg>
  );
}

export function AIDoctorIcon({ className, size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      {/* 몸체 */}
      <ellipse cx="32" cy="48" rx="18" ry="12" fill="#9F85E3" />
      <ellipse cx="32" cy="46" rx="16" ry="10" fill="#B39DDB" />

      {/* 얼굴 */}
      <circle cx="32" cy="30" r="16" fill="#9F85E3" />

      {/* 눈 */}
      <ellipse cx="26" cy="28" rx="4" ry="5" fill="white" />
      <ellipse cx="38" cy="28" rx="4" ry="5" fill="white" />
      <circle cx="27" cy="29" r="2" fill="#333333" />
      <circle cx="39" cy="29" r="2" fill="#333333" />

      {/* 입 (미소) */}
      <path
        d="M28 36C28 36 32 40 36 36"
        stroke="#333333"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* 학사모 */}
      <rect x="18" y="12" width="28" height="5" fill="#1a1a2e" />
      <path d="M22 12L32 4L42 12" fill="#1a1a2e" />
      <circle cx="32" cy="6" r="3" fill="#FFD700" />

      {/* 볼터치 */}
      <ellipse cx="20" cy="34" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="44" cy="34" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />
    </svg>
  );
}

