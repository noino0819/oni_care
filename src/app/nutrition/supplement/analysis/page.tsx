"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, ChevronDown, ChevronUp, Home, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

interface IngredientAnalysis {
  id: string;
  ingredientName: string;
  status: "deficient" | "adequate" | "excessive";
  currentAmount: number;
  minAmount: number | null;
  maxAmount: number | null;
  unit: string;
  sourceSupplements: string[];
  recommendationText: string; // 권장량 표기 텍스트
}

interface DuplicateIngredient extends IngredientAnalysis {
  isDuplicate: true;
}

interface RecommendedIngredient {
  id: string;
  ingredientName: string;
  interactions: string[]; // 상호작용 설명들
}

interface SupplementSummary {
  name: string;
  dosage: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const STATUS_CONFIG = {
  deficient: {
    label: "부족",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    barColor: "bg-orange-400",
  },
  adequate: {
    label: "적정",
    color: "text-green-600",
    bgColor: "bg-green-100",
    barColor: "bg-green-400",
  },
  excessive: {
    label: "과다",
    color: "text-red-600",
    bgColor: "bg-red-100",
    barColor: "bg-red-400",
  },
};

// 그래프 계산 함수
function calculateGraphData(
  currentAmount: number,
  minAmount: number | null,
  maxAmount: number | null
): { percentage: number; minPercentage: number | null; maxPercentage: number | null; graphMax: number } {
  let graphMax: number;
  
  if (minAmount !== null && maxAmount !== null) {
    // CASE 1: min/max 둘 다 있음
    graphMax = maxAmount * (100 / 70);
  } else {
    // CASE 2, 3: min만 또는 max만 있음
    graphMax = currentAmount * (100 / 80);
  }
  
  const percentage = Math.min((currentAmount / graphMax) * 100, 100);
  const minPercentage = minAmount !== null ? (minAmount / graphMax) * 100 : null;
  const maxPercentage = maxAmount !== null ? (maxAmount / graphMax) * 100 : null;
  
  return { percentage, minPercentage, maxPercentage, graphMax };
}

export default function SupplementAnalysisPage() {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { data, error, isLoading } = useSWR(
    "/api/nutrition/supplements/analysis",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const duplicateIngredients: DuplicateIngredient[] = data?.duplicates || [];
  const allIngredients: IngredientAnalysis[] = data?.ingredients || [];
  const recommendedIngredients: RecommendedIngredient[] = data?.recommendations || [];
  const supplements: SupplementSummary[] = data?.supplements || [];
  const analysisDate = data?.analysisDate || new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  
  const hasWarning = duplicateIngredients.length > 0 || 
    allIngredients.some((i) => i.status === "excessive");

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 스켈레톤 UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            <h1 className="text-lg font-semibold text-gray-900">영양제 루틴 분석</h1>
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
        </header>

        <div className="px-4 py-4 space-y-4">
          {/* 상단 요약 스켈레톤 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>

          {/* 성분 분석 스켈레톤 */}
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <div key={j} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex-1">
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">분석 데이터를 불러오는 중 오류가 발생했습니다.</p>
          <button
            onClick={() => router.refresh()}
            className="bg-[#9F85E3] text-white px-4 py-2 rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 데이터가 없을 때
  if (allIngredients.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => router.back()} className="p-1">
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">영양제 루틴 분석</h1>
            <button onClick={() => router.push("/home")} className="p-1">
              <Home className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </header>

        <div className="px-4 py-20 text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-6xl opacity-30">📊</span>
          </div>
          <p className="text-gray-600 mb-2">분석할 영양제가 없습니다.</p>
          <p className="text-sm text-gray-400 mb-6">
            영양제를 등록하면 성분 분석을 확인할 수 있어요!
          </p>
          <button
            onClick={() => router.push("/nutrition/supplement/search")}
            className="bg-[#9F85E3] text-white px-6 py-3 rounded-xl font-medium"
          >
            영양제 등록하기
          </button>
        </div>
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
          <h1 className="text-lg font-semibold text-gray-900">영양제 루틴 분석</h1>
          <button onClick={() => router.push("/home")} className="p-1">
            <Home className="w-5 h-5 text-gray-800" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* 상단 요약 카드 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-[#9F85E3] text-sm mb-1">{analysisDate}에</p>
              <h2 className="text-xl font-bold text-gray-900">
                등록된 {supplements.length}개 영양제를
              </h2>
              <h2 className="text-xl font-bold text-gray-900">분석했어요!</h2>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-[#9F85E3]/20 to-[#9F85E3]/5 rounded-full flex items-center justify-center">
              <span className="text-5xl">🧪</span>
            </div>
          </div>

          {/* 영양제 목록 */}
          {supplements.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                {supplements.map((supp, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{supp.name}</span>
                    <span className="text-gray-500">{supp.dosage}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 중복 성분 경고 (있을 때만) */}
        {duplicateIngredients.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <h2 className="font-semibold">
                <span className="text-red-500">중복</span>
                <span className="text-gray-900">되는 성분이 있어요</span>
              </h2>
            </div>

            {hasWarning && (
              <div className="px-4 py-3 bg-red-50 text-sm text-red-700">
                중복해서 섭취하는 성분이 있어요
                <br />
                너무 과다하지 않은지 확인해주세요
              </div>
            )}

            <div className="divide-y divide-gray-100">
              {duplicateIngredients.map((ingredient) => {
                const isExpanded = expandedItems.has(`dup-${ingredient.id}`);
                const config = STATUS_CONFIG[ingredient.status];

                return (
                  <div key={`dup-${ingredient.id}`}>
                    <button
                      onClick={() => toggleExpand(`dup-${ingredient.id}`)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          {ingredient.ingredientName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {ingredient.currentAmount} {ingredient.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          config.bgColor,
                          config.color
                        )}>
                          {config.label}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* 확장 내용 */}
                    {isExpanded && (
                      <div className="px-4 pb-4 bg-gray-50">
                        <div className="p-3 bg-white rounded-xl">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            성분이 겹치는 영양제
                          </p>
                          <ul className="space-y-1">
                            {ingredient.sourceSupplements.map((name, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                                {name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 현재 섭취중인 성분 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <span className="text-lg">💊</span>
            <h2 className="font-semibold">
              <span className="text-[#9F85E3]">현재 섭취중</span>
              <span className="text-gray-900">인 성분이에요</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {allIngredients.map((ingredient) => {
              const isExpanded = expandedItems.has(ingredient.id);
              const config = STATUS_CONFIG[ingredient.status];
              const { percentage, minPercentage, maxPercentage } = calculateGraphData(
                ingredient.currentAmount,
                ingredient.minAmount,
                ingredient.maxAmount
              );

              return (
                <div key={ingredient.id}>
                  <button
                    onClick={() => toggleExpand(ingredient.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {ingredient.ingredientName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ingredient.currentAmount} {ingredient.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        config.bgColor,
                        config.color
                      )}>
                        {config.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* 확장 내용 - 그래프 */}
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-gray-50">
                      <div className="p-4 bg-white rounded-xl">
                        {/* 진행바 */}
                        <div className="relative mb-2">
                          <div className="h-4 bg-gray-100 rounded-full overflow-visible relative">
                            {/* 적정 범위 표시 (min/max 둘 다 있을 때) */}
                            {minPercentage !== null && maxPercentage !== null && (
                              <div
                                className="absolute h-full bg-green-100 rounded-full"
                                style={{
                                  left: `${minPercentage}%`,
                                  width: `${maxPercentage - minPercentage}%`,
                                }}
                              />
                            )}
                            
                            {/* 현재 섭취량 바 */}
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                config.barColor
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                            
                            {/* 현재 위치 마커 */}
                            <div
                              className="absolute top-1/2 -translate-y-1/2 w-0 h-0"
                              style={{ left: `${percentage}%` }}
                            >
                              <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                                <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 범위 표시 */}
                        <div className="flex justify-between text-xs text-gray-500 mt-3">
                          {ingredient.minAmount !== null && ingredient.maxAmount !== null ? (
                            // CASE 1: min/max 둘 다 있음
                            <>
                              <span>min : {ingredient.minAmount}{ingredient.unit}</span>
                              <span>max : {ingredient.maxAmount}{ingredient.unit}</span>
                            </>
                          ) : ingredient.minAmount !== null ? (
                            // CASE 2: min만 있음
                            <>
                              <span></span>
                              <span>일일 섭취량 : {ingredient.minAmount}{ingredient.unit}</span>
                            </>
                          ) : ingredient.maxAmount !== null ? (
                            // CASE 3: max만 있음
                            <>
                              <span></span>
                              <span>max : {ingredient.maxAmount}{ingredient.unit}</span>
                            </>
                          ) : null}
                        </div>

                        {/* 권장량 표기 */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            권장량: {ingredient.recommendationText}
                          </p>
                        </div>

                        {/* 함유 영양제 목록 */}
                        {ingredient.sourceSupplements.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">
                              함유 영양제
                            </p>
                            <ul className="space-y-1">
                              {ingredient.sourceSupplements.map((name, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full" />
                                  {name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 추천 성분 섹션 */}
        {recommendedIngredients.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#BFFF00]" />
              <h2 className="font-semibold">
                <span className="text-[#9F85E3]">이런 성분</span>
                <span className="text-gray-900">을 추가하면 좋아요!</span>
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recommendedIngredients.map((rec) => (
                <div key={rec.id} className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{rec.ingredientName}</h3>
                  <ul className="space-y-1">
                    {rec.interactions.map((interaction, idx) => (
                      <li key={idx} className="text-sm text-gray-600">
                        - {interaction}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
