"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmModal, BottomSheet } from "@/components/ui/Modal";

// 질병 옵션
const DISEASE_OPTIONS = [
  { value: "none", label: "해당없음" },
  { value: "obesity", label: "비만" },
  { value: "fatty_liver", label: "지방간" },
  { value: "diabetes", label: "당뇨" },
  { value: "hypertension", label: "고혈압" },
  { value: "osteoporosis", label: "골다공증" },
  { value: "hypercholesterolemia", label: "고콜레스테롤 혈증" },
  { value: "hypertriglyceridemia", label: "고중성지방 혈증" },
  { value: "cancer", label: "암" },
];

// 관심사 옵션
const INTEREST_OPTIONS = [
  { value: "immunity", label: "면역력" },
  { value: "eye_health", label: "눈건강" },
  { value: "bone_joint", label: "뼈관절건강" },
  { value: "muscle", label: "근력" },
  { value: "weight_control", label: "체중조절" },
  { value: "brain_activity", label: "두뇌활동" },
  { value: "fatigue_recovery", label: "피로회복" },
  { value: "hair_health", label: "모발건강" },
  { value: "blood_circulation", label: "혈행개선" },
  { value: "skin_health", label: "피부건강" },
  { value: "menopause", label: "갱년기" },
  { value: "digestive_health", label: "소화기/장건강" },
];

// 활동량 옵션
const ACTIVITY_OPTIONS = [
  { value: "very_active", label: "매우 활동적" },
  { value: "moderately_active", label: "활동적" },
  { value: "lightly_active", label: "저활동적" },
  { value: "sedentary", label: "비활동적" },
];

interface SurveyData {
  height: string;
  weight: string;
  activityLevel: string;
  disease: string;
  interests: string[];
}

// 스텝 인디케이터 컴포넌트
function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1">
      {/* Step 1 */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
          currentStep >= 1 ? "bg-[#9F85E3] text-white" : "bg-gray-200 text-gray-500"
        )}
      >
        {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
      </div>
      <div className="w-6 h-[2px] bg-gray-200">
        <div
          className={cn(
            "h-full bg-[#9F85E3] transition-all duration-300",
            currentStep > 1 ? "w-full" : "w-0"
          )}
        />
      </div>

      {/* Step 2 */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
          currentStep >= 2 ? "bg-[#9F85E3] text-white" : "bg-gray-200 text-gray-500"
        )}
      >
        {currentStep > 2 ? <Check className="w-4 h-4" /> : "2"}
      </div>
      <div className="w-6 h-[2px] bg-gray-200">
        <div
          className={cn(
            "h-full bg-[#9F85E3] transition-all duration-300",
            currentStep > 2 ? "w-full" : "w-0"
          )}
        />
      </div>

      {/* Step 3 */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
          currentStep >= 3 ? "bg-[#9F85E3] text-white" : "bg-gray-200 text-gray-500"
        )}
      >
        3
      </div>
    </div>
  );
}

export default function SurveyPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [surveyData, setSurveyData] = useState<SurveyData>({
    height: "",
    weight: "",
    activityLevel: "",
    disease: "",
    interests: [],
  });

  const [errors, setErrors] = useState({
    height: "",
    weight: "",
  });

  // 스텝 1 유효성 검사
  const isStep1Valid = useCallback(() => {
    const heightNum = parseFloat(surveyData.height);
    const weightNum = parseFloat(surveyData.weight);
    return (
      surveyData.height !== "" &&
      surveyData.weight !== "" &&
      surveyData.activityLevel !== "" &&
      heightNum >= 0 &&
      heightNum <= 200 &&
      weightNum >= 0 &&
      weightNum <= 300
    );
  }, [surveyData.height, surveyData.weight, surveyData.activityLevel]);

  // 스텝 2 유효성 검사
  const isStep2Valid = useCallback(() => {
    return surveyData.disease !== "";
  }, [surveyData.disease]);

  // 스텝 3 유효성 검사
  const isStep3Valid = useCallback(() => {
    return surveyData.interests.length > 0;
  }, [surveyData.interests]);

  // 현재 스텝의 다음 버튼 활성화 여부
  const isNextEnabled = useCallback(() => {
    switch (currentStep) {
      case 1:
        return isStep1Valid();
      case 2:
        return isStep2Valid();
      case 3:
        return isStep3Valid();
      default:
        return false;
    }
  }, [currentStep, isStep1Valid, isStep2Valid, isStep3Valid]);

  // 키 입력 핸들러
  const handleHeightChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setSurveyData((prev) => ({ ...prev, height: numericValue }));

    if (numericValue) {
      const num = parseInt(numericValue);
      if (num < 0 || num > 200) {
        setErrors((prev) => ({
          ...prev,
          height: "0~200 사이의 값을 입력해주세요.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, height: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, height: "" }));
    }
  };

  // 몸무게 입력 핸들러
  const handleWeightChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setSurveyData((prev) => ({ ...prev, weight: numericValue }));

    if (numericValue) {
      const num = parseInt(numericValue);
      if (num < 0 || num > 300) {
        setErrors((prev) => ({
          ...prev,
          weight: "0~300 사이의 값을 입력해주세요.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, weight: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, weight: "" }));
    }
  };

  // 질병 선택 핸들러
  const handleDiseaseSelect = (disease: string) => {
    setSurveyData((prev) => ({
      ...prev,
      disease: prev.disease === disease ? "" : disease,
    }));
  };

  // 관심사 선택 핸들러
  const handleInterestSelect = (interest: string) => {
    // 첫 번째 선택 시 툴팁 표시
    if (surveyData.interests.length === 0 && !showTooltip) {
      setShowTooltip(true);
      setIsTooltipVisible(true);
      setTimeout(() => {
        setIsTooltipVisible(false);
        setTimeout(() => setShowTooltip(false), 300);
      }, 2000);
    }

    setSurveyData((prev) => {
      const isSelected = prev.interests.includes(interest);
      if (isSelected) {
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== interest),
        };
      } else if (prev.interests.length < 3) {
        return {
          ...prev,
          interests: [...prev.interests, interest],
        };
      }
      return prev;
    });
  };

  // 선택된 관심사의 순서 가져오기
  const getInterestOrder = (interest: string) => {
    const index = surveyData.interests.indexOf(interest);
    return index >= 0 ? index + 1 : 0;
  };

  // 스와이프 처리
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;

    if (isSwipeLeft && isNextEnabled() && currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else if (isSwipeRight && currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // 다음 버튼 클릭
  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await submitSurvey();
    }
  };

  // 설문 제출
  const submitSurvey = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: parseInt(surveyData.height),
          weight: parseInt(surveyData.weight),
          activity_level: surveyData.activityLevel,
          disease: surveyData.disease,
          interests: surveyData.interests,
        }),
      });

      if (response.ok) {
        sessionStorage.removeItem("signup_data");
        sessionStorage.removeItem("signup_verify");
        router.push("/home");
      } else {
        const data = await response.json();
        alert(data.error || "설문 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("설문 제출 에러:", error);
      alert("설문 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 닫기 확인
  const handleClose = () => {
    setShowExitModal(true);
  };

  const handleExitConfirm = () => {
    setShowExitModal(false);
    sessionStorage.removeItem("signup_data");
    sessionStorage.removeItem("signup_verify");
    router.push("/home");
  };

  const stepLabels = ["인적사항", "질병", "관심사"];

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={handleClose}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-900">
            기본 설문
          </h1>
          <div className="w-6" />
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main
        className="pb-24"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 스텝 인디케이터 */}
        <div className="px-6 pt-6 pb-2">
          <StepIndicator currentStep={currentStep} />
          <p className="text-sm text-gray-500 mt-2">{stepLabels[currentStep - 1]}</p>
        </div>

        {/* Step 1: 인적사항 */}
        {currentStep === 1 && (
          <div className="px-6 py-4">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                인적 사항을 입력해 주세요
              </h2>
              <p className="text-sm text-gray-500">
                맞춤 건강관리 플랜을 제공하기 위한 권장열량 산출에 사용해요!
              </p>
            </div>

            <div className="space-y-6">
              {/* 키 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  키
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={surveyData.height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    placeholder="키를 입력해주세요"
                    className={cn(
                      "w-full px-4 py-4 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9F85E3] transition-all",
                      errors.height ? "border-red-400" : "border-gray-200"
                    )}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    cm
                  </span>
                </div>
                {errors.height && (
                  <p className="mt-1 text-sm text-red-500">{errors.height}</p>
                )}
              </div>

              {/* 몸무게 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  몸무게
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={surveyData.weight}
                    onChange={(e) => handleWeightChange(e.target.value)}
                    placeholder="몸무게를 입력해주세요"
                    className={cn(
                      "w-full px-4 py-4 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9F85E3] transition-all",
                      errors.weight ? "border-red-400" : "border-gray-200"
                    )}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    kg
                  </span>
                </div>
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-500">{errors.weight}</p>
                )}
              </div>

              {/* 활동량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  활동량
                </label>
                <button
                  onClick={() => setShowActivityPicker(true)}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-gray-300 transition-colors"
                >
                  <span
                    className={
                      surveyData.activityLevel ? "text-gray-900" : "text-gray-400"
                    }
                  >
                    {surveyData.activityLevel
                      ? ACTIVITY_OPTIONS.find(
                          (o) => o.value === surveyData.activityLevel
                        )?.label
                      : "평소 활동량을 선택해주세요"}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 질병 */}
        {currentStep === 2 && (
          <div className="px-6 py-4">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                보유하고 있거나 관리가 필요한
                <br />
                질병이 있다면 알려주세요
              </h2>
              <p className="text-sm text-gray-500">
                질병 별로 맞춤 관리법을 제안해 드려요!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {DISEASE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDiseaseSelect(option.value)}
                  className={cn(
                    "py-4 px-3 rounded-xl text-sm font-medium transition-all",
                    surveyData.disease === option.value
                      ? "bg-[#9F85E3] text-white shadow-md shadow-[#9F85E3]/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 관심사 */}
        {currentStep === 3 && (
          <div className="px-6 py-4 relative">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                건강관심사를 최대 3개 선택해주세요
                <br />
                <span className="text-[#9F85E3]">관심있는 순서대로 선택해 주세요</span>
              </h2>
              <p className="text-sm text-gray-500">
                맞춤 컨텐츠와 상품을 추천해 드려요!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 relative">
              {INTEREST_OPTIONS.map((option) => {
                const order = getInterestOrder(option.value);
                const isSelected = order > 0;
                const isDisabled = surveyData.interests.length >= 3 && !isSelected;

                return (
                  <button
                    key={option.value}
                    onClick={() => !isDisabled && handleInterestSelect(option.value)}
                    disabled={isDisabled}
                    className={cn(
                      "py-4 px-3 rounded-xl text-sm font-medium transition-all relative",
                      isSelected
                        ? "bg-[#9F85E3] text-white shadow-md shadow-[#9F85E3]/30"
                        : isDisabled
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFD54F] rounded-full text-xs font-bold text-gray-900 flex items-center justify-center">
                        {order}
                      </span>
                    )}
                    {option.label}
                  </button>
                );
              })}

              {/* 취소 안내 툴팁 */}
              {showTooltip && (
                <div
                  className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-opacity duration-300 pointer-events-none",
                    isTooltipVisible ? "opacity-100" : "opacity-0"
                  )}
                >
                  <div className="bg-gray-800/90 text-white px-6 py-4 rounded-2xl text-center shadow-xl">
                    <p className="font-medium">취소하시려면</p>
                    <p className="font-medium">다시 클릭해주세요!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <button
          onClick={handleNext}
          disabled={!isNextEnabled() || isSubmitting}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-lg transition-all",
            isNextEnabled() && !isSubmitting
              ? "bg-[#9F85E3] text-white hover:bg-[#8B74D1]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          {isSubmitting ? "저장 중..." : currentStep === 3 ? "완료" : "다 음"}
        </button>
      </div>

      {/* 활동량 선택 바텀시트 */}
      <BottomSheet
        isOpen={showActivityPicker}
        onClose={() => setShowActivityPicker(false)}
        title="활동량"
        showCloseButton={false}
      >
        <div className="space-y-1 mb-6 pt-2">
          {ACTIVITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSurveyData((prev) => ({
                  ...prev,
                  activityLevel: option.value,
                }));
              }}
              className={cn(
                "w-full px-4 py-3 text-center rounded-xl transition-colors text-base",
                surveyData.activityLevel === option.value
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-400 hover:bg-gray-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowActivityPicker(false)}
          className="w-full py-4 bg-[#FFD54F] text-gray-900 font-semibold rounded-xl hover:bg-[#FFC107] transition-colors"
        >
          선 택 하 기
        </button>
      </BottomSheet>

      {/* 나가기 확인 모달 */}
      <ConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitConfirm}
        message={
          <>
            3가지 질문에 답변해 주시면 나에게 딱 맞는
            <br />
            건강관리 서비스를 제공받을 수 있어요
          </>
        }
        cancelText="닫기"
        confirmText="이어서 답변하기"
      />
    </div>
  );
}
