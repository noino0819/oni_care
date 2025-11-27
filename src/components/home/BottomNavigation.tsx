"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MealRecordMenuIcon,
  SupplementRecordIcon,
  NutritionDiagnosisIcon,
  AttendanceIcon,
  StepsMenuIcon,
  AIDoctorIcon,
  CloseIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

// 하단 네비게이션용 아이콘들
function NavHomeIcon({
  className,
  isActive,
}: {
  className?: string;
  isActive?: boolean;
}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {isActive ? (
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z"
          fill="#9F85E3"
        />
      ) : (
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function NavNutritionIcon({
  className,
  isActive,
}: {
  className?: string;
  isActive?: boolean;
}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* 잎사귀 형태의 영양 아이콘 */}
      <path
        d="M12 2C6.5 2 2 6.5 2 12C2 14.5 3 16.8 4.6 18.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 2C12 2 16 6 16 12C16 18 12 22 12 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill={isActive ? "#9F85E3" : "none"}
      />
      <path
        d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 12H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavChallengeIcon({
  className,
  isActive,
}: {
  className?: string;
  isActive?: boolean;
}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isActive ? "#9F85E3" : "none"}
      />
      <line
        x1="4"
        y1="22"
        x2="4"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavContentIcon({
  className,
  isActive,
}: {
  className?: string;
  isActive?: boolean;
}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isActive ? "#9F85E3" : "none"}
      />
      <path
        d="M14 2V8H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 13H8"
        stroke={isActive ? "white" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17H8"
        stroke={isActive ? "white" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RecordPlusIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12 5V19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BottomNavigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 하단 메뉴를 숨길 경로 목록
  const hiddenPaths = [
    "/",
    "/signup",
    "/signup/terms",
    "/signup/verify",
    "/onboarding",
    "/find-account",
  ];

  // 컨텐츠 상세 페이지에서도 네비게이션 숨김
  if (hiddenPaths.includes(pathname) || pathname.startsWith("/content/")) {
    return null;
  }

  const menuItems = [
    { href: "/meal-record", label: "식사 기록", icon: MealRecordMenuIcon },
    {
      href: "/supplement-record",
      label: "영양제 기록",
      icon: SupplementRecordIcon,
    },
    { href: "/diagnosis", label: "영양진단", icon: NutritionDiagnosisIcon },
    { href: "/attendance", label: "출석체크", icon: AttendanceIcon },
    { href: "/steps", label: "걸음수", icon: StepsMenuIcon },
    { href: "/ai-doctor", label: "AI 영양박사", icon: AIDoctorIcon },
  ];

  const isHomeActive = pathname === "/home";
  const isNutritionActive =
    pathname === "/nutrition" || pathname === "/meal-record";
  const isChallengeActive = pathname === "/challenge";
  const isContentActive = pathname === "/content";

  return (
    <>
      {/* 메뉴 팝업 오버레이 */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* 메뉴 팝업 */}
      {isMenuOpen && (
        <div className="fixed bottom-24 left-0 right-0 z-[55] px-4">
          <div className="bg-white rounded-3xl p-6 pt-8 pb-8 shadow-2xl mx-auto max-w-md">
            <div className="grid grid-cols-3 gap-x-4 gap-y-6">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-16 h-16 flex items-center justify-center">
                      <IconComponent size={56} />
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] z-50">
        <div className="flex justify-around items-end h-[72px] pb-2 relative">
          {/* 홈 */}
          <Link
            href="/home"
            className="flex flex-col items-center justify-center flex-1 pt-2"
          >
            <NavHomeIcon
              className={cn(
                "w-6 h-6 transition-colors",
                isHomeActive ? "text-[#9F85E3]" : "text-gray-400"
              )}
              isActive={isHomeActive}
            />
            <span
              className={cn(
                "text-[10px] font-medium mt-1 transition-colors",
                isHomeActive ? "text-[#9F85E3]" : "text-gray-500"
              )}
            >
              홈
            </span>
          </Link>

          {/* 영양 */}
          <Link
            href="/nutrition"
            className="flex flex-col items-center justify-center flex-1 pt-2"
          >
            <NavNutritionIcon
              className={cn(
                "w-6 h-6 transition-colors",
                isNutritionActive ? "text-[#9F85E3]" : "text-gray-400"
              )}
              isActive={isNutritionActive}
            />
            <span
              className={cn(
                "text-[10px] font-medium mt-1 transition-colors",
                isNutritionActive ? "text-[#9F85E3]" : "text-gray-500"
              )}
            >
              영양
            </span>
          </Link>

          {/* 기록하기 (중앙 버튼) */}
          <div className="flex flex-col items-center flex-1">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col items-center -mt-7"
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
                  isMenuOpen ? "bg-[#8B74D1]" : "bg-[#9F85E3]"
                )}
              >
                {isMenuOpen ? (
                  <CloseIcon size={24} className="text-white" />
                ) : (
                  <RecordPlusIcon className="text-white w-6 h-6" />
                )}
              </div>
            </button>
          </div>

          {/* 챌린지 */}
          <Link
            href="/challenge"
            className="flex flex-col items-center justify-center flex-1 pt-2"
          >
            <NavChallengeIcon
              className={cn(
                "w-6 h-6 transition-colors",
                isChallengeActive ? "text-[#9F85E3]" : "text-gray-400"
              )}
              isActive={isChallengeActive}
            />
            <span
              className={cn(
                "text-[10px] font-medium mt-1 transition-colors",
                isChallengeActive ? "text-[#9F85E3]" : "text-gray-500"
              )}
            >
              챌린지
            </span>
          </Link>

          {/* 컨텐츠 */}
          <Link
            href="/content"
            className="flex flex-col items-center justify-center flex-1 pt-2"
          >
            <NavContentIcon
              className={cn(
                "w-6 h-6 transition-colors",
                isContentActive ? "text-[#9F85E3]" : "text-gray-400"
              )}
              isActive={isContentActive}
            />
            <span
              className={cn(
                "text-[10px] font-medium mt-1 transition-colors",
                isContentActive ? "text-[#9F85E3]" : "text-gray-500"
              )}
            >
              컨텐츠
            </span>
          </Link>
        </div>

        {/* Safe area padding */}
        <div className="pb-safe" />
      </nav>
    </>
  );
}
