"use client";

import Link from "next/link";
import { DoctorCharacter } from "@/components/icons";

export function ContentBanners() {
  return (
    <div className="mx-4 space-y-3">
      {/* 배너 1: 맞춤 컨텐츠 */}
      <Link href="/contents" className="block">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-4">
          {/* 배경 장식 */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-100/50 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-orange-100/50 rounded-full" />

          <div className="relative flex items-center gap-4">
            {/* 텍스트 영역 */}
            <div className="flex-1">
              <p className="text-xs text-amber-600 font-medium mb-1">
                어떻게 관리해야 할까?
              </p>
              <h4 className="text-base font-bold text-gray-800 leading-snug">
                맞춤 컨텐츠로
                <br />
                알아보기!
              </h4>
            </div>

            {/* 캐릭터 */}
            <div className="flex-shrink-0">
              <BannerCharacter1 />
            </div>

            {/* 화살표 */}
            <div className="flex-shrink-0 text-amber-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* 배너 2: 그리팅 케어 활용 가이드 */}
      <Link href="/guide" className="block">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 p-4">
          {/* 배경 장식 */}
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-100/50 rounded-full" />

          <div className="relative flex items-center gap-4">
            {/* 텍스트 영역 */}
            <div className="flex-1">
              <p className="text-xs text-green-600 font-medium mb-1">
                식사는 하셨나요? 건강은 한 끼에서 시작해요!
              </p>
              <h4 className="text-base font-bold text-gray-800 leading-snug">
                그리팅 케어, 슬기롭게
                <br />
                활용하기
              </h4>
            </div>

            {/* 캐릭터 */}
            <div className="flex-shrink-0">
              <BannerCharacter2 />
            </div>

            {/* 화살표 */}
            <div className="flex-shrink-0 text-green-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// 배너 1용 캐릭터
function BannerCharacter1() {
  return (
    <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
      {/* 몸체 */}
      <ellipse cx="35" cy="45" rx="18" ry="16" fill="#FFB74D" />
      <ellipse cx="35" cy="47" rx="16" ry="13" fill="#FFCC80" />

      {/* 얼굴 */}
      <ellipse cx="35" cy="30" rx="15" ry="16" fill="#FFB74D" />

      {/* 눈 */}
      <ellipse cx="30" cy="28" rx="3" ry="4" fill="#FFFFFF" />
      <ellipse cx="40" cy="28" rx="3" ry="4" fill="#FFFFFF" />
      <circle cx="31" cy="29" r="1.5" fill="#333333" />
      <circle cx="41" cy="29" r="1.5" fill="#333333" />

      {/* 볼 */}
      <ellipse cx="25" cy="33" rx="3" ry="2" fill="#FFAB91" opacity="0.6" />
      <ellipse cx="45" cy="33" rx="3" ry="2" fill="#FFAB91" opacity="0.6" />

      {/* 입 */}
      <path
        d="M32 36 Q35 39 38 36"
        stroke="#333333"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 책 */}
      <rect x="45" y="40" width="15" height="12" rx="1" fill="#4CAF50" />
      <rect x="46" y="42" width="13" height="1" fill="#FFFFFF" />
      <rect x="46" y="45" width="10" height="1" fill="#FFFFFF" />
      <rect x="46" y="48" width="8" height="1" fill="#FFFFFF" />
    </svg>
  );
}

// 배너 2용 캐릭터
function BannerCharacter2() {
  return (
    <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
      {/* 요리사 모자 */}
      <ellipse
        cx="35"
        cy="12"
        rx="16"
        ry="8"
        fill="#FFFFFF"
        stroke="#E0E0E0"
        strokeWidth="1"
      />
      <rect x="22" y="10" width="26" height="8" fill="#FFFFFF" />

      {/* 몸체 */}
      <ellipse cx="35" cy="48" rx="16" ry="14" fill="#81C784" />
      <ellipse cx="35" cy="50" rx="14" ry="11" fill="#A5D6A7" />

      {/* 얼굴 */}
      <ellipse cx="35" cy="32" rx="14" ry="15" fill="#81C784" />

      {/* 눈 */}
      <ellipse cx="30" cy="30" rx="3" ry="4" fill="#FFFFFF" />
      <ellipse cx="40" cy="30" rx="3" ry="4" fill="#FFFFFF" />
      <circle cx="31" cy="31" r="1.5" fill="#333333" />
      <circle cx="41" cy="31" r="1.5" fill="#333333" />

      {/* 볼 */}
      <ellipse cx="25" cy="35" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="45" cy="35" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />

      {/* 입 */}
      <path
        d="M32 38 Q35 41 38 38"
        stroke="#333333"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 숟가락 */}
      <rect x="50" y="35" width="3" height="20" rx="1" fill="#9E9E9E" />
      <ellipse cx="51.5" cy="32" rx="5" ry="6" fill="#9E9E9E" />
    </svg>
  );
}

