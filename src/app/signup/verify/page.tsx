"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import DateWheelPicker from "@/components/ui/DateWheelPicker";
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
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Validation
  const isNameValid = name.length >= 2;
  const isBirthDateValid = birthDate.length === 8; // YYYYMMDD
  const isPhoneValid = phone.length >= 10;
  const isNextButtonEnabled = isVerified;
  
  // 이름 입력 검증 (한글 10자/영문 20자, 특수문자/숫자/띄어쓰기 불가)
  const validateNameInput = (value: string) => {
    // 한글, 영문만 허용 (특수문자, 숫자, 띄어쓰기 불가)
    const validChars = /^[가-힣a-zA-Z]*$/;
    if (!validChars.test(value)) {
      return name; // 유효하지 않은 문자는 입력 거부
    }
    
    // 한글/영문 개별 길이 체크
    const koreanCount = (value.match(/[가-힣]/g) || []).length;
    const englishCount = (value.match(/[a-zA-Z]/g) || []).length;
    
    // 한글 10자 초과 또는 영문 20자 초과 시 입력 거부
    if (koreanCount > 10 || englishCount > 20) {
      return name;
    }
    
    return value;
  };

  const handleSendPhone = () => {
    if (!isPhoneValid) return;
    setIsPhoneSent(true);
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
    if (!isNextButtonEnabled) return;

    const verifyData = {
      name,
      birthDate,
      gender,
      phone
    };
    sessionStorage.setItem("signup_verify", JSON.stringify(verifyData));
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
      <div className="px-6 py-2 sticky top-14 bg-white z-10 pb-4">
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
        
        {/* 5. 인증번호 (가장 위) */}
        {isPhoneSent && !isVerified && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
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

        {/* 4. 휴대폰 */}
        {gender && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-2xl font-bold">휴대폰 번호를 입력해 주세요.</h2>
            <div className="flex space-x-2">
              <Input 
                type="tel"
                placeholder="010-1234-5678" 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                className="h-14 rounded-xl text-lg bg-gray-50 border-none flex-1"
              />
              <Button 
                className="h-14 w-24 rounded-xl"
                disabled={!isPhoneValid}
                onClick={handleSendPhone}
              >
                {isPhoneSent ? "재전송" : "전송"}
              </Button>
            </div>
          </div>
        )}

        {/* 3. 성별 */}
        {isBirthDateValid && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
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

        {/* 2. 생년월일 */}
        {isNameValid && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className={cn("text-2xl font-bold transition-colors", isBirthDateValid ? "text-gray-400" : "text-black")}>
              생년월일을 입력해 주세요.
            </h2>
            <div 
              className={cn(
                "h-14 rounded-xl flex items-center px-4 text-lg transition-colors cursor-pointer",
                isBirthDateValid ? "bg-gray-100 text-gray-500" : "bg-gray-50 text-black"
              )}
              onClick={() => setShowDatePicker(true)}
            >
              {birthDate ? `${birthDate.slice(0,4)}년 ${birthDate.slice(4,6)}월 ${birthDate.slice(6,8)}일` : "YYYYMMDD"}
            </div>
          </div>
        )}

        {/* 1. 이름 (가장 아래) */}
        <div className="space-y-2 transition-all duration-500">
          <h1 className={cn("text-2xl font-bold transition-colors", isNameValid ? "text-gray-400" : "text-black")}>
            이름을 입력해 주세요.
          </h1>
          <Input 
            placeholder="이름" 
            value={name}
            onChange={(e) => setName(validateNameInput(e.target.value))}
            className={cn(
              "h-14 rounded-xl text-lg border-none transition-colors cursor-text",
              isNameValid ? "bg-gray-100 text-gray-500" : "bg-gray-50 text-black"
            )}
          />
        </div>

        {/* 생년월일 입력 후 "다음" 버튼 */}
        {isBirthDateValid && !gender && (
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 animate-in slide-in-from-bottom duration-300">
            <Button
              className="w-full h-14 text-base font-bold rounded-xl"
              size="lg"
              onClick={() => setShowGenderModal(true)}
            >
              다 음
            </Button>
          </div>
        )}

        {isVerified && (
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 animate-in slide-in-from-bottom duration-300">
            <Button
              className="w-full h-14 text-base font-bold rounded-xl"
              size="lg"
              onClick={handleNext}
              disabled={!isNextButtonEnabled}
            >
              다 음
            </Button>
          </div>
        )}
      </div>

      {/* Date Wheel Picker Modal */}
      {showDatePicker && (
        <DateWheelPicker 
          value={birthDate}
          onChange={setBirthDate}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {/* Gender Selection Modal */}
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
