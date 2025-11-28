"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, Info } from "lucide-react";
import { BottomSheet } from "@/components/ui/Modal";
import { WITHDRAWAL_REASONS } from "@/types/point-coupon";

export default function WithdrawPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("회원");
  const [password, setPassword] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [showReasonPicker, setShowReasonPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setUserName(data.name || "회원");
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    if (!selectedReason) {
      setError("탈퇴 사유를 선택해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profile/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          reason: selectedReason,
          reasonCategory: selectedReason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      // 탈퇴 완료 페이지로 이동
      router.replace("/menu/profile-edit/withdraw/complete");
    } catch {
      setError("회원탈퇴에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = password && selectedReason;

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">회원탈퇴</h1>
          <div className="w-6 h-6" />
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 안내 문구 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {userName}님
          </h2>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-1">
            정말 탈퇴하시겠어요? <span className="text-2xl">😢</span>
          </h2>
        </div>

        {/* 경고 사항 */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              지금 탈퇴하시면 지금까지 기록한 다양한 건강정보들은<br />
              사라져 다시 확인하실 수 없습니다
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              지금 탈퇴하시면 보유중이던 적립금과 쿠폰은<br />
              모두 사라져 사용이 불가능합니다
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              탈퇴후에는 동일한 ID로는 가입이 불가능합니다
            </p>
          </div>
        </div>

        {/* 비밀번호 확인 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호 확인
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9F85E3]"
          />
        </div>

        {/* 탈퇴사유 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            탈퇴사유
          </label>
          <button
            onClick={() => setShowReasonPicker(true)}
            className="w-full px-4 py-3 bg-gray-100 rounded-xl flex items-center justify-between"
          >
            <span className={selectedReason ? "text-gray-900" : "text-gray-400"}>
              {selectedReason || "탈퇴사유를 선택해주세요."}
            </span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* 회원탈퇴 버튼 */}
        <button
          onClick={handleWithdraw}
          disabled={!isFormValid || loading}
          className={`w-full py-4 rounded-xl font-semibold transition-colors ${
            isFormValid && !loading
              ? "bg-[#9F85E3] text-white hover:bg-[#8B71CF]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "처리중..." : "회원탈퇴"}
        </button>
      </div>

      {/* 탈퇴사유 선택 바텀시트 */}
      <BottomSheet
        isOpen={showReasonPicker}
        onClose={() => setShowReasonPicker(false)}
        title="탈퇴사유를 선택해주세요"
      >
        <div className="space-y-1 mb-6">
          {WITHDRAWAL_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => {
                setSelectedReason(reason);
                setShowReasonPicker(false);
              }}
              className={`w-full px-4 py-3 text-left rounded-xl transition-colors ${
                selectedReason === reason
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {reason}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowReasonPicker(false)}
          className="w-full py-4 bg-[#9F85E3] text-white font-semibold rounded-xl"
        >
          완 료
        </button>
      </BottomSheet>
    </div>
  );
}

