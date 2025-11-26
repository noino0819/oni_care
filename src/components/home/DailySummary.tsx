import { Card, CardContent } from "@/components/ui/Card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DailySummary() {
  return (
    <div className="px-6 py-4 space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-center space-x-4">
        <button className="text-gray-400">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <span className="text-sm font-medium text-primary block">오늘</span>
          <span className="text-lg font-bold">11월 26일 화요일</span>
        </div>
        <button className="text-gray-400">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calorie Circle */}
      <Card className="rounded-2xl shadow-sm border-none bg-white">
        <CardContent className="p-6 flex flex-col items-center justify-center relative">
           {/* Placeholder for Circular Progress - implementing with CSS for simplicity */}
           <div className="relative w-40 h-40 rounded-full border-[12px] border-emerald-100 flex items-center justify-center">
              <div className="absolute w-full h-full rounded-full border-[12px] border-primary border-t-transparent border-l-transparent -rotate-45"></div>
              <div className="text-center z-10">
                <p className="text-sm text-gray-500">오늘 섭취 칼로리</p>
                <p className="text-2xl font-bold text-primary">1,200</p>
                <p className="text-sm text-gray-400">/ 2,000 kcal</p>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Nutrients */}
      <div className="grid grid-cols-3 gap-4">
        {['탄수화물', '단백질', '지방'].map((nutrient, idx) => (
          <Card key={nutrient} className="rounded-2xl shadow-sm border-none bg-white">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <span className="text-sm font-medium text-gray-600">{nutrient}</span>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/2 rounded-full" />
              </div>
              <span className="text-xs text-gray-500">100 / 200g</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
