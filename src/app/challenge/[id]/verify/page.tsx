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
  challenge_duration_days: number;
  daily_verification_count: number;
  verification_time_slots: Array<{ start: string; end: string; label: string }> | null;
  reward_type: string;
  total_reward: string | null;
  total_stamp_count: number;
  stamp_empty_image: string | null;
  stamp_filled_image: string | null;
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
  total_required_count: number;
  achievement_rate: number;
  today_verification_count: number;
}

interface Stamp {
  id: string;
  stamp_number: number;
  is_achieved: boolean;
  stamp_date: string | null;
  achieved_at: string | null;
}

interface Verification {
  id: string;
  verification_date: string;
  verification_slot: number;
  is_verified: boolean;
}

interface Quiz {
  id: string;
  quiz_type: string;
  question: string;
  options: string[];
  hint: string;
  display_order: number;
}

interface RouletteSettings {
  id: string;
  segments: Array<{
    label: string;
    probability: number;
    reward_type: string;
    reward_value: number;
    image_url?: string;
  }>;
}

interface Ranking {
  rank: number;
  maskedName: string;
  achievement_rate: number;
  isCurrentUser: boolean;
}

// 달성률 메시지
function getAchievementMessage(rate: number): string {
  if (rate === 0) return "시작이 반! 오늘도 함께 가볼까요?!";
  if (rate < 30) return "아직 부족해요😊 좀 더 힘을 내봐요!";
  if (rate < 50) return "희망이 보여요! 포기하지말고 화이팅!";
  if (rate < 70) return "진짜 절반이에요! 완료까지 화이팅 🎉";
  if (rate < 100) return "거의 다 왔어요😊 곧 목표 완료!";
  return "오늘의 목표를 달성했어요 🎉";
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

// 스탬프 컴포넌트
function StampGrid({
  stamps,
  totalCount,
  emptyImage,
  filledImage,
}: {
  stamps: Stamp[];
  totalCount: number;
  emptyImage: string | null;
  filledImage: string | null;
}) {
  const columns = 5;
  const stampItems = [];

  for (let i = 1; i <= totalCount; i++) {
    const stamp = stamps.find((s) => s.stamp_number === i);
    const isAchieved = stamp?.is_achieved || false;

    stampItems.push(
      <div key={i} className="flex flex-col items-center">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all",
            isAchieved
              ? "bg-[#9F85E3] text-white shadow-lg"
              : "bg-gray-200 text-gray-400"
          )}
        >
          {isAchieved ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          ) : (
            <span className="text-sm">{i}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3 p-4 bg-gray-100 rounded-xl",
        `grid-cols-${columns}`
      )}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {stampItems}
    </div>
  );
}

// 오늘의 달성 현황 (복수 인증)
function TodayProgress({
  dailyCount,
  todayVerifications,
  timeSlots,
}: {
  dailyCount: number;
  todayVerifications: Verification[];
  timeSlots: Array<{ start: string; end: string; label: string }> | null;
}) {
  const slots = [];

  for (let i = 1; i <= dailyCount; i++) {
    const verification = todayVerifications.find((v) => v.verification_slot === i);
    const isCompleted = verification?.is_verified || false;
    const timeSlot = timeSlots?.[i - 1];

    // 현재 시간이 시간대에 포함되는지 확인
    let isCurrentSlot = false;
    let isLocked = false;

    if (timeSlot) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      isCurrentSlot = currentTime >= timeSlot.start && currentTime <= timeSlot.end;
      isLocked = currentTime < timeSlot.start;
    }

    slots.push(
      <div key={i} className="flex flex-col items-center">
        <div
          className={cn(
            "relative w-16 h-16 rounded-full flex items-center justify-center transition-all",
            isCompleted
              ? "bg-[#9F85E3] text-white"
              : isLocked
              ? "bg-gray-200 text-gray-400"
              : "bg-gray-100 text-gray-500 border-2 border-gray-200"
          )}
        >
          {isCompleted ? (
            <span className="text-sm font-bold">완료</span>
          ) : isLocked ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
            </svg>
          ) : (
            <span className="text-2xl font-bold">{i}</span>
          )}
        </div>
        <span className="text-xs text-gray-500 mt-1">{i}회차</span>
        {timeSlot && (
          <span className="text-[10px] text-gray-400">
            {timeSlot.start}~{timeSlot.end.slice(0, 2)}시
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4">오늘의 달성 현황</h3>
      <div className="flex justify-center gap-4">{slots}</div>
    </div>
  );
}

// 진행률 바
function ProgressBar({
  completedDays,
  totalDays,
  remainingDays,
}: {
  completedDays: number;
  totalDays: number;
  remainingDays: number;
}) {
  const progress = (completedDays / totalDays) * 100;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-3">달성 현황</h3>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">
          <strong className="text-[#9F85E3]">{completedDays}일</strong> 인증 완료!
        </span>
        <span className="text-gray-500">{remainingDays}일 남았어요</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#9F85E3] to-[#B8A5F0] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// 랭킹 테이블
function RankingTable({ rankings }: { rankings: Ranking[] }) {
  if (rankings.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-3">등수확인</h3>
      <div className="space-y-2">
        {rankings.map((ranking, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-center justify-between py-2 px-3 rounded-lg",
              ranking.isCurrentUser ? "bg-[#9F85E3]/10" : "bg-gray-50"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "w-8 text-center font-bold",
                  ranking.rank <= 3 ? "text-[#9F85E3]" : "text-gray-500"
                )}
              >
                {ranking.rank}위
              </span>
              <span
                className={cn(
                  "font-medium",
                  ranking.isCurrentUser ? "text-[#9F85E3]" : "text-gray-700"
                )}
              >
                {ranking.maskedName}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {ranking.achievement_rate.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 확인 팝업
function ConfirmPopup({
  isOpen,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up">
        <p className="text-gray-800 text-center text-lg font-medium mb-6">
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
            className="flex-1 py-3 rounded-xl bg-[#9F85E3] text-white font-medium hover:bg-[#8B74D1] transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// 완료 팝업
function CompletePopup({
  isOpen,
  message,
  rewardImage,
  onConfirm,
}: {
  isOpen: boolean;
  message: string;
  rewardImage?: string;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          챌린지를 모두 완료했어요!
        </h3>
        {rewardImage && (
          <div className="w-24 h-24 mx-auto mb-4 relative">
            <Image
              src={rewardImage}
              alt="보상"
              fill
              className="object-contain"
            />
          </div>
        )}
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={onConfirm}
          className="w-full py-3 rounded-xl bg-[#9F85E3] text-white font-medium hover:bg-[#8B74D1] transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
}

// 퀴즈 컴포넌트
function QuizSection({
  quiz,
  challengeId,
  slot,
  onComplete,
}: {
  quiz: Quiz;
  challengeId: string;
  slot: number;
  onComplete: () => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    canRetry: boolean;
    message: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = async () => {
    if (selectedAnswer === null) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/challenges/${challengeId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          selectedAnswer,
          slot,
        }),
      });
      const data = await res.json();

      setResult({
        isCorrect: data.isCorrect,
        canRetry: data.canRetry,
        message: data.message,
      });

      if (data.isCorrect) {
        setTimeout(() => onComplete(), 2000);
      }
    } catch (error) {
      console.error("퀴즈 제출 에러:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4 text-center">퀴즈</h3>
      
      <p className="text-gray-800 text-center text-lg mb-6 leading-relaxed">
        {quiz.question}
      </p>

      {quiz.quiz_type === "ox" ? (
        <div className="flex gap-4 justify-center mb-6">
          {["O", "X"].map((option) => (
            <button
              key={option}
              onClick={() => setSelectedAnswer(option)}
              disabled={result?.isCorrect}
              className={cn(
                "w-24 h-24 rounded-xl text-4xl font-bold transition-all",
                selectedAnswer === option
                  ? option === "O"
                    ? "bg-blue-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {quiz.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAnswer(idx)}
              disabled={result?.isCorrect}
              className={cn(
                "w-full py-3 px-4 rounded-xl text-left transition-all",
                selectedAnswer === idx
                  ? "bg-[#9F85E3] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {result && (
        <div
          className={cn(
            "mb-4 p-4 rounded-xl text-center",
            result.isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          )}
        >
          {result.message}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setShowHint(true)}
          className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
        >
          힌트보기
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null || isSubmitting || result?.isCorrect}
          className={cn(
            "flex-1 py-3 rounded-xl font-medium transition-colors",
            selectedAnswer === null || result?.isCorrect
              ? "bg-gray-200 text-gray-400"
              : "bg-[#9F85E3] text-white hover:bg-[#8B74D1]"
          )}
        >
          {isSubmitting ? "제출중..." : "정답제출"}
        </button>
      </div>

      {/* 힌트 팝업 */}
      {showHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHint(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm">
            <h4 className="text-lg font-bold text-center mb-4">[HINT]</h4>
            <p className="text-gray-600 text-center mb-6">{quiz.hint}</p>
            <button
              onClick={() => setShowHint(false)}
              className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 룰렛 컴포넌트
function RouletteWheel({
  settings,
  challengeId,
  todaySpun,
  onSpin,
}: {
  settings: RouletteSettings;
  challengeId: string;
  todaySpun: boolean;
  onSpin: (result: any) => void;
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const segments = settings.segments;
  const segmentAngle = 360 / segments.length;

  const handleSpin = async () => {
    if (isSpinning || todaySpun) return;

    try {
      setIsSpinning(true);
      
      const res = await fetch(`/api/challenges/${challengeId}/roulette`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setIsSpinning(false);
        return;
      }

      // 회전 애니메이션
      const targetIndex = data.wonIndex;
      const spins = 5; // 5바퀴 회전
      const targetAngle = 360 - (targetIndex * segmentAngle + segmentAngle / 2);
      const totalRotation = spins * 360 + targetAngle;

      setRotation(totalRotation);

      // 애니메이션 완료 후 결과 표시
      setTimeout(() => {
        setIsSpinning(false);
        onSpin(data);
      }, 4000);
    } catch (error) {
      console.error("룰렛 에러:", error);
      setIsSpinning(false);
    }
  };

  // 색상 배열
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
  ];

  return (
    <div className="flex flex-col items-center">
      {/* 룰렛 휠 */}
      <div className="relative w-72 h-72">
        {/* 화살표 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-[#9F85E3]" />
        </div>

        {/* 휠 */}
        <div
          className="w-full h-full rounded-full overflow-hidden shadow-xl transition-transform"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? "4s" : "0s",
            transitionTimingFunction: "cubic-bezier(0.17, 0.67, 0.12, 0.99)",
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {segments.map((segment, idx) => {
              const startAngle = idx * segmentAngle;
              const endAngle = startAngle + segmentAngle;
              const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
              const largeArc = segmentAngle > 180 ? 1 : 0;

              // 텍스트 위치 계산
              const textAngle = startAngle + segmentAngle / 2;
              const textRadius = 35;
              const textX = 50 + textRadius * Math.cos((Math.PI * textAngle) / 180);
              const textY = 50 + textRadius * Math.sin((Math.PI * textAngle) / 180);

              return (
                <g key={idx}>
                  <path
                    d={`M50,50 L${x1},${y1} A50,50 0 ${largeArc},1 ${x2},${y2} Z`}
                    fill={colors[idx % colors.length]}
                    stroke="#fff"
                    strokeWidth="0.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize="4"
                    fontWeight="bold"
                    transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* START 버튼 */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || todaySpun}
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-16 h-16 rounded-full font-bold text-sm shadow-lg transition-all",
            isSpinning || todaySpun
              ? "bg-gray-300 text-gray-500"
              : "bg-white text-[#9F85E3] hover:bg-gray-50"
          )}
        >
          {isSpinning ? "..." : "START"}
        </button>
      </div>

      {todaySpun && (
        <p className="mt-4 text-gray-500 text-center">
          오늘은 이미 룰렛을 돌렸어요!<br />
          내일 다시 만나요 :D
        </p>
      )}
    </div>
  );
}

// 룰렛 결과 팝업
function RouletteResultPopup({
  isOpen,
  result,
  onConfirm,
}: {
  isOpen: boolean;
  result: any;
  onConfirm: () => void;
}) {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm text-center animate-slide-up">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {result.message}
        </h3>
        {result.wonSegment?.image_url && (
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <Image
              src={result.wonSegment.image_url}
              alt="보상"
              fill
              className="object-contain"
            />
          </div>
        )}
        <div className="text-4xl font-bold text-[#9F85E3] mb-6">
          {result.wonSegment?.label}
        </div>
        <button
          onClick={onConfirm}
          className="w-full py-3 rounded-xl bg-[#9F85E3] text-white font-medium hover:bg-[#8B74D1] transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
}

// 메인 컴포넌트
export default function ChallengeVerifyPage() {
  const params = useParams();
  const challengeId = params.id as string;
  const router = useRouter();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participation, setParticipation] = useState<Participation | null>(null);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [todayVerifications, setTodayVerifications] = useState<Verification[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [rouletteSettings, setRouletteSettings] = useState<RouletteSettings | null>(null);
  const [todaySpun, setTodaySpun] = useState(false);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [remainingDays, setRemainingDays] = useState(0);
  const [completedDays, setCompletedDays] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<any>(null);
  const [showRouletteResult, setShowRouletteResult] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  // 데이터 로드
  const loadData = useCallback(async () => {
    if (!challengeId) return;
    
    try {
      setIsLoading(true);

      // 챌린지 데이터 로드
      const challengeRes = await fetch(`/api/challenges/${challengeId}`);
      const challengeData = await challengeRes.json();

      if (!challengeData.challenge) {
        router.push("/challenge");
        return;
      }

      // 참여중이 아니면 상세 페이지로 리다이렉트
      if (!challengeData.participation || challengeData.participation.status !== "participating") {
        router.push(`/challenge/${challengeId}`);
        return;
      }

      setChallenge(challengeData.challenge);
      setParticipation(challengeData.participation);
      setStamps(challengeData.stamps || []);
      setTodayVerifications(challengeData.todayVerifications || []);
      setQuizzes(challengeData.quizzes || []);
      setRouletteSettings(challengeData.rouletteSettings);
      setTodaySpun(challengeData.todaySpun || false);
      setRemainingDays(challengeData.remainingDays || 0);
      setCompletedDays(challengeData.completedDays || 0);

      // 랭킹 로드 (복수 인증 챌린지인 경우)
      if (challengeData.challenge.daily_verification_count > 1) {
        const rankingRes = await fetch(`/api/challenges/${challengeId}/rankings`);
        const rankingData = await rankingRes.json();
        setRankings(rankingData.rankings || []);
      }
    } catch (error) {
      console.error("데이터 로드 에러:", error);
    } finally {
      setIsLoading(false);
    }
  }, [challengeId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 인증하기
  const handleVerify = async (slot: number = 1) => {
    try {
      setIsVerifying(true);
      const res = await fetch(`/api/challenges/${challengeId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot }),
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setShowVerifyPopup(false);

      // 챌린지 완료 시 완료 팝업
      if (data.isCompleted) {
        setShowCompletePopup(true);
      }

      // 데이터 새로고침
      loadData();
    } catch (error) {
      console.error("인증 에러:", error);
      alert("인증에 실패했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 룰렛 결과 처리
  const handleRouletteResult = (result: any) => {
    setRouletteResult(result);
    setShowRouletteResult(true);
    setTodaySpun(true);
    loadData();
  };

  // 현재 인증 가능한 슬롯 확인
  const getCurrentAvailableSlot = (): number | null => {
    if (!challenge || !participation) return null;

    const dailyCount = challenge.daily_verification_count;
    const todayCount = todayVerifications.length;

    if (todayCount >= dailyCount) return null;

    // 시간대 설정이 없으면 다음 슬롯
    if (!challenge.verification_time_slots || challenge.verification_time_slots.length === 0) {
      return todayCount + 1;
    }

    // 시간대 설정이 있으면 현재 시간에 맞는 슬롯 확인
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    for (let i = 0; i < challenge.verification_time_slots.length; i++) {
      const slot = challenge.verification_time_slots[i];
      const isVerified = todayVerifications.some((v) => v.verification_slot === i + 1);

      if (!isVerified && currentTime >= slot.start && currentTime <= slot.end) {
        return i + 1;
      }
    }

    return null;
  };

  // 버튼 비활성화 조건
  const isButtonDisabled = () => {
    if (!challenge || !participation) return true;

    // 룰렛 챌린지
    if (challenge.challenge_type === "attendance") {
      return todaySpun;
    }

    // 퀴즈 챌린지
    if (challenge.challenge_type === "quiz") {
      return todayVerifications.length >= challenge.daily_verification_count;
    }

    // 자동 인증 챌린지 (걸음수, 식사기록, 영양제)
    if (challenge.verification_method === "auto") {
      return todayVerifications.length >= challenge.daily_verification_count;
    }

    // 수기 인증 챌린지
    return getCurrentAvailableSlot() === null;
  };

  // 버튼 텍스트
  const getButtonText = () => {
    if (!challenge) return "";

    if (challenge.challenge_type === "attendance") {
      return todaySpun ? "인증완료" : "룰렛 돌리기";
    }

    if (challenge.challenge_type === "quiz") {
      const remaining = challenge.daily_verification_count - todayVerifications.length;
      if (remaining <= 0) return "인증완료";
      return `퀴즈 풀기(${todayVerifications.length + 1}/${challenge.daily_verification_count})`;
    }

    const todayCount = todayVerifications.length;
    const dailyMax = challenge.daily_verification_count;

    if (todayCount >= dailyMax) return "인증완료";

    if (dailyMax > 1) {
      return `${challenge.verification_button_text} (${todayCount + 1}/${dailyMax})`;
    }

    return challenge.verification_button_text;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse p-4 space-y-4">
          <div className="h-14 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!challenge || !participation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">챌린지를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const dailyAchievementRate =
    (todayVerifications.length / challenge.daily_verification_count) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => router.push("/challenge")}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <BackIcon className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-900">
            챌린지 인증하기
          </h1>
          <button
            onClick={() => router.push(`/challenge/${challengeId}`)}
            className="text-sm text-[#9F85E3] font-medium"
          >
            상세보기
          </button>
        </div>
      </header>

      {/* 콘텐츠 */}
      <main className="p-4 space-y-4">
        {/* 챌린지 정보 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            {challenge.thumbnail_url && (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <Image
                  src={challenge.thumbnail_url}
                  alt={challenge.title}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900">{challenge.title}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                  하루 {challenge.daily_verification_count}번
                </span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                  {challenge.challenge_duration_days}일 동안
                </span>
                {challenge.total_reward && (
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                    {challenge.total_reward}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 룰렛 챌린지 */}
        {challenge.challenge_type === "attendance" && rouletteSettings && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">출석체크</h3>
            <RouletteWheel
              settings={rouletteSettings}
              challengeId={challenge.id}
              todaySpun={todaySpun}
              onSpin={handleRouletteResult}
            />
          </div>
        )}

        {/* 퀴즈 챌린지 */}
        {challenge.challenge_type === "quiz" && quizzes.length > 0 && (
          <>
            {/* 오늘의 달성 현황 */}
            {challenge.daily_verification_count > 1 && (
              <TodayProgress
                dailyCount={challenge.daily_verification_count}
                todayVerifications={todayVerifications}
                timeSlots={challenge.verification_time_slots}
              />
            )}

            {/* 퀴즈 */}
            {todayVerifications.length < challenge.daily_verification_count && (
              <QuizSection
                quiz={quizzes[currentQuizIndex]}
                challengeId={challenge.id}
                slot={todayVerifications.length + 1}
                onComplete={() => {
                  loadData();
                  if (currentQuizIndex < quizzes.length - 1) {
                    setCurrentQuizIndex(currentQuizIndex + 1);
                  }
                }}
              />
            )}
          </>
        )}

        {/* 걸음수/영양제/식사기록 챌린지 - 자동인증 */}
        {["steps", "supplement", "meal"].includes(challenge.challenge_type) && (
          <>
            {/* 오늘의 달성 현황 */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">오늘의 달성 현황</h3>
              <p className="text-sm text-gray-600 mb-2">
                {getAchievementMessage(dailyAchievementRate)}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#9F85E3] rounded-full transition-all"
                    style={{ width: `${dailyAchievementRate}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {todayVerifications.length}/{challenge.daily_verification_count}
                  {challenge.challenge_type === "steps" ? "걸음" : "회"}
                </span>
              </div>
            </div>

            {/* 복수 인증 - 오늘의 달성 현황 */}
            {challenge.daily_verification_count > 1 && (
              <TodayProgress
                dailyCount={challenge.daily_verification_count}
                todayVerifications={todayVerifications}
                timeSlots={challenge.verification_time_slots}
              />
            )}
          </>
        )}

        {/* 수기인증 챌린지 */}
        {challenge.verification_method === "manual" && (
          <>
            {/* 복수 인증 - 오늘의 달성 현황 */}
            {challenge.daily_verification_count > 1 && (
              <TodayProgress
                dailyCount={challenge.daily_verification_count}
                todayVerifications={todayVerifications}
                timeSlots={challenge.verification_time_slots}
              />
            )}
          </>
        )}

        {/* 달성 현황 (진행률 바) */}
        <ProgressBar
          completedDays={completedDays}
          totalDays={challenge.total_stamp_count || challenge.challenge_duration_days}
          remainingDays={remainingDays}
        />

        {/* 스탬프 그리드 */}
        <StampGrid
          stamps={stamps}
          totalCount={challenge.total_stamp_count || challenge.challenge_duration_days}
          emptyImage={challenge.stamp_empty_image}
          filledImage={challenge.stamp_filled_image}
        />

        {/* 랭킹 테이블 (복수 인증 챌린지) */}
        {challenge.daily_verification_count > 1 && rankings.length > 0 && (
          <RankingTable rankings={rankings} />
        )}
      </main>

      {/* 하단 버튼 */}
      {challenge.challenge_type !== "attendance" && challenge.challenge_type !== "quiz" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe">
          <button
            onClick={() => {
              if (challenge.verification_method === "auto") {
                // 자동 인증: 해당 기록 화면으로 이동
                if (challenge.challenge_type === "meal") {
                  router.push("/meal-record");
                } else if (challenge.challenge_type === "supplement") {
                  router.push("/supplement-record");
                } else if (challenge.challenge_type === "steps") {
                  router.push("/steps");
                }
              } else {
                // 수기 인증: 확인 팝업
                setShowVerifyPopup(true);
              }
            }}
            disabled={isButtonDisabled()}
            className={cn(
              "w-full py-4 rounded-xl font-semibold transition-colors",
              isButtonDisabled()
                ? "bg-gray-200 text-gray-400"
                : "bg-[#9F85E3] text-white hover:bg-[#8B74D1]"
            )}
          >
            {getButtonText()}
          </button>
        </div>
      )}

      {/* 인증 확인 팝업 */}
      <ConfirmPopup
        isOpen={showVerifyPopup}
        message="오늘의 챌린지를 달성하셨나요?"
        confirmText={isVerifying ? "인증중..." : "네, 달성했어요!"}
        cancelText="아니오"
        onConfirm={() => handleVerify(getCurrentAvailableSlot() || 1)}
        onCancel={() => setShowVerifyPopup(false)}
      />

      {/* 완료 팝업 */}
      <CompletePopup
        isOpen={showCompletePopup}
        message={`${challenge.total_reward || "보상"}을 획득했어요!`}
        onConfirm={() => {
          setShowCompletePopup(false);
          router.push("/challenge");
        }}
      />

      {/* 룰렛 결과 팝업 */}
      <RouletteResultPopup
        isOpen={showRouletteResult}
        result={rouletteResult}
        onConfirm={() => setShowRouletteResult(false)}
      />
    </div>
  );
}

