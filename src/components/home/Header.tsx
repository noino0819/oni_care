"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  points?: number;
  userName?: string;
}

export function Header({ points: propPoints }: HeaderProps) {
  const [userPoints, setUserPoints] = useState<number | null>(
    propPoints ?? null
  );
  const [isScrolled, setIsScrolled] = useState(false);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      // 50px 이상 스크롤하면 배경 불투명하게
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // props로 포인트가 전달되지 않으면 API에서 가져오기
  useEffect(() => {
    if (propPoints !== undefined) {
      setUserPoints(propPoints);
      return;
    }

    async function fetchUserPoints() {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setUserPoints(data.user?.points ?? 0);
        }
      } catch (error) {
        console.error("Failed to fetch user points:", error);
        setUserPoints(0);
      }
    }

    fetchUserPoints();
  }, [propPoints]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-5 py-3">
        {/* 로고 이미지 */}
        <Link href="/home" className="flex items-center">
          <Image
            src="/big_logo.png"
            alt="GREATING Care"
            width={130}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* 우측 영역: 포인트 + 프로필 */}
        <div className="flex items-center gap-2">
          {/* 포인트 표시 */}
          <div className="flex items-center gap-1">
            {/* P 아이콘 */}
            <div className="w-5 h-5 rounded-full bg-[#9585BA] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">P</span>
            </div>
            <span className="text-sm font-semibold text-[#9585BA]">
              {userPoints !== null ? userPoints.toLocaleString() : "..."}Point
            </span>
          </div>

          {/* 프로필 아이콘 */}
          <Link
            href="/menu"
            className="w-8 h-8 rounded-full bg-[#9585BA] flex items-center justify-center hover:bg-[#8575AA] transition-colors overflow-hidden"
          >
            {/* 사람 실루엣 아이콘 */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-[18px] h-[18px] text-white/90"
            >
              <circle cx="12" cy="8" r="4" fill="currentColor" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="currentColor" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
