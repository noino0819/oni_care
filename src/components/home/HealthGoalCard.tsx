"use client";

import { MainCharacter, SaladBowlIcon } from "@/components/icons";
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
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #e8f5e9 100%)",
        }}
      >
        <div className="flex items-center gap-4">
          <SaladBowlIcon size={80} />
          <div className="flex-1">
            <p className="text-base font-semibold text-gray-800 leading-relaxed">
              식습관 파악하는 영양진단하고
              <br />
              <span className="text-[#7CB342]">나만의 식습관 가이드</span>{" "}
              확인하기!
            </p>
          </div>
          <div className="text-gray-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6L15 12L9 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
