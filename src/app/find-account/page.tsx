"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// ==================== 타입 정의 ====================
type TabType = "id" | "pw";

type FindIdResult = {
  found: boolean;
  displayType?: "email" | "social";
  maskedId?: string;
  fullEmail?: string;
  joinDate?: string;
  provider?: string;
} | null;

type FindPwResult = {
  found: boolean;
  isSocialAccount?: boolean;
  provider?: string;
  userId?: string;
  resetToken?: string;
  message?: string;
} | null;

type ScreenType =
  | "form" // 입력 폼
  | "id_result" // 아이디 찾기 결과
  | "pw_result" // 비밀번호 찾기 결과 (계정 없음 or SNS 계정)
  | "pw_reset" // 비밀번호 재설정 입력
  | "pw_complete"; // 비밀번호 변경 완료

// ==================== 유효성 검사 함수들 ====================
const validateName = (name: string): { valid: boolean; message: string } => {
  if (!name) return { valid: false, message: "" };
  const koreanEnglishOnly = /^[가-힣a-zA-Z]+$/;
  if (!koreanEnglishOnly.test(name)) {
    return { valid: false, message: "이름은 한글/영문만 입력 가능합니다" };
  }
  if (name.length > 20) {
    return { valid: false, message: "이름은 20자 이내로 입력해주세요" };
  }
  return { valid: true, message: "" };
};

const validateUserId = (
  userId: string
): { valid: boolean; message: string } => {
  if (!userId) return { valid: false, message: "" };
  const alphanumeric = /^[a-zA-Z0-9]+$/;
  if (!alphanumeric.test(userId)) {
    return { valid: false, message: "ID는 6~12자리의 영문, 숫자 조합입니다" };
  }
  if (userId.length < 6 || userId.length > 12) {
    return { valid: false, message: "ID는 6~12자리의 영문, 숫자 조합입니다" };
  }
  return { valid: true, message: "" };
};

const validatePhone = (phone: string): { valid: boolean; message: string } => {
  if (!phone) return { valid: false, message: "" };
  const numbersOnly = phone.replace(/\D/g, "");
  if (numbersOnly.length !== 11) {
    return { valid: false, message: "휴대폰 번호는 11자리입니다" };
  }
  return { valid: true, message: "" };
};

const validateVerificationCode = (
  code: string
): { valid: boolean; message: string } => {
  if (!code) return { valid: false, message: "" };
  if (!/^\d+$/.test(code)) {
    return { valid: false, message: "인증번호는 6자리 숫자입니다" };
  }
  if (code.length !== 6) {
    return { valid: false, message: "인증번호는 6자리 숫자입니다" };
  }
  return { valid: true, message: "" };
};

const validatePassword = (
  password: string
): { valid: boolean; message: string } => {
  if (!password) return { valid: false, message: "" };
  if (password.length < 8 || password.length > 15) {
    return {
      valid: false,
      message: "비밀번호는 8자 이상 15자 이내로 설정해주세요",
    };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasLetter || !hasNumber || !hasSpecial) {
    return {
      valid: false,
      message: "영문, 숫자, 특수문자를 모두 포함해주세요",
    };
  }
  return { valid: true, message: "" };
};

// ==================== 메인 컴포넌트 ====================
export default function FindAccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("id");
  const [screen, setScreen] = useState<ScreenType>("form");
  const [loading, setLoading] = useState(false);

  // 뒤로가기 핸들러 (히스토리 기반, fallback으로 랜딩페이지)
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // ==================== 아이디 찾기 상태 ====================
  const [idName, setIdName] = useState("");
  const [idPhone, setIdPhone] = useState("");
  const [idVerificationCode, setIdVerificationCode] = useState("");
  const [idVerificationSent, setIdVerificationSent] = useState(false);
  const [idVerificationId, setIdVerificationId] = useState("");
  const [idVerified, setIdVerified] = useState(false);
  const [findIdResult, setFindIdResult] = useState<FindIdResult>(null);

  // ==================== 비밀번호 찾기 상태 ====================
  const [pwUserId, setPwUserId] = useState("");
  const [pwName, setPwName] = useState("");
  const [pwPhone, setPwPhone] = useState("");
  const [pwVerificationCode, setPwVerificationCode] = useState("");
  const [pwVerificationSent, setPwVerificationSent] = useState(false);
  const [pwVerificationId, setPwVerificationId] = useState("");
  const [pwVerified, setPwVerified] = useState(false);
  const [findPwResult, setFindPwResult] = useState<FindPwResult>(null);

  // ==================== 비밀번호 재설정 상태 ====================
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // ==================== 에러 메시지 상태 ====================
  const [idNameError, setIdNameError] = useState("");
  const [idPhoneError, setIdPhoneError] = useState("");
  const [idCodeError, setIdCodeError] = useState("");
  const [pwUserIdError, setPwUserIdError] = useState("");
  const [pwNameError, setPwNameError] = useState("");
  const [pwPhoneError, setPwPhoneError] = useState("");
  const [pwCodeError, setPwCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");
  const [generalError, setGeneralError] = useState("");

  // ==================== 휴대폰 번호 포맷팅 ====================
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
      7,
      11
    )}`;
  };

  // ==================== 탭 변경 ====================
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setScreen("form");
    resetAllStates();
  };

  // ==================== 상태 초기화 ====================
  const resetAllStates = useCallback(() => {
    // 아이디 찾기 초기화
    setIdName("");
    setIdPhone("");
    setIdVerificationCode("");
    setIdVerificationSent(false);
    setIdVerificationId("");
    setIdVerified(false);
    setFindIdResult(null);
    // 비밀번호 찾기 초기화
    setPwUserId("");
    setPwName("");
    setPwPhone("");
    setPwVerificationCode("");
    setPwVerificationSent(false);
    setPwVerificationId("");
    setPwVerified(false);
    setFindPwResult(null);
    // 비밀번호 재설정 초기화
    setNewPassword("");
    setNewPasswordConfirm("");
    // 에러 초기화
    setIdNameError("");
    setIdPhoneError("");
    setIdCodeError("");
    setPwUserIdError("");
    setPwNameError("");
    setPwPhoneError("");
    setPwCodeError("");
    setPasswordError("");
    setPasswordConfirmError("");
    setGeneralError("");
  }, []);

  // ==================== 인증번호 전송 (아이디 찾기) ====================
  const handleSendIdVerification = async () => {
    const phoneValidation = validatePhone(idPhone);
    if (!phoneValidation.valid) {
      setIdPhoneError(phoneValidation.message);
      return;
    }

    setLoading(true);
    setGeneralError("");

    try {
      const response = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: idPhone.replace(/-/g, ""),
          purpose: "find_id",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "인증번호 전송에 실패했습니다.");
      }

      setIdVerificationSent(true);
      // 개발환경에서 인증번호 자동 입력 (디버깅용)
      if (data.code) {
        console.log("인증번호:", data.code);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "인증번호 전송에 실패했습니다.";
      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==================== 인증번호 전송 (비밀번호 찾기) ====================
  const handleSendPwVerification = async () => {
    const phoneValidation = validatePhone(pwPhone);
    if (!phoneValidation.valid) {
      setPwPhoneError(phoneValidation.message);
      return;
    }

    setLoading(true);
    setGeneralError("");

    try {
      const response = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: pwPhone.replace(/-/g, ""),
          purpose: "find_password",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "인증번호 전송에 실패했습니다.");
      }

      setPwVerificationSent(true);
      if (data.code) {
        console.log("인증번호:", data.code);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "인증번호 전송에 실패했습니다.";
      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==================== 인증번호 확인 (공통) ====================
  const handleVerifyCode = async (type: "id" | "pw") => {
    const phone = type === "id" ? idPhone : pwPhone;
    const code = type === "id" ? idVerificationCode : pwVerificationCode;
    const purpose = type === "id" ? "find_id" : "find_password";

    const codeValidation = validateVerificationCode(code);
    if (!codeValidation.valid) {
      if (type === "id") setIdCodeError(codeValidation.message);
      else setPwCodeError(codeValidation.message);
      return false;
    }

    try {
      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/-/g, ""),
          code,
          purpose,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (type === "id")
          setIdCodeError(data.error || "유효하지 않은 인증번호입니다");
        else setPwCodeError(data.error || "유효하지 않은 인증번호입니다");
        return false;
      }

      if (type === "id") {
        setIdVerificationId(data.verificationId);
        setIdVerified(true);
      } else {
        setPwVerificationId(data.verificationId);
        setPwVerified(true);
      }
      return true;
    } catch {
      if (type === "id") setIdCodeError("인증 확인에 실패했습니다");
      else setPwCodeError("인증 확인에 실패했습니다");
      return false;
    }
  };

  // ==================== 아이디 찾기 제출 ====================
  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    // 유효성 검사
    const nameValidation = validateName(idName);
    if (!nameValidation.valid) {
      setIdNameError(nameValidation.message);
      return;
    }

    // 인증번호 확인
    if (!idVerified) {
      const verified = await handleVerifyCode("id");
      if (!verified) return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: idName,
          phone: idPhone.replace(/-/g, ""),
          verificationId: idVerificationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "아이디 찾기에 실패했습니다.");
      }

      setFindIdResult(data);
      setScreen("id_result");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "아이디 찾기 중 오류가 발생했습니다.";
      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==================== 비밀번호 찾기 제출 ====================
  const handleFindPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    // 유효성 검사
    const userIdValidation = validateUserId(pwUserId);
    if (!userIdValidation.valid) {
      setPwUserIdError(userIdValidation.message);
      return;
    }

    const nameValidation = validateName(pwName);
    if (!nameValidation.valid) {
      setPwNameError(nameValidation.message);
      return;
    }

    // 인증번호 확인
    if (!pwVerified) {
      const verified = await handleVerifyCode("pw");
      if (!verified) return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/find-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: pwUserId,
          name: pwName,
          phone: pwPhone.replace(/-/g, ""),
          verificationId: pwVerificationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "비밀번호 찾기에 실패했습니다.");
      }

      setFindPwResult(data);

      if (data.found && !data.isSocialAccount) {
        // 일치하는 계정 있음 → 비밀번호 재설정 화면
        setScreen("pw_reset");
      } else {
        // 없거나 SNS 계정인 경우 → 결과 화면
        setScreen("pw_result");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "비밀번호 찾기 중 오류가 발생했습니다.";
      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==================== 비밀번호 재설정 제출 ====================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    // 비밀번호 규칙 검증
    const pwValidation = validatePassword(newPassword);
    if (!pwValidation.valid) {
      setPasswordError(pwValidation.message);
      return;
    }

    // 비밀번호 일치 확인
    if (newPassword !== newPasswordConfirm) {
      setPasswordConfirmError("비밀번호가 일치하지 않습니다");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: findPwResult?.userId,
          password: newPassword,
          passwordConfirm: newPasswordConfirm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "비밀번호 변경에 실패했습니다.");
      }

      setScreen("pw_complete");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "비밀번호 변경 중 오류가 발생했습니다.";
      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==================== 실시간 유효성 검사 ====================
  useEffect(() => {
    if (idName) {
      const validation = validateName(idName);
      setIdNameError(validation.valid ? "" : validation.message);
    } else {
      setIdNameError("");
    }
  }, [idName]);

  useEffect(() => {
    if (idPhone) {
      const validation = validatePhone(idPhone);
      setIdPhoneError(validation.valid ? "" : validation.message);
    } else {
      setIdPhoneError("");
    }
  }, [idPhone]);

  useEffect(() => {
    if (pwUserId) {
      const validation = validateUserId(pwUserId);
      setPwUserIdError(validation.valid ? "" : validation.message);
    } else {
      setPwUserIdError("");
    }
  }, [pwUserId]);

  useEffect(() => {
    if (pwName) {
      const validation = validateName(pwName);
      setPwNameError(validation.valid ? "" : validation.message);
    } else {
      setPwNameError("");
    }
  }, [pwName]);

  useEffect(() => {
    if (pwPhone) {
      const validation = validatePhone(pwPhone);
      setPwPhoneError(validation.valid ? "" : validation.message);
    } else {
      setPwPhoneError("");
    }
  }, [pwPhone]);

  useEffect(() => {
    if (newPassword) {
      const validation = validatePassword(newPassword);
      setPasswordError(validation.valid ? "" : validation.message);
    } else {
      setPasswordError("");
    }
  }, [newPassword]);

  useEffect(() => {
    if (newPasswordConfirm && newPassword !== newPasswordConfirm) {
      setPasswordConfirmError("비밀번호가 일치하지 않습니다");
    } else {
      setPasswordConfirmError("");
    }
  }, [newPassword, newPasswordConfirm]);

  // ==================== 버튼 활성화 조건 ====================
  const isIdPhoneValid = validatePhone(idPhone).valid;
  const isIdFormValid =
    validateName(idName).valid &&
    isIdPhoneValid &&
    idVerificationSent &&
    idVerificationCode.length === 6;

  const isPwPhoneValid = validatePhone(pwPhone).valid;
  const isPwFormValid =
    validateUserId(pwUserId).valid &&
    validateName(pwName).valid &&
    isPwPhoneValid &&
    pwVerificationSent &&
    pwVerificationCode.length === 6;

  const isPasswordValid =
    validatePassword(newPassword).valid && newPassword === newPasswordConfirm;

  // ==================== 렌더링 ====================
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-center px-4 py-4 sticky top-0 bg-white z-10 border-b border-gray-200 relative">
        <button onClick={handleBack} className="absolute left-4 p-2 -ml-2">
          <ChevronLeft className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          아이디/비밀번호 찾기
        </h1>
      </header>

      {/* 탭 (폼 화면에서만 표시) */}
      {screen === "form" && (
        <div className="flex border-b border-gray-200">
          <button
            className={cn(
              "flex-1 py-4 text-base font-medium text-center relative transition-colors",
              activeTab === "id" ? "text-gray-900" : "text-gray-400"
            )}
            onClick={() => handleTabChange("id")}
          >
            아이디 찾기
            {activeTab === "id" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gray-900" />
            )}
          </button>
          <button
            className={cn(
              "flex-1 py-4 text-base font-medium text-center relative transition-colors",
              activeTab === "pw" ? "text-gray-900" : "text-gray-400"
            )}
            onClick={() => handleTabChange("pw")}
          >
            비밀번호 찾기
            {activeTab === "pw" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gray-900" />
            )}
          </button>
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className="flex-1 px-6 py-6">
        {/* 일반 에러 메시지 */}
        {generalError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
            <p className="text-sm text-red-600">{generalError}</p>
          </div>
        )}

        {/* ==================== 아이디 찾기 폼 ==================== */}
        {screen === "form" && activeTab === "id" && (
          <form onSubmit={handleFindId} className="space-y-5">
            {/* 이름 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">이름</label>
              <Input
                type="text"
                value={idName}
                onChange={(e) => setIdName(e.target.value)}
                placeholder="이름"
                className="h-12 rounded-lg bg-gray-100 border-none text-gray-900 placeholder:text-gray-400"
                inputMode="text"
                autoComplete="name"
              />
              {idNameError && (
                <p className="text-sm text-red-500">{idNameError}</p>
              )}
            </div>

            {/* 핸드폰 번호 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                핸드폰 번호
              </label>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  value={idPhone}
                  onChange={(e) =>
                    setIdPhone(formatPhoneNumber(e.target.value))
                  }
                  placeholder="핸드폰 번호"
                  className="flex-1 h-12 rounded-lg bg-gray-100 border-none text-gray-900 placeholder:text-gray-400"
                  inputMode="numeric"
                  maxLength={13}
                />
                <Button
                  type="button"
                  onClick={handleSendIdVerification}
                  disabled={!isIdPhoneValid || loading}
                  className={cn(
                    "h-12 px-4 rounded-lg whitespace-nowrap text-sm font-medium",
                    isIdPhoneValid
                      ? "bg-[#B8D070] hover:bg-[#a5bd5f] text-white"
                      : "bg-gray-200 text-gray-400"
                  )}
                >
                  인증번호 전송
                </Button>
              </div>
              {idPhoneError && (
                <p className="text-sm text-red-500">{idPhoneError}</p>
              )}
            </div>

            {/* 인증번호 */}
            <div className="space-y-2">
              <Input
                type="text"
                value={idVerificationCode}
                onChange={(e) =>
                  setIdVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="인증번호"
                className="h-12 rounded-lg bg-gray-100 border-none text-gray-900 placeholder:text-gray-400"
                inputMode="numeric"
                maxLength={6}
                disabled={!idVerificationSent}
              />
              {idCodeError && (
                <p className="text-sm text-red-500">{idCodeError}</p>
              )}
            </div>

            {/* 아이디 찾기 버튼 */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!isIdFormValid || loading}
                className={cn(
                  "w-full h-14 text-lg font-bold rounded-full",
                  isIdFormValid
                    ? "bg-[#B8D070] hover:bg-[#a5bd5f] text-white"
                    : "bg-gray-200 text-gray-400"
                )}
              >
                {loading ? "찾는 중..." : "아이디 찾기"}
              </Button>
            </div>
          </form>
        )}

        {/* ==================== 비밀번호 찾기 폼 ==================== */}
        {screen === "form" && activeTab === "pw" && (
          <form onSubmit={handleFindPassword} className="space-y-5">
            {/* 아이디 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                아이디
              </label>
              <Input
                type="text"
                value={pwUserId}
                onChange={(e) => setPwUserId(e.target.value)}
                placeholder="아이디"
                className="h-12 rounded-lg bg-gray-100 border-none text-gray-900 placeholder:text-gray-400"
                inputMode="text"
                autoComplete="username"
              />
              {pwUserIdError && (
                <p className="text-sm text-red-500">{pwUserIdError}</p>
              )}
            </div>

            {/* 이름 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">이름</label>
              <Input
                type="text"
                value={pwName}
                onChange={(e) => setPwName(e.target.value)}
                placeholder="이름"
                className="h-12 rounded-lg bg-gray-100 border-none text-gray-900 placeholder:text-gray-400"
                inputMode="text"
                autoComplete="name"
              />
              {pwNameError && (
                <p className="text-sm text-red-500">{pwNameError}</p>
              )}
            </div>

            {/* 핸드폰 번호 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                핸드폰 번호
              </label>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  value={pwPhone}
                  onChange={(e) =>
                    setPwPhone(formatPhoneNumber(e.target.value))
                  }
                  placeholder="핸드폰 번호"
                  className="flex-1 h-12 rounded-lg bg-gray-100 border-none text-gray-900 placeholder:text-gray-400"
                  inputMode="numeric"
                  maxLength={13}
                />
                <Button
                  type="button"
                  onClick={handleSendPwVerification}
                  disabled={!isPwPhoneValid || loading}
                  className={cn(
                    "h-12 px-4 rounded-lg whitespace-nowrap text-sm font-medium",
                    isPwPhoneValid
                      ? "bg-[#B8D070] hover:bg-[#a5bd5f] text-white"
                      : "bg-gray-200 text-gray-400"
                  )}
                >
                  인증번호 전송
                </Button>
              </div>
              {pwPhoneError && (
                <p className="text-sm text-red-500">{pwPhoneError}</p>
              )}
            </div>

            {/* 인증번호 */}
            <div className="space-y-2">
              <Input
                type="text"
                value={pwVerificationCode}
                onChange={(e) =>
                  setPwVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="인증번호"
                className="h-12 rounded-lg bg-gray-100 border-none text-gray-900 placeholder:text-gray-400"
                inputMode="numeric"
                maxLength={6}
                disabled={!pwVerificationSent}
              />
              {pwCodeError && (
                <p className="text-sm text-red-500">{pwCodeError}</p>
              )}
            </div>

            {/* 비밀번호 찾기 버튼 */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!isPwFormValid || loading}
                className={cn(
                  "w-full h-14 text-lg font-bold rounded-full",
                  isPwFormValid
                    ? "bg-[#B8D070] hover:bg-[#a5bd5f] text-white"
                    : "bg-gray-200 text-gray-400"
                )}
              >
                {loading ? "찾는 중..." : "비밀번호 찾기"}
              </Button>
            </div>
          </form>
        )}

        {/* ==================== 아이디 찾기 결과 ==================== */}
        {screen === "id_result" && findIdResult && (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              {findIdResult.found ? (
                <>
                  {/* Case 1 & 2: 아이디 찾음 */}
                  <p className="text-lg text-gray-900 mb-8 text-center">
                    입력하신 정보와 일치하는 아이디 입니다.
                  </p>

                  <div className="w-full bg-white border border-gray-200 rounded-lg p-6 space-y-3">
                    {findIdResult.displayType === "email" ? (
                      // 일반회원
                      <>
                        <div className="text-center">
                          <span className="text-gray-600">아이디 : </span>
                          <span className="font-medium text-gray-900">
                            {findIdResult.maskedId}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-gray-600">가입일 : </span>
                          <span className="text-gray-900">
                            {findIdResult.joinDate}
                          </span>
                        </div>
                      </>
                    ) : (
                      // SNS회원
                      <>
                        <div className="flex items-center justify-center gap-2">
                          {findIdResult.provider === "naver" && (
                            <div className="w-6 h-6 bg-[#03C75A] rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                N
                              </span>
                            </div>
                          )}
                          {findIdResult.provider === "kakao" && (
                            <div className="w-6 h-6 bg-[#FEE500] rounded flex items-center justify-center">
                              <span className="text-[#3C1E1E] text-xs font-bold">
                                K
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-gray-900">
                            {findIdResult.provider === "naver"
                              ? "네이버 간편가입"
                              : "카카오톡 간편가입"}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-gray-600">가입일 : </span>
                          <span className="text-gray-900">
                            {findIdResult.joinDate}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Case 3: 아이디 없음 */}
                  <p className="text-lg text-gray-900 mb-8 text-center">
                    입력하신 정보와
                    <br />
                    일치하는 아이디가 없습니다.
                  </p>

                  {/* Sad Image */}
                  <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-8">
                    <span className="text-6xl">😢</span>
                  </div>
                </>
              )}
            </div>

            {/* 하단 버튼 */}
            <div className="flex gap-3 mt-auto pb-4">
              {findIdResult.found ? (
                findIdResult.displayType === "email" ? (
                  // 일반회원: 로그인 / 비밀번호 찾기
                  <>
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/?email=${encodeURIComponent(
                            findIdResult.fullEmail || ""
                          )}`
                        )
                      }
                      className="flex-1 h-12 rounded-lg border-gray-300 text-gray-900"
                    >
                      로그인
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleTabChange("pw");
                      }}
                      className="flex-1 h-12 rounded-lg border-gray-300 text-gray-900"
                    >
                      비밀번호 찾기
                    </Button>
                  </>
                ) : (
                  // SNS회원: 확인 / 로그인
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetAllStates();
                        setScreen("form");
                      }}
                      className="flex-1 h-12 rounded-lg border-gray-300 text-gray-900"
                    >
                      확인
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/")}
                      className="flex-1 h-12 rounded-lg border-gray-300 text-gray-900"
                    >
                      로그인
                    </Button>
                  </>
                )
              ) : (
                // 없음: 다시찾기 / 회원가입
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetAllStates();
                      setScreen("form");
                    }}
                    className="flex-1 h-12 rounded-lg border-gray-300 text-gray-900"
                  >
                    다시찾기
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/signup")}
                    className="flex-1 h-12 rounded-lg border-gray-300 text-gray-900"
                  >
                    회원가입
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ==================== 비밀번호 찾기 결과 (없음/SNS) ==================== */}
        {screen === "pw_result" && findPwResult && (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              {findPwResult.isSocialAccount ? (
                // SNS 계정인 경우
                <>
                  <p className="text-lg text-gray-900 mb-8 text-center">
                    {findPwResult.message}
                  </p>
                  <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-8">
                    {findPwResult.provider === "naver" && (
                      <div className="w-16 h-16 bg-[#03C75A] rounded-lg flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">N</span>
                      </div>
                    )}
                    {findPwResult.provider === "kakao" && (
                      <div className="w-16 h-16 bg-[#FEE500] rounded-lg flex items-center justify-center">
                        <span className="text-[#3C1E1E] text-2xl font-bold">
                          K
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // 계정 없음
                <>
                  <p className="text-lg text-gray-900 mb-8 text-center">
                    입력하신 정보와
                    <br />
                    일치하는 아이디가 없습니다.
                  </p>
                  <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-8">
                    <span className="text-6xl">😢</span>
                  </div>
                </>
              )}
            </div>

            {/* 하단 버튼 */}
            <div className="flex gap-3 mt-auto pb-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetAllStates();
                  setScreen("form");
                }}
                className="flex-1 h-12 rounded-lg border-gray-300 text-gray-900"
              >
                다시찾기
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/signup")}
                className="flex-1 h-12 rounded-lg border-gray-300 text-gray-900"
              >
                회원가입
              </Button>
            </div>
          </div>
        )}

        {/* ==================== 비밀번호 재설정 폼 ==================== */}
        {screen === "pw_reset" && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                비밀번호를 재설정 해주세요.
              </h2>
              <p className="text-sm text-gray-500">
                영문, 숫자, 특수문자를 포함하여
                <br />
                8자이상 15장 이내로 설정해주세요
              </p>
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                비밀번호
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="h-12 rounded-lg bg-gray-100 border-none text-gray-900 placeholder:text-gray-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPasswordConfirm ? "text" : "password"}
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 확인"
                  className="h-12 rounded-lg bg-gray-100 border-none text-gray-900 placeholder:text-gray-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordConfirmError && (
                <p className="text-sm text-red-500">{passwordConfirmError}</p>
              )}
            </div>

            {/* 비밀번호 재설정 버튼 */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!isPasswordValid || loading}
                className={cn(
                  "w-full h-14 text-lg font-bold rounded-full",
                  isPasswordValid
                    ? "bg-[#B8D070] hover:bg-[#a5bd5f] text-white"
                    : "bg-gray-200 text-gray-400"
                )}
              >
                {loading ? "변경 중..." : "비밀번호 재설정"}
              </Button>
            </div>
          </form>
        )}

        {/* ==================== 비밀번호 변경 완료 ==================== */}
        {screen === "pw_complete" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <p className="text-lg text-gray-900 mb-2 text-center">
                비밀번호가 변경되었습니다.
              </p>
              <p className="text-lg text-gray-900 mb-8 text-center">
                다시 로그인 해주세요.
              </p>

              {/* Happy Image */}
              <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-8">
                <span className="text-6xl">🎉</span>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="mt-auto pb-4">
              <Button
                onClick={() =>
                  router.push(`/?email=${encodeURIComponent(pwUserId)}`)
                }
                className="w-full h-14 text-lg font-bold rounded-full bg-[#B8D070] hover:bg-[#a5bd5f] text-white"
              >
                로그인
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
