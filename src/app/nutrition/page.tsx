"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, Star, Info, Flag, X } from "lucide-react";
import { Header } from "@/components/home/Header";
import { BottomNavigation } from "@/components/home/BottomNavigation";
import { cn } from "@/lib/utils";
import { useFetch } from "@/hooks/useFetch";

// 타입 정의
interface DiagnosisHistory {
  id: string;
  diagnosis_date: string;
  eat_score: number;
  diagnosis_number: number;
}

interface DiagnosisData {
  diagnosisList: DiagnosisHistory[];
  lastDiagnosis: {
    id: string;
    eat_score: number;
    diagnosis_date: string;
  } | null;
  daysSinceLastDiagnosis: number | null;
  totalCount: number;
}

interface TodaySteps {
  stepCount: number;
  goalSteps: number;
  recordDate: string;
}

interface WeeklySteps {
  weekData: {
    date: string;
    dayOfWeek: number;
    stepCount: number;
    goalSteps: number;
    isGoalAchieved: boolean;
  }[];
  startDate: string;
  endDate: string;
  maxSteps: number;
}

interface MonthlySteps {
  weeklyData: {
    weekNumber: number;
    weekStart: string;
    weekEnd: string;
    avgSteps: number;
    daysRecorded: number;
    totalSteps: number;
  }[];
  totalSteps: number;
  monthlyGoal: number;
  maxAvgSteps: number;
  year: number;
  month: number;
}

interface CompletedChallenge {
  participationId: string;
  challengeId: string;
  title: string;
  thumbnailUrl: string | null;
  challengeType: string;
  dailyVerificationCount: number;
  totalReward: string;
  rewardType: string;
  achievementRate: number;
  totalVerificationCount: number;
  isRewardClaimed: boolean;
  rankPosition: number | null;
  completedAt: string;
}

interface CompletedChallengesData {
  completedChallenges: CompletedChallenge[];
  totalCount: number;
}

// 요일
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const WEEKDAYS_SHORT = ["월", "화", "수", "목", "금", "토", "일"];

export default function NutritionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "diagnosis" | "steps" | "completed"
  >("diagnosis");

  // 포인트 조회
  const { data: homeData } = useFetch<{ user: { points: number } }>(
    "/api/home"
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* 헤더 */}
      <Header points={homeData?.user.points} />

      {/* 탭 네비게이션 */}
      <div className="sticky top-[56px] z-10 bg-white border-b border-gray-100">
        <div className="flex">
          <button
            onClick={() => setActiveTab("diagnosis")}
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium transition-colors relative",
              activeTab === "diagnosis" ? "text-gray-900" : "text-gray-400"
            )}
          >
            영양진단
            {activeTab === "diagnosis" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-[#9F85E3]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("steps")}
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium transition-colors relative",
              activeTab === "steps" ? "text-gray-900" : "text-gray-400"
            )}
          >
            걸음 수
            {activeTab === "steps" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-[#9F85E3]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium transition-colors relative",
              activeTab === "completed" ? "text-gray-900" : "text-gray-400"
            )}
          >
            완료한 챌린지
            {activeTab === "completed" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-[#9F85E3]" />
            )}
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === "diagnosis" && <DiagnosisTab />}
      {activeTab === "steps" && <StepsTab />}
      {activeTab === "completed" && <CompletedChallengesTab />}

      <BottomNavigation />
    </div>
  );
}

// ==============================
// 1. 영양진단 탭
// ==============================
function DiagnosisTab() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState(3);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const PERIOD_OPTIONS = [3, 6, 9, 12];

  // 영양진단 이력 조회
  const { data, isLoading } = useFetch<DiagnosisData>(
    "/api/nutrition/diagnosis/history",
    { period: selectedPeriod }
  );

  const hasDiagnosis = data?.lastDiagnosis !== null;
  const daysSince = data?.daysSinceLastDiagnosis;
  const eatScore = data?.lastDiagnosis?.eat_score;

  return (
    <div className="space-y-4 pt-4 pb-4">
      {/* 영양진단 카드 */}
      <div className="px-4">
        {isLoading ? (
          // 스켈레톤 UI
          <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
            <div className="h-5 w-64 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
            <div className="h-12 w-48 mx-auto bg-gray-200 rounded-full mb-6" />
            <div className="h-8 w-32 mx-auto bg-gray-200 rounded mb-4" />
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-200 rounded-xl" />
              <div className="flex-1 h-12 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ) : hasDiagnosis ? (
          // 진단 내역이 있는 경우
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-gray-700 mb-1">
              마지막 영양진단일로부터{" "}
              <span className="font-bold">{daysSince}일</span>이 지났어요.
            </p>
            <p className="text-gray-500 text-sm mb-4">
              주기적으로 영양상태를 확인해 보세요.
            </p>

            <button
              onClick={() => router.push("/nutrition/diagnosis")}
              className="w-full bg-[#9F85E3] text-white py-3 rounded-full text-sm font-medium mb-6 flex items-center justify-center gap-2"
            >
              📋 영양진단 다시하기
            </button>

            {/* 잇스코어 */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-gray-600">
                나의 잇스코어 점수는
              </span>
              <span className="text-3xl font-bold text-gray-900">
                {eatScore}
              </span>
              <span className="text-lg text-gray-600">점</span>
            </div>

            {/* 버튼들 */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => router.push("/nutrition/diagnosis-result")}
                className="flex-1 flex items-center justify-center gap-2 bg-[#9F85E3] text-white py-3 rounded-xl text-sm font-medium"
              >
                📋 영양진단 결과보기
              </button>
              <button
                onClick={() => router.push("/nutrition/recommendation")}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 py-3 rounded-xl text-sm font-medium border border-gray-200"
              >
                🛒 맞춤 상품 추천받기
              </button>
            </div>

            {/* 이전 내역 확인하기 */}
            <button
              onClick={() => router.push("/nutrition/diagnosis-result")}
              className="w-full text-right text-sm text-gray-500 flex items-center justify-end gap-1"
            >
              이전 내역확인하기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // 진단 내역이 없는 경우
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <p className="text-gray-700 mb-6 text-lg">
              영양진단내역이 없어요 😅
            </p>
            <button
              onClick={() => router.push("/nutrition/diagnosis")}
              className="bg-[#9F85E3] text-white px-8 py-3 rounded-full text-sm font-medium"
            >
              영양진단 하러가기
            </button>
          </div>
        )}
      </div>

      {/* 설문 내역 */}
      <div className="px-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800">설문 내역</h3>

            {/* 기간 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center gap-1 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg"
              >
                {selectedPeriod}개월
                <ChevronDown className="w-4 h-4" />
              </button>

              {showPeriodDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {PERIOD_OPTIONS.map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        setSelectedPeriod(period);
                        setShowPeriodDropdown(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-sm text-left hover:bg-gray-50",
                        selectedPeriod === period
                          ? "text-[#9F85E3] font-medium"
                          : "text-gray-600"
                      )}
                    >
                      {period}개월
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 설문 리스트 */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-gray-100 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-8 bg-gray-200 rounded" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : data?.diagnosisList && data.diagnosisList.length > 0 ? (
            <div className="space-y-0">
              {data.diagnosisList.map((diagnosis) => (
                <div
                  key={diagnosis.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 w-8">
                      {diagnosis.diagnosis_number}차
                    </span>
                    <span className="text-sm text-gray-700">
                      {formatDate(diagnosis.diagnosis_date)} 진단
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      router.push(
                        `/nutrition/diagnosis-result?id=${diagnosis.id}`
                      )
                    }
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-medium"
                  >
                    확인하기
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              설문 내역이 없어요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==============================
// 2. 걸음 수 탭
// ==============================
function StepsTab() {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 오늘의 걸음수
  const { data: todayData, isLoading: isTodayLoading } = useFetch<TodaySteps>(
    "/api/steps",
    { type: "today" }
  );

  // 주간/월간 걸음수
  const { data: weeklyData, isLoading: isWeeklyLoading } =
    useFetch<WeeklySteps>(
      "/api/steps",
      { type: "weekly", date: selectedDate.toISOString().split("T")[0] },
      { enabled: viewMode === "weekly" }
    );

  const { data: monthlyData, isLoading: isMonthlyLoading } =
    useFetch<MonthlySteps>(
      "/api/steps",
      { type: "monthly", date: selectedDate.toISOString().split("T")[0] },
      { enabled: viewMode === "monthly" }
    );

  const isLoading =
    isTodayLoading ||
    (viewMode === "weekly" ? isWeeklyLoading : isMonthlyLoading);

  return (
    <div className="space-y-4 pt-4 pb-4">
      {/* 오늘의/이달의 걸음 수 */}
      <div className="px-4">
        {isLoading ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
            <div className="flex items-baseline justify-center gap-1">
              <div className="h-12 w-24 bg-gray-200 rounded" />
              <div className="h-6 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              {viewMode === "weekly" ? "오늘의 걸음 수" : "이달의 걸음 수"}
            </h3>

            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-gray-900">
                {viewMode === "weekly"
                  ? todayData?.stepCount.toLocaleString() || "0"
                  : monthlyData?.totalSteps.toLocaleString() || "0"}
              </span>
              <span className="text-gray-400 text-lg">
                /
                {viewMode === "weekly"
                  ? (todayData?.goalSteps || 10000).toLocaleString()
                  : (monthlyData?.monthlyGoal || 300000).toLocaleString()}{" "}
                걸음
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 연동 안내 */}
      <div className="px-4">
        <button
          onClick={() => setShowInfoModal(true)}
          className="flex items-center justify-center gap-1 text-sm text-gray-500 w-full"
        >
          연동 안내 <Info className="w-4 h-4" />
        </button>
      </div>

      {/* 기간별 걸음수 비교 */}
      <div className="px-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            기간별 걸음수 비교
          </h3>

          {/* 주간/월간 토글 */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setViewMode("weekly")}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
                viewMode === "weekly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              )}
            >
              주간
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
                viewMode === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              )}
            >
              월간
            </button>
          </div>

          {/* 목표 달성일 범례 (주간만) */}
          {viewMode === "weekly" && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-red-500">목표 달성일</span>
            </div>
          )}

          {/* 차트 */}
          {isLoading ? (
            <div className="h-64 animate-pulse">
              <div className="flex items-end justify-between h-48 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gray-200 rounded-t"
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                  />
                ))}
              </div>
            </div>
          ) : viewMode === "weekly" ? (
            <WeeklyChart data={weeklyData} />
          ) : (
            <MonthlyChart data={monthlyData} />
          )}
        </div>
      </div>

      {/* 연동 안내 모달 */}
      {showInfoModal && (
        <StepsInfoModal onClose={() => setShowInfoModal(false)} />
      )}
    </div>
  );
}

// 주간 차트 컴포넌트
function WeeklyChart({ data }: { data: WeeklySteps | undefined }) {
  if (!data) return null;

  const maxValue = data.maxSteps || 10000;

  return (
    <div>
      {/* Y축 레이블 */}
      <div className="flex items-start mb-2">
        <div className="w-12 flex flex-col justify-between h-48 text-right pr-2">
          <span className="text-xs text-gray-400">
            {maxValue.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">
            {(maxValue / 2).toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">0</span>
        </div>

        {/* 막대 그래프 */}
        <div className="flex-1 flex items-end justify-between gap-2 h-48 border-l border-gray-200">
          {data.weekData.map((day, idx) => {
            const height = (day.stepCount / maxValue) * 100;
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end"
              >
                <div
                  className={cn(
                    "w-full rounded-t transition-all",
                    day.isGoalAchieved ? "bg-gray-800" : "bg-gray-300"
                  )}
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X축 레이블 */}
      <div className="flex items-start">
        <div className="w-12" />
        <div className="flex-1 flex justify-between">
          {data.weekData.map((day, idx) => {
            const date = new Date(day.date);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <span className="text-xs text-gray-700">{date.getDate()}</span>
                <span className="text-xs text-gray-400">
                  {WEEKDAYS[day.dayOfWeek]}
                </span>
                {day.isGoalAchieved && (
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 월간 차트 컴포넌트
function MonthlyChart({ data }: { data: MonthlySteps | undefined }) {
  if (!data) return null;

  const maxValue = data.maxAvgSteps || 10000;

  return (
    <div>
      {/* Y축 레이블 */}
      <div className="flex items-start mb-2">
        <div className="w-12 flex flex-col justify-between h-48 text-right pr-2">
          <span className="text-xs text-gray-400">
            {maxValue.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">
            {(maxValue / 2).toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">0</span>
        </div>

        {/* 막대 그래프 */}
        <div className="flex-1 flex items-end justify-between gap-4 h-48 border-l border-gray-200">
          {data.weeklyData.map((week, idx) => {
            const height = (week.avgSteps / maxValue) * 100;
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end"
              >
                <div
                  className="w-full bg-gray-400 rounded-t transition-all"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X축 레이블 */}
      <div className="flex items-start">
        <div className="w-12" />
        <div className="flex-1 flex justify-between">
          {data.weeklyData.map((week, idx) => {
            const startDate = new Date(week.weekStart);
            const endDate = new Date(week.weekEnd);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <span className="text-xs text-gray-700">{week.weekNumber}주차</span>
                <span className="text-xs text-gray-400">
                  {startDate.getMonth() + 1}/{startDate.getDate()}-
                  {endDate.getMonth() + 1}/{endDate.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 걸음수 연동 안내 모달
function StepsInfoModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">걸음수 연동안내</h3>
            <button onClick={onClose} className="p-1">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <ul className="space-y-4 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>
                그리팅케어는 단말기의 구글 헬스커넥트, IOS 헬스데이터를 활용하여
                사용자 환경에 따라 걸음수 데이터 차이가 발생할 수 있습니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>
                걸음수 연동시에는 최초 연동 시점 기준으로 과거 15일 데이터를
                불러오고 있습니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>
                안드로이드의 경우 헬스커넥트, 삼성헬스와 모두 연동되어 있을 때
                걸음 수를 정상적으로 연동할 수 있습니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>
                헬스 커넥트 권한을 허용해도 걸음수가 연동되지 않는 경우
                [헬스커넥트 앱→ 앱권한 → 삼성헬스]에서 모든 권한이 허용되었는지
                확인해주세요!
                <br />
                <span className="text-gray-500 text-xs">
                  (헬스 커넥트와 삼성헬스 최초 연동시 최대 1~2시간 소요)
                </span>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>기타 문의 사항은 아래 버튼을 확인해주세요.</span>
            </li>
          </ul>

          <button
            onClick={() => {
              onClose();
              router.push("/menu");
            }}
            className="w-full mt-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700"
          >
            앱 설정 확인
          </button>
        </div>
      </div>
    </div>
  );
}

// ==============================
// 3. 완료한 챌린지 탭
// ==============================
function CompletedChallengesTab() {
  const router = useRouter();

  const { data, isLoading } = useFetch<CompletedChallengesData>(
    "/api/challenges/completed"
  );

  const challenges = data?.completedChallenges || [];

  return (
    <div className="space-y-4 pt-4 pb-4">
      {isLoading ? (
        // 스켈레톤 UI
        <div className="px-4 space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 shadow-sm animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-gray-200 rounded" />
                    <div className="h-6 w-16 bg-gray-200 rounded" />
                  </div>
                  <div className="h-10 w-24 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : challenges.length > 0 ? (
        // 완료한 챌린지 목록
        <div className="px-4 space-y-4">
          {challenges.map((challenge) => (
            <div
              key={challenge.participationId}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {/* 썸네일 */}
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border-4 border-[#E8F5E9]">
                  {challenge.thumbnailUrl ? (
                    <img
                      src={challenge.thumbnailUrl}
                      alt={challenge.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🏆</span>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">
                    {challenge.title}
                  </h4>

                  {/* 태그 */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      하루 {challenge.dailyVerificationCount}번
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {challenge.totalReward}
                    </span>
                  </div>

                  {/* 버튼 */}
                  <button
                    onClick={() => {
                      if (challenge.rankPosition !== null) {
                        // 등수가 있는 챌린지 → 결과 보기
                        router.push(
                          `/challenge/${challenge.challengeId}/verify?showResult=true`
                        );
                      } else {
                        // 일반 완료 챌린지 → 상세 보기
                        router.push(`/challenge/${challenge.challengeId}`);
                      }
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {challenge.rankPosition !== null ? "결과보기" : "상세보기"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 빈 상태
        <div className="flex flex-col items-center justify-center py-32">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            아직 완료한 챌린지가 없어요
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            건강한 습관을 위해 챌린지에 도전해 볼까요?
          </p>
          <button
            onClick={() => router.push("/challenge")}
            className="bg-[#9F85E3] text-white px-6 py-3 rounded-full text-sm font-medium"
          >
            챌린지 보러가기
          </button>
        </div>
      )}
    </div>
  );
}

// ==============================
// 유틸 함수
// ==============================
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(date.getDate()).padStart(2, "0")}`;
}
