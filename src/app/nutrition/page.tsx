"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  Star,
  Info,
  Plus,
  Check,
  Salad,
} from "lucide-react";
import { Header } from "@/components/home/Header";
import { BottomNavigation } from "@/components/home/BottomNavigation";
import { cn } from "@/lib/utils";

// 타입 정의
interface MealStatus {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  status: "not_recorded" | "recorded" | "skipped";
  calories: number;
  targetCalories: number;
}

interface NutrientStatus {
  name: string;
  nameKo: string;
  status: "adequate" | "excessive" | "deficient";
  value: number;
  min: number;
  max: number;
  unit: string;
  needsAttention: boolean;
}

interface NutritionData {
  user: {
    name: string;
    points: number;
    diseases: string[];
  };
  eatScore: number | null;
  hasNutritionDiagnosis: boolean;
  warningNutrients: string[];
  diagnosisType: string | null;
  meals: MealStatus[];
  dailyCalories: {
    consumed: number;
    target: number;
    burned: number;
  };
  nutrients: NutrientStatus[];
}

// 끼니 아이콘 및 라벨
const MEAL_CONFIG = {
  breakfast: { label: "아침", icon: "🌅", color: "bg-orange-100" },
  lunch: { label: "점심", icon: "☀️", color: "bg-yellow-100" },
  dinner: { label: "저녁", icon: "🌙", color: "bg-indigo-100" },
  snack: { label: "간식", icon: "🍪", color: "bg-pink-100" },
};

// 요일
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 질병 맵
const DISEASE_MAP: Record<string, string> = {
  diabetes: "당뇨",
  hypertension: "고혈압",
  hyperlipidemia: "고중성지방혈증",
  hypercholesterolemia: "고콜레스테롤혈증",
  fatty_liver: "지방간",
  osteoporosis: "골다공증",
  obesity: "비만",
};

// 질병별 주의 영양소
const DISEASE_WARNINGS: Record<string, string[]> = {
  diabetes: ["당류", "포화지방"],
  hypertension: ["포화지방", "콜레스테롤", "나트륨"],
  osteoporosis: ["나트륨", "지방"],
  obesity: ["지방", "당류", "나트륨"],
  fatty_liver: ["당류", "지방", "탄수화물"],
  hypercholesterolemia: ["포화지방", "콜레스테롤"],
  hyperlipidemia: ["지방", "포화지방", "당류"],
};

export default function NutritionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "todayMenu" | "meal" | "supplement"
  >("meal");
  const [isFsMember, setIsFsMember] = useState(false); // FS회원 여부
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [analysisPeriod, setAnalysisPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // 주간 날짜 계산
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [selectedDate]);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const dateStr = selectedDate.toISOString().split("T")[0];
        const response = await fetch(`/api/nutrition?date=${dateStr}`);

        if (response.ok) {
          const data = await response.json();
          setNutritionData(data);
          // FS 회원 여부 설정
          setIsFsMember(data.user?.isFsMember || false);
        } else {
          // API 실패 시 기본값 설정
          setNutritionData(getDefaultNutritionData());
        }
      } catch (error) {
        console.error("Nutrition data fetch error:", error);
        setNutritionData(getDefaultNutritionData());
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  // 기본 영양 데이터
  const getDefaultNutritionData = (): NutritionData => ({
    user: {
      name: "사용자",
      points: 0,
      diseases: [],
    },
    eatScore: null,
    hasNutritionDiagnosis: false,
    warningNutrients: [],
    diagnosisType: null,
    meals: [
      {
        type: "breakfast",
        status: "not_recorded",
        calories: 0,
        targetCalories: 500,
      },
      {
        type: "lunch",
        status: "not_recorded",
        calories: 0,
        targetCalories: 500,
      },
      {
        type: "dinner",
        status: "not_recorded",
        calories: 0,
        targetCalories: 500,
      },
      {
        type: "snack",
        status: "not_recorded",
        calories: 0,
        targetCalories: 225,
      },
    ],
    dailyCalories: { consumed: 0, target: 2100, burned: 0 },
    nutrients: [],
  });

  // 안먹음 기록 핸들러
  const handleSkipMeal = async (mealType: string) => {
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      await fetch(
        `/api/nutrition/meals?mealType=${mealType}&mealDate=${dateStr}`,
        {
          method: "DELETE",
        }
      );
      // 데이터 새로고침
      const response = await fetch(`/api/nutrition?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        setNutritionData(data);
      }
    } catch (error) {
      console.error("Skip meal error:", error);
    }
  };

  // 날짜 포맷
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  // 섭취율 계산
  const consumptionRate = nutritionData
    ? Math.round(
        (nutritionData.dailyCalories.consumed /
          nutritionData.dailyCalories.target) *
          100
      )
    : 0;

  // 질병 기반 안내 메시지 생성
  const getGuidanceMessage = () => {
    if (!nutritionData?.user.diseases.length) return null;
    const disease = nutritionData.user.diseases[0];
    const diseaseName = DISEASE_MAP[disease] || disease;
    const warnings = DISEASE_WARNINGS[disease] || [];
    return {
      disease: diseaseName,
      nutrients: warnings,
    };
  };

  const guidance = getGuidanceMessage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F85E3]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* 공통 헤더 */}
      <Header points={nutritionData?.user.points || 0} />

      {/* 탭 네비게이션 */}
      <div className="sticky top-[56px] z-10 bg-white border-b border-gray-100">
        <div className="flex">
          {/* 오늘의 메뉴 탭 - FS회원에게만 노출 */}
          {isFsMember && (
            <button
              onClick={() => setActiveTab("todayMenu")}
              className={cn(
                "flex-1 py-3 text-center text-sm font-medium transition-colors relative",
                activeTab === "todayMenu" ? "text-gray-900" : "text-gray-400"
              )}
            >
              오늘의 메뉴
              {activeTab === "todayMenu" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-[#7B9B5C]" />
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab("meal")}
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium transition-colors relative",
              activeTab === "meal" ? "text-gray-900" : "text-gray-400"
            )}
          >
            식사 기록
            {activeTab === "meal" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-[#7B9B5C]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("supplement")}
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium transition-colors relative",
              activeTab === "supplement" ? "text-gray-900" : "text-gray-400"
            )}
          >
            영양제
            {activeTab === "supplement" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-[#7B9B5C]" />
            )}
          </button>
        </div>
      </div>

      {activeTab === "todayMenu" && isFsMember ? (
        <TodayMenuTab selectedDate={selectedDate} />
      ) : activeTab === "meal" ? (
        <div className="space-y-4 pt-4">
          {/* 날짜 선택 */}
          <div className="px-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              {/* 년월 선택 */}
              <button
                onClick={() => setShowMonthPicker(true)}
                className="flex items-center gap-1 mb-3"
              >
                <ChevronDown className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">
                  {formatDate(selectedDate)}
                </span>
              </button>

              {/* 주간 캘린더 */}
              <div className="flex justify-between">
                {weekDates.map((date, idx) => {
                  const isSelected =
                    date.toDateString() === selectedDate.toDateString();
                  const isToday =
                    date.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className={cn(
                          "text-xs",
                          idx === 0
                            ? "text-red-400"
                            : idx === 6
                            ? "text-blue-400"
                            : "text-gray-400"
                        )}
                      >
                        {WEEKDAYS[idx]}
                      </span>
                      <span
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                          isSelected
                            ? "bg-[#7B9B5C] text-white"
                            : isToday
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600"
                        )}
                      >
                        {date.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 식사분석 (영양진단 영역) */}
          <div className="px-4">
            <div className="bg-[#F8F9E8] rounded-2xl p-4 shadow-sm border border-[#E8EBC8]">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                식사분석
              </h3>

              {nutritionData?.hasNutritionDiagnosis ? (
                <>
                  {/* 잇스코어 표시 */}
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-[#7B9B5C] fill-[#7B9B5C]" />
                    <span className="text-lg font-bold">
                      나의 잇스코어 점수는{" "}
                      <span className="text-[#7B9B5C]">
                        {nutritionData.eatScore || 0}점
                      </span>
                    </span>
                  </div>

                  {/* 질병 기반 안내 메시지 */}
                  {guidance && (
                    <p className="text-sm text-gray-700 mb-3">
                      <span className="font-medium">
                        {nutritionData.user.name}님
                      </span>{" "}
                      <span className="text-[#7B9B5C] font-medium">
                        {guidance.disease}
                      </span>{" "}
                      관리를 위해{" "}
                      <span className="text-[#7B9B5C] font-medium">
                        {guidance.nutrients.join(", ")}
                      </span>{" "}
                      섭취를 특별히 주의해야해요!
                    </p>
                  )}

                  {/* 진단 유형 안내 (질병이 없는 경우) */}
                  {!guidance && nutritionData.diagnosisType && (
                    <p className="text-sm text-gray-700 mb-3">
                      <span className="font-medium">
                        {nutritionData.user.name}님
                      </span>
                      의 식습관은{" "}
                      <span className="text-[#7B9B5C] font-medium">
                        {nutritionData.diagnosisType}
                      </span>
                      유형으로{" "}
                      <span className="text-[#7B9B5C] font-medium">
                        {nutritionData.warningNutrients?.join(", ")}
                      </span>{" "}
                      섭취에 좀더 주의를 기울여주세요!
                    </p>
                  )}

                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => router.push("/nutrition/diagnosis-result")}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#7B9B5C] text-white py-3 rounded-xl text-sm font-medium"
                    >
                      <Salad className="w-4 h-4" />
                      영양진단 결과보기
                    </button>
                    <button
                      onClick={() => router.push("/nutrition/recommendation")}
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 py-3 rounded-xl text-sm font-medium border border-gray-200"
                    >
                      🍽️ 맞춤 상품 추천받기
                    </button>
                  </div>

                  <button className="text-sm text-gray-500 flex items-center gap-1">
                    이전 내역 확인하기 <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-[#7B9B5C]" />
                    <span className="text-lg font-bold">
                      나의 잇스코어 점수는 __점
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    나의 식습관이 궁금하다면?
                  </p>
                  <button
                    onClick={() => router.push("/nutrition/diagnosis")}
                    className="bg-[#7B9B5C] text-white px-6 py-2 rounded-full text-sm font-medium"
                  >
                    영양진단 하러가기
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 식사 추가 */}
          <div className="px-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                식사 추가
              </h3>

              <div className="grid grid-cols-4 gap-2">
                {nutritionData?.meals.map((meal) => {
                  const config = MEAL_CONFIG[meal.type];
                  const isRecorded = meal.status === "recorded";
                  const isSkipped = meal.status === "skipped";

                  return (
                    <div key={meal.type} className="flex flex-col">
                      <button
                        onClick={() => {
                          if (isRecorded) {
                            router.push(
                              `/nutrition/meal/${meal.type}/edit?date=${
                                selectedDate.toISOString().split("T")[0]
                              }`
                            );
                          } else if (isSkipped) {
                            router.push(
                              `/nutrition/meal/${meal.type}/edit?date=${
                                selectedDate.toISOString().split("T")[0]
                              }`
                            );
                          } else {
                            router.push(`/nutrition/meal/${meal.type}`);
                          }
                        }}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-2xl transition-colors relative",
                          isRecorded
                            ? "bg-[#7B9B5C]/10"
                            : isSkipped
                            ? "bg-gray-100"
                            : config.color
                        )}
                      >
                        <span className="text-2xl mb-1">{config.icon}</span>
                        <span className="text-xs font-medium text-gray-700">
                          {config.label}
                        </span>
                        {isRecorded && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-4 h-4 text-[#7B9B5C]" />
                          </div>
                        )}
                        {!isRecorded && !isSkipped && (
                          <div className="absolute top-2 right-2">
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <span
                          className={cn(
                            "text-xs mt-1",
                            isRecorded
                              ? "text-[#7B9B5C]"
                              : isSkipped
                              ? "text-gray-400"
                              : "text-gray-500"
                          )}
                        >
                          {isSkipped
                            ? "안먹었어요"
                            : isRecorded
                            ? `${meal.calories}/${meal.targetCalories}kcal`
                            : ""}
                        </span>
                      </button>
                      {/* 안먹었어요 버튼 */}
                      {!isRecorded && !isSkipped && (
                        <button
                          onClick={() => handleSkipMeal(meal.type)}
                          className="text-xs text-gray-400 mt-1 hover:text-gray-600"
                        >
                          안먹었어요✓
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 식사 분석 */}
          <div className="px-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  식사 분석
                </h3>
                <button
                  onClick={() => router.push("/nutrition/analysis")}
                  className="text-xs text-gray-500 flex items-center gap-1"
                >
                  상세분석 <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* 기간 선택 탭 */}
              <div className="flex gap-2 mb-6">
                {[
                  { key: "daily", label: "당일분석" },
                  { key: "weekly", label: "일주일분석" },
                  { key: "monthly", label: "한달분석" },
                ].map((period) => (
                  <button
                    key={period.key}
                    onClick={() =>
                      setAnalysisPeriod(period.key as typeof analysisPeriod)
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                      analysisPeriod === period.key
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {/* 칼로리 원형 그래프 */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-40 h-40">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#9F85E3"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${
                        Math.min(consumptionRate, 100) * 2.51
                      } 251`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {nutritionData?.dailyCalories.consumed.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-400">kcal</span>
                    <span className="text-xs text-gray-400">
                      /{nutritionData?.dailyCalories.target.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 섭취/소모 칼로리 */}
                <div className="flex items-center gap-8 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍳</span>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">섭취한 칼로리</p>
                      <p className="text-lg font-bold text-gray-900">
                        {nutritionData?.dailyCalories.consumed}{" "}
                        <span className="text-xs font-normal">kcal</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏃</span>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">소모한 칼로리</p>
                      <p className="text-lg font-bold text-gray-900">
                        {nutritionData?.dailyCalories.burned}{" "}
                        <span className="text-xs font-normal">kcal</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 안내 메시지 */}
                <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
                  <Info className="w-4 h-4" />
                  <span>
                    권장열량 대비{" "}
                    {consumptionRate < 100
                      ? `${100 - consumptionRate}% 부족하게`
                      : `${consumptionRate - 100}% 과다하게`}{" "}
                    섭취했어요.
                  </span>
                </div>
              </div>

              {/* 관리가 필요한 영양소 */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-sm font-medium text-[#7B9B5C]">
                    🥬 관리가 필요한 영양소!
                  </span>
                </div>

                {/* 영양소 바 차트 */}
                <div className="space-y-3">
                  {nutritionData?.nutrients.map((nutrient) => {
                    const percentage = Math.min(
                      (nutrient.value / nutrient.max) * 100,
                      100
                    );
                    const isExcessive = nutrient.status === "excessive";
                    const isDeficient = nutrient.status === "deficient";

                    return (
                      <div
                        key={nutrient.name}
                        className={cn(
                          "p-3 rounded-xl",
                          nutrient.needsAttention
                            ? "bg-orange-50 border border-orange-200"
                            : "bg-gray-50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {nutrient.needsAttention && (
                              <span className="text-orange-500">⚠️</span>
                            )}
                            <span className="text-sm font-medium">
                              {nutrient.nameKo}
                            </span>
                            {nutrient.needsAttention && (
                              <Info className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                isExcessive
                                  ? "bg-red-100 text-red-600"
                                  : isDeficient
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-green-100 text-green-600"
                              )}
                            >
                              {isExcessive
                                ? "과다"
                                : isDeficient
                                ? "부족"
                                : "적정"}
                            </span>
                          </div>
                        </div>

                        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "absolute left-0 top-0 h-full rounded-full transition-all",
                              isExcessive
                                ? "bg-red-400"
                                : isDeficient
                                ? "bg-blue-400"
                                : "bg-green-400"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                          {/* 적정 범위 마커 */}
                          <div
                            className="absolute top-0 h-full border-l-2 border-gray-400"
                            style={{
                              left: `${(nutrient.min / nutrient.max) * 100}%`,
                            }}
                          />
                        </div>

                        <div className="flex justify-between mt-1 text-xs text-gray-400">
                          <span>부족</span>
                          <span>
                            적정 ({nutrient.min}-{nutrient.max}
                            {nutrient.unit})
                          </span>
                          <span>과다</span>
                        </div>

                        <div className="text-right text-xs text-gray-600 mt-1">
                          {nutrient.value}
                          {nutrient.unit}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 영양제 탭 */
        <SupplementTab />
      )}

      {/* 월 선택 팝업 */}
      {showMonthPicker && (
        <MonthPickerModal
          selectedDate={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date);
            setShowMonthPicker(false);
          }}
          onClose={() => setShowMonthPicker(false)}
        />
      )}

      <BottomNavigation />
    </div>
  );
}

// 영양제 탭 컴포넌트
function SupplementTab() {
  const router = useRouter();
  const [supplements, setSupplements] = useState<
    {
      id: string;
      name: string;
      dosage: string;
      timeSlot: string;
      isTaken: boolean;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const TIME_SLOT_LABELS: Record<string, string> = {
    morning: "아침 식후",
    lunch: "점심 식후",
    dinner: "저녁 식후",
    before_sleep: "취침 전",
  };

  useEffect(() => {
    const fetchSupplements = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/nutrition/supplements");
        if (response.ok) {
          const data = await response.json();
          const formattedSupplements = (data.supplements || []).map(
            (s: {
              id: string;
              name: string;
              dosage: string;
              timeSlot: string;
              isTaken: boolean;
            }) => ({
              ...s,
              timeSlot: TIME_SLOT_LABELS[s.timeSlot] || s.timeSlot,
            })
          );
          setSupplements(formattedSupplements);
        }
      } catch (error) {
        console.error("Supplements fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplements();
  }, []);

  // 복용 토글
  const toggleTaken = async (supplementId: string) => {
    try {
      await fetch("/api/nutrition/supplements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routineId: supplementId,
          action: "toggleTaken",
        }),
      });
      // 로컬 상태 업데이트
      setSupplements((prev) =>
        prev.map((s) =>
          s.id === supplementId ? { ...s, isTaken: !s.isTaken } : s
        )
      );
    } catch (error) {
      console.error("Toggle taken error:", error);
    }
  };

  const takenCount = supplements.filter((s) => s.isTaken).length;
  const totalCount = supplements.length;
  const completionRate =
    totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9F85E3]" />
      </div>
    );
  }

  if (supplements.length === 0) {
    return (
      <div className="px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">💊</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            챙겨먹는 영양제가 있나요?
          </h3>
          <p className="text-sm text-gray-500 mb-6">아직 기록이 없어요</p>
          <button
            onClick={() => router.push("/nutrition/supplement/routine")}
            className="inline-flex items-center gap-2 bg-[#9F85E3] text-white px-6 py-3 rounded-xl font-medium"
          >
            <Plus className="w-5 h-5" />
            영양제 루틴 등록하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* 섭취 완료율 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">섭취 완료율</span>
          <span className="text-sm text-gray-500">
            {takenCount}개 남았어요!
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#9F85E3"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${completionRate * 2.51} 251`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900">
                {completionRate}%
              </span>
            </div>
          </div>

          <div className="flex-1">
            <button
              onClick={() => router.push("/nutrition/supplement/log")}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 py-3 rounded-xl text-sm font-medium text-gray-700"
            >
              영양제 <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 영양제 목록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">오늘의 영양제</h3>
          <button
            onClick={() => router.push("/nutrition/supplement/routine")}
            className="text-[#9F85E3]"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {supplements.map((supplement) => (
            <div
              key={supplement.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    supplement.isTaken ? "bg-[#9F85E3]/10" : "bg-gray-100"
                  )}
                >
                  <span className="text-lg">💊</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{supplement.name}</p>
                  <p className="text-sm text-gray-500">
                    {supplement.dosage} · {supplement.timeSlot}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleTaken(supplement.id)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                  supplement.isTaken
                    ? "bg-[#9F85E3] border-[#9F85E3]"
                    : "border-gray-300 hover:border-[#9F85E3]"
                )}
              >
                {supplement.isTaken && <Check className="w-4 h-4 text-white" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 오늘의 메뉴 탭 컴포넌트 (FS회원 전용)
function TodayMenuTab({ selectedDate }: { selectedDate: Date }) {
  const router = useRouter();
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("lunch");
  const [menus, setMenus] = useState<
    {
      id: string;
      cornerName: string;
      menuName: string;
      calories: number;
      image?: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // 현재 시간에 따른 기본 끼니 설정
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) {
      setSelectedMealType("breakfast");
    } else if (hour >= 11 && hour < 16) {
      setSelectedMealType("lunch");
    } else if (hour >= 16 && hour < 21) {
      setSelectedMealType("dinner");
    } else {
      setSelectedMealType("breakfast"); // 다음날 아침
    }
  }, []);

  // 메뉴 데이터 로드
  useEffect(() => {
    const fetchMenus = async () => {
      setIsLoading(true);
      try {
        // TODO: 실제 API 호출로 대체
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 샘플 데이터
        setMenus([
          {
            id: "1",
            cornerName: "A코너",
            menuName: "매콤순대볶음",
            calories: 945,
            image: "/images/meal-order-01.jpg",
          },
          {
            id: "2",
            cornerName: "B코너",
            menuName: "황태콩나물 해장국",
            calories: 860,
            image: "/images/meal-order-02.jpg",
          },
          {
            id: "3",
            cornerName: "C코너",
            menuName: "유니짜장면",
            calories: 1110,
            image: undefined,
          },
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();
  }, [selectedDate, selectedMealType]);

  const MEAL_TYPES = [
    { value: "breakfast", label: "아침" },
    { value: "lunch", label: "점심" },
    { value: "dinner", label: "저녁" },
    { value: "snack", label: "야식" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7B9B5C]" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* 끼니 선택 */}
      <div className="flex gap-2">
        {MEAL_TYPES.map((meal) => (
          <button
            key={meal.value}
            onClick={() =>
              setSelectedMealType(meal.value as typeof selectedMealType)
            }
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
              selectedMealType === meal.value
                ? "bg-[#7B9B5C] text-white"
                : "bg-gray-100 text-gray-600"
            )}
          >
            {meal.label}
          </button>
        ))}
      </div>

      {/* 메뉴 목록 */}
      <div className="grid grid-cols-2 gap-3">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="aspect-square bg-gray-100 relative">
              {menu.image ? (
                <img
                  src={menu.image}
                  alt={menu.menuName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-4xl">🍽️</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{menu.cornerName}</span>
                <span>{menu.calories}kcal</span>
              </div>
              <p className="font-medium text-gray-800 text-sm mb-2">
                {menu.menuName}
              </p>
              <button
                onClick={() => {
                  // 해당 메뉴로 식사 기록 페이지 이동
                  router.push(
                    `/nutrition/meal/${selectedMealType}?menu=${menu.id}`
                  );
                }}
                className="w-full py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700"
              >
                식사기록
              </button>
            </div>
          </div>
        ))}
      </div>

      {menus.length === 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            등록된 메뉴가 없어요
          </h3>
          <p className="text-sm text-gray-500">
            오늘의 메뉴가 아직 등록되지 않았습니다.
          </p>
        </div>
      )}
    </div>
  );
}

// 월 선택 모달
function MonthPickerModal({
  selectedDate,
  onSelect,
  onClose,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}) {
  const [year, setYear] = useState(selectedDate.getFullYear());
  const [month, setMonth] = useState(selectedDate.getMonth());

  const years = Array.from({ length: 5 }, (_, i) => 2023 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl w-full max-w-md p-6 pb-8 animate-slide-up">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="flex gap-4 mb-6">
          {/* 년도 선택 */}
          <div className="flex-1 h-48 overflow-y-auto">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={cn(
                  "w-full py-3 text-center text-lg transition-colors",
                  year === y ? "font-bold text-gray-900" : "text-gray-400"
                )}
              >
                {y}년
              </button>
            ))}
          </div>

          {/* 월 선택 */}
          <div className="flex-1 h-48 overflow-y-auto">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setMonth(m)}
                className={cn(
                  "w-full py-3 text-center text-lg transition-colors",
                  month === m ? "font-bold text-gray-900" : "text-gray-400"
                )}
              >
                {String(m + 1).padStart(2, "0")}월
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            const newDate = new Date(year, month, 1);
            onSelect(newDate);
          }}
          className="w-full bg-gray-800 text-white py-4 rounded-xl font-medium"
        >
          선택
        </button>
      </div>
    </div>
  );
}
