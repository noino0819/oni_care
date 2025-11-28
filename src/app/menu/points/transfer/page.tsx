"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Delete, ChevronDown } from "lucide-react";
import { ConfirmModal, BottomSheet } from "@/components/ui/Modal";
import useSWR from "swr";

interface ConversionOption {
  id: number;
  option_type: string;
  option_name: string;
  min_points: number;
  max_points: number;
  requires_membership: boolean;
  available: boolean;
}

interface PointsResponse {
  totalPoints: number;
}

interface TransferOptionsResponse {
  options: ConversionOption[];
}

// 쿠폰 종류
const COUPON_OPTIONS = [
  { value: 3000, label: "3,000원 쿠폰" },
  { value: 5000, label: "5,000원 쿠폰" },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const defaultOptions: ConversionOption[] = [
  { id: 1, option_type: "greating_hpoint", option_name: "그리팅\nH.point", min_points: 5000, max_points: 10000, requires_membership: true, available: false },
  { id: 2, option_type: "greenery_point", option_name: "그리너리\n포인트", min_points: 5000, max_points: 10000, requires_membership: false, available: true },
  { id: 3, option_type: "greating_coupon", option_name: "그리팅\n상품권", min_points: 3000, max_points: 10000, requires_membership: false, available: true },
  { id: 4, option_type: "greating_spoon", option_name: "그리팅\n스푼", min_points: 5000, max_points: 10000, requires_membership: false, available: true },
];

// 스켈레톤 컴포넌트
function TransferSkeleton() {
  return (
    <div className="flex-1 px-4 py-6 animate-pulse">
      {/* 사용가능 포인트 */}
      <div className="mb-6">
        <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="h-8 w-32 bg-gray-200 rounded" />
        </div>
      </div>

      {/* 전환 가능 목록 */}
      <div className="mb-6">
        <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>

      {/* 전환 요청 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-20 bg-gray-200 rounded-xl" />
      </div>

      {/* 안내 문구 */}
      <div className="mb-4 space-y-1">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>

      {/* 확인 버튼 */}
      <div className="h-14 bg-gray-200 rounded-xl" />
    </div>
  );
}

export default function PointTransferPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>("greenery_point");
  const [inputPoints, setInputPoints] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<number>(3000);
  const [showCouponPicker, setShowCouponPicker] = useState(false);

  // 팝업 상태
  const [showExceedsBalanceAlert, setShowExceedsBalanceAlert] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // SWR로 포인트 데이터 가져오기
  const { data: pointsData, isLoading: pointsLoading, mutate: mutatePoints } = useSWR<PointsResponse>(
    "/api/points",
    fetcher,
    { revalidateOnFocus: false }
  );

  // SWR로 전환 옵션 데이터 가져오기
  const { data: optionsData, isLoading: optionsLoading } = useSWR<TransferOptionsResponse>(
    "/api/points/transfer",
    fetcher,
    { revalidateOnFocus: false }
  );

  const totalPoints = pointsData?.totalPoints ?? 0;
  const options = optionsData?.options?.length ? optionsData.options : defaultOptions;
  const loading = pointsLoading || optionsLoading;

  const selectedOptionData = useMemo(
    () => options.find((o) => o.option_type === selectedOption),
    [options, selectedOption]
  );

  // 쿠폰 전환 모드인지 확인
  const isCouponMode = selectedOption === "greating_coupon";

  // 쿠폰 모드일 때 사용 가능한 쿠폰 필터링
  const availableCoupons = useMemo(() => {
    return COUPON_OPTIONS.filter(c => c.value <= totalPoints);
  }, [totalPoints]);

  const handleNumberClick = useCallback((num: string) => {
    if (inputPoints.length >= 6) return;
    const newValue = inputPoints + num;
    const numValue = parseInt(newValue);

    if (numValue > totalPoints) {
      setShowExceedsBalanceAlert(true);
      return;
    }

    setInputPoints(newValue);
  }, [inputPoints, totalPoints]);

  const handleDelete = useCallback(() => {
    setInputPoints(inputPoints.slice(0, -1));
  }, [inputPoints]);

  const handleConfirm = useCallback(() => {
    if (isCouponMode) {
      // 쿠폰 전환
      if (selectedCoupon > totalPoints) {
        setShowExceedsBalanceAlert(true);
        return;
      }
      setShowConfirmModal(true);
    } else {
      // 포인트 전환
      const points = parseInt(inputPoints);
      if (!inputPoints || points === 0) return;

      if (points > 10000) {
        setShowExceedsBalanceAlert(true);
        return;
      }

      setShowConfirmModal(true);
    }
  }, [isCouponMode, inputPoints, selectedCoupon, totalPoints]);

  const handleTransfer = useCallback(async () => {
    setShowConfirmModal(false);

    const transferPoints = isCouponMode ? selectedCoupon : parseInt(inputPoints);

    try {
      const res = await fetch("/api/points/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionType: selectedOption,
          points: transferPoints,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setShowExceedsBalanceAlert(true);
        return;
      }

      setSuccessMessage(data.message);
      setShowSuccessModal(true);
      mutatePoints();
    } catch {
      console.error("Error transferring points");
    }
  }, [selectedOption, inputPoints, isCouponMode, selectedCoupon, mutatePoints]);

  const handleOptionSelect = useCallback((optionType: string, available: boolean) => {
    if (!available) return;
    setSelectedOption(optionType);
    setInputPoints("");
    setSelectedCoupon(3000);
  }, []);

  // 확인 버튼 활성화 조건
  const isConfirmEnabled = useMemo(() => {
    if (isCouponMode) {
      return selectedCoupon <= totalPoints && availableCoupons.length > 0;
    }
    return inputPoints && parseInt(inputPoints) > 0 && parseInt(inputPoints) <= totalPoints;
  }, [isCouponMode, selectedCoupon, totalPoints, availableCoupons, inputPoints]);

  if (loading) {
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
        <TransferSkeleton />
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
                onClick={() => handleOptionSelect(option.option_type, option.available)}
                disabled={!option.available}
                className={`flex-shrink-0 w-20 h-16 rounded-xl border-2 transition-all flex items-center justify-center text-xs font-medium text-center leading-tight ${
                  selectedOption === option.option_type
                    ? "bg-[#9F85E3] text-white border-[#9F85E3]"
                    : option.available
                    ? "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    : "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                }`}
              >
                <span className="whitespace-pre-line">{option.option_name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 전환 요청 포인트/쿠폰 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">
              {isCouponMode ? "전환 요청 쿠폰" : "전환 요청 포인트"}
            </p>
            <p className="text-xs text-gray-400">
              사용가능한 포인트: {totalPoints.toLocaleString()}P
            </p>
          </div>

          {isCouponMode ? (
            /* 쿠폰 선택 드롭다운 */
            <button
              onClick={() => setShowCouponPicker(true)}
              className="w-full flex items-center justify-between px-4 py-4 border border-gray-200 rounded-xl bg-gray-50"
            >
              <span className="text-lg font-medium text-gray-900">
                {availableCoupons.length > 0 
                  ? COUPON_OPTIONS.find(c => c.value === selectedCoupon)?.label
                  : "사용 가능한 쿠폰 없음"}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          ) : (
            /* 포인트 입력 */
            <div className="flex items-center justify-center py-6 border border-gray-200 rounded-xl bg-gray-50">
              <span className="text-3xl font-bold text-gray-900">
                {inputPoints ? parseInt(inputPoints).toLocaleString() : ""}
              </span>
              <span className="text-2xl text-gray-400 ml-1">P</span>
            </div>
          )}
        </div>

        {/* 안내 문구 */}
        <div className="mb-4 text-sm space-y-1">
          {isCouponMode ? (
            <>
              <p className="text-gray-500">• 한번 전환할 때 한개 쿠폰만 전환할 수 있어요.</p>
              <p className="text-gray-500">• 전환 이후 환불은 불가능 해요!</p>
            </>
          ) : (
            <>
              <p className="text-gray-500">• 한번 전환할 때 10,000포인트 까지 전환할 수 있어요.</p>
              <p className="text-gray-500">• 전환 이후 환불은 불가능 해요!</p>
            </>
          )}
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={handleConfirm}
          disabled={!isConfirmEnabled}
          className={`w-full py-4 rounded-xl font-semibold transition-colors ${
            isConfirmEnabled
              ? "bg-[#C9E34F] text-gray-900 hover:bg-[#B8D23E]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          확인
        </button>
      </div>

      {/* 숫자 키패드 (포인트 모드에서만) */}
      {!isCouponMode && (
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
      )}

      {/* 쿠폰 선택 바텀시트 */}
      <BottomSheet
        isOpen={showCouponPicker}
        onClose={() => setShowCouponPicker(false)}
        title="쿠폰을 선택해주세요"
      >
        <div className="space-y-2 mb-6">
          {COUPON_OPTIONS.map((coupon) => {
            const isAvailable = coupon.value <= totalPoints;
            return (
              <button
                key={coupon.value}
                onClick={() => {
                  if (isAvailable) {
                    setSelectedCoupon(coupon.value);
                    setShowCouponPicker(false);
                  }
                }}
                disabled={!isAvailable}
                className={`w-full px-4 py-4 rounded-xl transition-colors text-left ${
                  selectedCoupon === coupon.value && isAvailable
                    ? "bg-purple-50 border-2 border-[#9F85E3]"
                    : isAvailable
                    ? "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${!isAvailable ? "text-gray-400" : "text-gray-900"}`}>
                    {coupon.label}
                  </span>
                  {!isAvailable && (
                    <span className="text-xs text-gray-400">포인트 부족</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </BottomSheet>

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
        message={
          isCouponMode
            ? `${selectedCoupon.toLocaleString()}원 쿠폰을 ${selectedOptionData?.option_name?.replace('\n', ' ') || ""}으로 전환하시겠습니까?`
            : `${parseInt(inputPoints || "0").toLocaleString()}P를 ${selectedOptionData?.option_name?.replace('\n', ' ') || ""}으로 전환하시겠습니까?`
        }
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
