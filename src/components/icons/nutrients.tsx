import type { IconProps } from "./types";

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

// 영양소 타입에 따른 아이콘 가져오기
export function getNutrientIcon(nutrientType: string) {
  const icons: Record<string, React.ComponentType<IconProps>> = {
    fat: FatIcon,
    saturated_fat: SaturatedFatIcon,
    sugar: SugarIcon,
    carbs: CarbsIcon,
    cholesterol: CholesterolIcon,
    sodium: SodiumIcon,
    protein: ProteinIcon,
    fiber: FiberIcon,
  };
  return icons[nutrientType] || null;
}

