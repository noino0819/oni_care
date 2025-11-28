"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Check, Edit2 } from "lucide-react";
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
  scheduledTimes: ScheduledTime[];
  isTaken: boolean;
  takenAt?: string;
}

interface GroupedSupplement {
  time: string;
  period: "AM" | "PM";
  displayTime: string;
  supplements: (SupplementRoutine & { currentDosage: string })[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 시간을 24시간 형식의 숫자로 변환
const timeToMinutes = (time: string, period: "AM" | "PM"): number => {
  const [hours, minutes] = time.split(":").map(Number);
  let h = hours;
  if (period === "PM" && hours !== 12) h += 12;
  if (period === "AM" && hours === 12) h = 0;
  return h * 60 + minutes;
};

// 시간 포맷팅 (오전/오후 형식)
const formatTime = (time: string, period: "AM" | "PM"): string => {
  return `${period === "AM" ? "오전" : "오후"} ${time}`;
};

export default function SupplementLogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (dateParam) {
      return new Date(dateParam);
    }
    return new Date();
  });
  
  const [localSupplements, setLocalSupplements] = useState<SupplementRoutine[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showCompleteAlert, setShowCompleteAlert] = useState(false);
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const dateString = selectedDate.toISOString().split("T")[0];
  
  const { data, error, isLoading } = useSWR(
    `/api/nutrition/supplements?date=${dateString}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  // 데이터 로드 시 로컬 상태 업데이트
  useEffect(() => {
    if (data?.supplements) {
      setLocalSupplements(data.supplements);
      setHasChanges(false);
    }
  }, [data]);

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // 시간대별로 그룹화
  const groupedSupplements: GroupedSupplement[] = (() => {
    const groups: { [key: string]: GroupedSupplement } = {};
    
    localSupplements.forEach((supplement) => {
      const scheduledTimes = supplement.scheduledTimes || [];
      
      scheduledTimes.forEach((st) => {
        const key = `${st.period}-${st.time}`;
        if (!groups[key]) {
          groups[key] = {
            time: st.time,
            period: st.period,
            displayTime: formatTime(st.time, st.period),
            supplements: [],
          };
        }
        groups[key].supplements.push({
          ...supplement,
          currentDosage: st.dosage,
        });
      });
    });

    // 시간순 정렬
    return Object.values(groups).sort(
      (a, b) => timeToMinutes(a.time, a.period) - timeToMinutes(b.time, b.period)
    );
  })();

  const totalCount = localSupplements.length;
  const takenCount = localSupplements.filter((s) => s.isTaken).length;

  // 복용 토글
  const toggleTaken = useCallback((supplementId: string) => {
    setLocalSupplements((prev) =>
      prev.map((s) =>
        s.id === supplementId
          ? {
              ...s,
              isTaken: !s.isTaken,
              takenAt: !s.isTaken ? new Date().toISOString() : undefined,
            }
          : s
      )
    );
    setHasChanges(true);
  }, []);

  // 기록 완료
  const handleComplete = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      // 변경된 항목들 서버에 저장
      const promises = localSupplements.map((supplement) => {
        const original = data?.supplements?.find((s: SupplementRoutine) => s.id === supplement.id);
        if (original && original.isTaken !== supplement.isTaken) {
          return fetch("/api/nutrition/supplements", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              routineId: supplement.id,
              action: "toggleTaken",
              date: dateString,
            }),
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);

      // 포인트 지급 (첫 기록 완료 시)
      const allTaken = localSupplements.every((s) => s.isTaken);
      if (allTaken && isToday) {
        const pointsResponse = await fetch("/api/nutrition/supplements", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "completeDaily",
            date: dateString,
          }),
        });
        const pointsData = await pointsResponse.json();
        
        if (pointsData.pointsEarned) {
          setEarnedPoints(pointsData.pointsEarned);
          setShowPointsModal(true);
        } else {
          setShowCompleteAlert(true);
          setTimeout(() => setShowCompleteAlert(false), 2000);
        }
      } else {
        setShowCompleteAlert(true);
        setTimeout(() => setShowCompleteAlert(false), 2000);
      }

      setHasChanges(false);
      mutate(`/api/nutrition/supplements?date=${dateString}`);
    } catch (error) {
      console.error("Error saving:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 뒤로가기 처리
  const handleBack = () => {
    if (hasChanges) {
      setShowExitAlert(true);
    } else {
      router.back();
    }
  };

  // 날짜 포맷팅
  const formatDateDisplay = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return `${month}월 ${day}일 ${isToday ? "(오늘)" : ""}`;
  };

  // 스켈레톤 UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center justify-center px-4 py-3 relative">
            <div className="absolute left-4">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">영양제 섭취 기록</h1>
          </div>
        </header>
        
        <div className="px-4 py-4 space-y-4">
          {/* 날짜 및 편집 스켈레톤 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* 시간대별 영양제 스켈레톤 */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="divide-y divide-gray-100">
                {[1, 2].map((j) => (
                  <div key={j} className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                ))}
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
            onClick={() => mutate(`/api/nutrition/supplements?date=${dateString}`)}
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
        <div className="flex items-center justify-center px-4 py-3 relative">
          <button 
            onClick={handleBack} 
            className="absolute left-4 p-1"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">영양제 섭취 기록</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* 날짜 및 편집하기 버튼 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">
              {formatDateDisplay(selectedDate)}
            </span>
          </div>
          <button
            onClick={() => router.push("/nutrition/supplement/routine")}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#9F85E3]"
          >
            <Edit2 className="w-4 h-4" />
            <span>편집하기</span>
          </button>
        </div>

        {/* 영양제 목록 */}
        {groupedSupplements.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">💊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              등록된 루틴이 없습니다
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              루틴을 등록하고 영양제 섭취를 관리해보세요!
            </p>
            <button
              onClick={() => router.push("/nutrition/supplement/routine")}
              className="bg-[#9F85E3] text-white px-6 py-3 rounded-xl font-medium"
            >
              루틴 등록하기
            </button>
          </div>
        ) : (
          <>
            {/* 시간대별 영양제 카드 */}
            {groupedSupplements.map((group) => (
              <div
                key={`${group.period}-${group.time}`}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* 시간 헤더 */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">
                    {group.displayTime}
                  </span>
                </div>

                {/* 영양제 리스트 */}
                <div className="divide-y divide-gray-100">
                  {group.supplements.map((supplement) => (
                    <button
                      key={`${supplement.id}-${group.time}`}
                      onClick={() => toggleTaken(supplement.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          {supplement.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {supplement.currentDosage}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                          supplement.isTaken
                            ? "bg-[#9F85E3] border-[#9F85E3]"
                            : "border-gray-300"
                        )}
                      >
                        {supplement.isTaken && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 하단 기록완료 버튼 */}
      {groupedSupplements.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <button
            onClick={handleComplete}
            disabled={!hasChanges || isSaving}
            className={cn(
              "w-full py-4 rounded-xl font-semibold text-lg transition-colors",
              hasChanges
                ? "bg-[#9F85E3] text-white"
                : "bg-gray-200 text-gray-400"
            )}
          >
            {isSaving ? "저장 중..." : "기록완료"}
          </button>
        </div>
      )}

      {/* 기록 완료 토스트 */}
      {showCompleteAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in">
          영양제 기록이 완료되었습니다 🎉
        </div>
      )}

      {/* 포인트 획득 모달 */}
      {showPointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowPointsModal(false)} 
          />
          <div className="relative bg-white rounded-3xl w-[300px] p-6 text-center animate-scale-up">
            {/* 캐릭터 이미지 */}
            <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-[#9F85E3]/20 to-[#9F85E3]/5 rounded-full flex items-center justify-center">
              <span className="text-6xl">🎉</span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              오늘의 영양제 기록완료!
            </h3>
            <p className="text-[#9F85E3] font-bold text-lg mb-6">
              {earnedPoints}포인트를 받았어요
            </p>
            
            <button
              onClick={() => {
                setShowPointsModal(false);
                router.push("/nutrition");
              }}
              className="w-full py-3 bg-[#9F85E3] text-white rounded-xl font-semibold"
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
    </div>
  );
}
