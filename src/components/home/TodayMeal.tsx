"use client";

interface NutrientBar {
  name: string;
  current: number;
  target: number;
  color: string;
}

interface TodayMealProps {
  currentCalories?: number;
  targetCalories?: number;
  nutrients?: NutrientBar[];
}

const defaultNutrients: NutrientBar[] = [
  { name: "탄수화물", current: 180, target: 300, color: "#FFC107" },
  { name: "단백질", current: 65, target: 100, color: "#9F85E3" },
  { name: "지방", current: 45, target: 70, color: "#FF9800" },
];

export function TodayMeal({
  currentCalories = 1528,
  targetCalories = 2100,
  nutrients = defaultNutrients,
}: TodayMealProps) {
  const caloriePercentage = Math.min(
    (currentCalories / targetCalories) * 100,
    100
  );
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset =
    circumference - (caloriePercentage / 100) * circumference;

  return (
    <div className="mx-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* 헤더 */}
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-1.5 h-5 bg-[#7CB342] rounded-full" />
        오늘의 식사
      </h3>

      <div className="flex items-center gap-6">
        {/* 칼로리 원형 차트 */}
        <div className="relative flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* 배경 원 */}
            <circle
              cx="60"
              cy="60"
              r="45"
              stroke="#E5E7EB"
              strokeWidth="10"
              fill="none"
            />
            {/* 프로그레스 원 */}
            <circle
              cx="60"
              cy="60"
              r="45"
              stroke="url(#calorieGradient)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 60 60)"
              className="transition-all duration-500"
            />
            {/* 그라데이션 정의 */}
            <defs>
              <linearGradient
                id="calorieGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#9F85E3" />
                <stop offset="100%" stopColor="#7CB342" />
              </linearGradient>
            </defs>
          </svg>

          {/* 중앙 텍스트 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">
              {currentCalories.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">
              /{targetCalories.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-500 mt-0.5">kcal</span>
          </div>
        </div>

        {/* 영양소 바 차트 */}
        <div className="flex-1 space-y-3">
          {nutrients.map((nutrient) => {
            const percentage = Math.min(
              (nutrient.current / nutrient.target) * 100,
              100
            );
            return (
              <div key={nutrient.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    {nutrient.name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {nutrient.current}g / {nutrient.target}g
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: nutrient.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

