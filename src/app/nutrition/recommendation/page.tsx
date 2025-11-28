"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Home } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MealRecommendation {
  day: number;
  dayName: string;
  meals: {
    type: "breakfast" | "lunch" | "dinner";
    name: string;
    image: string;
  }[];
}

interface RecommendationData {
  user: {
    name: string;
  };
  diagnosisDate: string;
  eatScore: number;
  description: string;
  hasAllergy: boolean;
  mealRecommendations: MealRecommendation[];
}

export default function RecommendationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"meal" | "product" | "ingredient">("meal");
  const [data, setData] = useState<RecommendationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: 실제 API 호출로 대체
    setIsLoading(true);
    setTimeout(() => {
      setData({
        user: { name: "테스트" },
        diagnosisDate: "2025.02.05",
        eatScore: 92,
        description: "테스트님께 필요한 영양소를 골고루 섭취하기에 가장 좋은 메뉴를 추천해요",
        hasAllergy: true,
        mealRecommendations: [
          {
            day: 1,
            dayName: "금요일",
            meals: [
              { type: "lunch", name: "열무보리장&돼지불고기비빔 세트", image: "/images/meal-order-01.jpg" },
              { type: "dinner", name: "해초 유부비빔밥 &마늘 대추 닭살구이 세트", image: "/images/meal-order-02.jpg" },
            ],
          },
          {
            day: 2,
            dayName: "월요일",
            meals: [
              { type: "lunch", name: "흑임자 닭볶음&김치솥밥 세트", image: "/images/meal-order-01.jpg" },
              { type: "dinner", name: "[한국식] 콩비지 김치찜&토마토 초장소스 세트", image: "/images/meal-order-02.jpg" },
            ],
          },
          {
            day: 3,
            dayName: "수요일",
            meals: [
              { type: "lunch", name: "된장찌개&제육볶음 세트", image: "/images/meal-order-01.jpg" },
              { type: "dinner", name: "닭가슴살 샐러드 세트", image: "/images/meal-order-02.jpg" },
            ],
          },
        ],
      });
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F85E3]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">결과를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <X className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">맞춤상품 추천</h1>
          <button onClick={() => router.push("/home")} className="p-1">
            <Home className="w-6 h-6 text-[#7B9B5C]" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* 진단 결과 요약 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">{data.user.name}님의 진단 결과</h2>
            <span className="text-sm text-gray-500">진단일: {data.diagnosisDate}</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-sm text-gray-500">EAT SCORE</span>
            <span className="text-lg font-bold text-[#7B9B5C]">{data.eatScore}점</span>
            <span className="text-sm text-gray-400">/100점</span>
          </div>
          <p className="text-sm text-gray-600">{data.description}</p>
          {data.hasAllergy && (
            <p className="text-xs text-gray-400 mt-2">*알러지 선택 사항 반영</p>
          )}
        </div>

        {/* 탭 */}
        <div className="flex gap-2">
          {[
            { key: "meal", label: "식단추천" },
            { key: "product", label: "상품추천" },
            { key: "ingredient", label: "식재료추천" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "bg-[#7B9B5C] text-white"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 식단 추천 */}
        {activeTab === "meal" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold mb-2">나에게 필요한 식단</h3>
              <p className="text-sm text-gray-500 mb-1">
                {data.user.name}님의 영양밸런스를 맞춰준 메뉴
              </p>
              {data.hasAllergy && (
                <p className="text-xs text-gray-400">*알러지 선택 사항 반영</p>
              )}
            </div>

            {/* 식단 목록 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              {/* 헤더 */}
              <div className="grid grid-cols-4 gap-2 mb-4 text-sm font-medium text-gray-600 text-center">
                <div></div>
                <div>마이그리팅</div>
                <div>점심</div>
                <div>저녁</div>
              </div>

              {/* 일별 식단 */}
              {data.mealRecommendations.map((day) => (
                <div key={day.day} className="grid grid-cols-4 gap-2 mb-6 items-start">
                  <div className="text-center">
                    <p className="text-sm font-medium">Day{day.day}</p>
                    <p className="text-xs text-gray-500">{day.dayName}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-300">-</span>
                  </div>
                  {day.meals.map((meal, idx) => (
                    <div key={idx} className="text-center">
                      <div className="relative w-full aspect-square mb-2 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={meal.image}
                          alt={meal.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{meal.name}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 상품 추천 */}
        {activeTab === "product" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <p className="text-gray-500">상품 추천 준비 중입니다.</p>
          </div>
        )}

        {/* 식재료 추천 */}
        {activeTab === "ingredient" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <p className="text-gray-500">식재료 추천 준비 중입니다.</p>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <button
          onClick={() => {
            // TODO: 그리팅몰로 이동
            alert("그리팅몰로 이동합니다.");
          }}
          className="w-full bg-[#F5E6A3] text-gray-800 py-4 rounded-xl font-medium text-lg"
        >
          주문하러 가기
        </button>
      </div>
    </div>
  );
}

