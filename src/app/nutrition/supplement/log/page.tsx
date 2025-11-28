"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupplementRoutine {
  id: string;
  name: string;
  dosage: string;
  timeSlot: string;
  timeSlotLabel: string;
  isTaken: boolean;
  takenAt?: string;
}

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "아침 식후",
  lunch: "점심 식후",
  dinner: "저녁 식후",
  before_sleep: "취침 전",
};

export default function SupplementLogPage() {
  const router = useRouter();
  const [supplements, setSupplements] = useState<SupplementRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSupplements = async () => {
      setIsLoading(true);
      try {
        // TODO: 실제 API 호출로 대체
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        setSupplements([
          { id: "1", name: "종합 비타민", dosage: "1정", timeSlot: "morning", timeSlotLabel: "아침 식후", isTaken: true },
          { id: "2", name: "오메가3", dosage: "1캡슐", timeSlot: "lunch", timeSlotLabel: "점심 식후", isTaken: true },
          { id: "3", name: "비타민D", dosage: "1정", timeSlot: "dinner", timeSlotLabel: "저녁 식후", isTaken: false },
          { id: "4", name: "유산균", dosage: "1포", timeSlot: "before_sleep", timeSlotLabel: "취침 전", isTaken: false },
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplements();
  }, []);

  const takenCount = supplements.filter((s) => s.isTaken).length;
  const totalCount = supplements.length;

  // 복용 토글
  const toggleTaken = async (supplementId: string) => {
    const supplement = supplements.find((s) => s.id === supplementId);
    if (!supplement) return;

    setSupplements((prev) =>
      prev.map((s) =>
        s.id === supplementId
          ? { ...s, isTaken: !s.isTaken, takenAt: !s.isTaken ? new Date().toISOString() : undefined }
          : s
      )
    );

    // TODO: API 호출로 저장
  };

  // 전체 복용 완료
  const markAllTaken = async () => {
    setIsSaving(true);
    try {
      setSupplements((prev) =>
        prev.map((s) => ({ ...s, isTaken: true, takenAt: new Date().toISOString() }))
      );
      // TODO: API 호출로 저장
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F85E3]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">영양제 기록</h1>
          <button
            onClick={() => router.push("/nutrition/supplement/routine")}
            className="p-1 text-[#9F85E3]"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* 오늘의 복용 현황 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">오늘의 복용 현황</h3>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* 원형 그래프 */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#9F85E3"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(takenCount / totalCount) * 251} 251`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {takenCount}/{totalCount}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                {takenCount === totalCount
                  ? "오늘 복용을 완료했어요! 👏"
                  : `${totalCount - takenCount}개 더 복용해야 해요`}
              </p>
              {takenCount < totalCount && (
                <button
                  onClick={markAllTaken}
                  disabled={isSaving}
                  className="bg-[#9F85E3] text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {isSaving ? "처리 중..." : "전체 복용 완료"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 시간대별 영양제 */}
        {["morning", "lunch", "dinner", "before_sleep"].map((timeSlot) => {
          const slotSupplements = supplements.filter((s) => s.timeSlot === timeSlot);
          if (slotSupplements.length === 0) return null;

          return (
            <div key={timeSlot} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-800">
                  {TIME_SLOT_LABELS[timeSlot]}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {slotSupplements.map((supplement) => (
                  <button
                    key={supplement.id}
                    onClick={() => toggleTaken(supplement.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          supplement.isTaken ? "bg-[#9F85E3]/10" : "bg-gray-100"
                        )}
                      >
                        <span className="text-lg">💊</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-800">{supplement.name}</p>
                        <p className="text-sm text-gray-500">{supplement.dosage}</p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        supplement.isTaken
                          ? "bg-[#9F85E3] border-[#9F85E3]"
                          : "border-gray-300"
                      )}
                    >
                      {supplement.isTaken && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {supplements.length === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-4xl mb-4">💊</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              등록된 영양제가 없어요
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              복용 중인 영양제를 등록해주세요
            </p>
            <button
              onClick={() => router.push("/nutrition/supplement/routine")}
              className="inline-flex items-center gap-2 bg-[#9F85E3] text-white px-6 py-3 rounded-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              영양제 등록하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

