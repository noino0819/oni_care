"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NaverCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("네이버 로그인 처리 중...");

  useEffect(() => {
    const handleNaverLogin = async () => {
      if (!window.naver || !window.naver.LoginWithNaverId) {
        setStatus("네이버 SDK 로드 실패. 다시 시도해 주세요.");
        return;
      }

      const naverLogin = new window.naver.LoginWithNaverId({
        clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "YOUR_NAVER_CLIENT_ID",
        callbackUrl: `${window.location.origin}/auth/naver/callback`,
        isPopup: false,
        callbackHandle: true,
      });

      naverLogin.init();

      naverLogin.getLoginStatus(async (status: boolean) => {
        if (status) {
          const email = naverLogin.user.email;
          const name = naverLogin.user.name;
          const id = naverLogin.user.id; // Naver unique ID
          
          if (!email) {
            setStatus("이메일 정보가 없습니다. 다시 시도해 주세요.");
            return;
          }

          try {
            const supabase = createClient();
            
            // Dummy password strategy (In production, use a more secure method or server-side handling)
            // Using a fixed prefix + Naver ID might be better but for now using a fixed complex string
            // assuming the user will only login via Naver.
            const dummyPassword = process.env.NEXT_PUBLIC_NAVER_DUMMY_PASSWORD || "NaverLogin123!@#";

            // 1. Try to SignIn
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password: dummyPassword,
            });

            if (signInData.user) {
              // Login successful
              router.push("/auth/callback?code=mock_naver"); // Reuse existing callback logic if possible, or direct redirect
              // Since we are already logged in via Supabase client, we can redirect to home or verify check
              // But we need to run the logic in auth/callback to check for new/existing user?
              // Actually auth/callback expects a 'code' for exchange. Here we are already authenticated.
              // So we should replicate the logic: check if new user (profile exists?)
              
              checkUserAndRedirect(supabase, signInData.user.id);
              return;
            }

            // 2. If SignIn fails, Try SignUp
            if (signInError && signInError.message.includes("Invalid login credentials")) {
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password: dummyPassword,
                    options: {
                        data: {
                            name: name,
                            // Store Naver ID if needed
                        }
                    }
                });

                if (signUpError) throw signUpError;

                if (signUpData.user) {
                    checkUserAndRedirect(supabase, signUpData.user.id);
                }
            } else {
                throw signInError;
            }

          } catch (error: any) {
            console.error("Supabase Auth Error:", error);
            setStatus(`로그인 처리 중 오류가 발생했습니다: ${error.message}`);
          }
        } else {
          setStatus("네이버 로그인 정보 가져오기 실패.");
        }
      });
    };

    handleNaverLogin();
  }, [router]);

  const checkUserAndRedirect = async (supabase: any, userId: string) => {
      // Check if user exists in public.users table
      const { data: existingUser, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("id", userId)
          .single();

      if (existingUser) {
          router.push("/home");
      } else {
          router.push("/signup/terms");
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9F85E3] mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}
