"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SignupTermsPage() {
  const router = useRouter();
  
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false, // 이용약관 (필수)
    privacy: false, // 개인정보 수집 및 이용동의 (필수)
    sensitive: false, // 민감정보 수집 및 이용동의 (필수)
    marketing: false, // 마케팅 활용동의 (선택)
    push: false, // 앱 푸시 알림 동의 (선택)
  });

  // 전체 동의 체크박스 로직
  const handleAllCheck = () => {
    const newValue = !agreements.all;
    setAgreements({
      all: newValue,
      terms: newValue,
      privacy: newValue,
      sensitive: newValue,
      marketing: newValue,
      push: newValue,
    });
  };

  // 개별 체크박스 로직
  const handleCheck = (key: keyof typeof agreements) => {
    setAgreements((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      
      // 모든 항목이 체크되었는지 확인하여 전체 동의 상태 업데이트
      const allChecked = 
        newState.terms && 
        newState.privacy && 
        newState.sensitive && 
        newState.marketing && 
        newState.push;
        
      return { ...newState, all: allChecked };
    });
  };

  // 필수 항목 동의 여부 확인
  const isRequiredChecked = agreements.terms && agreements.privacy && agreements.sensitive;

  const handleNext = () => {
    if (!isRequiredChecked) return;

    // 약관 동의 정보를 sessionStorage에 저장
    sessionStorage.setItem("signup_terms", JSON.stringify(agreements));
    
    // 본인인증 페이지로 이동
    router.push("/signup/verify");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 sticky top-0 bg-white z-10">
        <Link href="/">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="flex-1 text-center font-medium text-lg pr-8">회원가입</div>
      </header>

      {/* Progress */}
      <div className="px-6 py-2">
        <div className="flex items-center space-x-2 mb-6">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">1</div>
          <div className="h-[1px] w-4 bg-gray-300"></div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold">2</div>
          <div className="h-[1px] w-4 bg-gray-300"></div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold">3</div>
        </div>
        <div className="text-xs text-gray-500 mb-1">약관동의</div>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-6">
        <h1 className="text-2xl font-bold mb-8 leading-tight">
          가입을 위한 약관에<br />동의해주세요
        </h1>

        <div className="space-y-6">
          {/* 전체 동의 */}
          <div className="pb-4 border-b border-gray-100">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={handleAllCheck}
            >
              <span className="text-lg font-bold">전체동의</span>
              <div className={cn(
                "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                agreements.all ? "bg-primary border-primary" : "border-gray-300"
              )}>
                {agreements.all && <Check className="h-4 w-4 text-white" />}
              </div>
            </div>
          </div>

          {/* 개별 약관들 */}
          <div className="space-y-4">
            <TermItem 
              label="이용약관 (필수)" 
              checked={agreements.terms} 
              onCheck={() => handleCheck("terms")} 
            />
            <TermItem 
              label="개인정보 수집 및 이용동의 (필수)" 
              checked={agreements.privacy} 
              onCheck={() => handleCheck("privacy")} 
            />
            <TermItem 
              label="민감정보 수집 및 이용동의 (필수)" 
              checked={agreements.sensitive} 
              onCheck={() => handleCheck("sensitive")} 
            />
            <TermItem 
              label="마케팅 활용동의 (선택)" 
              checked={agreements.marketing} 
              onCheck={() => handleCheck("marketing")} 
            />
            <TermItem 
              label="앱 푸시(광고성) 알림 동의 (선택)" 
              checked={agreements.push} 
              onCheck={() => handleCheck("push")} 
            />
          </div>
        </div>

        {/* 마케팅 동의 배너 */}
        <div className="mt-8 bg-gray-50 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">
            마케팅 수신 동의 시 <span className="font-bold text-primary">500포인트</span>를 지급해 드려요!
          </p>
        </div>

        <div className="mt-auto pt-6">
          <Button
            className="w-full h-14 text-base font-bold rounded-xl"
            size="lg"
            disabled={!isRequiredChecked}
            onClick={handleNext}
          >
            다 음
          </Button>
        </div>
      </div>
    </div>
  );
}

function TermItem({ 
  label, 
  checked, 
  onCheck 
}: { 
  label: string; 
  checked: boolean; 
  onCheck: () => void; 
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={onCheck}>
        <div className={cn(
          "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
          checked ? "bg-primary border-primary" : "border-gray-300"
        )}>
          {checked && <Check className="h-3 w-3 text-white" />}
        </div>
        <span className="text-base text-gray-600">{label}</span>
      </div>
      <button className="text-sm text-gray-400 underline decoration-gray-300 underline-offset-4">
        보기
      </button>
    </div>
  );
}
