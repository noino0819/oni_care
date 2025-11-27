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
import { HIDDEN_NAV_PATHS, HIDDEN_NAV_PREFIXES } from "@/lib/constants";

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

// 식사 아이콘 (숟가락 + 포크)
function NavMealIcon({
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
        <>
          {/* 포크 */}
          <path
            d="M6 3V11C6 12.1046 6.89543 13 8 13V21"
            stroke="#9F85E3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 3V8"
            stroke="#9F85E3"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M8 3V8"
            stroke="#9F85E3"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10 3V8"
            stroke="#9F85E3"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* 나이프 */}
          <path
            d="M18 3C18 3 20 5 20 8C20 11 18 13 18 13V21"
            stroke="#9F85E3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#9F85E3"
            fillOpacity="0.3"
          />
        </>
      ) : (
        <>
          {/* 포크 */}
          <path
            d="M6 3V11C6 12.1046 6.89543 13 8 13V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 3V8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M8 3V8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10 3V8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* 나이프 */}
          <path
            d="M18 3C18 3 20 5 20 8C20 11 18 13 18 13V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

// 영양제 아이콘 (알약)
function NavSupplementIcon({
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
        <>
          <rect
            x="7"
            y="2"
            width="10"
            height="20"
            rx="5"
            fill="#9F85E3"
            stroke="#9F85E3"
            strokeWidth="2"
          />
          <line x1="7" y1="12" x2="17" y2="12" stroke="white" strokeWidth="2" />
        </>
      ) : (
        <>
          <rect
            x="7"
            y="2"
            width="10"
            height="20"
            rx="5"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="7"
            y1="12"
            x2="17"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
          />
        </>
      )}
    </svg>
  );
}

// 메뉴 아이콘 (햄버거 메뉴)
function NavMenuIcon({
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
        d="M4 6H20"
        stroke={isActive ? "#9F85E3" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 12H20"
        stroke={isActive ? "#9F85E3" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 18H20"
        stroke={isActive ? "#9F85E3" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
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

  // 네비게이션을 숨겨야 하는지 확인
  const shouldHideNav =
    HIDDEN_NAV_PATHS.includes(pathname as (typeof HIDDEN_NAV_PATHS)[number]) ||
    HIDDEN_NAV_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (shouldHideNav) {
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
  const isMealActive = pathname === "/record" || pathname === "/meal-record";
  const isSupplementActive =
    pathname === "/supplement" || pathname === "/supplement-record";
  const isMenuPageActive =
    pathname === "/menu" || pathname.startsWith("/menu/");

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

          {/* 식사 */}
          <Link
            href="/record"
            className="flex flex-col items-center justify-center flex-1 pt-2"
          >
            <NavMealIcon
              className={cn(
                "w-6 h-6 transition-colors",
                isMealActive ? "text-[#9F85E3]" : "text-gray-400"
              )}
              isActive={isMealActive}
            />
            <span
              className={cn(
                "text-[10px] font-medium mt-1 transition-colors",
                isMealActive ? "text-[#9F85E3]" : "text-gray-500"
              )}
            >
              식사
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
              isActive={isSupplementActive}
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
                isMenuPageActive ? "text-[#9F85E3]" : "text-gray-400"
              )}
              isActive={isMenuPageActive}
            />
            <span
              className={cn(
                "text-[10px] font-medium mt-1 transition-colors",
                isMenuPageActive ? "text-[#9F85E3]" : "text-gray-500"
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
