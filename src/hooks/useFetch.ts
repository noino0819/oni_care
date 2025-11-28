"use client";

import useSWR, { SWRConfiguration, mutate as globalMutate } from "swr";
import { apiGet, isApiError, getErrorMessage } from "@/lib/api";

// SWR fetcher
const fetcher = async <T>(url: string): Promise<T> => {
  return apiGet<T>(url);
};

interface UseFetchOptions<T> extends SWRConfiguration<T> {
  // 자동 실행 여부 (기본: true)
  enabled?: boolean;
  // 성공 콜백
  onSuccess?: (data: T) => void;
  // 에러 콜백
  onError?: (error: unknown) => void;
}

interface UseFetchReturn<T> {
  data: T | undefined;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  refetch: () => Promise<T | undefined>;
  mutate: (data?: T | Promise<T> | ((currentData?: T) => T)) => Promise<T | undefined>;
}

/**
 * SWR 기반 데이터 fetching 훅
 * - 자동 캐싱
 * - 백그라운드 재검증
 * - 포커스 시 재검증
 * - 에러 재시도
 */
export function useFetch<T>(
  url: string | null,
  params?: Record<string, string | number | boolean | undefined>,
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const {
    enabled = true,
    onSuccess,
    onError,
    ...swrOptions
  } = options;

  // URL 파라미터 처리
  let finalUrl = url;
  if (url && params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      finalUrl = `${url}?${queryString}`;
    }
  }

  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    enabled && finalUrl ? finalUrl : null,
    fetcher,
    {
      // 기본 설정
      revalidateOnFocus: true, // 포커스 시 재검증
      revalidateOnReconnect: true, // 재연결 시 재검증
      dedupingInterval: 2000, // 2초 내 중복 요청 방지
      errorRetryCount: 3, // 에러 시 3번 재시도
      errorRetryInterval: 1000, // 재시도 간격 1초
      
      // 캐시 설정
      refreshInterval: 0, // 자동 새로고침 비활성화 (필요 시 활성화)
      
      // 콜백
      onSuccess: (data) => {
        onSuccess?.(data);
      },
      onError: (err) => {
        // 인증 에러 처리
        if (isApiError(err) && err.isUnauthorized) {
          window.location.href = "/";
        }
        onError?.(err);
      },
      
      // 사용자 옵션 오버라이드
      ...swrOptions,
    }
  );

  const errorMessage = error ? getErrorMessage(error, "데이터를 불러오는데 실패했습니다.") : null;

  return {
    data,
    isLoading,
    isValidating,
    error: errorMessage,
    refetch: async () => mutate(),
    mutate,
  };
}

// POST/PUT/DELETE 등을 위한 mutation 훅
interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: unknown, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: unknown, variables: TVariables) => void;
}

interface UseMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | undefined;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationReturn<TData, TVariables> {
  const { onSuccess, onError, onSettled } = options;

  const [data, setData] = useState<TData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await mutationFn(variables);
        setData(result);
        onSuccess?.(result, variables);
        onSettled?.(result, null, variables);
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        onError?.(err, variables);
        onSettled?.(undefined, err, variables);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );

  const mutate = useCallback(
    (variables: TVariables) => {
      mutateAsync(variables).catch(() => {
        // 에러는 이미 처리됨
      });
      return mutateAsync(variables);
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    mutate,
    mutateAsync,
    data,
    isLoading,
    error,
    reset,
  };
}

// 추가 imports
import { useState, useCallback } from "react";

// 캐시 무효화 유틸리티
export function invalidateCache(key: string | RegExp) {
  if (typeof key === "string") {
    globalMutate(key);
  } else {
    // 정규식 패턴으로 캐시 무효화
    globalMutate(
      (cacheKey) => typeof cacheKey === "string" && key.test(cacheKey),
      undefined,
      { revalidate: true }
    );
  }
}

// 특정 키의 캐시 프리페치
export async function prefetchData<T>(url: string): Promise<T> {
  const data = await fetcher<T>(url);
  globalMutate(url, data, { revalidate: false });
  return data;
}
