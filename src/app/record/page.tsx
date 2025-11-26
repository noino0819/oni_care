import Link from "next/link";
import { ChevronLeft, Search, Camera, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Navigation } from "@/components/ui/Navigation";

export default function RecordPage() {
  const recentFoods = [
    { id: 1, name: "계란", calories: 80, unit: "1개" },
    { id: 2, name: "바나나", calories: 100, unit: "1개" },
    { id: 3, name: "닭가슴살 샐러드", calories: 350, unit: "1인분" },
    { id: 4, name: "아메리카노", calories: 10, unit: "1잔" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-white sticky top-0 z-10">
        <Link href="/home">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold">식사 기록</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      <div className="flex-1 px-6 space-y-6 pt-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="어떤 음식을 드셨나요?" 
            className="pl-10 h-12 rounded-xl bg-gray-50 border-none"
          />
        </div>

        {/* Photo Logging Button */}
        <Button 
          variant="outline" 
          className="w-full h-32 flex flex-col items-center justify-center space-y-3 rounded-2xl border-dashed border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50"
        >
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          <span className="font-medium text-primary">사진으로 간편하게 기록하기</span>
        </Button>

        {/* Recent Records */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">최근 기록</h2>
          <div className="space-y-3">
            {recentFoods.map((food) => (
              <Card key={food.id} className="rounded-xl shadow-sm border-none bg-white">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{food.name}</p>
                    <p className="text-sm text-gray-500">{food.calories} kcal / {food.unit}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full">
                    <Plus className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
}
