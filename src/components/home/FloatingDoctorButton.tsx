"use client";

import Link from "next/link";
import { DoctorCharacter } from "@/components/icons";

export function FloatingDoctorButton() {
  return (
    <Link
      href="/ai-doctor"
      className="fixed bottom-24 right-4 z-40 group"
      aria-label="AI 영양박사"
    >
      <div className="relative">
        {/* 그림자/글로우 효과 */}
        <div className="absolute inset-0 bg-[#9F85E3] rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />

        {/* 버튼 본체 */}
        <div className="relative w-14 h-14 bg-gradient-to-br from-[#B39DDB] to-[#9F85E3] rounded-full shadow-lg flex items-center justify-center overflow-hidden border-2 border-white group-hover:scale-110 transition-transform">
          <DoctorCharacter size={50} className="-mt-1" />
        </div>

        {/* 툴팁 */}
        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap">
            AI 영양박사
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-800" />
          </div>
        </div>

        {/* 알림 뱃지 (선택적) */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-[8px] text-white font-bold">!</span>
        </div>
      </div>
    </Link>
  );
}
