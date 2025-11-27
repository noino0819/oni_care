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

