"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import DateWheelPicker from "@/components/ui/DateWheelPicker";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function SignupVerifyPage() {
  const router = useRouter();
  
  // Form State
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState(""); // 빈 값으로 시작, 스피너는 1983년 디폴트
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
  
  // 그리팅몰 연동 상태
  const [showGreetingModal, setShowGreetingModal] = useState(false);
  const [showGreetingInfoModal, setShowGreetingInfoModal] = useState(false);
  const [greetingAgree, setGreetingAgree] = useState(false);
  const [greetingData, setGreetingData] = useState<{id: string, joinDate: string} | null>(null);

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
      // 인증 완료 후 자동으로 그리팅몰 연동 팝업 표시
      setTimeout(() => {
        setShowGreetingModal(true);
      }, 500);
    } else {
      setVerifyError("인증번호가 일치하지 않습니다. 인증번호를 확인해주세요.");
    }
  };
  
  // Mock 그리팅몰 API 호출
  const handleGreetingConnect = async () => {
    // Mock API 응답
    const mockResponse = {
      success: true,
      data: {
        id: "kimsample",
        joinDate: "2025.02.10"
      }
    };
    
    setGreetingData(mockResponse.data);
    setShowGreetingModal(false);
    setShowGreetingInfoModal(true);
  };
  
  // 일반 가입하기
  const handleNormalSignup = () => {
    const verifyData = { name, birthDate, gender, phone, useGreetingId: false };
    sessionStorage.setItem("signup_verify", JSON.stringify(verifyData));
    router.push("/signup");
  };
  
  // 그리팅몰 ID로 가입하기
  const handleGreetingSignup = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("로그인 정보가 없습니다.");
      }

      // 약관 동의 정보 가져오기
      const tData = sessionStorage.getItem("signup_terms");
      const terms = tData ? JSON.parse(tData) : {};

      // 사용자 정보 업데이트 (Upsert to handle case where public.users row doesn't exist yet)
      const { error: updateError } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          email: user.email || "", // Ensure email is present
          name,
          gender,
          birth_date: birthDate,
          phone,
          greeting_id: greetingData?.id,
          is_greeting_connected: true,
          marketing_agreed: terms.marketing || false,
        })
        .select();

      if (updateError) throw updateError;

      // 완료 페이지를 위한 데이터 저장
      const signupData = {
        name,
        userId: greetingData?.id,
        joinDate: greetingData?.joinDate
      };
      sessionStorage.setItem("signup_data", JSON.stringify(signupData));
      
      router.push("/signup/complete");
    } catch (error: any) {
      console.error("Signup error:", error);
      alert(error.message || "가입 처리 중 오류가 발생했습니다.");
    }
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
        <h1 className="text-2xl font-bold mb-8">
          {!isNameValid && "이름을 입력해 주세요. (필수)"}
          {isNameValid && !isBirthDateValid && "생년월일을 입력해 주세요. (필수)"}
          {isBirthDateValid && !isGenderValid && "성별을 선택해 주세요. (필수)"}
          {isGenderValid && "휴대폰번호를 입력해 주세요."}
        </h1>
        
        <div className="space-y-6">
          {/* 4. 휴대폰 번호 */}
          {isGenderValid && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
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
              
              {/* 5. 인증번호 (휴대폰 번호 바로 아래) */}
              {isPhoneSent && !isVerified && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
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
                    <p className="text-red-500 text-xs mt-2">{verifyError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. 성별 */}
          {isBirthDateValid && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
              <label className="text-sm text-gray-600">성별</label>
              <div 
                className="h-14 rounded-xl flex items-center px-4 justify-between cursor-pointer bg-gray-50"
                onClick={() => setShowGenderModal(true)}
              >
                <span className={gender ? "text-gray-900" : "text-gray-400"}>
                  {gender === "male" ? "남성" : gender === "female" ? "여성" : "성별"}
                </span>
                <ChevronLeft className="h-5 w-5 rotate-270 text-gray-400" />
              </div>
            </div>
          )}

          {/* 2. 생년월일 */}
          {isNameValid && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
              <label className="text-sm text-gray-600">생년월일</label>
              <div 
                className="h-14 rounded-xl flex items-center px-4 text-base bg-gray-50 cursor-pointer"
                onClick={() => setShowDatePicker(true)}
              >
                <span className={birthDate ? "text-gray-900" : "text-gray-400"}>
                  {birthDate ? `${birthDate.slice(0,4)}.${birthDate.slice(4,6)}.${birthDate.slice(6,8)}` : "생년월일 선택"}
                </span>
              </div>
            </div>
          )}

          {/* 1. 이름 (가장 아래) */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">이름</label>
            <Input 
              placeholder="이름" 
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

      {/* 그리팅몰 연동 안내 Modal */}
      {showGreetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-bold mb-2">그리팅몰 연동안내</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                그리팅몰 계정을 연동하시면 식단정보, 식사기록 등을 연계하여 더 쉽고 편리한 웰스케어 서비스를 제공받으실 수 있습니다.
              </p>
              
              <div className="w-full bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-bold mb-2">조회정보</h4>
                <p className="text-xs text-gray-600">이름, 성별, 생년월일, 휴대폰번호</p>
              </div>
              
              <label className="flex items-center space-x-2 mb-6 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={greetingAgree}
                  onChange={(e) => setGreetingAgree(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">위 내용에 동의 합니다.</span>
              </label>
              
              <div className="flex space-x-3 w-full">
                <button 
                  className="flex-1 h-12 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
                  onClick={() => {
                    setShowGreetingModal(false);
                    handleNormalSignup();
                  }}
                >
                  취소
                </button>
                <button 
                  className={cn(
                    "flex-1 h-12 rounded-xl font-medium transition-colors",
                    greetingAgree 
                      ? "bg-primary hover:bg-primary/90 text-white" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                  disabled={!greetingAgree}
                  onClick={handleGreetingConnect}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 그리팅몰 정보 Modal */}
      {showGreetingInfoModal && greetingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col">
              <div className="mb-6">
                <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">{name}님,</h2>
                    <p className="text-lg">이미 그리팅 고객이시군요!</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-primary">✓</span>
                        <span className="text-sm">나의 건강 정보를</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-yellow-600">💰</span>
                        <span className="text-sm">나에게 맞는 상품을</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">아이디:</p>
                    <p className="text-lg font-bold">{greetingData.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">가입일: {greetingData.joinDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  className="w-full h-12 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
                  onClick={handleNormalSignup}
                >
                  일반 가입하기
                </button>
                <button 
                  className="w-full h-12 bg-[#00A651] hover:bg-[#008c44] text-white rounded-xl font-medium transition-colors"
                  onClick={handleGreetingSignup}
                >
                  그리팅몰 ID로 가입하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
