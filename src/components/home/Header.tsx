"use client";

import Link from "next/link";
import { PointIcon, ProfileIcon } from "@/components/icons";

interface HeaderProps {
  points?: number;
  userName?: string;
}

export function Header({ points = 50 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-5 py-3">
        {/* 로고 */}
        <Link href="/home" className="flex items-center">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-[#7CB342]">GREATING</span>
            <span className="text-[#9F85E3] italic">Care</span>
          </span>
        </Link>

        {/* 우측 영역: 포인트 + 프로필 */}
        <div className="flex items-center gap-3">
          {/* 포인트 표시 */}
          <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full">
            <PointIcon size={16} />
            <span className="text-sm font-semibold text-amber-700">
              P {points.toLocaleString()}Point
            </span>
          </div>

          {/* 프로필 아이콘 */}
          <Link
            href="/profile"
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ProfileIcon size={20} className="text-gray-500" />
          </Link>
        </div>
      </div>
    </header>
  );
}
