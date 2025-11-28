"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Home, ChevronDown } from "lucide-react";
import { ConfirmModal, BottomSheet } from "@/components/ui/Modal";
import { PointsPageSkeleton } from "@/components/ui/LoadingSpinner";

type TabType = "coupon" | "point";
type CouponFilter = "all" | "greating" | "cafeteria";
type PointFilter = "all" | "earn" | "use" | "expire";

interface Coupon {
  id: string;
  coupon_name: string;
  coupon_type: "greating" | "cafeteria";
  coupon_value: number;
  source_detail?: string;
  status: "pending" | "available" | "transferred" | "used" | "expired";
  transferred_account?: string;
  created_at: string;
}

interface PointHistory {
  id: string;
  points: number;
  transaction_type: "earn" | "use" | "transfer" | "expire";
  source: string;
  source_detail?: string;
  text1?: string;
  text2?: string;
  created_at: string;
}

export default function PointsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("point");
  const [couponFilter, setCouponFilter] = useState<CouponFilter>("all");
  const [pointFilter, setPointFilter] = useState<PointFilter>("all");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
  });
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  // 데이터 상태
  const [loading, setLoading] = useState(true);
  const [totalCoupons, setTotalCoupons] = useState(2);
  const [totalPoints, setTotalPoints] = useState(3200);
  const [couponStats, setCouponStats] = useState({
    available: 2,
    thisMonthIssued: 1,
    thisMonthUsed: 2,
    expiring30Days: 3,
  });
  const [pointStats, setPointStats] = useState({
    thisMonthEarned: 200,
    thisMonthTransferred: 5000,
    expiring30Days: 700,
  });
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);

  // 팝업 상태
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [showTransferError, setShowTransferError] = useState(false);
  const [showLinkRequired, setShowLinkRequired] = useState(false);
  const [showMinPointsAlert, setShowMinPointsAlert] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [linkAccountType, setLinkAccountType] = useState<string>("");

  // 월 선택 옵션 생성
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, couponFilter, pointFilter, selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 월 파싱
      const match = selectedMonth.match(/(\d+)년 (\d+)월/);
      if (!match) return;
      const monthParam = `${match[1]}-${match[2].padStart(2, "0")}`;

      if (activeTab === "point") {
        const res = await fetch(`/api/points?filter=${pointFilter}&month=${monthParam}`);
        const data = await res.json();
        if (data.totalPoints !== undefined) setTotalPoints(data.totalPoints);
        if (data.thisMonthEarned !== undefined) {
          setPointStats({
            thisMonthEarned: data.thisMonthEarned || 0,
            thisMonthTransferred: data.thisMonthTransferred || 0,
            expiring30Days: data.expiringPoints30Days || 0,
          });
        }
        setPointHistory(data.history || []);
      } else {
        const res = await fetch(`/api/coupons?filter=${couponFilter}&month=${monthParam}`);
        const data = await res.json();
        if (data.availableCoupons !== undefined) setTotalCoupons(data.availableCoupons);
        if (data.thisMonthIssued !== undefined) {
          setCouponStats({
            available: data.availableCoupons || 0,
            thisMonthIssued: data.thisMonthIssued || 0,
            thisMonthUsed: data.thisMonthUsed || 0,
            expiring30Days: data.expiringCoupons30Days || 0,
          });
        }
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCouponTransfer = async (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    
    try {
      const res = await fetch("/api/coupons/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId: coupon.id }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.needsLinking) {
          setLinkAccountType(data.accountType);
          setShowLinkRequired(true);
        } else {
          setShowTransferError(true);
        }
        return;
      }
      
      setShowTransferConfirm(true);
      fetchData();
    } catch {
      setShowTransferError(true);
    }
  };

  const handlePointTransfer = () => {
    if (totalPoints < 5000) {
      setShowMinPointsAlert(true);
      return;
    }
    router.push("/menu/points/transfer");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} (${days[date.getDay()]})`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const getStatusButton = (coupon: Coupon) => {
    switch (coupon.status) {
      case "pending":
        return (
          <span className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg">
            발급대기
          </span>
        );
      case "transferred":
        return (
          <span className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg">
            전환됨
          </span>
        );
      case "available":
        return (
          <button
            onClick={() => handleCouponTransfer(coupon)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#9F85E3] rounded-lg hover:bg-[#8B71CF] transition-colors"
          >
            전환하기
          </button>
        );
      default:
        return null;
    }
  };

  // 내역 그룹화 (날짜별)
  const groupByDate = <T extends { created_at: string }>(items: T[]) => {
    const groups: { [key: string]: T[] } = {};
    items.forEach((item) => {
      const dateKey = formatDate(item.created_at);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    return groups;
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* 헤더 - 상단 고정 */}
      <header className="sticky top-0 bg-white z-20 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {activeTab === "point" ? "포인트" : "쿠폰"}
          </h1>
          <button onClick={() => router.push("/home")} className="p-1">
            <Home className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        {/* 내 자산 섹션 */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-lg">🐷</span>
            <span className="text-base font-semibold text-gray-900">내 자산</span>
          </div>
          
          {/* 자산 현황 카드 */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            {/* 쿠폰 행 */}
            <button 
              className={`w-full flex items-center justify-between px-4 py-4 transition-colors ${activeTab === "coupon" ? "bg-purple-50" : ""}`}
              onClick={() => setActiveTab("coupon")}
            >
              <span className="text-gray-700 font-medium">쿠폰</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-900">{totalCoupons}장</span>
                <span className="text-sm text-gray-400">상세보기</span>
              </div>
            </button>
            
            <div className="border-t border-gray-100" />
            
            {/* 포인트 행 */}
            <button 
              className={`w-full flex items-center justify-between px-4 py-4 transition-colors ${activeTab === "point" ? "bg-purple-50" : ""}`}
              onClick={() => setActiveTab("point")}
            >
              <span className="text-gray-700 font-medium">포인트</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-900">{totalPoints.toLocaleString()}P</span>
                <span className="text-sm text-gray-400">상세보기</span>
              </div>
            </button>
          </div>
        </div>

        {/* 상세 현황 섹션 */}
        <div className="bg-white rounded-2xl p-4 mb-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-lg">{activeTab === "point" ? "💰" : "🎫"}</span>
            <span className="text-base font-semibold text-gray-900">
              {activeTab === "point" ? "내 포인트" : "내 쿠폰"}
            </span>
          </div>

          {activeTab === "point" ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">현재 포인트</p>
                  <p className="text-3xl font-bold text-gray-900">{totalPoints.toLocaleString()}P</p>
                </div>
                <div className="text-right text-sm space-y-1">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">이번달 적립</span>
                    <span className="text-gray-900 font-medium">{pointStats.thisMonthEarned.toLocaleString()}P</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">이번달 전환</span>
                    <span className="text-gray-900 font-medium">{pointStats.thisMonthTransferred.toLocaleString()}P</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">30일 이내 소멸 예정</span>
                    <span className="text-gray-900 font-medium">{pointStats.expiring30Days.toLocaleString()}P</span>
                  </div>
                </div>
              </div>
              {/* 5000포인트 미만 안내 */}
              {totalPoints < 5000 && (
                <p className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                  5,000 포인트 이상부터 사용가능합니다
                </p>
              )}
            </>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">발급된 쿠폰</p>
                <p className="text-3xl font-bold text-gray-900">{couponStats.available}장</p>
              </div>
              <div className="text-right text-sm space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">이번달 발급</span>
                  <span className="text-gray-900 font-medium">{couponStats.thisMonthIssued}장</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">이번달 전환</span>
                  <span className="text-gray-900 font-medium">{couponStats.thisMonthUsed}장</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">30일 이내 소멸 예정</span>
                  <span className="text-gray-900 font-medium">{couponStats.expiring30Days}장</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 필터 섹션 */}
        <div className="flex items-center justify-between mb-4">
          {/* 월 선택 */}
          <button
            onClick={() => setShowMonthPicker(true)}
            className="flex items-center gap-1 text-gray-900 font-medium"
          >
            {selectedMonth}
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* 구분 필터 */}
          {activeTab === "point" ? (
            <div className="flex text-sm">
              {(["all", "earn", "use", "expire"] as PointFilter[]).map((filter, idx) => (
                <button
                  key={filter}
                  onClick={() => setPointFilter(filter)}
                  className={`px-2 py-1 ${
                    pointFilter === filter
                      ? "text-gray-900 font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {filter === "all" ? "전체" : filter === "earn" ? "적립" : filter === "use" ? "사용" : "소멸"}
                  {idx < 3 && <span className="text-gray-300 ml-2">|</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex text-sm">
              {(["all", "greating", "cafeteria"] as CouponFilter[]).map((filter, idx) => (
                <button
                  key={filter}
                  onClick={() => setCouponFilter(filter)}
                  className={`px-2 py-1 ${
                    couponFilter === filter
                      ? "text-gray-900 font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {filter === "all" ? "전체" : filter === "greating" ? "그리팅" : "카페테리아"}
                  {idx < 2 && <span className="text-gray-300 ml-2">|</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 내역 리스트 */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="h-5 w-32 bg-gray-200 rounded mb-1" />
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </div>
                      <div className="h-6 w-16 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "point" ? (
          pointHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-400">포인트 내역이 없어요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupByDate(pointHistory)).map(([date, items]) => (
                <div key={date}>
                  <p className="text-sm text-gray-500 mb-2">{date}</p>
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`px-4 py-3 ${idx !== items.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-900">{item.source}</span>
                              {item.text1 && (
                                <span className="px-2 py-0.5 text-xs bg-[#9F85E3] text-white rounded">
                                  {item.text1}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <span>{formatTime(item.created_at)}</span>
                              {item.source_detail && (
                                <>
                                  <span>|</span>
                                  <span>{item.source_detail}</span>
                                </>
                              )}
                              {item.text2 && (
                                <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                                  {item.text2}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`font-bold text-lg ${item.points > 0 ? "text-gray-900" : "text-gray-500"}`}>
                            {item.points > 0 ? "" : ""}{item.points.toLocaleString()}P
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-400">쿠폰 내역이 없어요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupByDate(coupons)).map(([date, items]) => (
                <div key={date}>
                  <p className="text-sm text-gray-500 mb-2">{date}</p>
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`px-4 py-3 ${idx !== items.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">{item.coupon_name}</span>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <span>{formatTime(item.created_at)}</span>
                              {item.source_detail && (
                                <>
                                  <span>|</span>
                                  <span>{item.source_detail}</span>
                                </>
                              )}
                            </div>
                          </div>
                          {getStatusButton(item)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* 포인트 전환하기 버튼 */}
      {activeTab === "point" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <button
            onClick={handlePointTransfer}
            className="w-full py-4 bg-[#9F85E3] text-white font-semibold rounded-xl hover:bg-[#8B71CF] transition-colors"
          >
            포인트 전환하기
          </button>
        </div>
      )}

      {/* 월 선택 바텀시트 */}
      <BottomSheet
        isOpen={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        title="월 선택"
      >
        <div className="space-y-1 mb-4">
          {monthOptions.map((month) => (
            <button
              key={month}
              onClick={() => {
                setSelectedMonth(month);
                setShowMonthPicker(false);
              }}
              className={`w-full px-4 py-3 text-left rounded-xl transition-colors ${
                selectedMonth === month
                  ? "bg-purple-50 text-[#9F85E3] font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* 전환 확인 팝업 */}
      <ConfirmModal
        isOpen={showTransferConfirm}
        onClose={() => setShowTransferConfirm(false)}
        onConfirm={() => setShowTransferConfirm(false)}
        message={`확인 버튼을 누르시면\n그리팅몰(${selectedCoupon?.transferred_account || "gre***"})로 쿠폰이 전환되어\n그리팅몰 쿠폰함에서 확인하실 수 있어요!`}
        showCancel
      />

      {/* 전환 에러 팝업 */}
      <ConfirmModal
        isOpen={showTransferError}
        onClose={() => setShowTransferError(false)}
        onConfirm={() => setShowTransferError(false)}
        message={"쿠폰 전환중 문제가 발생했어요!\n다시 시도해주세요."}
        showCancel
      />

      {/* 연동 필요 팝업 */}
      <ConfirmModal
        isOpen={showLinkRequired}
        onClose={() => setShowLinkRequired(false)}
        onConfirm={() => {
          setShowLinkRequired(false);
          router.push("/menu/account-link");
        }}
        message={`___쿠폰 발급을 위해\n${linkAccountType === "greating_mall" ? "그리팅(카페테리아)" : "그리팅(카페테리아)"} 연동이 필요해요!`}
        confirmText="연동하기"
        cancelText="취소"
        showCancel
      />

      {/* 최소 포인트 알림 팝업 */}
      <ConfirmModal
        isOpen={showMinPointsAlert}
        onClose={() => setShowMinPointsAlert(false)}
        onConfirm={() => setShowMinPointsAlert(false)}
        message="5,000 포인트 이상부터 사용가능합니다"
        showCancel={false}
      />
    </div>
  );
}
