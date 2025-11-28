import { NextResponse } from "next/server";

// ============================================
// API 응답 타입
// ============================================

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// API 응답 헬퍼 (서버용)
// ============================================

/**
 * 성공 응답 생성
 */
export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } satisfies ApiSuccessResponse<T>,
    { status }
  );
}

/**
 * 에러 응답 생성
 */
export function errorResponse(
  error: string,
  status = 500,
  code?: string,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      details,
    } satisfies ApiErrorResponse,
    { status }
  );
}

// 자주 사용되는 에러 응답
export const ErrorResponses = {
  unauthorized: () => errorResponse("로그인이 필요합니다.", 401, "UNAUTHORIZED"),
  forbidden: () => errorResponse("권한이 없습니다.", 403, "FORBIDDEN"),
  notFound: (resource = "리소스") => errorResponse(`${resource}를 찾을 수 없습니다.`, 404, "NOT_FOUND"),
  badRequest: (message = "잘못된 요청입니다.") => errorResponse(message, 400, "BAD_REQUEST"),
  conflict: (message = "이미 존재합니다.") => errorResponse(message, 409, "CONFLICT"),
  serverError: (message = "서버 오류가 발생했습니다.") => errorResponse(message, 500, "SERVER_ERROR"),
  validationError: (message: string, details?: unknown) => errorResponse(message, 422, "VALIDATION_ERROR", details),
} as const;

// ============================================
// 클라이언트용 API 호출 헬퍼
// ============================================

export interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * 기본 fetch wrapper
 */
export async function apiFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, params, ...fetchOptions } = options;

  // URL 파라미터 처리
  let finalUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      finalUrl += `?${queryString}`;
    }
  }

  // fetch 요청
  const response = await fetch(finalUrl, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // 응답 파싱
  const data = await response.json();

  // 에러 처리
  if (!response.ok) {
    throw new ApiError(
      data.error || "요청 처리 중 오류가 발생했습니다.",
      response.status,
      data.code,
      data.details
    );
  }

  return data;
}

/**
 * GET 요청
 */
export function apiGet<T>(url: string, params?: FetchOptions["params"]) {
  return apiFetch<T>(url, { method: "GET", params });
}

/**
 * POST 요청
 */
export function apiPost<T>(url: string, body?: unknown, options?: FetchOptions) {
  return apiFetch<T>(url, { method: "POST", body, ...options });
}

/**
 * PUT 요청
 */
export function apiPut<T>(url: string, body?: unknown, options?: FetchOptions) {
  return apiFetch<T>(url, { method: "PUT", body, ...options });
}

/**
 * PATCH 요청
 */
export function apiPatch<T>(url: string, body?: unknown, options?: FetchOptions) {
  return apiFetch<T>(url, { method: "PATCH", body, ...options });
}

/**
 * DELETE 요청
 */
export function apiDelete<T>(url: string, options?: FetchOptions) {
  return apiFetch<T>(url, { method: "DELETE", ...options });
}

// ============================================
// 커스텀 에러 클래스
// ============================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isValidationError() {
    return this.status === 422;
  }

  get isServerError() {
    return this.status >= 500;
  }
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * API 에러인지 확인
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * 에러 메시지 추출
 */
export function getErrorMessage(error: unknown, defaultMessage = "오류가 발생했습니다."): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return defaultMessage;
}

/**
 * API 응답에서 데이터 추출
 */
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiError(response.error, 500, response.code);
  }
  return response.data;
}

// ============================================
// 재시도 로직
// ============================================

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryOn?: (error: unknown) => boolean;
}

/**
 * 재시도가 가능한 fetch
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryOn = (error) => {
      if (isApiError(error)) {
        return error.isServerError;
      }
      return false;
    },
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries && retryOn(error)) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}


