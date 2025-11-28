"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Home, ChevronRight } from "lucide-react";
import {
  ConfirmModal,
  BottomSheet,
  WheelPickerModal,
  MultiSelectBottomSheet,
  SingleSelectBottomSheet,
} from "@/components/ui/Modal";
import {
  ACTIVITY_LEVELS,
  DISEASE_OPTIONS,
  INTEREST_OPTIONS,
} from "@/types/point-coupon";
import useSWR from "swr";

interface UserProfile {
  id: string;
  name?: string;
  birth_date?: string;
  gender?: string;
  phone?: string;
  masked_phone?: string;
  business_code?: string;
  height?: number;
  weight?: number;
  activity_level?: string;
  diseases?: string[];
  interests?: string[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 스켈레톤 컴포넌트
function ProfileSkeleton() {
  return (
    <div className="px-4 py-4 animate-pulse">
      {/* 기본정보 스켈레톤 */}
      <div className="mb-6">
        <div className="h-5 w-16 bg-gray-200 rounded mb-3" />
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between px-4 py-4">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 사업장코드 스켈레톤 */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 py-4 bg-white rounded-xl border border-gray-200">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      </div>

      {/* 건강정보 스켈레톤 */}
      <div className="mb-6">
        <div className="h-5 w-16 bg-gray-200 rounded mb-3" />
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between px-4 py-4">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfileEditPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // SWR로 프로필 데이터 가져오기
  const { data: profile, isLoading, mutate } = useSWR<UserProfile>(
    "/api/profile",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  // 모달 상태
  const [showNameModal, setShowNameModal] = useState(false);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showHeightPicker, setShowHeightPicker] = useState(false);
  const [showWeightPicker, setShowWeightPicker] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [showDiseasePicker, setShowDiseasePicker] = useState(false);
  const [showInterestPicker, setShowInterestPicker] = useState(false);
  const [showBusinessCodeModal, setShowBusinessCodeModal] = useState(false);
  const [showInvalidCodeAlert, setShowInvalidCodeAlert] = useState(false);
  const [invalidCodeMessage, setInvalidCodeMessage] = useState("");

  // 임시 값
  const [tempName, setTempName] = useState("");
  const [tempBusinessCode, setTempBusinessCode] = useState("");
  const [tempBirthYear, setTempBirthYear] = useState(1990);
  const [tempBirthMonth, setTempBirthMonth] = useState(1);
  const [tempBirthDay, setTempBirthDay] = useState(1);

  // 프로필 데이터 변경 시 임시 값 업데이트
  useEffect(() => {
    if (profile) {
      setTempName(profile.name || "");
      setTempBusinessCode(profile.business_code || "");
      
      if (profile.birth_date) {
        const date = new Date(profile.birth_date);
        setTempBirthYear(date.getFullYear());
        setTempBirthMonth(date.getMonth() + 1);
        setTempBirthDay(date.getDate());
      }
    }
  }, [profile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        mutate();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  }, [mutate]);

  const handleNameSubmit = useCallback(() => {
    if (tempName.trim()) {
      updateProfile({ name: tempName.trim() });
      setShowNameModal(false);
    }
  }, [tempName, updateProfile]);

  const handleBusinessCodeSubmit = useCallback(async () => {
    if (tempBusinessCode.length !== 6) {
      setInvalidCodeMessage("유효하지 않은 사업장코드입니다.");
      setShowInvalidCodeAlert(true);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_code: tempBusinessCode }),
      });

      if (!res.ok) {
        const data = await res.json();
        setInvalidCodeMessage(data.error || "유효하지 않은 사업장코드입니다.");
        setShowInvalidCodeAlert(true);
        return;
      }

      mutate();
      setShowBusinessCodeModal(false);
    } catch {
      setInvalidCodeMessage("유효하지 않은 사업장코드입니다.");
      setShowInvalidCodeAlert(true);
    }
  }, [tempBusinessCode, mutate]);

  const formatBirthDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${String(date.getFullYear()).slice(2)}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  };

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case "male":
        return "남";
      case "female":
        return "여";
      default:
        return "";
    }
  };

  const getActivityLabel = (level?: string) => {
    const found = ACTIVITY_LEVELS.find((a) => a.value === level);
    return found?.label || "";
  };

  const getDiseaseLabels = (diseases?: string[]) => {
    if (!diseases || diseases.length === 0) return "해당없음";
    if (diseases.includes("none")) return "해당없음";
    return diseases
      .map((d) => DISEASE_OPTIONS.find((opt) => opt.value === d)?.label)
      .filter(Boolean)
      .join(", ");
  };

  const getInterestLabels = (interests?: string[]) => {
    if (!interests || interests.length === 0) return "-";
    const labels = interests
      .map((i) => INTEREST_OPTIONS.find((opt) => opt.value === i)?.label)
      .filter(Boolean);
    if (labels.length > 2) {
      return `${labels.slice(0, 2).join(", ")} 외 ${labels.length - 2}개`;
    }
    return labels.join(", ");
  };

  // 높이 옵션 생성 (140~200cm)
  const heightOptions = Array.from({ length: 61 }, (_, i) => ({
    value: 140 + i,
    label: `${140 + i}`,
  }));

  // 몸무게 옵션 생성 (30~150kg)
  const weightOptions = Array.from({ length: 121 }, (_, i) => ({
    value: 30 + i,
    label: `${30 + i}`,
  }));

  // 연도 옵션 생성
  const yearOptions = Array.from({ length: 100 }, (_, i) => ({
    value: 2025 - i,
    label: `${2025 - i}`,
  }));

  // 월 옵션 생성
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${String(i + 1).padStart(2, "0")}`,
  }));

  // 일 옵션 생성
  const dayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: `${String(i + 1).padStart(2, "0")}`,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        {/* 헤더 */}
        <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => router.back()} className="p-1">
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">회원정보 수정</h1>
            <button onClick={() => router.push("/home")} className="p-1">
              <Home className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </header>
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">회원정보 수정</h1>
          <button onClick={() => router.push("/home")} className="p-1">
            <Home className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        {/* 기본정보 */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">기본정보</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {/* 이름 */}
            <button
              onClick={() => setShowNameModal(true)}
              className="w-full flex items-center justify-between px-4 py-4"
            >
              <span className="text-gray-600">이름</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-900">{profile?.name || "-"}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* 생년월일 */}
            <button
              onClick={() => setShowBirthDatePicker(true)}
              className="w-full flex items-center justify-between px-4 py-4"
            >
              <span className="text-gray-600">생년월일</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-900">
                  {formatBirthDate(profile?.birth_date) || "-"}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* 성별 */}
            <button
              onClick={() => setShowGenderPicker(true)}
              className="w-full flex items-center justify-between px-4 py-4"
            >
              <span className="text-gray-600">성별</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-900">
                  {getGenderLabel(profile?.gender) || "-"}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* 연락처 */}
            <button
              onClick={() => router.push("/menu/profile-edit/phone")}
              className="w-full flex items-center justify-between px-4 py-4"
            >
              <span className="text-gray-600">연락처</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-900">
                  {profile?.masked_phone || "-"}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* 비밀번호 */}
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-gray-600">비밀번호</span>
              <button
                onClick={() => router.push("/menu/profile-edit/password")}
                className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                변경하기
              </button>
            </div>
          </div>
        </div>

        {/* 사업장코드 */}
        <div className="mb-6">
          <button
            onClick={() => setShowBusinessCodeModal(true)}
            className="w-full flex items-center justify-between px-4 py-4 bg-white rounded-xl border border-gray-200"
          >
            <span className="text-gray-600">사업장코드</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-900">
                {profile?.business_code || "미등록"}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        </div>

        {/* 건강정보 */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">건강정보</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {/* 키 */}
            <button
              onClick={() => setShowHeightPicker(true)}
              className="w-full flex items-center justify-between px-4 py-4"
            >
              <span className="text-gray-600">키</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-900">
                  {profile?.height ? `${profile.height}cm` : "-"}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* 몸무게 */}
            <button
              onClick={() => setShowWeightPicker(true)}
              className="w-full flex items-center justify-between px-4 py-4"
            >
              <span className="text-gray-600">몸무게</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-900">
                  {profile?.weight ? `${profile.weight}kg` : "-"}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* 활동량 */}
            <button
              onClick={() => setShowActivityPicker(true)}
              className="w-full flex items-center justify-between px-4 py-4"
            >
              <span className="text-gray-600">활동량</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-900">
                  {getActivityLabel(profile?.activity_level) || "-"}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* 질병 */}
            <button
              onClick={() => setShowDiseasePicker(true)}
              className="w-full flex items-center justify-between px-4 py-4"
            >
              <span className="text-gray-600">질병</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-900 text-right max-w-[180px] truncate">
                  {getDiseaseLabels(profile?.diseases)}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </button>

            {/* 관심사 */}
            <button
              onClick={() => setShowInterestPicker(true)}
              className="w-full flex items-center justify-between px-4 py-4"
            >
              <span className="text-gray-600">관심사</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-900 text-right max-w-[180px] truncate">
                  {getInterestLabels(profile?.interests)}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </button>
          </div>
        </div>

        {/* 회원 탈퇴 */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => router.push("/menu/profile-edit/withdraw")}
            className="w-full text-center py-3 text-gray-400 hover:text-gray-600"
          >
            회원 탈퇴 &gt;
          </button>
        </div>
      </div>

      {/* 이름 입력 모달 */}
      <BottomSheet
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        title="이름을 입력해 주세요."
      >
        <div className="mb-6">
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="이름"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9F85E3] text-center text-lg"
            maxLength={20}
          />
        </div>
        <button
          onClick={handleNameSubmit}
          disabled={!tempName.trim()}
          className={`w-full py-4 rounded-xl font-semibold ${
            tempName.trim()
              ? "bg-[#FFD54F] text-gray-900"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          완 료
        </button>
      </BottomSheet>

      {/* 생년월일 피커 */}
      <BottomSheet
        isOpen={showBirthDatePicker}
        onClose={() => setShowBirthDatePicker(false)}
        title="생년월일을 입력해 주세요."
      >
        <div className="flex gap-2 mb-6 relative">
          {/* 선택 영역 표시 */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-10 bg-gray-100 rounded-lg pointer-events-none" />

          {/* 연도 */}
          <div className="flex-1 relative">
            <div
              className="h-[200px] overflow-y-auto scrollbar-hide py-[80px]"
              style={{ scrollSnapType: "y mandatory" }}
            >
              {yearOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTempBirthYear(opt.value)}
                  className={`w-full h-10 flex items-center justify-center text-base ${
                    tempBirthYear === opt.value
                      ? "text-gray-900 font-semibold"
                      : "text-gray-400"
                  }`}
                  style={{ scrollSnapAlign: "center" }}
                >
                  {opt.label} 년
                </button>
              ))}
            </div>
          </div>
          {/* 월 */}
          <div className="flex-1 relative">
            <div
              className="h-[200px] overflow-y-auto scrollbar-hide py-[80px]"
              style={{ scrollSnapType: "y mandatory" }}
            >
              {monthOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTempBirthMonth(opt.value)}
                  className={`w-full h-10 flex items-center justify-center text-base ${
                    tempBirthMonth === opt.value
                      ? "text-gray-900 font-semibold"
                      : "text-gray-400"
                  }`}
                  style={{ scrollSnapAlign: "center" }}
                >
                  {opt.label} 월
                </button>
              ))}
            </div>
          </div>
          {/* 일 */}
          <div className="flex-1 relative">
            <div
              className="h-[200px] overflow-y-auto scrollbar-hide py-[80px]"
              style={{ scrollSnapType: "y mandatory" }}
            >
              {dayOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTempBirthDay(opt.value)}
                  className={`w-full h-10 flex items-center justify-center text-base ${
                    tempBirthDay === opt.value
                      ? "text-gray-900 font-semibold"
                      : "text-gray-400"
                  }`}
                  style={{ scrollSnapAlign: "center" }}
                >
                  {opt.label} 일
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            const birthDate = `${tempBirthYear}-${String(
              tempBirthMonth
            ).padStart(2, "0")}-${String(tempBirthDay).padStart(2, "0")}`;
            updateProfile({ birth_date: birthDate });
            setShowBirthDatePicker(false);
          }}
          className="w-full py-4 bg-[#FFD54F] text-gray-900 font-semibold rounded-xl"
        >
          완 료
        </button>
      </BottomSheet>

      {/* 성별 피커 */}
      <SingleSelectBottomSheet
        isOpen={showGenderPicker}
        onClose={() => setShowGenderPicker(false)}
        title="성별을 입력해 주세요."
        options={[
          { value: "female", label: "여성" },
          { value: "male", label: "남성" },
        ]}
        selectedValue={profile?.gender || ""}
        onSelect={(value) => {
          updateProfile({ gender: value });
          setShowGenderPicker(false);
        }}
      />

      {/* 키 피커 */}
      <WheelPickerModal
        isOpen={showHeightPicker}
        onClose={() => setShowHeightPicker(false)}
        title="키를 수정해주세요"
        options={heightOptions}
        selectedValue={profile?.height || 170}
        onSelect={(value) => updateProfile({ height: Number(value) })}
        unit="cm"
      />

      {/* 몸무게 피커 */}
      <WheelPickerModal
        isOpen={showWeightPicker}
        onClose={() => setShowWeightPicker(false)}
        title="몸무게를 수정해주세요"
        options={weightOptions}
        selectedValue={profile?.weight || 60}
        onSelect={(value) => updateProfile({ weight: Number(value) })}
        unit="kg"
      />

      {/* 활동량 피커 */}
      <SingleSelectBottomSheet
        isOpen={showActivityPicker}
        onClose={() => setShowActivityPicker(false)}
        title="활동량을 수정해주세요"
        options={ACTIVITY_LEVELS.map((a) => ({
          value: a.value,
          label: a.label,
        }))}
        selectedValue={profile?.activity_level || ""}
        onSelect={(value) => {
          updateProfile({ activity_level: value });
          setShowActivityPicker(false);
        }}
      />

      {/* 질병 선택 피커 */}
      <MultiSelectBottomSheet
        isOpen={showDiseasePicker}
        onClose={() => setShowDiseasePicker(false)}
        title="질병을 수정해주세요"
        options={DISEASE_OPTIONS.map((d) => ({
          value: d.value,
          label: d.label,
        }))}
        selectedValues={profile?.diseases || []}
        onSelect={(values) => updateProfile({ diseases: values })}
      />

      {/* 관심사 선택 피커 */}
      <MultiSelectBottomSheet
        isOpen={showInterestPicker}
        onClose={() => setShowInterestPicker(false)}
        title="관심사를 수정해주세요"
        options={INTEREST_OPTIONS.map((i) => ({
          value: i.value,
          label: i.label,
        }))}
        selectedValues={profile?.interests || []}
        onSelect={(values) => updateProfile({ interests: values })}
      />

      {/* 사업장코드 입력 모달 */}
      <BottomSheet
        isOpen={showBusinessCodeModal}
        onClose={() => setShowBusinessCodeModal(false)}
        title="사업장코드를 입력해 주세요."
      >
        <div className="mb-6">
          <input
            type="text"
            value={tempBusinessCode}
            onChange={(e) =>
              setTempBusinessCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="199868"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9F85E3] text-center text-lg"
            maxLength={6}
          />
          {tempBusinessCode.length > 0 && tempBusinessCode.length !== 6 && (
            <p className="text-sm text-red-500 mt-2 text-center">
              유효하지 않은 사업장코드입니다.
            </p>
          )}
        </div>
        <button
          onClick={handleBusinessCodeSubmit}
          disabled={tempBusinessCode.length !== 6}
          className={`w-full py-4 rounded-xl font-semibold ${
            tempBusinessCode.length === 6
              ? "bg-[#FFD54F] text-gray-900"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          완 료
        </button>
      </BottomSheet>

      {/* 유효하지 않은 코드 알림 */}
      <ConfirmModal
        isOpen={showInvalidCodeAlert}
        onClose={() => setShowInvalidCodeAlert(false)}
        onConfirm={() => setShowInvalidCodeAlert(false)}
        message={invalidCodeMessage}
        showCancel={false}
      />

      {/* 로딩 오버레이 */}
      {saving && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F85E3]" />
          </div>
        </div>
      )}
    </div>
  );
}
