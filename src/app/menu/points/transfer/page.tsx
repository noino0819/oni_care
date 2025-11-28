"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Delete } from "lucide-react";
import { ConfirmModal } from "@/components/ui/Modal";

interface ConversionOption {
  id: number;
  option_type: string;
  option_name: string;
  min_points: number;
  max_points: number;
  requires_membership: boolean;
  available: boolean;
}

export default function PointTransferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(3200);
  const [options, setOptions] = useState<ConversionOption[]>([
    { id: 1, option_type: "greating_hpoint", option_name: "그리팅 H.point", min_points: 5000, max_points: 10000, requires_membership: true, available: true },
    { id: 2, option_type: "greenery_point", option_name: "그리너리 포인트", min_points: 5000, max_points: 10000, requires_membership: false, available: true },
    { id: 3, option_type: "greating_coupon", option_name: "그리팅 상품권", min_points: 5000, max_points: 10000, requires_membership: false, available: true },
    { id: 4, option_type: "greating_spoon", option_name: "그리팅 스푼", min_points: 5000, max_points: 10000, requires_membership: false, available: true },
  ]);
  const [selectedOption, setSelectedOption] = useState<string>("greating_hpoint");
  const [inputPoints, setInputPoints] = useState("");
  
  // 팝업 상태
  const [showMinPointsAlert, setShowMinPointsAlert] = useState(false);
  const [showMaxPointsAlert, setShowMaxPointsAlert] = useState(false);
  const [showExceedsBalanceAlert, setShowExceedsBalanceAlert] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 포인트 정보 조회
      const pointsRes = await fetch("/api/points");
      const pointsData = await pointsRes.json();
      if (pointsData.totalPoints !== undefined) {
        setTotalPoints(pointsData.totalPoints);
      }

      // 전환 옵션 조회
      const optionsRes = await fetch("/api/points/transfer");
      const optionsData = await optionsRes.json();
      if (optionsData.options && optionsData.options.length > 0) {
        setOptions(optionsData.options);
        const availableOption = optionsData.options.find((o: ConversionOption) => o.available);
        if (availableOption) {
          setSelectedOption(availableOption.option_type);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberClick = (num: string) => {
    if (inputPoints.length >= 6) return;
    const newValue = inputPoints + num;
    const numValue = parseInt(newValue);
    
    if (numValue > totalPoints) {
      setShowExceedsBalanceAlert(true);
      return;
    }
    
    setInputPoints(newValue);
  };

  const handleDelete = () => {
    setInputPoints(inputPoints.slice(0, -1));
  };

  const handleConfirm = () => {
    const points = parseInt(inputPoints);
    
    if (!inputPoints || points === 0) return;
    
    if (points < 5000) {
      setShowMinPointsAlert(true);
      return;
    }
    
    if (points > 10000) {
      setShowMaxPointsAlert(true);
      return;
    }
    
    setShowConfirmModal(true);
  };

  const handleTransfer = async () => {
    setShowConfirmModal(false);
    
    try {
      const res = await fetch("/api/points/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionType: selectedOption,
          points: parseInt(inputPoints),
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error.includes("5,000")) {
          setShowMinPointsAlert(true);
        } else if (data.error.includes("10,000")) {
          setShowMaxPointsAlert(true);
        } else {
          setShowExceedsBalanceAlert(true);
        }
        return;
      }
      
      setSuccessMessage(data.message);
      setShowSuccessModal(true);
    } catch {
      console.error("Error transferring points");
    }
  };

  const selectedOptionData = options.find((o) => o.option_type === selectedOption);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F85E3]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">포인트 전환하기</h1>
          <div className="w-6 h-6" />
        </div>
      </header>

      <div className="flex-1 px-4 py-6">
        {/* 사용가능 포인트 */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">사용가능 포인트</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#9F85E3] flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {totalPoints.toLocaleString()}P
            </span>
          </div>
        </div>

        {/* 전환 가능 목록 */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">전환 가능 목록</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {options.map((option) => (
              <button
                key={option.option_type}
                onClick={() => option.available && setSelectedOption(option.option_type)}
                disabled={!option.available}
                className={`flex-shrink-0 px-4 py-2.5 rounded-full border-2 transition-all text-sm font-medium ${
                  selectedOption === option.option_type
                    ? "bg-[#9F85E3] text-white border-[#9F85E3]"
                    : option.available
                    ? "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    : "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                }`}
              >
                {option.option_name}
              </button>
            ))}
          </div>
        </div>

        {/* 전환 요청 포인트 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">전환 요청 포인트</p>
            <p className="text-xs text-gray-400">
              사용가능한 포인트: {totalPoints.toLocaleString()}P
            </p>
          </div>
          <div className="flex items-center justify-center py-6 border border-gray-200 rounded-xl bg-gray-50">
            <span className="text-3xl font-bold text-gray-900">
              {inputPoints ? parseInt(inputPoints).toLocaleString() : ""}
            </span>
            <span className="text-2xl text-gray-400 ml-1">P</span>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="mb-4 text-sm space-y-1">
          <p className="text-red-500">• 한번 전환할 때 10,000포인트 까지 전환할 수 있어요.</p>
          <p className="text-red-500">• 전환 이후 환불은 불가능 해요!</p>
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={handleConfirm}
          disabled={!inputPoints || parseInt(inputPoints) === 0}
          className={`w-full py-4 rounded-xl font-semibold transition-colors ${
            inputPoints && parseInt(inputPoints) > 0
              ? "bg-[#FFD54F] text-gray-900 hover:bg-[#FFC107]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          확인
        </button>
      </div>

      {/* 숫자 키패드 */}
      <div className="bg-gray-100 p-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="py-4 text-xl font-medium text-gray-900 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <span className="text-xl">{num}</span>
                <span className="block text-[10px] text-gray-400 mt-0.5">
                  {num === "2" && "ABC"}
                  {num === "3" && "DEF"}
                  {num === "4" && "GHI"}
                  {num === "5" && "JKL"}
                  {num === "6" && "MNO"}
                  {num === "7" && "PQRS"}
                  {num === "8" && "TUV"}
                  {num === "9" && "WXYZ"}
                </span>
              </div>
            </button>
          ))}
          <button
            className="py-4 text-xl font-medium text-gray-400 bg-white rounded-lg"
          >
            +*#
          </button>
          <button
            onClick={() => handleNumberClick("0")}
            className="py-4 text-xl font-medium text-gray-900 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="py-4 flex items-center justify-center text-gray-600 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 최소 포인트 알림 팝업 */}
      <ConfirmModal
        isOpen={showMinPointsAlert}
        onClose={() => setShowMinPointsAlert(false)}
        onConfirm={() => setShowMinPointsAlert(false)}
        message="5,000포인트 이상부터 사용할 수 있어요!"
        showCancel={false}
      />

      {/* 최대 포인트 알림 팝업 */}
      <ConfirmModal
        isOpen={showMaxPointsAlert}
        onClose={() => setShowMaxPointsAlert(false)}
        onConfirm={() => setShowMaxPointsAlert(false)}
        message={"포인트를 전환할 때는\n한번에 10,000원 까지만 전환할 수 있어요!"}
        showCancel={false}
      />

      {/* 잔액 초과 알림 팝업 */}
      <ConfirmModal
        isOpen={showExceedsBalanceAlert}
        onClose={() => setShowExceedsBalanceAlert(false)}
        onConfirm={() => setShowExceedsBalanceAlert(false)}
        message="보유한 포인트 내에서만 전환할 수 있어요!"
        showCancel={false}
      />

      {/* 전환 확인 팝업 */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleTransfer}
        message={`${parseInt(inputPoints).toLocaleString()}P를 ${selectedOptionData?.option_name || ""}로 전환하시겠습니까?`}
        confirmText="확인"
        cancelText="취소"
        showCancel
      />

      {/* 성공 팝업 */}
      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/menu/points");
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
          router.push("/menu/points");
        }}
        message={successMessage}
        showCancel={false}
      />
    </div>
  );
}
