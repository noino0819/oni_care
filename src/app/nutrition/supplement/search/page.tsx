"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X, Plus, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

interface SupplementProduct {
  id: string;
  name: string;
  brand?: string;
  dosagePerServing: string;
  ingredients?: string[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MAX_SELECTION = 10;

export default function SupplementSearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SupplementProduct[]>([]);
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [showMaxAlert, setShowMaxAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 검색어 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 영양제 검색 API
  const { data, error, isLoading } = useSWR(
    debouncedQuery
      ? `/api/nutrition/supplements/search?q=${encodeURIComponent(debouncedQuery)}`
      : `/api/nutrition/supplements/products`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const products: SupplementProduct[] = data?.products || [];

  // 검색 결과 정렬 (텍스트 일치순)
  const sortedProducts = useMemo(() => {
    if (!debouncedQuery) return products;
    
    return [...products].sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().indexOf(debouncedQuery.toLowerCase());
      const bNameMatch = b.name.toLowerCase().indexOf(debouncedQuery.toLowerCase());
      
      // 이름에서 먼저 발견된 것이 우선
      if (aNameMatch !== -1 && bNameMatch !== -1) {
        return aNameMatch - bNameMatch;
      }
      if (aNameMatch !== -1) return -1;
      if (bNameMatch !== -1) return 1;
      return 0;
    });
  }, [products, debouncedQuery]);

  // 제품 선택/해제
  const toggleProduct = useCallback((product: SupplementProduct) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.id === product.id);
      
      if (isSelected) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        if (prev.length >= MAX_SELECTION) {
          setShowMaxAlert(true);
          setTimeout(() => setShowMaxAlert(false), 3000);
          return prev;
        }
        return [...prev, product];
      }
    });
  }, []);

  // 선택 태그 제거
  const removeSelection = useCallback((productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  // 검색어 초기화
  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
  };

  // 뒤로가기 처리
  const handleBack = () => {
    if (selectedProducts.length > 0) {
      setShowExitAlert(true);
    } else {
      router.back();
    }
  };

  // 추가하기
  const handleAdd = async () => {
    if (selectedProducts.length === 0) return;

    setIsSaving(true);
    try {
      // 선택된 제품들을 루틴으로 등록
      const response = await fetch("/api/nutrition/supplements/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: selectedProducts.map((p) => ({
            supplementProductId: p.id,
            name: p.name,
            brand: p.brand,
            dosagePerServing: p.dosagePerServing,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add routines");
      }

      router.push("/nutrition/supplement/routine");
    } catch (error) {
      console.error("Error adding routines:", error);
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={handleBack} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          
          {/* 검색창 */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="영양제 명을 검색해 보세요"
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9F85E3]/30"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* 선택된 제품 태그 */}
        {selectedProducts.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {selectedProducts.map((product) => (
              <span
                key={product.id}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#9F85E3]/10 text-[#9F85E3] rounded-full text-sm"
              >
                {product.name}
                <button
                  onClick={() => removeSelection(product.id)}
                  className="p-0.5 hover:bg-[#9F85E3]/20 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="px-4 py-4">
        {/* 로딩 상태 */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">검색 중 오류가 발생했습니다.</p>
            <button
              onClick={() => setDebouncedQuery(searchQuery)}
              className="text-[#9F85E3] font-medium"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 검색 결과 */}
        {!isLoading && !error && (
          <>
            {sortedProducts.length === 0 ? (
              /* 검색 결과 없음 */
              <div className="text-center py-20">
                <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <span className="text-6xl opacity-30">🔍</span>
                </div>
                <p className="text-gray-600 mb-2">
                  검색 결과에 해당하는 식품이 없어요
                </p>
                <p className="text-sm text-gray-400">
                  책을 뒤지는데 안나오고...
                  <br />
                  굉장히 궁금한 이미지
                </p>
              </div>
            ) : (
              /* 제품 목록 */
              <div className="space-y-3">
                {sortedProducts.map((product) => {
                  const isSelected = selectedProducts.some(
                    (p) => p.id === product.id
                  );

                  return (
                    <div
                      key={product.id}
                      className={cn(
                        "bg-white rounded-xl p-4 shadow-sm transition-all",
                        isSelected && "ring-2 ring-[#9F85E3]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {product.dosagePerServing}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleProduct(product)}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            isSelected
                              ? "bg-[#9F85E3] text-white"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          )}
                        >
                          {isSelected ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* 최대 선택 알림 */}
      {showMaxAlert && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in">
          최대 {MAX_SELECTION}개까지 선택 할 수 있습니다
        </div>
      )}

      {/* 하단 추가하기 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <button
          onClick={handleAdd}
          disabled={selectedProducts.length === 0 || isSaving}
          className={cn(
            "w-full py-4 rounded-xl font-semibold text-lg transition-colors",
            selectedProducts.length > 0
              ? "bg-[#9F85E3] text-white"
              : "bg-gray-200 text-gray-400"
          )}
        >
          {isSaving
            ? "등록 중..."
            : selectedProducts.length > 0
            ? `추가하기 (${selectedProducts.length})`
            : "추가하기"}
        </button>
      </div>

      {/* 나가기 확인 Alert */}
      {showExitAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowExitAlert(false)}
          />
          <div className="relative bg-white rounded-2xl w-[300px] p-6 text-center animate-scale-up">
            <p className="text-gray-900 font-semibold mb-2">
              아직 영양제가 기록되지 않았어요!
            </p>
            <p className="text-gray-900 font-semibold mb-6">
              정말 나가시겠어요?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowExitAlert(false);
                  router.back();
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
              >
                네
              </button>
              <button
                onClick={() => setShowExitAlert(false)}
                className="flex-1 py-3 bg-[#9F85E3] text-white rounded-xl font-medium"
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

