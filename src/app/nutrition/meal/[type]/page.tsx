"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ChevronLeft, Search, Camera, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  servingSize: string;
  isSelected: boolean;
  quantity: number;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

// 샘플 음식 데이터
const SAMPLE_FOODS: FoodItem[] = [
  { id: "1", name: "흰쌀밥", calories: 300, carbs: 65, protein: 5, fat: 0.5, servingSize: "1공기 (210g)", isSelected: false, quantity: 1 },
  { id: "2", name: "된장찌개", calories: 120, carbs: 8, protein: 8, fat: 6, servingSize: "1인분 (200g)", isSelected: false, quantity: 1 },
  { id: "3", name: "김치", calories: 15, carbs: 3, protein: 1, fat: 0.3, servingSize: "1접시 (50g)", isSelected: false, quantity: 1 },
  { id: "4", name: "계란프라이", calories: 90, carbs: 1, protein: 6, fat: 7, servingSize: "1개", isSelected: false, quantity: 1 },
  { id: "5", name: "닭가슴살", calories: 165, carbs: 0, protein: 31, fat: 3.6, servingSize: "100g", isSelected: false, quantity: 1 },
  { id: "6", name: "사과", calories: 52, carbs: 14, protein: 0.3, fat: 0.2, servingSize: "1개 (150g)", isSelected: false, quantity: 1 },
  { id: "7", name: "바나나", calories: 89, carbs: 23, protein: 1.1, fat: 0.3, servingSize: "1개 (120g)", isSelected: false, quantity: 1 },
  { id: "8", name: "우유", calories: 60, carbs: 5, protein: 3, fat: 3, servingSize: "1컵 (200ml)", isSelected: false, quantity: 1 },
];

export default function MealRecordPage() {
  const router = useRouter();
  const params = useParams();
  const mealType = params.type as string;
  const mealLabel = MEAL_LABELS[mealType] || "식사";

  const [searchQuery, setSearchQuery] = useState("");
  const [foods, setFoods] = useState<FoodItem[]>(SAMPLE_FOODS);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 선택된 음식들
  const selectedFoods = foods.filter((f) => f.isSelected);
  const totalCalories = selectedFoods.reduce((sum, f) => sum + f.calories * f.quantity, 0);
  const totalCarbs = selectedFoods.reduce((sum, f) => sum + f.carbs * f.quantity, 0);
  const totalProtein = selectedFoods.reduce((sum, f) => sum + f.protein * f.quantity, 0);
  const totalFat = selectedFoods.reduce((sum, f) => sum + f.fat * f.quantity, 0);

  // 음식 검색
  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 음식 선택/해제
  const toggleFood = (foodId: string) => {
    setFoods((prev) =>
      prev.map((f) =>
        f.id === foodId ? { ...f, isSelected: !f.isSelected } : f
      )
    );
  };

  // 수량 변경
  const updateQuantity = (foodId: string, delta: number) => {
    setFoods((prev) =>
      prev.map((f) =>
        f.id === foodId
          ? { ...f, quantity: Math.max(1, f.quantity + delta) }
          : f
      )
    );
  };

  // 식사 기록 저장
  const saveMealRecord = async () => {
    if (selectedFoods.length === 0) {
      alert("음식을 선택해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: API 호출로 대체
      const response = await fetch("/api/nutrition/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType,
          mealDate: new Date().toISOString().split("T")[0],
          foods: selectedFoods.map((f) => ({
            name: f.name,
            calories: f.calories * f.quantity,
            carbs: f.carbs * f.quantity,
            protein: f.protein * f.quantity,
            fat: f.fat * f.quantity,
            servingSize: f.servingSize,
            quantity: f.quantity,
          })),
          totalCalories,
          totalCarbs,
          totalProtein,
          totalFat,
        }),
      });

      if (response.ok) {
        router.push("/nutrition");
      } else {
        throw new Error("저장 실패");
      }
    } catch (error) {
      console.error(error);
      // 임시로 성공 처리
      router.push("/nutrition");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{mealLabel} 기록</h1>
          <div className="w-8" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* 검색 바 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="음식 이름으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7B9B5C]"
          />
        </div>

        {/* 사진으로 기록하기 */}
        <button className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-[#7B9B5C]/30 rounded-xl py-6 text-[#7B9B5C]">
          <Camera className="w-5 h-5" />
          <span className="font-medium">사진으로 간편하게 기록하기</span>
        </button>

        {/* 선택된 음식 */}
        {selectedFoods.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">선택된 음식</h3>
            <div className="space-y-3">
              {selectedFoods.map((food) => (
                <div key={food.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{food.name}</p>
                    <p className="text-xs text-gray-500">
                      {food.calories * food.quantity}kcal · {food.servingSize}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(food.id, -1)}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                      <span className="text-gray-600">-</span>
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {food.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(food.id, 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                      <span className="text-gray-600">+</span>
                    </button>
                    <button
                      onClick={() => toggleFood(food.id)}
                      className="ml-2 p-1"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 음식 목록 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">음식 목록</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredFoods.map((food) => (
              <button
                key={food.id}
                onClick={() => toggleFood(food.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <p className="font-medium text-gray-800">{food.name}</p>
                  <p className="text-xs text-gray-500">
                    {food.calories}kcal · {food.servingSize}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    food.isSelected
                      ? "bg-[#7B9B5C] border-[#7B9B5C]"
                      : "border-gray-300"
                  )}
                >
                  {food.isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 요약 및 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 space-y-3">
        {selectedFoods.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">총 칼로리</span>
            <span className="font-bold text-gray-800">{totalCalories}kcal</span>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
          >
            취소
          </button>
          <button
            onClick={saveMealRecord}
            disabled={selectedFoods.length === 0 || isLoading}
            className={cn(
              "flex-1 py-3 rounded-xl font-medium transition-colors",
              selectedFoods.length > 0
                ? "bg-[#7B9B5C] text-white"
                : "bg-gray-200 text-gray-400"
            )}
          >
            {isLoading ? "저장 중..." : "기록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

