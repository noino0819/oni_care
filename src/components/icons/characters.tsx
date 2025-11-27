import type { IconProps } from "./types";

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

