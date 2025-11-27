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
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle cx="24" cy="24" r="22" fill="#E8F5E9" />
      <rect x="14" y="12" width="20" height="24" rx="2" fill="#4CAF50" />
      <rect x="17" y="16" width="14" height="2" rx="1" fill="#FFFFFF" />
      <rect x="17" y="21" width="10" height="2" rx="1" fill="#FFFFFF" />
      <rect x="17" y="26" width="12" height="2" rx="1" fill="#FFFFFF" />
      <rect x="17" y="31" width="8" height="2" rx="1" fill="#FFFFFF" />
    </svg>
  );
}

export function SupplementRecordIcon({ className, size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle cx="24" cy="24" r="22" fill="#E3F2FD" />
      <rect x="16" y="10" width="16" height="28" rx="8" fill="#2196F3" />
      <path d="M16 24H32" stroke="#FFFFFF" strokeWidth="2" />
      <ellipse cx="24" cy="17" rx="4" ry="3" fill="#BBDEFB" />
      <ellipse cx="24" cy="31" rx="4" ry="3" fill="#64B5F6" />
    </svg>
  );
}

export function NutritionDiagnosisIcon({ className, size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle cx="24" cy="24" r="22" fill="#FFF3E0" />
      <path d="M12 36L24 12L36 36H12Z" fill="#FF9800" />
      <rect x="22" y="20" width="4" height="8" rx="1" fill="#FFFFFF" />
      <circle cx="24" cy="32" r="2" fill="#FFFFFF" />
    </svg>
  );
}

export function AttendanceIcon({ className, size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle cx="24" cy="24" r="22" fill="#E8F5E9" />
      <circle cx="24" cy="24" r="14" stroke="#4CAF50" strokeWidth="3" />
      <path
        d="M17 24L22 29L32 19"
        stroke="#4CAF50"
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
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle cx="24" cy="24" r="22" fill="#E1F5FE" />
      <ellipse
        cx="20"
        cy="16"
        rx="6"
        ry="8"
        fill="#03A9F4"
        transform="rotate(-15 20 16)"
      />
      <ellipse
        cx="28"
        cy="32"
        rx="6"
        ry="8"
        fill="#03A9F4"
        transform="rotate(15 28 32)"
      />
    </svg>
  );
}

export function AIDoctorIcon({ className, size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle cx="24" cy="24" r="22" fill="#EDE7F6" />
      <ellipse cx="24" cy="28" rx="12" ry="10" fill="#9F85E3" />
      <ellipse cx="24" cy="20" rx="10" ry="11" fill="#9F85E3" />
      <ellipse cx="20" cy="18" rx="3" ry="4" fill="#FFFFFF" />
      <ellipse cx="28" cy="18" rx="3" ry="4" fill="#FFFFFF" />
      <circle cx="21" cy="19" r="1.5" fill="#333333" />
      <circle cx="29" cy="19" r="1.5" fill="#333333" />
      <path
        d="M22 25 Q24 28 26 25"
        stroke="#333333"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="15" y="6" width="18" height="4" fill="#1a1a2e" />
      <path d="M17 6 L24 0 L31 6" fill="#1a1a2e" />
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
