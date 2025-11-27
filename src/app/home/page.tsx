"use client";

import { Header } from "@/components/home/Header";
import { HealthGoalCard } from "@/components/home/HealthGoalCard";
import { NutritionGuide } from "@/components/home/NutritionGuide";
import { FoodQuote } from "@/components/home/FoodQuote";
import { TodayMeal } from "@/components/home/TodayMeal";
import { StepsAndChallenge } from "@/components/home/StepsAndChallenge";
import { ContentBanners } from "@/components/home/ContentBanners";
import { BottomNavigation } from "@/components/home/BottomNavigation";
import { FloatingDoctorButton } from "@/components/home/FloatingDoctorButton";

export default function HomePage() {
  // TODO: Supabase에서 사용자 데이터 가져오기
  const userData = {
    name: "김건강",
    points: 50,
    hasNutritionDiagnosis: true,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 섹션 1: 헤더 */}
      <Header points={userData.points} userName={userData.name} />

      <main className="space-y-5 pt-2">
        {/* 섹션 2: 건강목표 카드 */}
        <HealthGoalCard
          userName={userData.name}
          goalDescription="체중관리 필요형 / 혈당관리, 근력운동 위주로 관리해요"
          tags={["비만", "당뇨병", "근력운동"]}
          hasNutritionDiagnosis={userData.hasNutritionDiagnosis}
        />

        {/* 섹션 2-1: 종합 가이드 (영양 진단 있을 경우) */}
        {userData.hasNutritionDiagnosis && (
          <NutritionGuide userName={userData.name} condition="고중성지방혈증" />
        )}

        {/* 섹션 3: 식품 관련 명언 */}
        <FoodQuote />

        {/* 섹션 4: 오늘의 식사 */}
        <TodayMeal
          currentCalories={1528}
          targetCalories={2100}
          nutrients={[
            { name: "탄수화물", current: 180, target: 300, color: "#FFC107" },
            { name: "단백질", current: 65, target: 100, color: "#9F85E3" },
            { name: "지방", current: 45, target: 70, color: "#FF9800" },
          ]}
        />

        {/* 섹션 5: 걸음수 + 챌린지 */}
        <StepsAndChallenge
          currentSteps={3560}
          targetSteps={10000}
          challengeTitle="매일 한잔 물마시기"
          challengeProgress={50}
          onVerify={() => {
            // TODO: 챌린지 인증 로직
            console.log("챌린지 인증");
          }}
        />

        {/* 섹션 6: 맞춤 컨텐츠 배너 */}
        <ContentBanners />
      </main>

      {/* 영양박사 플로팅 버튼 */}
      <FloatingDoctorButton />

      {/* 섹션 7: 하단 네비게이션 */}
      <BottomNavigation />
    </div>
  );
}
