"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisPageSkeleton } from "@/components/ui/LoadingSpinner";

interface NutrientData {
  name: string;
  nameKo: string;
  status: "adequate" | "excessive" | "deficient";
  value: number;
  min: number;
  max: number;
  unit: string;
}

interface AnalysisData {
  dailyCalories: {
    consumed: number;
    target: number;
    burned: number;
  };
  nutrients: NutrientData[];
  message?: string; // 기록 부족 시 안내 메시지
}

export default function NutritionAnalysisPage() {
  const router = useRouter();
  const [analysisPeriod, setAnalysisPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      setIsLoading(true);
      try {
        const dateStr = selectedDate.toISOString().split("T")[0];
        const response = await fetch(
          `/api/nutrition/analysis?date=${dateStr}&period=${analysisPeriod}`
        );

        if (response.ok) {
          const data = await response.json();
          setAnalysisData(data);
        } else {
          // API 실패 시 빈 데이터
          setAnalysisData({
            dailyCalories: { consumed: 0, target: 2100, burned: 0 },
            nutrients: [],
          });
        }
      } catch (error) {
        console.error("Analysis data fetch error:", error);
        setAnalysisData({
          dailyCalories: { consumed: 0, target: 2100, burned: 0 },
          nutrients: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisData();
  }, [selectedDate, analysisPeriod]);

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
    return `${month}.${day} (${weekday})`;
  };

  // 기간별 날짜 범위 텍스트
  const getDateRangeText = () => {
    if (analysisPeriod === "daily") {
      return formatDate(selectedDate);
    } else if (analysisPeriod === "weekly") {
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 6);
      return `${formatDate(startDate)} ~ ${formatDate(selectedDate)}`;
    } else {
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 29);
      return `${formatDate(startDate)} ~ ${formatDate(selectedDate)}`;
    }
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    if (analysisPeriod === "daily") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (analysisPeriod === "weekly") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 30);
    }
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    if (analysisPeriod === "daily") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (analysisPeriod === "weekly") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 30);
    }
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const consumptionRate = analysisData
    ? Math.round(
        (analysisData.dailyCalories.consumed /
          analysisData.dailyCalories.target) *
          100
      )
    : 0;

  if (isLoading) {
    return <AnalysisPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">상세분석</h1>
          <div className="w-8" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* 기간 선택 */}
        <div className="flex gap-2">
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

        {/* 날짜 선택 */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={goToPreviousDay} className="p-2">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-center">
            {getDateRangeText()}
          </span>
          <button onClick={goToNextDay} className="p-2">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 칼로리 원형 그래프 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-44 h-44">
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
                  strokeDasharray={`${
                    Math.min(consumptionRate, 100) * 2.51
                  } 251`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {analysisData?.dailyCalories.consumed.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400">kcal</span>
                <span className="text-xs text-gray-400">
                  /{analysisData?.dailyCalories.target.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="flex items-center gap-1 mt-4 text-sm text-gray-500">
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

          {/* 기록 부족 메시지 */}
          {analysisData?.message && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-yellow-700 text-sm">{analysisData.message}</p>
            </div>
          )}

          {/* 영양소 분석 */}
          <div className="space-y-4">
            {(!analysisData?.nutrients ||
              analysisData.nutrients.length === 0) &&
            !analysisData?.message ? (
              <div className="text-center py-8 text-gray-400">
                <p>🥗 식사기록을 시작해주세요</p>
              </div>
            ) : (
              analysisData?.nutrients.map((nutrient) => {
                const percentage = Math.min(
                  (nutrient.value / nutrient.max) * 100,
                  100
                );
                const isExcessive = nutrient.status === "excessive";
                const isDeficient = nutrient.status === "deficient";

                return (
                  <div
                    key={nutrient.name}
                    className="border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {nutrient.nameKo}
                      </span>
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
                        {isExcessive ? "과다" : isDeficient ? "부족" : "적정"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-12">
                        {nutrient.value}
                        {nutrient.unit}
                      </span>
                      <div className="flex-1 relative h-2 bg-gray-200 rounded-full overflow-hidden">
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
                        {/* 적정 범위 표시 */}
                        <div
                          className="absolute top-0 h-full bg-gray-400/30"
                          style={{
                            left: `${(nutrient.min / nutrient.max) * 100}%`,
                            width: `${
                              ((nutrient.max - nutrient.min) / nutrient.max) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>부족</span>
                      <span>
                        적정 ({nutrient.min}-{nutrient.max}
                        {nutrient.unit})
                      </span>
                      <span>과다</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
