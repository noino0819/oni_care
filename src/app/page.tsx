"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSNSLogin = async (provider: "kakao" | "google") => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
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
      {/* Logo Area */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Greating Care</h1>
      </div>

      {/* Login Form */}
      <div className="w-full space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">이메일</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력해주세요"
              className="h-12 rounded-xl bg-gray-50 border-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">비밀번호</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력해주세요"
              className="h-12 rounded-xl bg-gray-50 border-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </div>

      {/* Find ID/PW & Signup Links */}
      <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-500">
        <Link href="/find-account" className="hover:text-gray-900">비밀번호 찾기</Link>
        <span className="h-3 w-px bg-gray-300" />
        <Link href="/signup/terms" className="hover:text-gray-900">회원가입</Link>
      </div>

      {/* Divider */}
      <div className="relative w-full my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400">또는</span>
        </div>
      </div>

      {/* SNS Login Buttons */}
      <div className="w-full space-y-3">
        <Button
          type="button"
          onClick={() => handleSNSLogin("kakao")}
          variant="outline"
          className="w-full h-12 rounded-xl border-[#FEE500] bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 font-medium relative"
        >
          {/* Kakao Icon Placeholder */}
          <span className="absolute left-4">💬</span>
          카카오로 시작하기
        </Button>
        <Button
          type="button"
          onClick={() => handleSNSLogin("google")}
          variant="outline"
          className="w-full h-12 rounded-xl border-[#03C75A] bg-[#03C75A] text-white hover:bg-[#03C75A]/90 font-medium relative"
        >
          {/* Naver Icon Placeholder */}
          <span className="absolute left-4">N</span>
          네이버로 시작하기
        </Button>
      </div>
    </div>
  );
}
