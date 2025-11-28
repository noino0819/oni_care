"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Home, ChevronDown, Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function NutritionDiagnosisPage() {
  const router = useRouter();
  const [agreedAll, setAgreedAll] = useState(false);
  const [agreements, setAgreements] = useState({
    privacy: false,
    sensitive: false,
  });
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);

  const handleAgreeAll = () => {
    const newValue = !agreedAll;
    setAgreedAll(newValue);
    setAgreements({
      privacy: newValue,
      sensitive: newValue,
    });
  };

  const handleAgreement = (key: keyof typeof agreements) => {
    const newAgreements = { ...agreements, [key]: !agreements[key] };
    setAgreements(newAgreements);
    setAgreedAll(Object.values(newAgreements).every(Boolean));
  };

  const canProceed = agreements.privacy && agreements.sensitive;

  const handleStartDiagnosis = () => {
    // TODO: 외부 웹뷰로 이동하거나 설문 페이지로 이동
    // 실제로는 https://care.greating.co.kr/ 웹뷰 띄움
    router.push("/nutrition/diagnosis-result");
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <X className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">그리팅 영양진단</h1>
          <button onClick={() => router.push("/home")} className="p-1">
            <Home className="w-6 h-6 text-[#7B9B5C]" />
          </button>
        </div>
      </header>

      {/* 배너 이미지 */}
      <div className="relative w-full aspect-[4/5] bg-[#F5F5DC]">
        <div className="absolute inset-0 flex flex-col items-start justify-center px-6">
          <p className="text-[#7B9B5C] font-medium mb-2">GREATING</p>
          <p className="text-3xl font-bold text-gray-800 leading-tight mb-2">
            그리팅<br />
            영양 진단 서비스
          </p>
          <p className="text-gray-600 mb-8">나의 영양 섭취 점수는 몇 점?</p>

          {/* 설문 단계 안내 */}
          <div className="space-y-3 w-full max-w-xs">
            <div className="flex items-center gap-3 bg-white/80 rounded-xl p-3">
              <div className="w-10 h-10 rounded-full bg-[#7B9B5C] flex items-center justify-center text-white text-sm font-bold">
                1분
              </div>
              <div>
                <p className="font-medium text-gray-800">개인특성 조사</p>
                <p className="text-xs text-gray-500">신체정보, 질병, 관심사, 알러지 등 설문</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/80 rounded-xl p-3">
              <div className="w-10 h-10 rounded-full bg-[#7B9B5C] flex items-center justify-center text-white text-sm font-bold">
                2-3분
              </div>
              <div>
                <p className="font-medium text-gray-800">영양소별 섭취주기 조사</p>
                <p className="text-xs text-gray-500">22종 식품군의 섭취주기 설문</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 동의 섹션 */}
      <div className="px-4 py-6">
        {/* 전체 동의 */}
        <button
          onClick={handleAgreeAll}
          className="flex items-center gap-3 w-full p-4 border border-gray-200 rounded-xl mb-4"
        >
          <div className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
            agreedAll ? "bg-[#7B9B5C] border-[#7B9B5C]" : "border-gray-300"
          )}>
            {agreedAll && <Check className="w-4 h-4 text-white" />}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm">
              <span className="text-red-500">(필수)</span> 개인정보 수집 · 이용에
            </p>
            <p className="font-medium">모두 동의합니다.</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPrivacyDetail(!showPrivacyDetail);
            }}
          >
            <ChevronDown className={cn(
              "w-5 h-5 text-gray-400 transition-transform",
              showPrivacyDetail && "rotate-180"
            )} />
          </button>
        </button>

        {/* 상세 동의 내용 */}
        {showPrivacyDetail && (
          <div className="mb-4 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p className="mb-4">
              현대그린푸드(그리팅몰)는 영양진단 서비스 제공을 위하여 개인정보(민감정보 포함)를 수집 · 이용하고 있습니다. 
              내용을 자세히 읽으신 후 동의 여부를 결정해 주십시오.
            </p>

            {/* 개별 동의 항목 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleAgreement("privacy")}
                  className="flex items-center gap-2"
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    agreements.privacy ? "bg-[#7B9B5C] border-[#7B9B5C]" : "border-gray-300"
                  )}>
                    {agreements.privacy && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span><span className="text-red-500">(필수)</span> 개인정보 수집 · 이용 동의</span>
                </button>
                <button className="text-xs text-gray-500 underline">상세보기</button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleAgreement("sensitive")}
                  className="flex items-center gap-2"
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    agreements.sensitive ? "bg-[#7B9B5C] border-[#7B9B5C]" : "border-gray-300"
                  )}>
                    {agreements.sensitive && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span><span className="text-red-500">(필수)</span> 민감정보 수집 이용 동의</span>
                </button>
                <button className="text-xs text-gray-500 underline">상세보기</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <button
          onClick={handleStartDiagnosis}
          disabled={!canProceed}
          className={cn(
            "w-full py-4 rounded-xl font-medium text-lg transition-colors",
            canProceed
              ? "bg-[#7B9B5C] text-white"
              : "bg-gray-200 text-gray-400"
          )}
        >
          식습관 진단받기
        </button>
      </div>
    </div>
  );
}

