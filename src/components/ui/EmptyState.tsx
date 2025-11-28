"use client";

import { cn } from "@/lib/utils";
import { QuestionCharacter } from "@/components/icons";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4",
        className
      )}
    >
      {icon || <QuestionCharacter size={180} className="mb-4" />}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-gray-500 text-center whitespace-pre-line">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// 검색 결과 없음
export function NoSearchResults({
  keyword,
  onClear,
}: {
  keyword?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      description={
        keyword
          ? `"${keyword}"에 대한 검색 결과가 없어요...`
          : "검색 결과가 없어요..."
      }
      action={
        onClear && (
          <button
            onClick={onClear}
            className="px-4 py-2 bg-[#9F85E3] text-white rounded-lg hover:bg-[#8B74D1] transition-colors"
          >
            검색 초기화
          </button>
        )
      }
    />
  );
}

// 데이터 없음
export function NoData({
  title = "데이터가 없어요",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return <EmptyState title={title} description={description} />;
}

// 컨텐츠 없음
export function NoContent({ type = "컨텐츠" }: { type?: string }) {
  return (
    <EmptyState
      description={`${type}가 없어요...`}
    />
  );
}


