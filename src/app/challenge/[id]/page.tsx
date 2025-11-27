"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

// 타입 정의
interface Challenge {
  id: string;
  challenge_type: string;
  verification_method: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  detail_images: string[];
  challenge_duration_days: number;
  daily_verification_count: number;
  reward_type: string;
  total_reward: string | null;
  daily_reward: string | null;
  single_reward: string | null;
  total_stamp_count: number;
  current_participants: number;
  verification_button_text: string;
  status: string;
  statusTag: { text: string; color: string };
}

interface Participation {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  total_verification_count: number;
  achievement_rate: number;
}

// 상태 태그 스타일
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

// 뒤로가기 아이콘
function BackIcon({ className }: { className?: string }) {
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
      <polyline points="15,18 9,12 15,6" />
    </svg>
  );
}

// 확인 팝업
function ConfirmPopup({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDestructive = false,
}: {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up">
        {title && (
          <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
            {title}
          </h3>
        )}
        <p className="text-gray-600 text-center whitespace-pre-line mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "flex-1 py-3 rounded-xl font-medium transition-colors",
              isDestructive
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-[#9F85E3] text-white hover:bg-[#8B74D1]"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChallengeDetailPage() {
  const params = useParams();
  const challengeId = params.id as string;
  const router = useRouter();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participation, setParticipation] = useState<Participation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // 팝업 상태
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  // 데이터 로드
  const loadChallenge = useCallback(async () => {
    if (!challengeId) return;
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/challenges/${challengeId}`);
      const data = await res.json();

      if (data.challenge) {
        setChallenge(data.challenge);
        setParticipation(data.participation);
      }
    } catch (error) {
      console.error("챌린지 로드 에러:", error);
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  // 참여하기
  const handleJoin = async () => {
    try {
      setIsJoining(true);
      const res = await fetch(`/api/challenges/${challengeId}/join`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setShowJoinPopup(false);
        // 인증 화면으로 이동
        router.push(`/challenge/${challengeId}/verify`);
      } else {
        alert(data.error || "참여에 실패했습니다.");
      }
    } catch (error) {
      console.error("챌린지 참여 에러:", error);
      alert("참여에 실패했습니다.");
    } finally {
      setIsJoining(false);
    }
  };

  // 취소하기
  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      const res = await fetch(`/api/challenges/${challengeId}/join`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setShowCancelPopup(false);
        // 챌린지 홈으로 이동
        router.push("/challenge");
      } else {
        alert(data.error || "취소에 실패했습니다.");
      }
    } catch (error) {
      console.error("챌린지 취소 에러:", error);
      alert("취소에 실패했습니다.");
    } finally {
      setIsCancelling(false);
    }
  };

  // 참여 중인지 확인
  const isParticipating = participation?.status === "participating";
  
  // 버튼 비활성화 조건
  const isButtonDisabled = 
    challenge?.status === "before_recruitment" ||
    challenge?.status === "recruitment_closed" ||
    challenge?.status === "ended";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 스켈레톤 */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="flex items-center h-14 px-4">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 text-center">
              <div className="h-5 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
            </div>
            <div className="w-6" />
          </div>
        </div>

        {/* 콘텐츠 스켈레톤 */}
        <div className="p-4 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="aspect-[4/3] bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">챌린지를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* 헤더 (상단 고정) */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => router.push("/challenge")}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <BackIcon className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-900">
            챌린지 상세보기
          </h1>
          <div className="w-6" /> {/* 균형을 위한 빈 공간 */}
        </div>
      </header>

      {/* 콘텐츠 */}
      <main>
        {/* 제목 영역 */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900">{challenge.title}</h2>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium flex-shrink-0",
                getStatusTagStyle(challenge.statusTag.color)
              )}
            >
              {challenge.statusTag.text}
            </span>
          </div>
          
          {/* 챌린지 태그 */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              하루 {challenge.daily_verification_count}번
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              {challenge.challenge_duration_days}일 동안
            </span>
            {challenge.total_reward && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                {challenge.total_reward}
              </span>
            )}
          </div>
        </div>

        {/* 컨텐츠 이미지 */}
        <div className="px-4 py-4 space-y-4">
          {challenge.description && (
            <p className="text-gray-600 leading-relaxed">{challenge.description}</p>
          )}
          
          {/* 썸네일 이미지 */}
          {challenge.thumbnail_url && (
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={challenge.thumbnail_url}
                alt={challenge.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* 상세 이미지들 */}
          {challenge.detail_images && challenge.detail_images.length > 0 && (
            <div className="space-y-4">
              {challenge.detail_images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100"
                >
                  <Image
                    src={imageUrl}
                    alt={`${challenge.title} 상세 이미지 ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 참여자 수 */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            <span>{challenge.current_participants || 0}명 참여중</span>
          </div>
        </div>
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe">
        {isParticipating ? (
          <button
            onClick={() => setShowCancelPopup(true)}
            className="w-full py-4 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
          >
            챌린지 취소하기
          </button>
        ) : (
          <button
            onClick={() => setShowJoinPopup(true)}
            disabled={isButtonDisabled}
            className={cn(
              "w-full py-4 rounded-xl font-semibold transition-colors",
              isButtonDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#9F85E3] text-white hover:bg-[#8B74D1]"
            )}
          >
            {isButtonDisabled
              ? challenge.statusTag.text
              : "참여하기"}
          </button>
        )}
      </div>

      {/* 참여 확인 팝업 */}
      <ConfirmPopup
        isOpen={showJoinPopup}
        message="챌린지에 참여하시겠어요?"
        confirmText={isJoining ? "참여중..." : "네, 참여할게요!"}
        cancelText="아니오"
        onConfirm={handleJoin}
        onCancel={() => setShowJoinPopup(false)}
      />

      {/* 취소 확인 팝업 */}
      <ConfirmPopup
        isOpen={showCancelPopup}
        message={`챌린지를 취소하시면 지금까지의\n인증내용은 모두 사라져요!\n그래도 챌린지를 취소할까요?`}
        confirmText={isCancelling ? "취소중..." : "챌린지 취소하기"}
        cancelText="취소"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelPopup(false)}
        isDestructive
      />
    </div>
  );
}

