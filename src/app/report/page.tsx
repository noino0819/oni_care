import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function ReportPage() {
  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">주간 리포트</h1>
        <p className="text-muted-foreground text-sm">지난 7일간의 기록입니다</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>칼로리 섭취 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-between gap-2">
            {[65, 80, 45, 90, 75, 60, 85].map((height, i) => (
              <div key={i} className="w-full bg-primary/20 rounded-t-sm relative group">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm transition-all group-hover:bg-primary/80"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span>토</span>
            <span>일</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
         <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">평균 섭취</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">1,850</div>
            <p className="text-xs text-muted-foreground">kcal / 일</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">목표 달성</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-primary">85%</div>
            <p className="text-xs text-muted-foreground">지난주 대비 +5%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
