"use client";

import { MainCharacter } from "@/components/icons";
import Link from "next/link";

interface HealthGoalCardProps {
  userName?: string;
  goalDescription?: string;
  subDescription?: string;
  tags?: string[];
  hasNutritionDiagnosis?: boolean;
}

export function HealthGoalCard({
  userName = "김건강",
  goalDescription = "체중관리 필요형 / 혈당관리, 근력운동 위주로 관리해요",
  subDescription,
  tags = ["비만", "당뇨병", "근력운동"],
  hasNutritionDiagnosis = true,
}: HealthGoalCardProps) {
  if (!hasNutritionDiagnosis) {
    return <NoDiagnosisCard />;
  }

  return (
    <div className="mx-4 rounded-3xl overflow-hidden relative">
      {/* 그라데이션 배경 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #f3e7ff 0%, #e8f5e9 50%, #fff8e1 100%)",
        }}
      />

      {/* 장식적 요소 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-200/30 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative p-5">
        <div className="flex items-start justify-between">
          {/* 텍스트 영역 */}
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {userName}님의
              <br />
              <span className="text-[#9F85E3]">건강목표</span>
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {goalDescription}
            </p>
            {subDescription && (
              <p className="text-xs text-gray-500 mb-3">{subDescription}</p>
            )}

            {/* 태그 버튼들 */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm border border-gray-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 캐릭터 이미지 */}
          <div className="flex-shrink-0">
            <MainCharacter size={140} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NoDiagnosisCard() {
  return (
    <Link href="/diagnosis" className="block mx-4">
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #7C4DFF 0%, #E040FB 50%, #FF80AB 100%)",
        }}
      >
        {/* 장식 요소 */}
        <div className="absolute top-0 left-0 w-16 h-16 opacity-20">
          <svg viewBox="0 0 100 100" fill="none">
            <circle cx="20" cy="20" r="3" fill="white" />
            <circle cx="40" cy="10" r="2" fill="white" />
            <circle cx="10" cy="40" r="2" fill="white" />
            <circle cx="60" cy="30" r="2" fill="white" />
            <circle cx="30" cy="60" r="2" fill="white" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-20 w-16 h-16 opacity-20">
          <svg viewBox="0 0 100 100" fill="none">
            <circle cx="80" cy="80" r="3" fill="white" />
            <circle cx="60" cy="90" r="2" fill="white" />
            <circle cx="90" cy="60" r="2" fill="white" />
            <circle cx="40" cy="70" r="2" fill="white" />
            <circle cx="70" cy="40" r="2" fill="white" />
          </svg>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="flex-1">
            <p className="text-base font-semibold text-white leading-relaxed">
              식습관 파악하는 영양진단하고
              <br />
              <span className="text-yellow-300 font-bold">
                나만의 식습관 가이드
              </span>{" "}
              확인하기!
            </p>
          </div>

          {/* 영양박사 캐릭터 (엄지척 포즈) */}
          <div className="flex-shrink-0 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
            <DoctorThumbsUpCharacter size={70} />
          </div>
        </div>
      </div>
    </Link>
  );
}

// 엄지척 영양박사 캐릭터
function DoctorThumbsUpCharacter({ size = 70 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 70 70" fill="none">
      {/* 몸체 */}
      <ellipse cx="35" cy="48" rx="18" ry="16" fill="#9F85E3" />
      <ellipse cx="35" cy="50" rx="16" ry="13" fill="#B39DDB" />

      {/* 얼굴 */}
      <ellipse cx="35" cy="32" rx="15" ry="17" fill="#9F85E3" />

      {/* 눈 */}
      <ellipse cx="30" cy="30" rx="4" ry="5" fill="#FFFFFF" />
      <ellipse cx="40" cy="30" rx="4" ry="5" fill="#FFFFFF" />
      <circle cx="31" cy="31" r="2" fill="#333333" />
      <circle cx="41" cy="31" r="2" fill="#333333" />

      {/* 볼 */}
      <ellipse cx="24" cy="36" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="46" cy="36" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />

      {/* 입 (미소) */}
      <path
        d="M31 40 Q35 44 39 40"
        stroke="#333333"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 박사 모자 */}
      <rect x="22" y="12" width="26" height="5" fill="#1a1a2e" />
      <path d="M25 12 L35 4 L45 12" fill="#1a1a2e" />
      <circle cx="35" cy="6" r="3" fill="#FFD700" />

      {/* 왼쪽 팔 (서류 들고 있음) */}
      <ellipse
        cx="18"
        cy="45"
        rx="6"
        ry="10"
        fill="#9F85E3"
        transform="rotate(-15 18 45)"
      />
      <rect x="8" y="38" width="12" height="16" rx="1" fill="#FFFFFF" />
      <rect x="10" y="41" width="8" height="1" fill="#E0E0E0" />
      <rect x="10" y="44" width="6" height="1" fill="#E0E0E0" />
      <rect x="10" y="47" width="7" height="1" fill="#E0E0E0" />

      {/* 오른쪽 팔 (엄지척) */}
      <ellipse
        cx="54"
        cy="42"
        rx="6"
        ry="10"
        fill="#9F85E3"
        transform="rotate(20 54 42)"
      />
      {/* 엄지 */}
      <ellipse
        cx="58"
        cy="32"
        rx="3"
        ry="6"
        fill="#B39DDB"
        transform="rotate(-30 58 32)"
      />
      {/* 주먹 */}
      <ellipse cx="56" cy="40" rx="5" ry="4" fill="#B39DDB" />
    </svg>
  );
}
