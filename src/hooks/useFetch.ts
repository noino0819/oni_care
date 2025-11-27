"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiGet, isApiError, getErrorMessage } from "@/lib/api";

interface UseFetchOptions<T> {
  // 초기값
  initialData?: T;
  // 자동 실행 여부 (기본: true)
  enabled?: boolean;
  // 의존성 배열 (변경 시 재요청)
  deps?: unknown[];
  // 성공 콜백
  onSuccess?: (data: T) => void;
  // 에러 콜백
  onError?: (error: unknown) => void;
  // 캐시 시간 (ms)
  cacheTime?: number;
}

interface UseFetchReturn<T> {
  data: T | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (data: T | ((prev: T | undefined) => T)) => void;
}

export function useFetch<T>(
  url: string,
  params?: Record<string, string | number | boolean | undefined>,
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const {
    initialData,
    enabled = true,
    deps = [],
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 요청 취소를 위한 AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiGet<T>(url, params);
      setData(response);
      onSuccess?.(response);
    } catch (err) {
      // 요청 취소로 인한 에러는 무시
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      const errorMessage = getErrorMessage(err, "데이터를 불러오는데 실패했습니다.");
      setError(errorMessage);
      onError?.(err);

      // 인증 에러 처리
      if (isApiError(err) && err.isUnauthorized) {
        // 로그인 페이지로 리다이렉트 등의 처리
        window.location.href = "/";
      }
    } finally {
      setIsLoading(false);
    }
  }, [url, params, onSuccess, onError]);

  // 의존성 변경 시 재요청
  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    return () => {
      // 컴포넌트 언마운트 시 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  // 수동으로 데이터 업데이트
  const mutate = useCallback((newData: T | ((prev: T | undefined) => T)) => {
    setData((prev) =>
      typeof newData === "function" ? (newData as (prev: T | undefined) => T)(prev) : newData
    );
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
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

