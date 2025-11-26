import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Camera, Search } from "lucide-react";

export default function RecordPage() {
  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">식사 기록</h1>
        <p className="text-muted-foreground text-sm">오늘 무엇을 드셨나요?</p>
      </header>

      <Card className="bg-muted/50 border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center shadow-sm">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-medium">사진으로 기록하기</h3>
            <p className="text-sm text-muted-foreground">음식 사진을 찍으면 AI가 분석해드려요</p>
          </div>
          <Button>카메라 열기</Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">직접 검색</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="음식 이름 검색 (예: 닭가슴살)" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">최근 기록</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["현미밥", "닭가슴살", "아메리카노", "사과"].map((item) => (
            <Button key={item} variant="outline" size="sm" className="rounded-full whitespace-nowrap">
              {item}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
