"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white" | "gray";
  className?: string;
}

const sizeClasses = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-3",
  lg: "w-12 h-12 border-4",
};

const colorClasses = {
  primary: "border-[#9F85E3] border-t-transparent",
  white: "border-white border-t-transparent",
  gray: "border-gray-300 border-t-gray-600",
};

export function LoadingSpinner({
  size = "md",
  color = "primary",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({
  message = "로딩 중...",
  fullScreen = true,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 bg-gray-50",
        fullScreen ? "min-h-screen" : "min-h-[200px]"
      )}
    >
      <LoadingSpinner size="lg" />
      {message && <p className="text-gray-500 text-sm">{message}</p>}
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function LoadingSkeleton({
  className,
  variant = "rectangular",
  width,
  height,
}: LoadingSkeletonProps) {
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={cn(
        "bg-gray-200 animate-pulse",
        variantClasses[variant],
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

// 카드 스켈레톤 (자주 사용되는 패턴)
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-4 animate-pulse shadow-sm",
        className
      )}
    >
      <div className="flex gap-4">
        <div className="w-[100px] h-[100px] bg-gray-200 rounded-xl" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="flex gap-2">
            <div className="h-5 bg-gray-200 rounded w-16" />
            <div className="h-5 bg-gray-200 rounded w-12" />
          </div>
          <div className="h-9 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// 리스트 스켈레톤
export function ListSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================
// 페이지별 스켈레톤 컴포넌트
// ============================================

// 홈 페이지 스켈레톤
export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 스켈레톤 */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>

      <main className="space-y-5 pt-4 px-4">
        {/* 건강목표 카드 스켈레톤 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full mb-4" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded-full w-20" />
            <div className="h-8 bg-gray-200 rounded-full w-24" />
          </div>
        </div>

        {/* 영양 가이드 스켈레톤 */}
        <div className="bg-gradient-to-br from-[#F5F0FF] to-[#EDE7FF] rounded-2xl p-5 animate-pulse">
          <div className="h-5 bg-white/50 rounded w-32 mb-3" />
          <div className="h-4 bg-white/50 rounded w-48 mb-4" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-14 h-20 bg-white/50 rounded-xl" />
            ))}
          </div>
        </div>

        {/* 명언 스켈레톤 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-full mb-2" />
          <div className="h-5 bg-gray-200 rounded w-3/4" />
        </div>

        {/* 오늘의 식사 스켈레톤 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
          <div className="flex items-center justify-center mb-4">
            <div className="w-32 h-32 bg-gray-200 rounded-full" />
          </div>
          <div className="flex justify-around">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-2 w-20 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* 걸음수 + 챌린지 스켈레톤 */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-2xl p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-24" />
          </div>
          <div className="flex-1 bg-white rounded-2xl p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-full" />
          </div>
        </div>

        {/* 컨텐츠 배너 스켈레톤 */}
        <div className="space-y-3">
          <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </main>
    </div>
  );
}

// 컨텐츠 페이지 스켈레톤
export function ContentPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* 검색창 */}
      <div className="px-4 py-3 bg-white">
        <div className="h-12 bg-gray-100 rounded-full animate-pulse" />
      </div>

      {/* 카테고리 */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* 컨텐츠 리스트 */}
      <div className="px-4 py-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
            <div className="h-40 bg-gray-200" />
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-5 bg-gray-200 rounded w-full mb-1" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 영양 페이지 스켈레톤
export function NutritionPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* 헤더 */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* 탭 */}
      <div className="sticky top-[56px] z-10 bg-white border-b border-gray-100">
        <div className="flex">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 py-3 flex justify-center">
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 px-4">
        {/* 날짜 선택 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
          <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1 w-12">
                <div className="h-4 w-6 bg-gray-200 rounded" />
                <div className="h-9 w-9 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* 식사분석 */}
        <div className="bg-[#F8F9E8] rounded-2xl p-4 shadow-sm animate-pulse">
          <div className="h-5 w-20 bg-white/50 rounded mb-4" />
          <div className="h-6 w-48 bg-white/50 rounded mb-3" />
          <div className="h-4 w-full bg-white/50 rounded mb-4" />
          <div className="flex gap-2">
            <div className="flex-1 h-12 bg-white/50 rounded-xl" />
            <div className="flex-1 h-12 bg-white/50 rounded-xl" />
          </div>
        </div>

        {/* 식사 추가 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
          <div className="h-5 w-20 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>

        {/* 식사 분석 그래프 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
          <div className="h-5 w-20 bg-gray-200 rounded mb-4" />
          <div className="flex justify-center mb-6">
            <div className="w-40 h-40 bg-gray-200 rounded-full" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 챌린지 페이지 스켈레톤
export function ChallengePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* 서브 헤더 */}
      <div className="sticky top-[56px] z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* 챌린지 리스트 */}
      <main className="p-4 space-y-4">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
            <div className="flex gap-4">
              <div className="w-[100px] h-[100px] bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-200 rounded-full w-20" />
                  <div className="h-5 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="h-10 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

// 메뉴 페이지 스켈레톤
export function MenuPageSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-32">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6" />
        </div>
      </div>

      <div className="px-4">
        {/* 프로필 섹션 */}
        <div className="py-5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* 퀵메뉴 */}
        <div className="py-5 border-b border-gray-100">
          <div className="flex justify-around">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-gray-200 rounded-2xl animate-pulse" />
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* 메뉴 섹션들 */}
        {[1, 2, 3].map((section) => (
          <div key={section} className="py-4">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between px-4 py-4 border-b border-gray-100 last:border-0">
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 공지사항 페이지 스켈레톤
export function NoticesPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6" />
        </div>
      </div>

      <div className="px-4">
        <div className="py-4">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-1" />
        </div>

        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="py-4 animate-pulse">
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 알림 페이지 스켈레톤
export function NotificationsPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6" />
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mb-4" />

        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 w-full bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <div className="h-4 w-12 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 포인트/쿠폰 페이지 스켈레톤
export function PointsPageSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-24">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-20 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="px-4 py-4">
        {/* 내 자산 섹션 */}
        <div className="mb-5">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="px-4 py-4 flex items-center justify-between animate-pulse">
              <div className="h-5 w-12 bg-gray-200 rounded" />
              <div className="h-6 w-20 bg-gray-200 rounded" />
            </div>
            <div className="border-t border-gray-100" />
            <div className="px-4 py-4 flex items-center justify-between animate-pulse">
              <div className="h-5 w-16 bg-gray-200 rounded" />
              <div className="h-6 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* 상세 현황 */}
        <div className="bg-white rounded-2xl p-4 mb-5 border border-gray-200 shadow-sm animate-pulse">
          <div className="h-6 w-24 bg-gray-200 rounded mb-4" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-32 bg-gray-200 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex items-center justify-between mb-4 animate-pulse">
          <div className="h-5 w-24 bg-gray-200 rounded" />
          <div className="h-5 w-32 bg-gray-200 rounded" />
        </div>

        {/* 내역 리스트 */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                {[1, 2].map((j) => (
                  <div key={j} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="h-5 w-32 bg-gray-200 rounded mb-1" />
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 문의 페이지 스켈레톤
export function InquiryPageSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-32">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6" />
        </div>
      </div>

      <div className="px-4">
        {/* 자주묻는 질문 */}
        <div className="py-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />

          {/* 카테고리 버튼들 */}
          <div className="flex gap-4 pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* FAQ 리스트 */}
          <div className="mt-4">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-gray-100 py-4 animate-pulse">
                  <div className="h-5 w-full bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 나의 문의내역 */}
        <div className="py-6 border-t border-gray-100">
          <div className="h-6 w-28 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 animate-pulse">
                <div className="h-5 w-40 bg-gray-200 rounded" />
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 분석 페이지 스켈레톤
export function AnalysisPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="w-8" />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 기간 선택 */}
        <div className="flex gap-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-20 bg-gray-200 rounded-full" />
          ))}
        </div>

        {/* 날짜 선택 */}
        <div className="flex items-center justify-center gap-4 animate-pulse">
          <div className="w-6 h-6 bg-gray-200 rounded" />
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="w-6 h-6 bg-gray-200 rounded" />
        </div>

        {/* 그래프 카드 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
          <div className="flex flex-col items-center mb-6">
            <div className="w-44 h-44 bg-gray-200 rounded-full mb-4" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>

          {/* 영양소 분석 */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-5 w-16 bg-gray-200 rounded" />
                  <div className="h-5 w-12 bg-gray-200 rounded-full" />
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full" />
                <div className="flex justify-between mt-1">
                  <div className="h-3 w-8 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
