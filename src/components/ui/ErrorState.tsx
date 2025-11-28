"use client";

import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "오류가 발생했습니다",
  message,
  onRetry,
  retryLabel = "다시 시도",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4",
        className
      )}
    >
      {/* 에러 아이콘 */}
      <div className="w-16 h-16 mb-4 text-red-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
          <circle cx="12" cy="16" r="0.5" fill="currentColor" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {message && (
        <p className="text-red-500 text-center mb-4 max-w-sm">{message}</p>
      )}
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-[#9F85E3] text-white rounded-lg hover:bg-[#8B74D1] transition-colors font-medium"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

// 네트워크 에러
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="네트워크 오류"
      message="인터넷 연결을 확인해주세요."
      onRetry={onRetry}
    />
  );
}

// 서버 에러
export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="서버 오류"
      message="잠시 후 다시 시도해주세요."
      onRetry={onRetry}
    />
  );
}

// 권한 없음 에러
export function UnauthorizedError({
  onLogin,
}: {
  onLogin?: () => void;
}) {
  return (
    <ErrorState
      title="로그인이 필요합니다"
      message="이 기능을 이용하려면 로그인이 필요해요."
      onRetry={onLogin}
      retryLabel="로그인하기"
    />
  );
}

// 페이지 찾을 수 없음
export function NotFoundError({
  onGoBack,
}: {
  onGoBack?: () => void;
}) {
  return (
    <ErrorState
      title="페이지를 찾을 수 없습니다"
      message="요청하신 페이지가 존재하지 않아요."
      onRetry={onGoBack}
      retryLabel="이전으로 돌아가기"
    />
  );
}

// 인라인 에러 메시지 (폼 등에서 사용)
export function InlineError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-3 rounded-xl bg-red-50 border border-red-200",
        className
      )}
    >
      <p className="text-sm text-red-600">{message}</p>
    </div>
  );
}


