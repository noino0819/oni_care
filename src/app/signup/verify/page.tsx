"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SignupVerifyPage() {
  const router = useRouter();
  
  // Form State
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState(""); // YYYYMMDD
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  
  // UI State
  const [isPhoneSent, setIsPhoneSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  // Validation
  const isNameValid = name.length >= 2;
  const isBirthDateValid = birthDate.length === 6; // YYMMDD (기획서 기준) -> 실제로는 YYYYMMDD가 좋을 수 있으나 기획서 스크린샷에는 YYMMDD 예시가 보임. 하지만 2025년 기준 6자리는 모호함. 기획서 텍스트에는 "생년월일 입력 창 생성"이라고 되어 있음. 스크린샷에는 "000123" 처럼 6자리로 보임. 일단 6자리로 구현.
  // 수정: 기획서 상세 설명에 "스피너 범위: 1926년 ~ 2025년" 이라고 되어 있고, "YYYYMMDD" 형태의 입력창이 보임.
  // 스크린샷 2-1을 보면 "2025년 02월 11일" 처럼 스피너(Wheel Picker) 형태임.
  // 웹에서는 Native Date Picker를 사용하는 것이 가장 유사함.
  
  const isPhoneValid = phone.length >= 10;
  
  const handleSendPhone = () => {
    if (!isPhoneValid) return;
    setIsPhoneSent(true);
    // Mocking: 실제로는 SMS 전송 API 호출
    alert("인증번호가 전송되었습니다. (테스트용: 123456)");
  };

  const handleVerify = () => {
    if (verifyCode === "123456") {
      setIsVerified(true);
    } else {
      alert("인증번호가 올바르지 않습니다.");
    }
  };

  const handleNext = () => {
    if (!isVerified) return;

    // 본인인증 정보를 sessionStorage에 저장
    const verifyData = {
      name,
      birthDate, // 실제로는 YYYY-MM-DD 포맷으로 변환 필요할 수 있음
      gender,
      phone
    };
    sessionStorage.setItem("signup_verify", JSON.stringify(verifyData));
    
    // 계정 생성 페이지로 이동
    router.push("/signup");
  };

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
          <div className="h-[1px] w-4 bg-gray-300"></div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold">3</div>
        </div>
        <div className="text-xs text-gray-500 mb-1">본인인증</div>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-6 space-y-6">
        <h1 className="text-2xl font-bold mb-2">
          이름을 입력해 주세요.
        </h1>

        {/* 이름 입력 */}
        <div className="space-y-1">
          <Input 
            placeholder="이름" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 rounded-xl text-lg bg-gray-50 border-none"
          />
        </div>

        {/* 생년월일 입력 */}
        {name.length >= 2 && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold">생년월일을 입력해 주세요.</h2>
            <Input 
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="h-14 rounded-xl text-lg bg-gray-50 border-none"
            />
          </div>
        )}

        {/* 성별 선택 */}
        {birthDate && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold">성별을 선택해 주세요.</h2>
            <div 
              className="h-14 rounded-xl bg-gray-50 flex items-center px-4 justify-between cursor-pointer"
              onClick={() => setShowGenderModal(true)}
            >
              <span className={gender ? "text-black" : "text-gray-400"}>
                {gender === "male" ? "남성" : gender === "female" ? "여성" : "성별 선택"}
              </span>
              <ChevronLeft className="h-5 w-5 rotate-270 text-gray-400" />
            </div>
          </div>
        )}

        {/* 휴대폰 번호 입력 */}
        {gender && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold">휴대폰 번호를 입력해 주세요.</h2>
            <div className="flex space-x-2">
              <Input 
                type="tel"
                placeholder="010-1234-5678" 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                className="h-14 rounded-xl text-lg bg-gray-50 border-none flex-1"
                disabled={isVerified}
              />
              <Button 
                className="h-14 w-24 rounded-xl"
                disabled={!isPhoneValid || isVerified}
                onClick={handleSendPhone}
              >
                {isPhoneSent ? "재전송" : "전송"}
              </Button>
            </div>
          </div>
        )}

        {/* 인증번호 입력 */}
        {isPhoneSent && !isVerified && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Input 
              type="number"
              placeholder="인증번호 6자리" 
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="h-14 rounded-xl text-lg bg-gray-50 border-none"
            />
            <Button 
              className="w-full h-14 rounded-xl mt-2"
              onClick={handleVerify}
            >
              인증확인
            </Button>
          </div>
        )}

        <div className="mt-auto pt-6">
          <Button
            className="w-full h-14 text-base font-bold rounded-xl"
            size="lg"
            disabled={!isVerified}
            onClick={handleNext}
          >
            다 음
          </Button>
        </div>
      </div>

      {/* 성별 선택 모달 (Bottom Sheet) */}
      {showGenderModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white w-full max-w-md rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">성별을 선택해 주세요.</h3>
              <button onClick={() => setShowGenderModal(false)}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <button 
                className="w-full py-4 text-left text-lg font-medium border-b border-gray-100"
                onClick={() => { setGender("female"); setShowGenderModal(false); }}
              >
                여성
              </button>
              <button 
                className="w-full py-4 text-left text-lg font-medium border-b border-gray-100"
                onClick={() => { setGender("male"); setShowGenderModal(false); }}
              >
                남성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
