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

function NavMealRecordIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* 밥그릇 */}
      <ellipse
        cx="12"
        cy="16"
        rx="8"
        ry="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 16C4 16 4 12 12 12C20 12 20 16 20 16"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* 돋보기 */}
      <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M18.5 10.5L20 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavSupplementIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* 알약 1 */}
      <ellipse
        cx="8"
        cy="12"
        rx="4"
        ry="6"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M4 12H12" stroke="currentColor" strokeWidth="1.5" />
      {/* 알약 2 */}
      <ellipse
        cx="17"
        cy="14"
        rx="3"
        ry="4.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function NavMenuIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M4 6H20"
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
      <path
        d="M4 18H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RecordPencilIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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

  if (hiddenPaths.includes(pathname)) {
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
  const isMealActive = pathname === "/meal-record";
  const isSupplementActive = pathname === "/supplement";
  const isMenuActive = pathname === "/menu";

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
        <div className="fixed bottom-28 left-0 right-0 z-50 px-4 pb-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="grid grid-cols-3 gap-4">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
                  >
                    <IconComponent size={48} />
                    <span className="text-xs font-medium text-gray-700">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="mt-4 mx-auto flex items-center justify-center w-12 h-12 bg-[#9F85E3] rounded-full shadow-lg hover:bg-[#8B74D1] transition-colors"
            >
              <CloseIcon size={20} className="text-white" />
            </button>
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

          {/* 식사기록 */}
          <Link
            href="/meal-record"
            className="flex flex-col items-center justify-center flex-1 pt-2"
          >
            <NavMealRecordIcon
              className={cn(
                "w-6 h-6 transition-colors",
                isMealActive ? "text-[#9F85E3]" : "text-gray-400"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium mt-1 transition-colors",
                isMealActive ? "text-[#9F85E3]" : "text-gray-500"
              )}
            >
              식사기록
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
                  <RecordPencilIcon className="text-white w-6 h-6" />
                )}
              </div>
              <span className="text-[10px] font-medium mt-1 text-[#9F85E3]">
                기록하기
              </span>
            </button>
          </div>

          {/* 영양제 */}
          <Link
            href="/supplement"
            className="flex flex-col items-center justify-center flex-1 pt-2"
          >
            <NavSupplementIcon
              className={cn(
                "w-6 h-6 transition-colors",
                isSupplementActive ? "text-[#9F85E3]" : "text-gray-400"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium mt-1 transition-colors",
                isSupplementActive ? "text-[#9F85E3]" : "text-gray-500"
              )}
            >
              영양제
            </span>
          </Link>

          {/* 메뉴 */}
          <Link
            href="/menu"
            className="flex flex-col items-center justify-center flex-1 pt-2"
          >
            <NavMenuIcon
              className={cn(
                "w-6 h-6 transition-colors",
                isMenuActive ? "text-[#9F85E3]" : "text-gray-400"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium mt-1 transition-colors",
                isMenuActive ? "text-[#9F85E3]" : "text-gray-500"
              )}
            >
              메뉴
            </span>
          </Link>
        </div>

        {/* Safe area padding */}
        <div className="pb-safe" />
      </nav>
    </>
  );
}
