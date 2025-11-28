"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupplementRoutine {
  id: string;
  name: string;
  dosage: string;
  timeSlot: string;
  isActive: boolean;
}

const TIME_SLOTS = [
  { value: "morning", label: "아침 식후" },
  { value: "lunch", label: "점심 식후" },
  { value: "dinner", label: "저녁 식후" },
  { value: "before_sleep", label: "취침 전" },
];

export default function SupplementRoutinePage() {
  const router = useRouter();
  const [routines, setRoutines] = useState<SupplementRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    name: "",
    dosage: "",
    timeSlot: "morning",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchRoutines = async () => {
      setIsLoading(true);
      try {
        // TODO: 실제 API 호출로 대체
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        setRoutines([
          { id: "1", name: "종합 비타민", dosage: "1정", timeSlot: "morning", isActive: true },
          { id: "2", name: "오메가3", dosage: "1캡슐", timeSlot: "lunch", isActive: true },
          { id: "3", name: "비타민D", dosage: "1정", timeSlot: "dinner", isActive: true },
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutines();
  }, []);

  // 루틴 추가
  const addRoutine = async () => {
    if (!newRoutine.name.trim()) {
      alert("영양제 이름을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      // TODO: API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 300));

      const routine: SupplementRoutine = {
        id: Date.now().toString(),
        name: newRoutine.name,
        dosage: newRoutine.dosage || "1정",
        timeSlot: newRoutine.timeSlot,
        isActive: true,
      };

      setRoutines((prev) => [...prev, routine]);
      setNewRoutine({ name: "", dosage: "", timeSlot: "morning" });
      setShowAddModal(false);
    } catch (error) {
      console.error(error);
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 루틴 삭제
  const deleteRoutine = async (routineId: string) => {
    if (!confirm("이 영양제를 삭제하시겠습니까?")) return;

    try {
      // TODO: API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 300));
      setRoutines((prev) => prev.filter((r) => r.id !== routineId));
    } catch (error) {
      console.error(error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 활성화 토글
  const toggleActive = async (routineId: string) => {
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === routineId ? { ...r, isActive: !r.isActive } : r
      )
    );
    // TODO: API 호출로 저장
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
          <h1 className="text-lg font-semibold text-gray-900">영양제 루틴 관리</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-1 text-[#9F85E3]"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {routines.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-4xl mb-4">💊</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              등록된 영양제가 없어요
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              매일 복용하는 영양제를 등록해보세요
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-[#9F85E3] text-white px-6 py-3 rounded-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              영양제 등록하기
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              등록된 영양제를 관리하세요. 비활성화된 영양제는 기록에서 제외됩니다.
            </p>

            {/* 시간대별 루틴 */}
            {TIME_SLOTS.map((slot) => {
              const slotRoutines = routines.filter((r) => r.timeSlot === slot.value);
              if (slotRoutines.length === 0) return null;

              return (
                <div key={slot.value} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-800">{slot.label}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {slotRoutines.map((routine) => (
                      <div
                        key={routine.id}
                        className={cn(
                          "flex items-center justify-between p-4",
                          !routine.isActive && "opacity-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleActive(routine.id)}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                              routine.isActive
                                ? "bg-[#9F85E3] border-[#9F85E3]"
                                : "border-gray-300"
                            )}
                          >
                            {routine.isActive && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </button>
                          <div>
                            <p className="font-medium text-gray-800">{routine.name}</p>
                            <p className="text-sm text-gray-500">{routine.dosage}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteRoutine(routine.id)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white rounded-t-3xl w-full max-w-md p-6 pb-8 animate-slide-up">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-6">영양제 등록</h3>

            <div className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  영양제 이름 *
                </label>
                <input
                  type="text"
                  value={newRoutine.name}
                  onChange={(e) =>
                    setNewRoutine((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="예: 종합 비타민"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9F85E3]"
                />
              </div>

              {/* 복용량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  복용량
                </label>
                <input
                  type="text"
                  value={newRoutine.dosage}
                  onChange={(e) =>
                    setNewRoutine((prev) => ({ ...prev, dosage: e.target.value }))
                  }
                  placeholder="예: 1정, 2캡슐"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9F85E3]"
                />
              </div>

              {/* 복용 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  복용 시간
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() =>
                        setNewRoutine((prev) => ({ ...prev, timeSlot: slot.value }))
                      }
                      className={cn(
                        "py-3 rounded-xl text-sm font-medium transition-colors",
                        newRoutine.timeSlot === slot.value
                          ? "bg-[#9F85E3] text-white"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={addRoutine}
                disabled={isSaving}
                className="flex-1 py-3 bg-[#9F85E3] text-white rounded-xl font-medium"
              >
                {isSaving ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

