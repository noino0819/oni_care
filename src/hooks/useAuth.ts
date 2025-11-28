"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo, redirectIfFound = false } = options;
  const router = useRouter();
  const supabase = createClient();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth session error:", error);
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
          return;
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isAuthenticated: !!session?.user,
        });

        // 리다이렉트 처리
        if (redirectTo) {
          if (session?.user && redirectIfFound) {
            router.push(redirectTo);
          } else if (!session?.user && !redirectIfFound) {
            router.push(redirectTo);
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    getInitialSession();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session?.user,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, redirectTo, redirectIfFound]);

  // 로그인
  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    [supabase]
  );

  // 소셜 로그인
  const signInWithOAuth = useCallback(
    async (provider: "google" | "kakao") => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    [supabase]
  );

  // 회원가입
  const signUp = useCallback(
    async (email: string, password: string, metadata?: Record<string, unknown>) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    [supabase]
  );

  // 로그아웃
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    router.push("/");
  }, [supabase, router]);

  // 비밀번호 재설정 이메일 전송
  const resetPassword = useCallback(
    async (email: string) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    [supabase]
  );

  // 비밀번호 업데이트
  const updatePassword = useCallback(
    async (newPassword: string) => {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    [supabase]
  );

  return {
    ...authState,
    signIn,
    signInWithOAuth,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}

// 인증 필수 페이지에서 사용
export function useRequireAuth(redirectTo = "/") {
  return useAuth({ redirectTo, redirectIfFound: false });
}

// 게스트 전용 페이지에서 사용 (로그인 페이지 등)
export function useGuestOnly(redirectTo = "/home") {
  return useAuth({ redirectTo, redirectIfFound: true });
}


