"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

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
    
    // 가입 완료 후 세션 스토리지 클리어는 설문 페이지로 이동할 때 수행하거나 유지
    // sessionStorage.removeItem("signup_verify");
    // sessionStorage.removeItem("signup_data");
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
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Confetti Background */}
      <div className="absolute top-0 left-0 right-0 h-64 z-0 pointer-events-none">
        <Image 
          src="/images/confetti.png" 
          alt="Confetti" 
          fill 
          className="object-cover opacity-80"
          priority
        />
      </div>

      <div className="flex-1 flex flex-col p-6 z-10 pt-20">
        {/* 환영 메시지 */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold leading-tight mb-4 text-gray-900">
            {signupData.name}님 환영합니다<br />
            회원가입이 완료<br />
            되었습니다
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            3가지 질문에 답해주시면 그리팅 케어의<br />
            맞춤 건강관리 서비스를 경험하실 수 있습니다
          </p>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-10">
          {/* Pagination Dots */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#9F85E3]"></div>
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
          </div>

          {/* Label */}
          <h2 className="text-[#6B46C1] font-bold text-lg mb-6">
            개인맞춤건강관리 플랜
          </h2>

          {/* Character Image */}
          <div className="relative w-64 h-64">
            <Image 
              src="/images/doctor.png" 
              alt="Doctor Character" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-auto pb-6">
          <Button
            className="w-full h-14 text-lg font-bold rounded-full bg-gray-500 hover:bg-gray-600 text-white"
            size="lg"
            onClick={handleGoToSurvey}
          >
            설문 하러 가기
          </Button>
        </div>
      </div>
    </div>
  );
}
