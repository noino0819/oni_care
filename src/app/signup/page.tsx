"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [verifyData, setVerifyData] = useState<any>(null);
  
  // Form State
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [companyCode, setCompanyCode] = useState("");

  useEffect(() => {
    const data = sessionStorage.getItem("signup_verify");
    if (!data) {
      router.push("/signup/verify");
      return;
    }
    const parsed = JSON.parse(data);
    setVerifyData(parsed);
    
    // 그리팅몰 ID 사용 시 자동 입력
    if (parsed.useGreetingId && parsed.greetingId) {
      setUserId(parsed.greetingId);
    }
  }, [router]);

  const isPasswordValid = password.length >= 8;
  const isPasswordMatch = password === passwordConfirm;
  const isUserIdValid = userId.length >= 4;
  const canSubmit = isPasswordValid && isPasswordMatch && (verifyData?.useGreetingId || isUserIdValid);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const signupData = {
      ...verifyData,
      userId,
      password,
      companyCode: companyCode || null,
    };

    // Mock 회원가입 API 호출 (실제로는 서버에 저장)
    sessionStorage.setItem("signup_data", JSON.stringify(signupData));
    router.push("/signup/complete");
  };

  if (!verifyData) return null;

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
      <div className="px-6 py-2 sticky top-14 bg-white z-10 pb-4">
        <div className="flex items-center space-x-2 mb-6">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">1</div>
          <div className="h-[1px] w-4 bg-primary"></div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">2</div>
          <div className="h-[1px] w-4 bg-primary"></div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">3</div>
        </div>
        <div className="text-xs text-gray-500 mb-1">회원 정보 입력</div>
      </div>

      <div className="flex-1 px-6 pb-24">
        <h1 className="text-2xl font-bold mb-2">
          {verifyData.useGreetingId 
            ? "비밀번호를 입력해 주세요."
            : "아이디와 비밀번호를 입력해 주세요."
          }
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {verifyData.useGreetingId && "기업코드 또는 사업장 코드를 입력해 주세요. (선택)"}
        </p>
        
        <div className="space-y-6">
          {/* 그리팅몰 ID (자동 입력) */}
          {verifyData.useGreetingId && (
            <div className="space-y-2">
              <label className="text-sm text-gray-600">아이디 (그리팅몰 ID)</label>
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
                onChange={(e) => setUserId(e.target.value)}
                className="h-14 rounded-xl text-base bg-gray-50 border-none"
              />
              {userId && !isUserIdValid && (
                <p className="text-xs text-red-500">아이디는 4자 이상이어야 합니다.</p>
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
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-xl text-base bg-gray-50 border-none"
            />
            {password && !isPasswordValid && (
              <p className="text-xs text-red-500">비밀번호는 8자 이상이어야 합니다.</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">비밀번호 확인</label>
            <Input 
              type="password"
              placeholder="비밀번호 재입력" 
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="h-14 rounded-xl text-base bg-gray-50 border-none"
            />
            {passwordConfirm && !isPasswordMatch && (
              <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          {/* 기업코드/사업장코드 (선택) */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">기업코드 또는 사업장 코드 (선택)</label>
            <Input 
              placeholder="코드 입력 (선택사항)" 
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
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
          disabled={!canSubmit}
        >
          가입하기
        </Button>
      </div>
    </div>
  );
}
