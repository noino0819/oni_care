"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock } from "lucide-react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // URL에서 이메일 파라미터 받아오기 (아이디 찾기에서 넘어온 경우)
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  // Naver Login Init
  useEffect(() => {
    const initNaverLogin = () => {
      if (window.naver && window.naver.LoginWithNaverId) {
        const naverLogin = new window.naver.LoginWithNaverId({
          clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "YOUR_NAVER_CLIENT_ID", // Env var needed
          callbackUrl: `${window.location.origin}/auth/naver/callback`,
          isPopup: false,
          loginButton: { color: "green", type: 3, height: 60 },
        });
        naverLogin.init();
      }
    };
    
    // Script might not be loaded yet, retry if needed or use onLoad in Script (but Script is in layout)
    // Simple timeout retry for now
    const timer = setTimeout(initNaverLogin, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        router.push("/home");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message === "Invalid login credentials" 
        ? "이메일 또는 비밀번호가 올바르지 않습니다." 
        : "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSNSLogin = async (provider: "kakao" | "google" | "naver") => {
    if (provider === "naver") {
      const naverLoginBtn = document.getElementById("naverIdLogin")?.firstChild as HTMLElement;
      if (naverLoginBtn) {
        naverLoginBtn.click();
      }
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("SNS Login error:", err);
      setError("SNS 로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      {/* Hidden Naver Login Button */}
      <div id="naverIdLogin" className="hidden" />

      {/* Logo Area */}
      <div className="mb-12 text-center flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="GREATING Care"
          width={240}
          height={80}
          priority
          className="h-auto w-auto object-contain"
        />
      </div>

      {/* Login Form */}
      <div className="w-full space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="아이디 입력"
              className="h-12 rounded-full bg-white border-gray-200 focus:border-[#9F85E3] focus:ring-[#9F85E3]"
              startIcon={<User className="w-5 h-5 text-gray-300" />}
              required
            />
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              className="h-12 rounded-full bg-white border-gray-200 focus:border-[#9F85E3] focus:ring-[#9F85E3]"
              startIcon={<Lock className="w-5 h-5 text-gray-300" />}
              required
            />
          </div>

          <div className="flex items-center space-x-2 px-1">
            <input 
              type="checkbox" 
              id="auto-login" 
              className="w-4 h-4 rounded border-gray-300 text-[#9F85E3] focus:ring-[#9F85E3]"
            />
            <label htmlFor="auto-login" className="text-sm text-gray-500">자동로그인 설정</label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-lg font-medium rounded-full bg-[#9F85E3] hover:bg-[#8A72D1] disabled:opacity-50 text-white mt-4"
          >
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </div>

      {/* Find ID/PW & Signup Links */}
      <div className="flex items-center justify-center space-x-4 mt-6 text-sm text-gray-500">
        <Link href="/find-account" className="hover:text-gray-900">아이디 찾기</Link>
        <span className="h-3 w-px bg-gray-300" />
        <Link href="/find-account" className="hover:text-gray-900">비밀번호 찾기</Link>
        <span className="h-3 w-px bg-gray-300" />
        <Link href="/signup/terms" className="hover:text-gray-900 font-medium">회원가입</Link>
      </div>

      {/* SNS Login Buttons */}
      <div className="mt-12 w-full flex flex-col items-center">
        <p className="text-sm text-gray-500 mb-4">SNS계정으로 간편하게 로그인하세요.</p>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => handleSNSLogin("naver")}
            className="w-12 h-12 rounded-full bg-[#03C75A] flex items-center justify-center text-white text-xl font-bold hover:opacity-90 transition-opacity"
          >
            N
          </button>
          <button
            type="button"
            onClick={() => handleSNSLogin("kakao")}
            className="w-12 h-12 rounded-full bg-[#FEE500] flex items-center justify-center text-[#3C1E1E] hover:opacity-90 transition-opacity"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.682 2.545-.78 2.94-.122.49.178.483.376.351.279-.186 4.418-2.997 5.166-3.515.63.09 1.28.138 1.948.138 4.97 0 9-3.185 9-7.115C23 6.185 18.97 3 12 3z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#9F85E3] border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
