"use client";

import { useState, useEffect, useRef } from "react";
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

  // Refs for scrolling
  const nameRef = useRef<HTMLDivElement>(null);
  const birthRef = useRef<HTMLDivElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const verifyRef = useRef<HTMLDivElement>(null);

  // Validation
  const isNameValid = name.length >= 2;
  const isBirthDateValid = birthDate.length === 6; 
  const isPhoneValid = phone.length >= 10;
  
  // Auto-scroll effect
  useEffect(() => {
    if (isNameValid && !birthDate) {
      setTimeout(() => birthRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }, [isNameValid, birthDate]);

  useEffect(() => {
    if (isBirthDateValid && !gender) {
      setTimeout(() => genderRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }, [isBirthDateValid, gender]);

  useEffect(() => {
    if (gender && !phone) {
      setTimeout(() => phoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }, [gender, phone]);

  useEffect(() => {
    if (isPhoneSent && !isVerified) {
      setTimeout(() => verifyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }, [isPhoneSent, isVerified]);

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

      <div className="flex-1 flex flex-col px-6 pb-24 space-y-8">
        
        {/* 이름 입력 */}
        <div ref={nameRef} className="space-y-2 transition-all duration-500">
          <h1 className={cn("text-2xl font-bold transition-colors", isNameValid ? "text-gray-400" : "text-black")}>
            이름을 입력해 주세요.
          </h1>
          <Input 
            placeholder="이름" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(
              "h-14 rounded-xl text-lg border-none transition-colors",
              isNameValid ? "bg-gray-100 text-gray-500" : "bg-gray-50 text-black"
            )}
            readOnly={isNameValid && !!birthDate} // 다음 단계 진행 시 읽기 전용 처리 (선택)
          />
        </div>

        {/* 생년월일 입력 */}
        {name.length >= 2 && (
          <div ref={birthRef} className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className={cn("text-2xl font-bold transition-colors", isBirthDateValid ? "text-gray-400" : "text-black")}>
              생년월일을 입력해 주세요.
            </h2>
            <Input 
              type="number"
              placeholder="YYMMDD (6자리)"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value.slice(0, 6))}
              className={cn(
                "h-14 rounded-xl text-lg border-none transition-colors",
                isBirthDateValid ? "bg-gray-100 text-gray-500" : "bg-gray-50 text-black"
              )}
            />
          </div>
        )}

        {/* 성별 선택 */}
        {isBirthDateValid && (
          <div ref={genderRef} className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className={cn("text-2xl font-bold transition-colors", gender ? "text-gray-400" : "text-black")}>
              성별을 선택해 주세요.
            </h2>
            <div 
              className={cn(
                "h-14 rounded-xl flex items-center px-4 justify-between cursor-pointer transition-colors",
                gender ? "bg-gray-100" : "bg-gray-50"
              )}
              onClick={() => setShowGenderModal(true)}
            >
              <span className={gender ? "text-gray-500" : "text-gray-400"}>
                {gender === "male" ? "남성" : gender === "female" ? "여성" : "성별 선택"}
              </span>
              <ChevronLeft className="h-5 w-5 rotate-270 text-gray-400" />
            </div>
          </div>
        )}

        {/* 휴대폰 번호 입력 */}
        {gender && (
          <div ref={phoneRef} className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold">휴대폰 번호를 입력해 주세요.</h2>
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
          <div ref={verifyRef} className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
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
