"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SignupCompletePage() {
  const router = useRouter();
  const [signupData, setSignupData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem("signup_data");
    if (!data) {
      // 데이터가 없으면 리다이렉트
      router.replace("/signup/verify");
      return;
    }
    
    const parsed = JSON.parse(data);
    setSignupData(parsed);
    setLoading(false);
    
    // 가입 완료 후 세션 스토리지 클리어
    sessionStorage.removeItem("signup_verify");
    sessionStorage.removeItem("signup_data");
  }, [router]);

  const handleGoToSurvey = () => {
    // 설문 페이지로 이동 (추후 구현)
    router.push("/");
  };

  if (loading || !signupData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <button 
        className="absolute top-6 left-6 text-gray-500"
        onClick={() => router.push("/")}
      >
        <X className="h-6 w-6" />
      </button>

      <div className="w-full max-w-md flex flex-col items-center">
        {/* 환영 메시지 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl">🎉</span>
            <span className="text-3xl">🎊</span>
            <span className="text-3xl">🎉</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">
            {signupData.name}님 환영합니다
          </h1>
          <p className="text-xl font-medium text-gray-800 mb-2">
            회원가입이 완료
          </p>
          <p className="text-xl font-medium text-gray-800">
            되었습니다
          </p>
        </div>

        {/* 안내 메시지 */}
        <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8">
          <p className="text-sm text-gray-700 text-center leading-relaxed">
            3가지 질문에 대해주시면 그리팅 케어의<br />
            맞춤 건강관리 서비스를 경험하실 수 있습니다
          </p>
        </div>

        {/* 페이지 인디케이터 */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>

        {/* 캐릭터 이미지 영역 */}
        <div className="w-64 h-64 bg-primary/10 rounded-full flex items-center justify-center mb-12">
          <div className="text-center">
            <div className="text-6xl mb-2">👨‍⚕️</div>
            <p className="text-sm font-medium text-primary">개인맞춤건강관리 플랜</p>
          </div>
        </div>

        {/* 설문 하러 가기 버튼 */}
        <Button
          className="w-full h-14 text-base font-bold rounded-xl"
          size="lg"
          onClick={handleGoToSurvey}
        >
          설문 하러 가기
        </Button>
      </div>
    </div>
  );
}
