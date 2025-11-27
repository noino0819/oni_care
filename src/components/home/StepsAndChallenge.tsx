"use client";

import { DoctorCharacter } from "@/components/icons";

interface StepsAndChallengeProps {
  currentSteps?: number;
  targetSteps?: number;
  challengeTitle?: string;
  challengeProgress?: number;
  onVerify?: () => void;
}

export function StepsAndChallenge({
  currentSteps = 3560,
  targetSteps = 10000,
  challengeTitle = "매일 한잔 물마시기",
  challengeProgress = 50,
  onVerify,
}: StepsAndChallengeProps) {
  const stepsPercentage = Math.min((currentSteps / targetSteps) * 100, 100);
  const circumference = 2 * Math.PI * 35; // radius = 35
  const strokeDashoffset = circumference - (stepsPercentage / 100) * circumference;

  return (
    <div className="mx-4 flex gap-3">
      {/* 오늘의 걸음수 */}
      <div className="flex-[3] bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#03A9F4] rounded-full" />
          오늘의 걸음수
        </h4>
        
        <div className="flex items-center gap-4">
          {/* 원형 프로그레스 */}
          <div className="relative flex-shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="#E5E7EB"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="#03A9F4"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 40 40)"
                className="transition-all duration-500"
              />
            </svg>
            
            {/* 걸음 아이콘 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <ellipse cx="9" cy="8" rx="4" ry="5" fill="#03A9F4" transform="rotate(-15 9 8)"/>
                <ellipse cx="15" cy="16" rx="4" ry="5" fill="#03A9F4" transform="rotate(15 15 16)"/>
              </svg>
            </div>
          </div>
          
          {/* 숫자 */}
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {currentSteps.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">
              /{targetSteps.toLocaleString()}걸음
            </div>
          </div>
        </div>
      </div>

      {/* 챌린지 */}
      <div className="flex-[4] bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-sm border border-purple-100 p-4 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100/50 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#9F85E3] text-white text-[10px] font-semibold rounded-full">
                AI 영양박사
              </span>
              <span className="text-xs text-gray-500">챌린지</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 캐릭터 */}
            <div className="flex-shrink-0">
              <DoctorCharacter size={60} />
            </div>

            {/* 챌린지 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-[#9F85E3]">
                  {challengeProgress}%
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2 truncate">
                {challengeTitle}
              </p>
              <button
                onClick={onVerify}
                className="w-full py-1.5 bg-white border border-[#9F85E3] text-[#9F85E3] text-xs font-semibold rounded-lg hover:bg-purple-50 transition-colors"
              >
                인증하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

