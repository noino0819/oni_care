"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Pill, Plus, Calendar, Check } from "lucide-react";
import { BottomNavigation } from "@/components/home/BottomNavigation";

export default function SupplementPage() {
  const router = useRouter();

  // 샘플 영양제 데이터
  const supplements = [
    {
      id: 1,
      name: "종합 비타민",
      dosage: "1정",
      time: "아침 식후",
      taken: true,
    },
    {
      id: 2,
      name: "오메가3",
      dosage: "1캡슐",
      time: "점심 식후",
      taken: true,
    },
    {
      id: 3,
      name: "비타민D",
      dosage: "1정",
      time: "저녁 식후",
      taken: false,
    },
    {
      id: 4,
      name: "유산균",
      dosage: "1포",
      time: "취침 전",
      taken: false,
    },
  ];

  const takenCount = supplements.filter((s) => s.taken).length;
  const totalCount = supplements.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">영양제 기록</h1>
          <button className="p-1">
            <Plus className="w-6 h-6 text-[#9F85E3]" />
          </button>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 오늘의 복용 현황 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">오늘</span>
            </div>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#9F85E3"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(takenCount / totalCount) * 283} 283`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {takenCount}/{totalCount}
                </span>
                <span className="text-sm text-gray-500">복용 완료</span>
              </div>
            </div>
          </div>
        </div>

        {/* 영양제 목록 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">오늘의 영양제</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {supplements.map((supplement) => (
              <div
                key={supplement.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      supplement.taken
                        ? "bg-[#9F85E3]/10"
                        : "bg-gray-100"
                    }`}
                  >
                    <Pill
                      className={`w-5 h-5 ${
                        supplement.taken
                          ? "text-[#9F85E3]"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {supplement.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {supplement.dosage} · {supplement.time}
                    </p>
                  </div>
                </div>
                <button
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    supplement.taken
                      ? "bg-[#9F85E3] border-[#9F85E3]"
                      : "border-gray-300 hover:border-[#9F85E3]"
                  }`}
                >
                  {supplement.taken && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 영양제 추가 안내 */}
        <div className="mt-6 text-center">
          <button className="inline-flex items-center gap-2 text-[#9F85E3] font-medium">
            <Plus className="w-5 h-5" />
            새 영양제 추가하기
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

