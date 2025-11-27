"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  MealRecordIcon,
  RecordIcon,
  SupplementIcon,
  MenuIcon,
  MealRecordMenuIcon,
  SupplementRecordIcon,
  NutritionDiagnosisIcon,
  AttendanceIcon,
  StepsMenuIcon,
  AIDoctorIcon,
  CloseIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

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

  const navItems = [
    { href: "/home", label: "홈", icon: HomeIcon },
    { href: "/meal-record", label: "식사기록", icon: MealRecordIcon },
    { href: "#record", label: "기록하기", icon: RecordIcon, isCenter: true },
    { href: "/supplement", label: "영양제", icon: SupplementIcon },
    { href: "/menu", label: "메뉴", icon: MenuIcon },
  ];

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
        <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-4">
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50">
        <div className="flex justify-around items-center h-16 relative">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;
            const isCenter = item.isCenter;

            if (isCenter) {
              return (
                <button
                  key={item.href}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="relative -mt-4"
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
                      isMenuOpen
                        ? "bg-[#9F85E3] rotate-45"
                        : "bg-gradient-to-br from-[#9F85E3] to-[#7CB342]"
                    )}
                  >
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium mt-1 block text-center",
                      isMenuOpen ? "text-[#9F85E3]" : "text-gray-400"
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full space-y-1"
              >
                <IconComponent
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isActive ? "text-[#9F85E3]" : "text-gray-400"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-[#9F85E3]" : "text-gray-400"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
