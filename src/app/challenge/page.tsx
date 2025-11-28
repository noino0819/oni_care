"use client";

import { useState, useEffect, useCallback } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Header } from "@/components/home/Header";
import { BottomNavigation } from "@/components/home/BottomNavigation";
import { ListSkeleton } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CHALLENGE_FILTER_OPTIONS,
  CHALLENGE_EMPTY_MESSAGES,
  CHALLENGE_STATUS_MAP,
} from "@/lib/constants";

// 타입 정의
interface Challenge {
  id: string;
  challenge_type: string;
  verification_method: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  challenge_duration_days: number;
  daily_verification_count: number;
  reward_type: string;
  total_reward: string | null;
  daily_reward: string | null;
  single_reward: string | null;
  total_stamp_count: number;
  current_participants: number;
  status: string;
  statusTag: { text: string; color: string };
  participation: unknown | null;
  dday: number | null;
  achievementRate: number;
}

// 상태 태그 색상
function getStatusTagStyle(color: string) {
  switch (color) {
    case "purple":
      return "bg-[#9F85E3] text-white";
    case "green":
      return "bg-emerald-500 text-white";
    case "gray":
    default:
      return "bg-gray-400 text-white";
  }
}

// 챌린지 카드 컴포넌트 - 레퍼런스에 맞게 개선
function ChallengeCard({
  challenge,
  isParticipating,
  onClick,
}: {
  challenge: Challenge;
  isParticipating: boolean;
  onClick: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all hover:scale-[1.01]"
    >
      <div className="flex gap-4">
        {/* 썸네일 */}
        <div className="relative w-[100px] h-[100px] flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-[#9F85E3]/10 to-[#B8A5F0]/20">
          {challenge.thumbnail_url && !imageError ? (
            <Image
              src={challenge.thumbnail_url}
              alt={challenge.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#9F85E3]">
              <ChallengeTypeIcon type={challenge.challenge_type} />
            </div>
          )}
          {/* 상태 태그 (왼쪽 상단) */}
          <div
            className={cn(
              "absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm",
              getStatusTagStyle(challenge.statusTag.color)
            )}
          >
            {challenge.statusTag.text}
          </div>
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 제목 */}
          <h3 className="font-bold text-gray-900 mb-1.5 line-clamp-2 text-[15px]">
            {challenge.title}
          </h3>

          {/* 태그들 */}
          <div className="flex flex-wrap gap-1.5 mb-auto">
            {isParticipating ? (
              <>
                {/* 참여중: 달성률, D-day */}
                <span className="px-2 py-0.5 bg-[#9F85E3]/10 rounded-full text-xs text-[#9F85E3] font-medium">
                  달성률 {Math.round(challenge.achievementRate)}%
                </span>
                {challenge.dday !== null && (
                  <span className="px-2 py-0.5 bg-orange-100 rounded-full text-xs text-orange-600 font-medium">
                    D-{challenge.dday > 0 ? challenge.dday : 0}
                  </span>
                )}
              </>
            ) : (
              <>
                {/* 기본형: 인증횟수, 보상 */}
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                  하루 {challenge.daily_verification_count}번
                </span>
                {challenge.total_reward && (
                  <span className="px-2 py-0.5 bg-amber-100 rounded-full text-xs text-amber-700">
                    {challenge.total_reward}
                  </span>
                )}
              </>
            )}
          </div>

          {/* 버튼 */}
          <button
            className={cn(
              "w-full py-2.5 rounded-xl text-sm font-semibold transition-all mt-2",
              isParticipating
                ? "bg-gradient-to-r from-[#9F85E3] to-[#B8A5F0] text-white hover:shadow-md hover:shadow-[#9F85E3]/30"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {isParticipating ? "인증하기" : "참여하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 챌린지 타입별 아이콘
function ChallengeTypeIcon({ type }: { type: string }) {
  const iconClass = "w-12 h-12 text-gray-400";

  switch (type) {
    case "attendance":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" strokeLinecap="round" />
        </svg>
      );
    case "steps":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          <path d="M12 6l3 6-3 2-3-2 3-6z" fill="currentColor" />
        </svg>
      );
    case "meal":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M18 8h1a4 4 0 010 8h-1" strokeLinecap="round" />
          <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" strokeLinecap="round" />
          <line x1="10" y1="1" x2="10" y2="4" strokeLinecap="round" />
          <line x1="14" y1="1" x2="14" y2="4" strokeLinecap="round" />
        </svg>
      );
    case "supplement":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="6" width="18" height="12" rx="3" />
          <line x1="12" y1="6" x2="12" y2="18" />
          <circle cx="7" cy="12" r="2" fill="currentColor" />
          <circle cx="17" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    case "quiz":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path
            d="M9 9a3 3 0 115.12 2.12A2.5 2.5 0 0012 14"
            strokeLinecap="round"
          />
          <circle cx="12" cy="18" r="0.5" fill="currentColor" />
        </svg>
      );
    case "health_habit":
    default:
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" />
          <polyline
            points="22,4 12,14.01 9,11.01"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

// 드롭다운 아이콘
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6,9 12,15 18,9" />
    </svg>
  );
}

// 빈 상태 일러스트
function ChallengeEmptyState({ message }: { message: string }) {
  return <EmptyState description={message} />;
}

export default function ChallengePage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [participatingChallenges, setParticipatingChallenges] = useState<
    Challenge[]
  >([]);
  const [otherChallenges, setOtherChallenges] = useState<Challenge[]>([]);
  const [filter, setFilter] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 챌린지 목록 로드
  const loadChallenges = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/challenges?filter=${filter}`);
      const data = await res.json();

      if (data.challenges) {
        setChallenges(data.challenges);
        setParticipatingChallenges(data.participatingChallenges || []);
        setOtherChallenges(data.otherChallenges || []);
      }
    } catch (error) {
      console.error("챌린지 로드 에러:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  // 챌린지 클릭 핸들러
  const handleChallengeClick = (challenge: Challenge) => {
    if (challenge.status === "participating") {
      // 참여중인 챌린지는 인증 화면으로
      router.push(`/challenge/${challenge.id}/verify`);
    } else {
      // 그 외는 상세 화면으로
      router.push(`/challenge/${challenge.id}`);
    }
  };

  // 현재 필터 레이블
  const currentFilterLabel =
    CHALLENGE_FILTER_OPTIONS.find((f) => f.value === filter)?.label || "전체";

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 공통 헤더 */}
      <Header />

      {/* 서브 헤더 (제목 + 필터) */}
      <div className="sticky top-[56px] z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-12">
          <h1 className="text-lg font-bold text-gray-900">챌린지</h1>

          {/* 필터 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-700"
            >
              {currentFilterLabel}
              <ChevronDownIcon
                className={cn(
                  "w-4 h-4 transition-transform",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {/* 드롭다운 메뉴 */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                  {CHALLENGE_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilter(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm transition-colors",
                        filter === option.value
                          ? "bg-[#9F85E3]/10 text-[#9F85E3] font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <main className="p-4 space-y-6">
        {isLoading ? (
          // 로딩 스켈레톤
          <ListSkeleton count={3} />
        ) : challenges.length === 0 ? (
          // 빈 상태
          <ChallengeEmptyState
            message={
              CHALLENGE_EMPTY_MESSAGES[filter] || CHALLENGE_EMPTY_MESSAGES.all
            }
          />
        ) : (
          <>
            {/* 참여중인 챌린지 섹션 */}
            {participatingChallenges.length > 0 && filter !== "ended" && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">
                  참여중인 챌린지
                </h2>
                <div className="space-y-3">
                  {participatingChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      isParticipating={true}
                      onClick={() => handleChallengeClick(challenge)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 기본형 챌린지 섹션 */}
            {otherChallenges.length > 0 && (
              <section>
                {participatingChallenges.length > 0 && filter === "all" && (
                  <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">
                    다른 챌린지
                  </h2>
                )}
                <div className="space-y-3">
                  {otherChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      isParticipating={false}
                      onClick={() => handleChallengeClick(challenge)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
