"use client";

import { useState, useEffect } from "react";
import { PillIcon } from "@/components/icons";

const defaultQuotes = [
  { quote: "약과 음식은 그 뿌리가 같다", author: "동의보감" },
  { quote: "식치로서 섭양을 잘하면 복약할 필요가 없다", author: "의방유취" },
  {
    quote: "음식으로는 못 고치는 병은 의사도 못 고친다",
    author: "히포크라테스",
  },
  { quote: "음식과 약으로 병을 치료한다", author: "동의보감(식약료병)" },
  { quote: "음식이 으뜸이고 약이 다음이 된다", author: "식료찬요" },
  { quote: "You are what you eat", author: null },
  { quote: "잘 먹는 것은 결코 하찮은 기술이 아니다", author: null },
  { quote: "걷기는 사람에게 최고의 약이다", author: null },
  { quote: "당신의 음식이 당신의 약이 되게 하라", author: null },
  { quote: "음식에 대한 사랑보다 더 숨김없는 사랑은 없다", author: null },
  { quote: "자기가 먹는 음식이 자기의 운명을 좌우한다", author: null },
  { quote: "먹는 것은 필수지만 현명하게 먹는 것은 예술이다", author: null },
  {
    quote: "무엇을 먹는지 말하라. 그러면 당신이 어떤 사람인지 알 수 있다",
    author: null,
  },
  { quote: "우리가 먹는 것이 곧 우리 자신이 된다", author: null },
  {
    quote:
      "잘 먹는 기술은 결코 하찮은 기술이 아니며, 그로 인한 기쁨은 작은 기쁨이 아니다",
    author: null,
  },
  { quote: "좋은 음식은 좋은 생각을 낳는다", author: null },
  { quote: "건강한 몸에 건강한 정신이 깃든다", author: null },
  { quote: "식탁이 곧 약국이다", author: null },
  { quote: "천천히 먹는 것이 건강의 비결이다", author: null },
  { quote: "제철 음식이 보약이다", author: null },
];

interface FoodQuoteProps {
  quotes?: { quote: string; author: string | null }[];
  interval?: number; // ms
}

export function FoodQuote({
  quotes = defaultQuotes,
  interval = 10000,
}: FoodQuoteProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection("up");
      setIsAnimating(true);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % quotes.length);
        setIsAnimating(false);
      }, 500);
    }, interval);

    return () => clearInterval(timer);
  }, [quotes.length, interval]);

  const currentQuote = quotes[currentIndex];

  return (
    <div className="mx-4 py-3">
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-green-50 rounded-xl px-4 py-3 border border-purple-100/50 overflow-hidden">
        {/* 아이콘 */}
        <div className="flex-shrink-0">
          <PillIcon size={24} />
        </div>

        {/* 명언 텍스트 */}
        <div className="flex-1 min-w-0 overflow-hidden h-6 relative">
          <div
            className={`transition-all duration-500 ease-in-out ${
              isAnimating
                ? direction === "up"
                  ? "-translate-y-full opacity-0"
                  : "translate-y-full opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            <p className="text-sm text-gray-700 truncate">
              <span className="font-medium">
                &ldquo;{currentQuote.quote}&rdquo;
              </span>
              {currentQuote.author && (
                <span className="text-gray-500 ml-2">
                  - {currentQuote.author}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
