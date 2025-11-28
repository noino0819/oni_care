"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ConfirmModal } from "@/components/ui/Modal";

export default function PhoneChangePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError("");
  };

  const handleSendCode = async () => {
    const phoneNumbers = phone.replace(/-/g, "");
    
    if (phoneNumbers.length !== 11) {
      setError("휴대폰 번호는 11자리입니다");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumbers,
          purpose: "find_password",
        }),
      });

      if (!res.ok) {
        setError("인증번호 전송에 실패했습니다.");
        return;
      }

      setCodeSent(true);
    } catch {
      setError("인증번호 전송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      setError("인증번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profile/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/-/g, ""),
          verificationCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setShowSuccessModal(true);
    } catch {
      setError("연락처 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const phoneNumbers = phone.replace(/-/g, "");
  const isPhoneValid = phoneNumbers.length === 11;
  const isFormValid = isPhoneValid && verificationCode.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">연락처 변경</h1>
          <div className="w-6 h-6" />
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 안내 문구 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">
            휴대폰 번호를 재설정 해주세요.
          </h2>
        </div>

        {/* 핸드폰 번호 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            핸드폰 번호
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="핸드폰 번호"
              className="flex-1 px-4 py-3.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9F85E3] text-gray-900 placeholder:text-gray-400"
              maxLength={13}
            />
            <button
              onClick={handleSendCode}
              disabled={!isPhoneValid || loading}
              className={`px-4 py-3.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                isPhoneValid && !loading
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "전송중..." : codeSent ? "재전송" : "인증번호 전송"}
            </button>
          </div>
        </div>

        {/* 인증번호 입력 */}
        <div className="mb-3">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => {
              setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            placeholder="인증번호"
            className="w-full px-4 py-3.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9F85E3] text-gray-900 placeholder:text-gray-400"
            maxLength={6}
          />
        </div>

        {/* 안내/에러 메시지 */}
        <p className="text-red-500 text-sm mb-6">
          {error || "휴대폰 번호는 11자리입니다"}
        </p>

        {/* 인증 완료 버튼 */}
        <button
          onClick={handleVerify}
          disabled={!isFormValid || loading}
          className={`w-full py-4 rounded-xl font-semibold transition-colors ${
            isFormValid && !loading
              ? "bg-[#9F85E3] text-white hover:bg-[#8B71CF]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "처리중..." : "인증 완료"}
        </button>
      </div>

      {/* 성공 모달 */}
      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/menu/profile-edit");
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
          router.push("/menu/profile-edit");
        }}
        message="연락처가 성공적으로 변경되었습니다."
        showCancel={false}
      />
    </div>
  );
}
