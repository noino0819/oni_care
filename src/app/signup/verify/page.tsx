"use client";

import { useState, useEffect } from "react";
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
  const [birthDate, setBirthDate] = useState("19830101"); // 디폴트: 1983년 1월 1일
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  
  // UI State
  const [isPhoneSent, setIsPhoneSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [timer, setTimer] = useState(0);

  // Validation
  const isNameValid = name.length >= 2;
  const isBirthDateValid = birthDate.length === 8;
  const isGenderValid = gender !== "";
  const isPhoneValid = phone.length >= 10;
  const isVerifyCodeValid = verifyCode.length === 6;
  const canSubmit = isNameValid && isBirthDateValid && isGenderValid && isVerified;
  
  // 타이머 로직
  useEffect(() => {
    if (timer > 0 && !isVerified) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, isVerified]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  // 이름 입력 검증
  const validateNameInput = (value: string) => {
    if (isComposing) return value;
    if (value === "") return value;
    
    const validChars = /^[가-힣a-zA-Z]*$/;
    if (!validChars.test(value)) {
      return value.replace(/[^가-힣a-zA-Z]/g, '');
    }
    
    const koreanCount = (value.match(/[가-힣]/g) || []).length;
    const englishCount = (value.match(/[a-zA-Z]/g) || []).length;
    
    if (koreanCount > 10) {
      const matches = value.match(/[가-힣]/g);
      if (matches) return matches.slice(0, 10).join('');
    }
    
    if (englishCount > 20) {
      const matches = value.match(/[a-zA-Z]/g);
      if (matches) return matches.slice(0, 20).join('');
    }
    
    return value;
  };

  const handleSendPhone = () => {
    if (!isPhoneValid) return;
    setIsPhoneSent(true);
    setTimer(180); // 3분
    setVerifyError("");
    alert("인증번호가 전송되었습니다. (테스트용: 123456)");
  };

  const handleVerify = () => {
    if (verifyCode === "123456") {
      setIsVerified(true);
      setVerifyError("");
      setTimer(0);
    } else {
      setVerifyError("인증번호가 일치하지 않습니다. 인증번호를 확인해주세요.");
    }
  };

  const handleNext = () => {
    if (!canSubmit) return;

    const verifyData = { name, birthDate, gender, phone };
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

      <div className="flex-1 px-6 pb-24">
        <h1 className="text-2xl font-bold mb-8">휴대폰번호를 입력해 주세요.</h1>
        
        <div className="space-y-6">
          {/* 이름 */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">이름</label>
            <Input 
              placeholder="김건강" 
              value={name}
              onChange={(e) => setName(validateNameInput(e.target.value))}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={(e) => {
                setIsComposing(false);
                const target = e.target as HTMLInputElement;
                setName(validateNameInput(target.value));
              }}
              className="h-14 rounded-xl text-base bg-gray-50 border-none"
            />
          </div>

          {/* 생년월일 */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">생년월일</label>
            <div 
              className="h-14 rounded-xl flex items-center px-4 text-base bg-gray-50 cursor-pointer"
              onClick={() => setShowDatePicker(true)}
            >
              <span className={birthDate ? "text-gray-900" : "text-gray-400"}>
                {birthDate ? `${birthDate.slice(0,4)}.${birthDate.slice(4,6)}.${birthDate.slice(6,8)}` : "0000123"}
              </span>
            </div>
          </div>

          {/* 성별 */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">성별</label>
            <div 
              className="h-14 rounded-xl flex items-center px-4 justify-between cursor-pointer bg-gray-50"
              onClick={() => setShowGenderModal(true)}
            >
              <span className={gender ? "text-gray-900" : "text-gray-400"}>
                {gender === "male" ? "남성" : gender === "female" ? "여성" : "성별 선택"}
              </span>
              <ChevronLeft className="h-5 w-5 rotate-270 text-gray-400" />
            </div>
          </div>

          {/* 휴대폰 번호 */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">휴대폰 번호</label>
            <div className="flex space-x-2">
              <Input 
                type="tel"
                placeholder="010-1234-5678" 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                className="h-14 rounded-xl text-base bg-gray-50 border-none flex-1"
              />
              <Button 
                className="h-14 px-6 rounded-xl whitespace-nowrap"
                disabled={!isPhoneValid}
                onClick={handleSendPhone}
              >
                재전송
              </Button>
            </div>
          </div>

          {/* 인증번호 */}
          {isPhoneSent && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="relative">
                <Input 
                  type="text"
                  placeholder="111456" 
                  value={verifyCode}
                  onChange={(e) => {
                    setVerifyCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6));
                    setVerifyError("");
                  }}
                  className={cn(
                    "h-14 rounded-xl text-base bg-gray-50 border-none pr-16",
                    verifyError && "border-2 border-red-500"
                  )}
                />
                {timer > 0 && !isVerified && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 text-sm font-medium">
                    {formatTime(timer)}
                  </div>
                )}
              </div>
              {verifyError && (
                <p className="text-red-500 text-xs">{verifyError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      {isPhoneSent && !isVerified && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
          <Button
            className="w-full h-14 text-base font-bold rounded-xl"
            size="lg"
            onClick={handleVerify}
            disabled={!isVerifyCodeValid}
          >
            인증하기
          </Button>
        </div>
      )}

      {isVerified && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
          <Button
            className="w-full h-14 text-base font-bold rounded-xl"
            size="lg"
            onClick={handleNext}
            disabled={!canSubmit}
          >
            다 음
          </Button>
        </div>
      )}

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
