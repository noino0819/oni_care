import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">오늘의 리포트</h1>
          <p className="text-muted-foreground text-sm">2025년 11월 26일</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          U
        </div>
      </header>

      <Card className="bg-primary text-primary-foreground border-none">
        <CardHeader>
          <CardTitle className="text-lg">오늘의 섭취 칼로리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold">1,250</span>
            <span className="text-lg opacity-80 mb-1">/ 2,000 kcal</span>
          </div>
          <div className="mt-4 h-2 bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-[62%] rounded-full" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
            <span className="text-muted-foreground text-sm">탄수화물</span>
            <span className="text-xl font-bold">150g</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
            <span className="text-muted-foreground text-sm">단백질</span>
            <span className="text-xl font-bold">80g</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
            <span className="text-muted-foreground text-sm">지방</span>
            <span className="text-xl font-bold">45g</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
            <span className="text-muted-foreground text-sm">수분</span>
            <span className="text-xl font-bold">1.2L</span>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">식사 기록</h2>
          <Link href="/record">
            <Button size="sm" variant="ghost" className="text-primary">
              <Plus className="h-4 w-4 mr-1" />
              기록하기
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {["아침", "점심"].map((meal) => (
            <Card key={meal} className="overflow-hidden">
              <div className="flex">
                <div className="w-2 bg-primary" />
                <div className="p-4 flex-1 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{meal}</h3>
                    <p className="text-sm text-muted-foreground">현미밥, 닭가슴살 샐러드</p>
                  </div>
                  <span className="font-bold text-sm">450 kcal</span>
                </div>
              </div>
            </Card>
          ))}
          <Card className="overflow-hidden border-dashed">
             <div className="flex">
                <div className="w-2 bg-muted" />
                <div className="p-4 flex-1 flex justify-between items-center opacity-50">
                  <div>
                    <h3 className="font-medium">저녁</h3>
                    <p className="text-sm text-muted-foreground">아직 기록되지 않음</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
