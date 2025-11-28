"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Search, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealType = (typeof MEAL_TYPES)[number];

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

const MEAL_ICONS: Record<MealType, string> = {
  breakfast: "☀️",
  lunch: "🌤️",
  dinner: "🌙",
  snack: "🍪",
};

// 적정비율 기준
const OPTIMAL_RATIOS = {
  carbs: { min: 55, max: 65 },
  protein: { min: 7, max: 20 },
  fat: { min: 15, max: 30 },
};

interface MealRecord {
  id: string;
  recordedAt: string; // ISO datetime
  foods: {
    id: string;
    name: string;
    portion: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  }[];
}

interface MealData {
  mealType: MealType;
  records: MealRecord[];
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
}

export default function MealDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateParam =
    searchParams.get("date") || new Date().toISOString().split("T")[0];
  const typeParam = (searchParams.get("type") as MealType) || "breakfast";

  const [selectedDate, setSelectedDate] = useState(dateParam);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(typeParam);
  const [mealData, setMealData] = useState<Record<MealType, MealData | null>>({
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 불러오기
  useEffect(() => {
    const fetchMealData = async () => {
      setIsLoading(true);
      try {
        const data: Record<MealType, MealData | null> = {
          breakfast: null,
          lunch: null,
          dinner: null,
          snack: null,
        };

        for (const mealType of MEAL_TYPES) {
          const response = await fetch(
            `/api/nutrition/meals?date=${selectedDate}&mealType=${mealType}`
          );

          if (response.ok) {
            const result = await response.json();

            if (result.meals && result.meals.length > 0) {
              // 시간별로 그룹화
              const recordsMap = new Map<string, MealRecord>();

              for (const meal of result.meals) {
                const recordedAt =
                  meal.recorded_at ||
                  meal.created_at ||
                  `${selectedDate}T12:00:00`;
                const timeKey = recordedAt.slice(0, 16); // YYYY-MM-DDTHH:MM

                if (!recordsMap.has(timeKey)) {
                  recordsMap.set(timeKey, {
                    id: timeKey,
                    recordedAt: recordedAt,
                    foods: [],
                  });
                }

                recordsMap.get(timeKey)!.foods.push({
                  id: meal.id,
                  name: meal.food_name,
                  portion: meal.serving_size || "1인분",
                  calories: meal.calories || 0,
                  carbs: meal.carbs || 0,
                  protein: meal.protein || 0,
                  fat: meal.fat || 0,
                });
              }

              const records = Array.from(recordsMap.values()).sort(
                (a, b) =>
                  new Date(a.recordedAt).getTime() -
                  new Date(b.recordedAt).getTime()
              );

              const totalCalories = result.meals.reduce(
                (sum: number, m: { calories?: number }) =>
                  sum + (m.calories || 0),
                0
              );
              const totalCarbs = result.meals.reduce(
                (sum: number, m: { carbs?: number }) => sum + (m.carbs || 0),
                0
              );
              const totalProtein = result.meals.reduce(
                (sum: number, m: { protein?: number }) =>
                  sum + (m.protein || 0),
                0
              );
              const totalFat = result.meals.reduce(
                (sum: number, m: { fat?: number }) => sum + (m.fat || 0),
                0
              );

              data[mealType] = {
                mealType,
                records,
                totalCalories,
                totalCarbs,
                totalProtein,
                totalFat,
              };
            }
          }
        }

        setMealData(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealData();
  }, [selectedDate]);

  const currentData = mealData[selectedMealType];

  // 탄단지 비율 계산 (칼로리 기준)
  const calculateRatios = () => {
    if (!currentData || currentData.totalCalories === 0) {
      return { carbs: 0, protein: 0, fat: 0 };
    }

    // 칼로리 환산: 탄수화물 4kcal/g, 단백질 4kcal/g, 지방 9kcal/g
    const carbsCal = currentData.totalCarbs * 4;
    const proteinCal = currentData.totalProtein * 4;
    const fatCal = currentData.totalFat * 9;
    const totalCal = carbsCal + proteinCal + fatCal;

    if (totalCal === 0) return { carbs: 0, protein: 0, fat: 0 };

    return {
      carbs: Math.round((carbsCal / totalCal) * 100),
      protein: Math.round((proteinCal / totalCal) * 100),
      fat: Math.round((fatCal / totalCal) * 100),
    };
  };

  const ratios = calculateRatios();

  // 비율 상태 확인
  const getRatioStatus = (value: number, type: "carbs" | "protein" | "fat") => {
    const range = OPTIMAL_RATIOS[type];
    if (value < range.min) return "low";
    if (value > range.max) return "high";
    return "optimal";
  };

  // 메시지 생성
  const generateMessage = () => {
    if (!currentData || currentData.totalCalories === 0) {
      return [];
    }

    const carbsStatus = getRatioStatus(ratios.carbs, "carbs");
    const proteinStatus = getRatioStatus(ratios.protein, "protein");
    const fatStatus = getRatioStatus(ratios.fat, "fat");

    // 모두 적정
    if (
      carbsStatus === "optimal" &&
      proteinStatus === "optimal" &&
      fatStatus === "optimal"
    ) {
      return ["이번 식사는 탄수화물, 단백질, 지방을 골고루 잘 드셨네요!"];
    }

    const messages: string[] = [];

    // 개별 상태 메시지
    if (carbsStatus === "high") messages.push("탄수화물 비중이 높아요.");
    if (carbsStatus === "low") messages.push("탄수화물 비중이 낮아요.");
    if (proteinStatus === "high") messages.push("단백질 비중이 높아요.");
    if (proteinStatus === "low") messages.push("단백질 비중이 낮아요.");
    if (fatStatus === "high") messages.push("지방 비중이 높아요.");
    if (fatStatus === "low") messages.push("지방 비중이 낮아요.");

    return messages;
  };

  const messages = generateMessage();

  // 시간 포맷팅
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours < 12 ? "AM" : "PM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${period} ${displayHours}:${minutes}`;
  };

  // 수정 페이지로 이동
  const handleEdit = (recordId: string) => {
    router.push(
      `/nutrition/meal/${selectedMealType}/edit?date=${selectedDate}&recordId=${recordId}`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5D84B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button className="p-1">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* 끼니 탭 */}
      <div className="flex border-b border-gray-200 bg-white">
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedMealType(type)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors relative",
              selectedMealType === type ? "text-[#C5D84B]" : "text-gray-500"
            )}
          >
            {MEAL_LABELS[type]}
            {selectedMealType === type && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C5D84B]" />
            )}
          </button>
        ))}
      </div>

      {/* 끼니별 분석 내용 */}
      {currentData && currentData.totalCalories > 0 ? (
        <>
          <div className="bg-white mx-4 mt-4 rounded-xl p-4">
            {/* 상세분석 링크 */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() =>
                  router.push(`/nutrition/analysis?date=${selectedDate}`)
                }
                className="text-sm text-gray-400"
              >
                상세분석 &gt;
              </button>
            </div>

            {/* 칼로리 섭취 */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-[#C5D84B] inline-block" />
              <span className="text-2xl font-bold text-gray-900">
                {currentData.totalCalories}kcal
              </span>
              <span className="text-2xl font-bold text-gray-900">먹었어요</span>
            </div>

            {/* 탄단지 정보 */}
            <div className="flex gap-4 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#C5D84B]" />
                탄수화물 {currentData.totalCarbs.toFixed(1)}g
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#9B8BB5]" />
                단백질 {currentData.totalProtein.toFixed(1)}g
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                지방 {currentData.totalFat.toFixed(1)}g
              </span>
            </div>

            {/* 탄단지 비율 그래프 */}
            <div className="mb-3">
              <div className="flex h-8 rounded-lg overflow-hidden">
                <div
                  className="bg-[#C5D84B] flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${ratios.carbs}%` }}
                >
                  {ratios.carbs > 10 && `${ratios.carbs}%`}
                </div>
                <div
                  className="bg-[#9B8BB5] flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${ratios.protein}%` }}
                >
                  {ratios.protein > 10 && `${ratios.protein}%`}
                </div>
                <div
                  className="bg-gray-400 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${ratios.fat}%` }}
                >
                  {ratios.fat > 10 && `${ratios.fat}%`}
                </div>
              </div>
            </div>

            {/* 메시지 */}
            <div className="space-y-1">
              {messages.map((msg, idx) => (
                <p key={idx} className="text-sm text-gray-600">
                  ◦ {msg}
                </p>
              ))}
            </div>
          </div>

          {/* 식사기록 리스트 */}
          <div className="px-4 mt-4 space-y-4">
            {currentData.records.map((record) => (
              <div key={record.id}>
                {/* 시간 헤더 */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {formatTime(record.recordedAt)}
                  </span>
                  <button onClick={() => handleEdit(record.id)} className="p-1">
                    <Pencil className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* 식사 카드 */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  {record.foods.map((food, idx) => (
                    <div
                      key={food.id}
                      className={cn(
                        "flex items-start gap-3",
                        idx > 0 && "mt-3 pt-3 border-t border-gray-100"
                      )}
                    >
                      {idx === 0 && (
                        <span className="text-2xl">
                          {MEAL_ICONS[selectedMealType]}
                        </span>
                      )}
                      {idx > 0 && <span className="w-8" />}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{food.name}</p>
                        <p className="text-xs text-gray-500">{food.portion}</p>
                      </div>
                      <span className="text-sm text-gray-600">
                        {food.calories}kcal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-4xl mb-4">🥗</span>
          <p className="text-gray-500">기록된 식사가 없습니다.</p>
          <button
            onClick={() =>
              router.push(
                `/nutrition/meal/${selectedMealType}?date=${selectedDate}`
              )
            }
            className="mt-4 px-6 py-2 bg-[#C5D84B] text-white rounded-full text-sm font-medium"
          >
            식사 기록하기
          </button>
        </div>
      )}
    </div>
  );
}

