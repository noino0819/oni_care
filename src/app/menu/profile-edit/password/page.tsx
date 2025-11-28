"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { ConfirmModal } from "@/components/ui/Modal";

export default function PasswordChangePage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validatePassword = (password: string) => {
    // 영문, 숫자, 특수문자 포함 8~15자
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,15}$/;
    return regex.test(password);
  };

  const handleSubmit = async () => {
    setError("");

    if (!currentPassword) {
      setError("현재 비밀번호를 입력해주세요.");
      return;
    }

    if (!newPassword) {
      setError("새 비밀번호를 입력해주세요.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("영문, 숫자, 특수문자를 포함하여 8자 이상 15자 이내로 설정해주세요");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setShowSuccessModal(true);
    } catch {
      setError("비밀번호 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = currentPassword && newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">비밀번호 재설정</h1>
          <div className="w-6 h-6" />
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 안내 문구 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            비밀번호를 재설정 해주세요.
          </h2>
          <p className="text-sm text-gray-500">
            영문, 숫자, 특수문자를 포함하여<br />
            8자이상 15정 이내로 설정해주세요
          </p>
        </div>

        {/* 현재 비밀번호 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            현재 비밀번호
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-[#9F85E3]"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 변경 비밀번호 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            변경 비밀번호
          </label>
          <div className="relative mb-3">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-[#9F85E3]"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 확인"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-[#9F85E3]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || loading}
          className={`w-full py-4 rounded-xl font-semibold transition-colors ${
            isFormValid && !loading
              ? "bg-[#9F85E3] text-white hover:bg-[#8B71CF]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "처리중..." : "비밀번호 재설정"}
        </button>
      </div>

      {/* 성공 모달 */}
      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        message="비밀번호가 성공적으로 변경되었습니다."
        showCancel={false}
      />
    </div>
  );
}

