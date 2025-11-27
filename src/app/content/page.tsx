"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/home/Header";
import {
  SearchIcon,
  ContentIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HeartIcon,
  CloseIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type {
  ContentCategory,
  ContentCard,
  CategoriesResponse,
} from "@/types/database";

export default function ContentListPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [contents, setContents] = useState<ContentCard[]>([]);
  const [categories, setCategories] = useState<CategoriesResponse | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ContentCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(
    null
  );
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [points, setPoints] = useState(50);

  // 카테고리 데이터 로드
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/content-categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // 컨텐츠 데이터 로드
  const fetchContents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.append("categoryId", selectedCategory.id.toString());
      }
      if (selectedSubcategory) {
        params.append("subcategoryId", selectedSubcategory.toString());
      }
      if (searchKeyword.trim()) {
        params.append("keyword", searchKeyword.trim());
      }

      const response = await fetch(`/api/contents?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setContents(data.contents);
      }
    } catch (error) {
      console.error("Failed to fetch contents:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedSubcategory, searchKeyword]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  // 포인트 데이터 로드
  useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await fetch("/api/home");
        if (response.ok) {
          const data = await response.json();
          setPoints(data.user?.points || 50);
        }
      } catch (error) {
        console.error("Failed to fetch points:", error);
      }
    }
    fetchPoints();
  }, []);

  // 검색 실행
  const handleSearch = () => {
    fetchContents();
  };

  // 엔터키 검색
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 카테고리 선택
  const handleCategorySelect = (category: ContentCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setIsCategoryOpen(false);
  };

  // 전체보기
  const handleShowAll = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setIsCategoryOpen(false);
  };

  // 세분류(태그) 선택
  const handleSubcategorySelect = (subcategoryId: number) => {
    setSelectedSubcategory(
      selectedSubcategory === subcategoryId ? null : subcategoryId
    );
  };

  // 좋아요 토글
  const handleLikeToggle = async (e: React.MouseEvent, contentId: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/contents/${contentId}/like`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setContents((prev) =>
          prev.map((c) =>
            c.id === contentId ? { ...c, isLiked: data.isLiked } : c
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  // 컨텐츠 클릭
  const handleContentClick = (contentId: string) => {
    router.push(`/content/${contentId}`);
  };

  // 세분류 태그 목록
  const subcategories = selectedCategory?.subcategories || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <Header points={points} />

      {/* 검색창 */}
      <div className="px-4 py-3 bg-white">
        <div className="relative">
          <SearchIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#9F85E3]/50"
          />
          {searchKeyword && (
            <button
              onClick={() => {
                setSearchKeyword("");
                fetchContents();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <CloseIcon size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 메뉴명 + 카테고리 드롭다운 */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ContentIcon size={20} className="text-[#9F85E3]" />
            <span className="font-semibold text-gray-900">건강 컨텐츠</span>
          </div>
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#9F85E3] text-white rounded-full text-sm font-medium"
          >
            {selectedCategory?.category_name || "카테고리"}
            {isCategoryOpen ? (
              <ChevronUpIcon size={16} />
            ) : (
              <ChevronDownIcon size={16} />
            )}
          </button>
        </div>
      </div>

      {/* 카테고리 드롭다운 팝업 */}
      {isCategoryOpen && categories && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsCategoryOpen(false)}
          />
          <div className="absolute left-0 right-0 bg-white shadow-lg z-50 mx-4 mt-2 rounded-xl overflow-hidden animate-slide-up">
            <div className="p-4">
              {/* 전체보기 버튼 */}
              <button
                onClick={handleShowAll}
                className="w-full text-right text-sm text-[#9F85E3] font-medium mb-4"
              >
                전체보기
              </button>

              {/* 3개 컬럼 레이아웃 */}
              <div className="grid grid-cols-3 gap-4">
                {/* 관심사 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">
                    관심사
                  </h3>
                  <ul className="space-y-2">
                    {categories.interest.map((cat) => (
                      <li key={cat.id}>
                        <button
                          onClick={() => handleCategorySelect(cat)}
                          className={cn(
                            "text-sm text-left w-full hover:text-[#9F85E3] transition-colors",
                            selectedCategory?.id === cat.id
                              ? "text-[#9F85E3] font-medium"
                              : "text-gray-600"
                          )}
                        >
                          {cat.category_name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 질병 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">
                    질병
                  </h3>
                  <ul className="space-y-2">
                    {categories.disease.map((cat) => (
                      <li key={cat.id}>
                        <button
                          onClick={() => handleCategorySelect(cat)}
                          className={cn(
                            "text-sm text-left w-full hover:text-[#9F85E3] transition-colors",
                            selectedCategory?.id === cat.id
                              ? "text-[#9F85E3] font-medium"
                              : "text-gray-600"
                          )}
                        >
                          {cat.category_name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 운동 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">
                    운동
                  </h3>
                  <ul className="space-y-2">
                    {categories.exercise.map((cat) => (
                      <li key={cat.id}>
                        <button
                          onClick={() => handleCategorySelect(cat)}
                          className={cn(
                            "text-sm text-left w-full hover:text-[#9F85E3] transition-colors",
                            selectedCategory?.id === cat.id
                              ? "text-[#9F85E3] font-medium"
                              : "text-gray-600"
                          )}
                        >
                          {cat.category_name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 선택된 카테고리 태그 */}
      {subcategories.length > 0 && (
        <div className="px-4 py-3 bg-white overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubcategorySelect(sub.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors",
                  selectedSubcategory === sub.id
                    ? "bg-[#9F85E3] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                #{sub.subcategory_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 컨텐츠 리스트 */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : contents.length === 0 ? (
          /* 빈 상태 화면 */
          <EmptyState description="검색 결과에 해당하는 컨텐츠가 없어요..." />
        ) : (
          /* 컨텐츠 카드 리스트 */
          <div className="space-y-4">
            {contents.map((content) => (
              <ContentCardItem
                key={content.id}
                content={content}
                onClick={() => handleContentClick(content.id)}
                onLikeToggle={(e) => handleLikeToggle(e, content.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 컨텐츠 카드 컴포넌트
interface ContentCardItemProps {
  content: ContentCard;
  onClick: () => void;
  onLikeToggle: (e: React.MouseEvent) => void;
}

function ContentCardItem({
  content,
  onClick,
  onLikeToggle,
}: ContentCardItemProps) {
  const isStyleA = content.cardStyle === "A";

  if (isStyleA) {
    // 스타일 A: 배경색 카드
    return (
      <div
        onClick={onClick}
        className="relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        style={{ backgroundColor: content.backgroundColor || "#FFE4E6" }}
      >
        <div className="flex items-center p-5">
          <div className="flex-1 pr-4">
            <span className="text-sm font-semibold text-[#9F85E3] mb-2 block">
              {content.category}
            </span>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {content.title}
            </h3>
          </div>
          {content.thumbnailUrl && (
            <div className="w-28 h-28 flex-shrink-0">
              <img
                src={content.thumbnailUrl}
                alt={content.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
        {/* 좋아요 버튼 */}
        <button onClick={onLikeToggle} className="absolute top-4 right-4 p-2">
          <HeartIcon
            size={24}
            filled={content.isLiked}
            className={content.isLiked ? "text-red-500" : "text-gray-400"}
          />
        </button>
      </div>
    );
  }

  // 스타일 B: 이미지 풀 카드
  return (
    <div
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow aspect-[4/3]"
    >
      {content.thumbnailUrl && (
        <img
          src={content.thumbnailUrl}
          alt={content.title}
          className="w-full h-full object-cover"
        />
      )}
      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      {/* 텍스트 */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <span className="text-sm font-semibold text-[#B39DDB] mb-2 block">
          {content.category}
        </span>
        <h3 className="text-lg font-bold text-white leading-tight">
          {content.title}
        </h3>
      </div>
      {/* 좋아요 버튼 */}
      <button onClick={onLikeToggle} className="absolute top-4 right-4 p-2">
        <HeartIcon
          size={24}
          filled={content.isLiked}
          className={content.isLiked ? "text-red-500" : "text-white/80"}
        />
      </button>
    </div>
  );
}
