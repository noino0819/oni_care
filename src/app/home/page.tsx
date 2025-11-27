import { HomeHeader } from "@/components/home/HomeHeader";
import { DailySummary } from "@/components/home/DailySummary";
import { MealSection } from "@/components/home/MealSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <HomeHeader />
      
      <main className="space-y-2">
        <DailySummary />
        
        <div className="space-y-4 mt-6">
          <MealSection title="아침" calories={300} />
          <MealSection title="점심" calories={500} />
          <MealSection title="저녁" calories={400} />
          <MealSection title="간식" calories={0} />
        </div>
      </main>

      <Navigation />
    </div>
  );
}
