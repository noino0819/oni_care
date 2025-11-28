"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR, { mutate } from "swr";

interface ScheduledTime {
  time: string;
  period: "AM" | "PM";
  dosage: string;
}

interface SupplementRoutine {
  id: string;
  name: string;
  brand?: string;
  dosage: string;
  dosagePerServing?: string;
  daysOfWeek: string[];
  scheduledTimes: ScheduledTime[];
  isActive: boolean;
}

const DAYS = [
  { key: "mon", label: "월" },
  { key: "tue", label: "화" },
  { key: "wed", label: "수" },
  { key: "thu", label: "목" },
  { key: "fri", label: "금" },
  { key: "sat", label: "토" },
  { key: "sun", label: "일" },
];

const ALL_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 요일 배열을 표시 텍스트로 변환
const formatDaysOfWeek = (days: string[]): string => {
  if (!days || days.length === 0) return "매일";
  if (days.length === 7) return "매일";
  
  const sortOrder = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const sorted = [...days].sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b));
  const labels = sorted.map((d) => DAYS.find((day) => day.key === d)?.label || d);
  return labels.join(", ");
};

// 스케줄된 시간을 표시 텍스트로 변환
const formatScheduledTime = (st: ScheduledTime): string => {
  const periodLabel = st.period === "AM" ? "오전" : "오후";
  return `${periodLabel} ${st.time}`;
};

// 시간별 추천 멘트 반환
const getIntakeTimeRecommendation = (scheduledTimes: ScheduledTime[]): string | null => {
  if (!scheduledTimes || scheduledTimes.length === 0) return null;
  
  // 첫 번째 시간대 기준으로 멘트 결정
  const firstTime = scheduledTimes[0];
  const [hourStr, minuteStr] = firstTime.time.split(":");
  let hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);
  
  // PM이고 12시가 아니면 12 더함
  if (firstTime.period === "PM" && hour !== 12) {
    hour += 12;
  }
  // AM이고 12시면 0으로
  if (firstTime.period === "AM" && hour === 12) {
    hour = 0;
  }
  
  const totalMinutes = hour * 60 + minute;
  
  // 5:00 ~ 7:00 (AM 5:00 ~ 7:00)
  if (totalMinutes >= 300 && totalMinutes < 420) {
    return "아침 식전에 먹는걸 추천해요!";
  }
  // 7:01 ~ 10:00 (AM 7:01 ~ 10:00)
  if (totalMinutes >= 420 && totalMinutes < 600) {
    return "아침 식후에 먹는걸 추천해요!";
  }
  // 10:01 ~ 12:00 (AM 10:01 ~ 12:00) - 멘트 없음
  if (totalMinutes >= 600 && totalMinutes < 720) {
    return null;
  }
  // 12:01 ~ 15:00 (PM 12:01 ~ 15:00)
  if (totalMinutes >= 720 && totalMinutes < 900) {
    return "점심 식후에 먹는걸 추천해요!";
  }
  // 15:01 ~ 18:00 (PM 15:01 ~ 18:00)
  if (totalMinutes >= 900 && totalMinutes < 1080) {
    return "저녁 식전에 먹는걸 추천해요!";
  }
  // 18:01 ~ 22:00 (PM 18:01 ~ 22:00)
  if (totalMinutes >= 1080 && totalMinutes <= 1320) {
    return "저녁 식후에 먹는걸 추천해요!";
  }
  
  return null;
};

export default function SupplementRoutinePage() {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [localRoutines, setLocalRoutines] = useState<SupplementRoutine[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  
  // 바텀시트 상태
  const [showDaysSheet, setShowDaysSheet] = useState(false);
  const [showTimeSheet, setShowTimeSheet] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [editingDays, setEditingDays] = useState<string[]>([]);
  const [editingTimes, setEditingTimes] = useState<ScheduledTime[]>([]);
  
  // 시간 선택 휠 상태
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");
  const [selectedHour, setSelectedHour] = useState("9");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedDosage, setSelectedDosage] = useState("1알");
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);

  // Alert 상태
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [showSearchAlert, setShowSearchAlert] = useState(false);
  const [showChangeWarning, setShowChangeWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const { data, error, isLoading } = useSWR(
    "/api/nutrition/supplements/routines",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  // 데이터 로드 시 로컬 상태 업데이트
  useEffect(() => {
    if (data?.routines) {
      setLocalRoutines(data.routines);
      setHasChanges(false);
    }
  }, [data]);

  // 초기 툴팁 3초 후 숨기기
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 뒤로가기 처리
  const handleBack = () => {
    if (isEditMode && hasChanges) {
      setShowExitAlert(true);
    } else {
      router.back();
    }
  };

  // 검색 버튼 클릭
  const handleSearchClick = () => {
    if (isEditMode && hasChanges) {
      setShowSearchAlert(true);
    } else {
      router.push("/nutrition/supplement/search");
    }
  };

  // 편집 완료
  const handleEditComplete = async () => {
    if (!hasChanges) {
      setIsEditMode(false);
      return;
    }

    try {
      // 변경사항 저장
      await fetch("/api/nutrition/supplements/routines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routines: localRoutines }),
      });

      mutate("/api/nutrition/supplements/routines");
      setHasChanges(false);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 루틴 삭제
  const deleteRoutine = useCallback((routineId: string) => {
    setLocalRoutines((prev) => prev.filter((r) => r.id !== routineId));
    setHasChanges(true);
  }, []);

  // 요일 선택 바텀시트 열기
  const openDaysSheet = (routine: SupplementRoutine) => {
    setEditingRoutineId(routine.id);
    setEditingDays([...routine.daysOfWeek]);
    setShowDaysSheet(true);
  };

  // 요일 토글
  const toggleDay = (day: string) => {
    setEditingDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day];
    });
  };

  // 요일 선택 확인
  const confirmDaysSelection = () => {
    if (editingRoutineId && editingDays.length > 0) {
      setLocalRoutines((prev) =>
        prev.map((r) =>
          r.id === editingRoutineId
            ? { ...r, daysOfWeek: editingDays }
            : r
        )
      );
      setHasChanges(true);
    }
    setShowDaysSheet(false);
    setEditingRoutineId(null);
  };

  // 시간 선택 바텀시트 열기
  const openTimeSheet = (routine: SupplementRoutine) => {
    setEditingRoutineId(routine.id);
    setEditingTimes([...routine.scheduledTimes]);
    setShowTimeSheet(true);
  };

  // 시간 항목 편집 시작
  const startEditTime = (index: number) => {
    const time = editingTimes[index];
    if (time) {
      setSelectedPeriod(time.period);
      const [hour, minute] = time.time.split(":");
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setSelectedDosage(time.dosage);
      setEditingTimeIndex(index);
    }
  };

  // 시간 항목 삭제
  const removeTime = (index: number) => {
    setEditingTimes((prev) => prev.filter((_, i) => i !== index));
  };

  // 루틴 추가
  const addTime = () => {
    setEditingTimes((prev) => [
      ...prev,
      { time: "09:00", period: "AM", dosage: "1알" },
    ]);
    setEditingTimeIndex(editingTimes.length);
    setSelectedPeriod("AM");
    setSelectedHour("9");
    setSelectedMinute("00");
    setSelectedDosage("1알");
  };

  // 시간 선택 확인
  const confirmTimeSelection = () => {
    if (editingTimeIndex !== null) {
      const newTime: ScheduledTime = {
        time: `${selectedHour.padStart(2, "0")}:${selectedMinute}`,
        period: selectedPeriod,
        dosage: selectedDosage,
      };
      setEditingTimes((prev) =>
        prev.map((t, i) => (i === editingTimeIndex ? newTime : t))
      );
      setEditingTimeIndex(null);
    }
  };

  // 전체 시간 설정 저장
  const saveTimeSettings = () => {
    if (editingRoutineId && editingTimes.length > 0) {
      setLocalRoutines((prev) =>
        prev.map((r) =>
          r.id === editingRoutineId
            ? { ...r, scheduledTimes: editingTimes }
            : r
        )
      );
      setHasChanges(true);
    }
    setShowTimeSheet(false);
    setEditingRoutineId(null);
    setEditingTimeIndex(null);
  };

  // 스켈레톤 UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            <h1 className="text-lg font-semibold text-gray-900">영양제 루틴 관리</h1>
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
        </header>

        <div className="px-4 py-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <button
            onClick={() => mutate("/api/nutrition/supplements/routines")}
            className="bg-[#9F85E3] text-white px-4 py-2 rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={handleBack} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">영양제 루틴 관리</h1>
          <div className="relative">
            <button onClick={handleSearchClick} className="p-1">
              <Search className="w-5 h-5 text-gray-800" />
            </button>
            {/* 안내 툴팁 */}
            {showTooltip && localRoutines.length > 0 && (
              <div className="absolute top-10 right-0 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap animate-fade-in">
                영양제를 추가할 수 있어요.
                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 rotate-45" />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {localRoutines.length === 0 ? (
          /* 빈 상태 화면 */
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center mt-20">
            <div className="w-40 h-40 mx-auto mb-6 bg-gradient-to-b from-gray-100 to-gray-50 rounded-full flex items-center justify-center">
              <span className="text-7xl opacity-50">💊</span>
            </div>
            <p className="text-gray-600 mb-2">등록된 루틴이 없습니다.</p>
            <p className="text-gray-500 text-sm mb-8">
              루틴을 등록하고 영양제 섭취를 관리해보세요!
            </p>
            <button
              onClick={() => router.push("/nutrition/supplement/search")}
              className="bg-[#9F85E3] text-white px-8 py-3 rounded-xl font-medium"
            >
              루틴 등록하기
            </button>
          </div>
        ) : (
          <>
            {/* 편집하기/편집완료 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (isEditMode) {
                    handleEditComplete();
                  } else {
                    setIsEditMode(true);
                  }
                }}
                className="text-sm text-gray-600 hover:text-[#9F85E3] flex items-center gap-1"
              >
                <span className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center text-xs",
                  isEditMode ? "border-[#9F85E3] text-[#9F85E3]" : "border-gray-400 text-gray-400"
                )}>
                  {isEditMode ? "✓" : ""}
                </span>
                {isEditMode ? "편집완료" : "편집하기"}
              </button>
            </div>

            {/* 루틴 카드 목록 */}
            {localRoutines.map((routine) => (
              <div
                key={routine.id}
                className={cn(
                  "bg-white rounded-2xl p-4 shadow-sm transition-all",
                  isEditMode && "border-2 border-dashed border-gray-200"
                )}
              >
                {/* 상단 - 브랜드, 이름, 삭제 버튼 */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {routine.brand && (
                      <p className="text-xs text-gray-500 mb-1">{routine.brand}</p>
                    )}
                    <h3 className="font-bold text-gray-900">{routine.name}</h3>
                  </div>
                  {isEditMode && (
                    <button
                      onClick={() => deleteRoutine(routine.id)}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>

                {/* 하단 - 섭취요일, 섭취루틴 */}
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                  {/* 섭취요일 */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">섭취요일</span>
                    {isEditMode ? (
                      <button
                        onClick={() => openDaysSheet(routine)}
                        className="flex items-center gap-1 text-sm text-gray-900"
                      >
                        {formatDaysOfWeek(routine.daysOfWeek)}
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ) : (
                      <span className="text-sm text-gray-900">
                        {formatDaysOfWeek(routine.daysOfWeek)}
                      </span>
                    )}
                  </div>

                  {/* 섭취루틴 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">섭취루틴</span>
                      {isEditMode && (
                        <button
                          onClick={() => openTimeSheet(routine)}
                          className="text-xs text-[#9F85E3] px-2 py-1 border border-[#9F85E3] rounded-full"
                        >
                          루틴추가
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {routine.scheduledTimes.map((st, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          {isEditMode ? (
                            <button
                              onClick={() => {
                                openTimeSheet(routine);
                                setTimeout(() => startEditTime(index), 100);
                              }}
                              className="flex items-center gap-1 text-sm text-gray-700"
                            >
                              <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-gray-400" />
                              </span>
                              {formatScheduledTime(st)}
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                          ) : (
                            <span className="text-sm text-gray-700">
                              {formatScheduledTime(st)}
                            </span>
                          )}
                          <span className="text-sm text-gray-900">{st.dosage}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 시간별 추천 멘트 (편집 모드에서만) */}
                  {isEditMode && getIntakeTimeRecommendation(routine.scheduledTimes) && (
                    <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">
                        {getIntakeTimeRecommendation(routine.scheduledTimes)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 하단 영양제 루틴 분석 버튼 */}
      {localRoutines.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <button
            onClick={() => router.push("/nutrition/supplement/analysis")}
            className="w-full py-4 bg-[#BFFF00] text-gray-900 rounded-xl font-semibold text-lg"
          >
            영양제 루틴 분석
          </button>
        </div>
      )}

      {/* 섭취요일 선택 바텀시트 */}
      {showDaysSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDaysSheet(false)}
          />
          <div className="relative bg-white rounded-t-3xl w-full max-w-md p-6 pb-8 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                섭취요일을 선택해주세요
              </h3>
              <button onClick={() => setShowDaysSheet(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {DAYS.map((day) => (
                <button
                  key={day.key}
                  onClick={() => toggleDay(day.key)}
                  className={cn(
                    "w-10 h-10 rounded-full font-medium transition-colors",
                    editingDays.includes(day.key)
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>

            <button
              onClick={confirmDaysSelection}
              disabled={editingDays.length === 0}
              className={cn(
                "w-full py-4 rounded-xl font-semibold",
                editingDays.length > 0
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 섭취루틴 설정 바텀시트 */}
      {showTimeSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowTimeSheet(false);
              setEditingTimeIndex(null);
            }}
          />
          <div className="relative bg-white rounded-t-3xl w-full max-w-md p-6 pb-8 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                섭취루틴을 설정해주세요
              </h3>
              <button onClick={() => {
                setShowTimeSheet(false);
                setEditingTimeIndex(null);
              }}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* 기존 시간 목록 */}
            <div className="space-y-2 mb-4">
              {editingTimes.map((time, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl",
                    editingTimeIndex === index ? "bg-[#9F85E3]/10 border border-[#9F85E3]" : "bg-gray-50"
                  )}
                >
                  <button
                    onClick={() => startEditTime(index)}
                    className="flex items-center gap-2 flex-1"
                  >
                    <span className="text-sm">
                      {formatScheduledTime(time)} - {time.dosage}
                    </span>
                  </button>
                  <button
                    onClick={() => removeTime(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* 루틴 추가 버튼 */}
            <button
              onClick={addTime}
              className="w-full py-2 mb-4 text-[#9F85E3] border border-dashed border-[#9F85E3] rounded-xl text-sm"
            >
              + 루틴 추가
            </button>

            {/* 시간 선택 휠 */}
            {editingTimeIndex !== null && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex justify-center gap-4 text-center">
                  {/* AM/PM */}
                  <div className="flex flex-col gap-2">
                    {["AM", "PM"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setSelectedPeriod(p as "AM" | "PM")}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium",
                          selectedPeriod === p
                            ? "bg-white shadow text-gray-900"
                            : "text-gray-400"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* 시간 */}
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <button
                        key={h}
                        onClick={() => setSelectedHour(h.toString())}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm",
                          selectedHour === h.toString()
                            ? "bg-white shadow font-medium text-gray-900"
                            : "text-gray-400"
                        )}
                      >
                        {h}시
                      </button>
                    ))}
                  </div>

                  {/* 분 */}
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                    {["00", "10", "20", "30", "40", "50"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedMinute(m)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm",
                          selectedMinute === m
                            ? "bg-white shadow font-medium text-gray-900"
                            : "text-gray-400"
                        )}
                      >
                        {m}분
                      </button>
                    ))}
                  </div>

                  {/* 섭취량 */}
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                    {["1알", "2알", "3알", "4알", "1포", "2포", "1캡슐", "2캡슐"].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDosage(d)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm",
                          selectedDosage === d
                            ? "bg-white shadow font-medium text-gray-900"
                            : "text-gray-400"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={confirmTimeSelection}
                  className="w-full mt-4 py-2 bg-[#9F85E3] text-white rounded-lg text-sm font-medium"
                >
                  적용
                </button>
              </div>
            )}

            <button
              onClick={saveTimeSettings}
              disabled={editingTimes.length === 0}
              className={cn(
                "w-full py-4 rounded-xl font-semibold",
                editingTimes.length > 0
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 나가기 확인 Alert */}
      {showExitAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowExitAlert(false)}
          />
          <div className="relative bg-white rounded-2xl w-[300px] p-6 text-center animate-scale-up">
            <p className="text-gray-900 font-semibold mb-2">
              아직 영양제가 기록되지 않았어요!
            </p>
            <p className="text-gray-900 font-semibold mb-6">
              정말 나가시겠어요?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowExitAlert(false);
                  router.back();
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
              >
                네
              </button>
              <button
                onClick={() => setShowExitAlert(false)}
                className="flex-1 py-3 bg-[#9F85E3] text-white rounded-xl font-medium"
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 검색 버튼 Alert (편집 미완료) */}
      {showSearchAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSearchAlert(false)}
          />
          <div className="relative bg-white rounded-2xl w-[300px] p-6 text-center animate-scale-up">
            <p className="text-gray-900 font-semibold mb-2">
              아직 영양제 기록이 완료되지 않았어요!
            </p>
            <p className="text-gray-900 font-semibold mb-6">
              편집완료 후 영양제를 추가해주세요
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSearchAlert(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
              >
                네
              </button>
              <button
                onClick={() => setShowSearchAlert(false)}
                className="flex-1 py-3 bg-[#9F85E3] text-white rounded-xl font-medium"
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
