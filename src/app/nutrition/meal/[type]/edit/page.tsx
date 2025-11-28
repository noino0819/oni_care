"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ChevronLeft, Plus, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodRecord {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
  saturatedFat: number;
  cholesterol: number;
  servingSize: string;
  quantity: number;
  isDeleted?: boolean; // 삭제 표시용
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

export default function MealEditPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const mealType = params.type as string;
  const mealLabel = MEAL_LABELS[mealType] || "식사";
  const mealDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const [foods, setFoods] = useState<FoodRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 기존 식사 기록 불러오기
  useEffect(() => {
    const fetchMealRecord = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/nutrition/meals?date=${mealDate}&mealType=${mealType}`
        );

        if (response.ok) {
          const data = await response.json();
          // API 응답을 FoodRecord 형태로 변환
          const formattedFoods: FoodRecord[] = (data.meals || []).map(
            (meal: {
              id: string;
              food_name: string;
              calories: number;
              carbs: number;
              protein: number;
              fat: number;
              fiber: number;
              sodium: number;
              sugar: number;
              saturated_fat: number;
              cholesterol: number;
              serving_size: string;
            }) => ({
              id: meal.id,
              name: meal.food_name,
              calories: meal.calories || 0,
              carbs: meal.carbs || 0,
              protein: meal.protein || 0,
              fat: meal.fat || 0,
              fiber: meal.fiber || 0,
              sodium: meal.sodium || 0,
              sugar: meal.sugar || 0,
              saturatedFat: meal.saturated_fat || 0,
              cholesterol: meal.cholesterol || 0,
              servingSize: meal.serving_size || "1인분",
              quantity: 1,
            })
          );
          setFoods(formattedFoods);
        } else {
          setFoods([]);
        }
      } catch (error) {
        console.error("Meal fetch error:", error);
        setFoods([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealRecord();
  }, [mealType, mealDate]);

  // 삭제되지 않은 음식만 계산
  const activeFoods = foods.filter((f) => !f.isDeleted);
  const totalCalories = activeFoods.reduce((sum, f) => sum + f.calories * f.quantity, 0);
  const totalCarbs = activeFoods.reduce((sum, f) => sum + f.carbs * f.quantity, 0);
  const totalProtein = activeFoods.reduce((sum, f) => sum + f.protein * f.quantity, 0);
  const totalFat = activeFoods.reduce((sum, f) => sum + f.fat * f.quantity, 0);

  // 수량 변경 (0.1 단위)
  const updateQuantity = (foodId: string, delta: number) => {
    setFoods((prev) =>
      prev.map((f) =>
        f.id === foodId
          ? { ...f, quantity: Math.max(0.1, Math.round((f.quantity + delta) * 10) / 10) }
          : f
      )
    );
  };

  // 음식 삭제 (로컬에서 삭제 표시)
  const removeFood = (foodId: string) => {
    setFoods((prev) => prev.map((f) => 
      f.id === foodId ? { ...f, isDeleted: true } : f
    ));
  };

  // 저장 - 변경사항 반영
  const saveChanges = async () => {
    setIsSaving(true);
    try {
      // 삭제된 음식들 실제 삭제
      const deletedFoods = foods.filter((f) => f.isDeleted);
      for (const food of deletedFoods) {
        await fetch(`/api/nutrition/meals?mealId=${food.id}`, {
          method: "DELETE",
        });
      }

      // 수량 변경된 음식들 업데이트 (현재는 수량 정보를 DB에 저장하지 않으므로 스킵)
      // 필요 시 PUT API 호출 추가

      router.push("/nutrition");
    } catch (error) {
      console.error("Save error:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 식사 전체 삭제 (안먹음으로 변경)
  const deleteMeal = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/nutrition/meals?mealType=${mealType}&mealDate=${mealDate}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      router.push("/nutrition");
    } catch (error) {
      console.error("Delete error:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B9B5C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{mealLabel} 수정</h1>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1 text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* 날짜 표시 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">기록 날짜</p>
          <p className="font-medium text-gray-800">{mealDate}</p>
        </div>

        {/* 음식 목록 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">기록된 음식</h3>
            <button
              onClick={() => router.push(`/nutrition/meal/${mealType}`)}
              className="flex items-center gap-1 text-[#7B9B5C] text-sm"
            >
              <Plus className="w-4 h-4" />
              음식 추가
            </button>
          </div>
          
          {activeFoods.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              기록된 음식이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeFoods.map((food) => (
                <div key={food.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{food.name}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round(food.calories * food.quantity)}kcal · {food.servingSize}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(food.id, -0.1)}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                      <span className="text-gray-600">-</span>
                    </button>
                    <span className="w-10 text-center text-sm font-medium">
                      {food.quantity.toFixed(1)}
                    </span>
                    <button
                      onClick={() => updateQuantity(food.id, 0.1)}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                      <span className="text-gray-600">+</span>
                    </button>
                    <button
                      onClick={() => removeFood(food.id)}
                      className="ml-2 p-1"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 영양 정보 요약 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">영양 정보</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">칼로리</p>
              <p className="text-lg font-bold text-gray-800">{totalCalories}kcal</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">탄수화물</p>
              <p className="text-lg font-bold text-gray-800">{totalCarbs.toFixed(1)}g</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">단백질</p>
              <p className="text-lg font-bold text-gray-800">{totalProtein.toFixed(1)}g</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">지방</p>
              <p className="text-lg font-bold text-gray-800">{totalFat.toFixed(1)}g</p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
          >
            취소
          </button>
          <button
            onClick={saveChanges}
            disabled={isSaving}
            className="flex-1 py-3 bg-[#7B9B5C] text-white rounded-xl font-medium"
          >
            {isSaving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 mx-4 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              식사 기록 삭제
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              이 식사 기록을 삭제하시겠습니까?<br />
              삭제하면 &apos;안먹음&apos;으로 처리됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={deleteMeal}
                disabled={isSaving}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium"
              >
                {isSaving ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

