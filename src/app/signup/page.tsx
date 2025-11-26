"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Previous Step Data
  const [termsData, setTermsData] = useState<any>(null);
  const [verifyData, setVerifyData] = useState<any>(null);

  useEffect(() => {
    // Load data from session storage
    const terms = sessionStorage.getItem("signup_terms");
    const verify = sessionStorage.getItem("signup_verify");

    if (!terms || !verify) {
      // 데이터가 없으면 첫 단계로 리다이렉트
      router.replace("/signup/terms");
      return;
    }

    setTermsData(JSON.parse(terms));
    setVerifyData(JSON.parse(verify));
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // 1. Supabase Auth SignUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: verifyData.name, // 본인인증된 이름 사용
            // 기타 메타데이터는 trigger나 별도 로직으로 처리하거나 여기서 추가
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. users 테이블에 추가 정보 업데이트
        // trigger가 자동으로 row를 생성하지만, 추가 정보를 update 해야 함
        const { error: updateError } = await supabase
          .from("users")
          .update({
            name: verifyData.name,
            gender: verifyData.gender,
            birth_date: verifyData.birthDate,
            // phone: verifyData.phone, // users 테이블에 phone 컬럼이 있다면 추가
            // 약관 동의 정보도 필요하다면 저장
          })
          .eq("id", authData.user.id);

        if (updateError) {
          console.error("User data update error:", updateError);
          // 치명적이지 않다면 무시하거나 재시도 로직 필요
        }

        // 3. Clear session storage
        sessionStorage.removeItem("signup_terms");
        sessionStorage.removeItem("signup_verify");

        // 4. Redirect to Onboarding
        router.push("/onboarding");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err.message.includes("User already registered")) {
        setError("이미 가입된 이메일입니다.");
      } else {
        setError(err.message || "회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!termsData || !verifyData) return null; // Loading or Redirecting

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 sticky top-0 bg-white z-10">
        <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1 text-center font-medium text-lg pr-8">회원가입</div>
      </header>

      {/* Progress */}
      <div className="px-6 py-2">
        <div className="flex items-center space-x-2 mb-6">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">1</div>
          <div className="h-[1px] w-4 bg-primary"></div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">2</div>
          <div className="h-[1px] w-4 bg-primary"></div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">3</div>
        </div>
        <div className="text-xs text-gray-500 mb-1">정보입력</div>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-6">
        <h1 className="text-2xl font-bold mb-8">
          로그인에 사용할<br />
          아이디와 비밀번호를 입력해주세요
        </h1>

        <form onSubmit={handleSignup} className="flex-1 flex flex-col space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">이메일 아이디</label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-xl bg-gray-50 border-none text-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">비밀번호</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-xl bg-gray-50 border-none text-lg pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">비밀번호 확인</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호를 한번 더 입력해주세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-14 rounded-xl bg-gray-50 border-none text-lg pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <Button
              type="submit"
              className="w-full h-14 text-base font-bold rounded-xl"
              size="lg"
              disabled={loading}
            >
              {loading ? "가입 처리 중..." : "가입 완료"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
