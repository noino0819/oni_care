"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [verifyData, setVerifyData] = useState<any>(null);
  const [termsData, setTermsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [companyCode, setCompanyCode] = useState("");

  useEffect(() => {
    const vData = sessionStorage.getItem("signup_verify");
    const tData = sessionStorage.getItem("signup_terms");

    if (!vData) {
      router.push("/signup/verify");
      return;
    }

    const parsedVerify = JSON.parse(vData);
    setVerifyData(parsedVerify);
    if (tData) setTermsData(JSON.parse(tData));

    // 그리팅몰 ID 사용 시 자동 입력
    if (parsedVerify.useGreetingId && parsedVerify.greetingId) {
      setUserId(parsedVerify.greetingId);
    }
  }, [router]);

  const isPasswordValid = password.length >= 8;
  const isPasswordMatch = password === passwordConfirm;
  const isUserIdValid = userId.length >= 4;
  const canSubmit =
    isPasswordValid &&
    isPasswordMatch &&
    (verifyData?.useGreetingId || isUserIdValid);

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      // 1. Social Login User (Update existing account)
      if (currentUser) {
        // Update password if provided
        if (password) {
          const { error: passwordError } = await supabase.auth.updateUser({
            password,
          });
          if (passwordError)
            console.error("Password update error:", passwordError);
        }

        // Update users table (Upsert to handle case where public.users row doesn't exist yet)
        const { error: updateError } = await supabase
          .from("users")
          .upsert({
            id: currentUser.id,
            name: verifyData.name,
            gender: verifyData.gender,
            birth_date: verifyData.birthDate,
            phone: verifyData.phone,
            business_code: companyCode || null,
            greeting_id: verifyData.useGreetingId
              ? verifyData.greetingId
              : null,
            is_greeting_connected: verifyData.useGreetingId,
            marketing_agreed: termsData?.marketing || false,
            email: currentUser.email || "", // Ensure email is present for new row
            // login_id: userId // If you have a column for this
          })
          .select(); // Select to ensure return value if needed, though we check error

        if (updateError) throw updateError;

        const signupData = {
          ...verifyData,
          userId,
          companyCode,
        };
        sessionStorage.setItem("signup_data", JSON.stringify(signupData));
        router.push("/signup/complete");
        return;
      }

      // 2. New User (Email Signup)
      // userId가 이메일 형식이 아닐 수 있으므로 가짜 도메인 추가
      let sanitizedId = userId.trim();
      const isEmail = sanitizedId.includes("@");

      if (!isEmail) {
        // 영문, 숫자, 언더바, 하이픈, 점만 허용
        sanitizedId = sanitizedId.replace(/[^a-zA-Z0-9._-]/g, "");
      }

      // 빈 문자열이면 에러 처리
      if (!sanitizedId) {
        alert("아이디를 올바르게 입력해주세요.");
        setLoading(false);
        return;
      }

      const email = isEmail ? sanitizedId : `${sanitizedId}@gmail.com`;
      console.log("Signup attempt with:", email);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: verifyData.name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. users 테이블 업데이트
        const { error: updateError } = await supabase
          .from("users")
          .update({
            name: verifyData.name,
            gender: verifyData.gender,
            birth_date: verifyData.birthDate,
            phone: verifyData.phone,
            business_code: companyCode || null,
            greeting_id: verifyData.useGreetingId
              ? verifyData.greetingId
              : null,
            is_greeting_connected: verifyData.useGreetingId,
            marketing_agreed: termsData?.marketing || false,
          })
          .eq("id", authData.user.id);

        if (updateError) {
          console.error("User update error:", updateError);
          // 업데이트 실패해도 가입은 진행? 일단 진행
        }

        const signupData = {
          ...verifyData,
          userId,
          companyCode,
        };
        sessionStorage.setItem("signup_data", JSON.stringify(signupData));
        router.push("/signup/complete");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      alert(error.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!verifyData) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 sticky top-0 bg-white z-10">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1 text-center font-medium text-lg pr-8">
          회원가입
        </div>
      </header>

      {/* Progress */}
      <div className="px-6 py-2 sticky top-14 bg-white z-10 pb-4">
        <div className="flex items-center space-x-2 mb-6">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
            1
          </div>
          <div className="h-[1px] w-4 bg-primary"></div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
            2
          </div>
          <div className="h-[1px] w-4 bg-primary"></div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
            3
          </div>
        </div>
        <div className="text-xs text-gray-500 mb-1">회원 정보 입력</div>
      </div>

      <div className="flex-1 px-6 pb-24">
        <h1 className="text-2xl font-bold mb-2">
          {verifyData.useGreetingId
            ? "비밀번호를 입력해 주세요."
            : "아이디와 비밀번호를 입력해 주세요."}
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {verifyData.useGreetingId &&
            "기업코드 또는 사업장 코드를 입력해 주세요. (선택)"}
        </p>

        <div className="space-y-6">
          {/* 그리팅몰 ID (자동 입력) */}
          {verifyData.useGreetingId && (
            <div className="space-y-2">
              <label className="text-sm text-gray-600">
                아이디 (그리팅몰 ID)
              </label>
              <Input
                placeholder="아이디"
                value={userId}
                disabled
                className="h-14 rounded-xl text-base bg-gray-100 border-none text-gray-600"
              />
            </div>
          )}

          {/* 아이디 (일반 가입 시만) */}
          {!verifyData.useGreetingId && (
            <div className="space-y-2">
              <label className="text-sm text-gray-600">아이디</label>
              <Input
                placeholder="아이디 입력 (4자 이상)"
                value={userId}
                onChange={(e: any) => setUserId(e.target.value)}
                className="h-14 rounded-xl text-base bg-gray-50 border-none"
              />
              {userId && !isUserIdValid && (
                <p className="text-xs text-red-500">
                  아이디는 4자 이상이어야 합니다.
                </p>
              )}
            </div>
          )}

          {/* 비밀번호 */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">비밀번호</label>
            <Input
              type="password"
              placeholder="8자 이상 입력"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              className="h-14 rounded-xl text-base bg-gray-50 border-none"
            />
            {password && !isPasswordValid && (
              <p className="text-xs text-red-500">
                비밀번호는 8자 이상이어야 합니다.
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">비밀번호 확인</label>
            <Input
              type="password"
              placeholder="비밀번호 재입력"
              value={passwordConfirm}
              onChange={(e: any) => setPasswordConfirm(e.target.value)}
              className="h-14 rounded-xl text-base bg-gray-50 border-none"
            />
            {passwordConfirm && !isPasswordMatch && (
              <p className="text-xs text-red-500">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          {/* 기업코드/사업장코드 (선택) */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">
              기업코드 또는 사업장 코드 (선택)
            </label>
            <Input
              placeholder="코드 입력 (선택사항)"
              value={companyCode}
              onChange={(e: any) => setCompanyCode(e.target.value)}
              className="h-14 rounded-xl text-base bg-gray-50 border-none"
            />
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
        <Button
          className="w-full h-14 text-base font-bold rounded-xl"
          size="lg"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
        >
          {loading ? "가입 처리 중..." : "가입하기"}
        </Button>
      </div>
    </div>
  );
}
