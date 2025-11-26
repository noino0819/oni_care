import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface MealSectionProps {
  title: string;
  calories: number;
}

export function MealSection({ title, calories }: MealSectionProps) {
  return (
    <div className="px-6 py-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className="text-sm text-gray-500">{calories} kcal</span>
      </div>
      <Card className="rounded-2xl shadow-sm border-dashed border-2 border-gray-200 bg-gray-50/50">
        <CardContent className="p-4 flex items-center justify-center">
          <Button variant="ghost" className="text-gray-400 hover:text-primary hover:bg-transparent">
            <Plus className="h-6 w-6 mr-2" />
            식사 추가하기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
