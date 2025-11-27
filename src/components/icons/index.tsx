// 공통 아이콘 타입
interface IconProps {
  className?: string;
  size?: number;
}

// ============================================
// 영양소 아이콘들
// ============================================

export function FatIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="#FFF3E0"
        stroke="#FF9800"
        strokeWidth="2"
      />
      <ellipse cx="24" cy="20" rx="10" ry="8" fill="#FFB74D" />
      <ellipse cx="24" cy="28" rx="8" ry="6" fill="#FFA726" />
      <circle cx="20" cy="18" r="2" fill="#FFCC80" />
      <circle cx="28" cy="22" r="1.5" fill="#FFCC80" />
    </svg>
  );
}

export function SaturatedFatIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="#FBE9E7"
        stroke="#FF5722"
        strokeWidth="2"
      />
      <path
        d="M16 20C16 16 20 12 24 12C28 12 32 16 32 20C32 28 24 36 24 36C24 36 16 28 16 20Z"
        fill="#FF8A65"
      />
      <circle cx="22" cy="19" r="2" fill="#FFCCBC" />
      <circle cx="26" cy="22" r="1.5" fill="#FFCCBC" />
    </svg>
  );
}

export function SugarIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="#FCE4EC"
        stroke="#E91E63"
        strokeWidth="2"
      />
      <rect x="16" y="16" rx="2" width="16" height="20" fill="#F48FB1" />
      <rect x="18" y="20" rx="1" width="12" height="3" fill="#FFFFFF" />
      <rect x="18" y="25" rx="1" width="12" height="3" fill="#FFFFFF" />
      <rect x="18" y="30" rx="1" width="12" height="3" fill="#FFFFFF" />
    </svg>
  );
}

export function CarbsIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="#FFF8E1"
        stroke="#FFC107"
        strokeWidth="2"
      />
      <ellipse cx="24" cy="24" rx="12" ry="10" fill="#FFD54F" />
      <path
        d="M14 22C14 22 18 18 24 18C30 18 34 22 34 22"
        stroke="#FF8F00"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 26C16 26 20 30 24 30C28 30 32 26 32 26"
        stroke="#FF8F00"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CholesterolIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="#E8F5E9"
        stroke="#4CAF50"
        strokeWidth="2"
      />
      <circle cx="24" cy="24" r="10" fill="#81C784" />
      <circle cx="24" cy="24" r="5" fill="#A5D6A7" />
      <path
        d="M20 18L24 24L28 18"
        stroke="#2E7D32"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 30L24 24L28 30"
        stroke="#2E7D32"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SodiumIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="#E3F2FD"
        stroke="#2196F3"
        strokeWidth="2"
      />
      <path
        d="M20 14L20 34"
        stroke="#64B5F6"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M28 14L28 34"
        stroke="#64B5F6"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="17" cy="20" r="2" fill="#90CAF9" />
      <circle cx="31" cy="24" r="2" fill="#90CAF9" />
      <circle cx="24" cy="28" r="2" fill="#90CAF9" />
    </svg>
  );
}

export function ProteinIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="#EDE7F6"
        stroke="#673AB7"
        strokeWidth="2"
      />
      <ellipse cx="24" cy="20" rx="8" ry="6" fill="#B39DDB" />
      <ellipse cx="20" cy="28" rx="5" ry="4" fill="#9575CD" />
      <ellipse cx="28" cy="28" rx="5" ry="4" fill="#9575CD" />
    </svg>
  );
}

export function FiberIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="#F1F8E9"
        stroke="#8BC34A"
        strokeWidth="2"
      />
      <path
        d="M24 12C24 12 28 16 28 24C28 32 24 36 24 36"
        stroke="#7CB342"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M18 18C18 18 22 20 24 24"
        stroke="#9CCC65"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M30 20C30 20 26 22 24 26"
        stroke="#9CCC65"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 26C16 26 20 26 24 28"
        stroke="#9CCC65"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================
// 3D 캐릭터 일러스트 (SVG로 표현)
// ============================================

export function MainCharacter({ className, size = 200 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
    >
      {/* 샐러드 볼 */}
      <ellipse cx="140" cy="150" rx="45" ry="25" fill="#8B4513" />
      <ellipse cx="140" cy="145" rx="42" ry="22" fill="#A0522D" />
      <ellipse cx="140" cy="140" rx="38" ry="18" fill="#90EE90" />
      <circle cx="125" cy="135" r="8" fill="#FF6347" />
      <circle cx="150" cy="138" r="6" fill="#FFD700" />
      <ellipse cx="140" cy="132" rx="10" ry="6" fill="#228B22" />

      {/* 캐릭터 몸체 */}
      <ellipse cx="80" cy="140" rx="45" ry="50" fill="#9F85E3" />
      <ellipse cx="80" cy="145" rx="42" ry="45" fill="#B39DDB" />

      {/* 캐릭터 얼굴 */}
      <ellipse cx="80" cy="100" rx="35" ry="38" fill="#9F85E3" />

      {/* 눈 */}
      <ellipse cx="68" cy="95" rx="8" ry="10" fill="#FFFFFF" />
      <ellipse cx="92" cy="95" rx="8" ry="10" fill="#FFFFFF" />
      <circle cx="70" cy="96" r="4" fill="#333333" />
      <circle cx="94" cy="96" r="4" fill="#333333" />
      <circle cx="71" cy="94" r="1.5" fill="#FFFFFF" />
      <circle cx="95" cy="94" r="1.5" fill="#FFFFFF" />

      {/* 볼 */}
      <ellipse cx="58" cy="105" rx="6" ry="4" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="102" cy="105" rx="6" ry="4" fill="#FFB6C1" opacity="0.6" />

      {/* 입 */}
      <path
        d="M72 115 Q80 122 88 115"
        stroke="#333333"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* 박사 모자 */}
      <rect x="55" y="55" width="50" height="8" fill="#1a1a2e" />
      <path d="M60 55 L80 30 L100 55" fill="#1a1a2e" />
      <circle cx="80" cy="35" r="5" fill="#FFD700" />

      {/* 팔 */}
      <ellipse
        cx="35"
        cy="130"
        rx="12"
        ry="20"
        fill="#9F85E3"
        transform="rotate(-20 35 130)"
      />
      <ellipse
        cx="125"
        cy="130"
        rx="12"
        ry="20"
        fill="#9F85E3"
        transform="rotate(20 125 130)"
      />
    </svg>
  );
}

export function DoctorCharacter({ className, size = 80 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
    >
      {/* 몸체 */}
      <ellipse cx="40" cy="55" rx="22" ry="20" fill="#9F85E3" />
      <ellipse cx="40" cy="58" rx="20" ry="17" fill="#B39DDB" />

      {/* 얼굴 */}
      <ellipse cx="40" cy="35" rx="18" ry="20" fill="#9F85E3" />

      {/* 눈 */}
      <ellipse cx="34" cy="32" rx="4" ry="5" fill="#FFFFFF" />
      <ellipse cx="46" cy="32" rx="4" ry="5" fill="#FFFFFF" />
      <circle cx="35" cy="33" r="2" fill="#333333" />
      <circle cx="47" cy="33" r="2" fill="#333333" />

      {/* 볼 */}
      <ellipse cx="28" cy="38" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="52" cy="38" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />

      {/* 입 */}
      <path
        d="M36 42 Q40 46 44 42"
        stroke="#333333"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 박사 모자 */}
      <rect x="25" y="12" width="30" height="5" fill="#1a1a2e" />
      <path d="M28 12 L40 2 L52 12" fill="#1a1a2e" />
      <circle cx="40" cy="5" r="3" fill="#FFD700" />
    </svg>
  );
}

export function SaladBowlIcon({ className, size = 100 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      {/* 볼 */}
      <ellipse cx="50" cy="70" rx="40" ry="20" fill="#8B4513" />
      <ellipse cx="50" cy="65" rx="37" ry="17" fill="#A0522D" />
      <ellipse cx="50" cy="60" rx="34" ry="14" fill="#90EE90" />

      {/* 채소들 */}
      <circle cx="35" cy="55" r="8" fill="#FF6347" />
      <circle cx="60" cy="58" r="6" fill="#FFD700" />
      <ellipse cx="50" cy="50" rx="12" ry="6" fill="#228B22" />
      <circle cx="42" cy="62" r="4" fill="#FF8C00" />
      <circle cx="58" cy="52" r="5" fill="#8B0000" />

      {/* 하이라이트 */}
      <ellipse cx="65" cy="48" rx="8" ry="4" fill="#98FB98" opacity="0.5" />
    </svg>
  );
}

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

// ============================================
// 기타 아이콘들
// ============================================

export function PointIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="#FFD700"
        stroke="#FFA000"
        strokeWidth="1"
      />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#8B4513"
      >
        P
      </text>
    </svg>
  );
}

export function ProfileIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PillIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <rect x="8" y="2" width="8" height="20" rx="4" fill="#9F85E3" />
      <rect x="8" y="2" width="8" height="10" rx="4" fill="#B39DDB" />
      <ellipse cx="12" cy="7" rx="2" ry="1.5" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}

export function WaterIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12 2C12 2 6 10 6 14C6 17.3137 8.68629 20 12 20C15.3137 20 18 17.3137 18 14C18 10 12 2 12 2Z"
        fill="#64B5F6"
        stroke="#2196F3"
        strokeWidth="1.5"
      />
      <ellipse cx="10" cy="13" rx="2" ry="3" fill="#BBDEFB" opacity="0.6" />
    </svg>
  );
}

export function CloseIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================
// 컨텐츠 페이지 아이콘들
// ============================================

export function SearchIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M16 16L20 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FolderIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M3 6C3 4.89543 3.89543 4 5 4H9L11 6H19C20.1046 6 21 6.89543 21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarIcon({
  className,
  size = 24,
  filled = false,
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      className={className}
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeartIcon({
  className,
  size = 24,
  filled = false,
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      className={className}
    >
      <path
        d="M20.84 4.61C20.3292 4.09924 19.7228 3.69397 19.0554 3.41708C18.3879 3.14019 17.6725 2.99751 16.95 2.99751C16.2275 2.99751 15.5121 3.14019 14.8446 3.41708C14.1772 3.69397 13.5708 4.09924 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99801 7.05 2.99801C5.59096 2.99801 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.548 7.04097 1.548 8.5C1.548 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.3508 11.8792 21.756 11.2728 22.0329 10.6054C22.3098 9.93792 22.4525 9.22252 22.4525 8.5C22.4525 7.77748 22.3098 7.06208 22.0329 6.39464C21.756 5.7272 21.3508 5.12076 20.84 4.61Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ContentIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2V8H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 13H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 9H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronUpIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M18 15L12 9L6 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M8 5.14v13.72c0 1.04 1.17 1.63 1.99 1.01l9.99-6.86c.68-.47.68-1.55 0-2.02l-9.99-6.86C9.17 3.51 8 4.1 8 5.14z" />
    </svg>
  );
}

export function QuestionCharacter({ className, size = 200 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
    >
      {/* 물음표 1 */}
      <text x="30" y="80" fontSize="40" fill="#9F85E3" fontWeight="bold">
        ?
      </text>
      <text x="150" y="120" fontSize="50" fill="#B39DDB" fontWeight="bold">
        ?
      </text>

      {/* 캐릭터 몸체 */}
      <ellipse cx="100" cy="140" rx="40" ry="35" fill="#F5F5F5" />
      <ellipse cx="100" cy="145" rx="35" ry="30" fill="#FAFAFA" />

      {/* 캐릭터 얼굴 */}
      <ellipse cx="100" cy="100" rx="35" ry="38" fill="#F5F5F5" />

      {/* 헤어 */}
      <ellipse cx="100" cy="70" rx="30" ry="20" fill="#4A4A4A" />
      <ellipse cx="80" cy="80" rx="8" ry="15" fill="#4A4A4A" />
      <ellipse cx="120" cy="80" rx="8" ry="15" fill="#4A4A4A" />

      {/* 눈 */}
      <ellipse cx="88" cy="95" rx="6" ry="8" fill="#FFFFFF" />
      <ellipse cx="112" cy="95" rx="6" ry="8" fill="#FFFFFF" />
      <circle cx="90" cy="96" r="3" fill="#333333" />
      <circle cx="114" cy="96" r="3" fill="#333333" />

      {/* 눈썹 - 고민하는 표정 */}
      <path
        d="M82 85 Q88 82 94 85"
        stroke="#4A4A4A"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M106 85 Q112 82 118 85"
        stroke="#4A4A4A"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* 볼 */}
      <ellipse cx="78" cy="105" rx="6" ry="4" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="122" cy="105" rx="6" ry="4" fill="#FFB6C1" opacity="0.6" />

      {/* 입 - 고민하는 표정 */}
      <path
        d="M92 115 Q100 112 108 115"
        stroke="#888888"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* 손 - 턱 괴는 자세 */}
      <ellipse cx="75" cy="130" rx="10" ry="12" fill="#F5F5F5" />
      <ellipse cx="125" cy="130" rx="10" ry="12" fill="#F5F5F5" />
    </svg>
  );
}

export function ChallengeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="4"
        y1="22"
        x2="4"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
