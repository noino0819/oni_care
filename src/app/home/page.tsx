"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/home/Header";
import { HealthGoalCard } from "@/components/home/HealthGoalCard";
import { NutritionGuide } from "@/components/home/NutritionGuide";
import { FoodQuote } from "@/components/home/FoodQuote";
import { TodayMeal } from "@/components/home/TodayMeal";
import { StepsAndChallenge } from "@/components/home/StepsAndChallenge";
import { ContentBanners } from "@/components/home/ContentBanners";
import { FloatingDoctorButton } from "@/components/home/FloatingDoctorButton";
import { BottomNavigation } from "@/components/home/BottomNavigation";
import { LoadingOverlay } from "@/components/ui/LoadingSpinner";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  NUTRIENT_NAME_MAP,
  GOAL_TYPE_MAP,
  DISEASE_MAP,
  DEFAULT_NUTRITION_TARGETS,
} from "@/lib/constants";
import { getNutrientIcon } from "@/components/icons";

interface HomeData {
  user: {
    name: string;
    email: string;
    points: number;
  };
  healthGoal: {
    goalType: string;
    diseases: string[];
    tags: string[];
    description: string;
  } | null;
  hasNutritionDiagnosis: boolean;
  nutritionDiagnosis: {
    diagnosisType: string;
    warningNutrients: string[];
    recommendations: string[];
  } | null;
  nutritionStatus: Array<{
    nutrientType: string;
    status: "adequate" | "excessive" | "deficient";
    currentValue: number;
    recommendedMin: number;
    recommendedMax: number;
    score: number;
  }>;
  quotes: Array<{
    quote: string;
    author: string | null;
  }>;
  todayMeal: {
    totalCalories: number;
    totalCarbs: number;
    totalProtein: number;
    totalFat: number;
  };
  steps: {
    currentSteps: number;
    goalSteps: number;
  };
  challenge: {
    id: string;
    title: string;
    currentProgress: number;
    targetCount: number;
    isCompleted: boolean;
  } | null;
}

export default function HomePage() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const response = await fetch("/api/home");

        if (!response.ok) {
          if (response.status === 401) {
            // 로그인 페이지로 리다이렉트
            window.location.href = "/";
            return;
          }
          throw new Error("데이터를 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setHomeData(data);
      } catch (err) {
        console.error("Home data fetch error:", err);
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchHomeData();
  }, []);

  // 로딩 상태
  if (isLoading) {
    return <LoadingOverlay message="데이터를 불러오는 중..." />;
  }

  // 에러 상태 (데이터가 없어도 기본값으로 표시)
  if (error && !homeData) {
    return (
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    );
  }

  // 데이터 가공
  const userData = homeData || {
    user: { name: "사용자", email: "", points: 0 },
    healthGoal: null,
    hasNutritionDiagnosis: false,
    nutritionDiagnosis: null,
    nutritionStatus: [],
    quotes: [],
    todayMeal: {
      totalCalories: 0,
      totalCarbs: 0,
      totalProtein: 0,
      totalFat: 0,
    },
    steps: { currentSteps: 0, goalSteps: 10000 },
    challenge: null,
  };

  // 건강 목표 설명 생성
  const goalDescription = userData.healthGoal
    ? `${GOAL_TYPE_MAP[userData.healthGoal.goalType] || "건강관리"} / ${
        userData.healthGoal.tags.length > 0
          ? userData.healthGoal.tags.join(", ") + " 위주로 관리해요"
          : "건강한 생활을 위해 관리해요"
      }`
    : "체중관리 필요형 / 혈당관리, 근력운동 위주로 관리해요";

  // 태그 생성
  const tags = userData.healthGoal?.tags?.length
    ? userData.healthGoal.tags
    : userData.healthGoal?.diseases?.map((d) => DISEASE_MAP[d] || d) || [
        "건강관리",
      ];

  // 질병 조건 확인
  const condition = userData.healthGoal?.diseases?.[0]
    ? DISEASE_MAP[userData.healthGoal.diseases[0]] ||
      userData.healthGoal.diseases[0]
    : userData.nutritionDiagnosis?.diagnosisType || "고중성지방혈증";

  // 영양소 상태를 NutritionGuide 형식으로 변환
  const nutrients = userData.nutritionStatus
    .map((n) => {
      const icon = getNutrientIcon(n.nutrientType);
      if (!icon) return null;
      return {
        id: n.nutrientType,
        name: n.nutrientType,
        nameKo: NUTRIENT_NAME_MAP[n.nutrientType] || n.nutrientType,
        status: n.status,
        icon,
      };
    })
    .filter((n): n is NonNullable<typeof n> => n !== null);

  // 챌린지 진행률 계산
  const challengeProgress = userData.challenge
    ? Math.round(
        (userData.challenge.currentProgress / userData.challenge.targetCount) *
          100
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 섹션 1: 헤더 */}
      <Header points={userData.user.points} userName={userData.user.name} />

      <main className="space-y-5 pt-2">
        {/* 섹션 2: 건강목표 카드 */}
        <HealthGoalCard
          userName={userData.user.name}
          goalDescription={goalDescription}
          tags={tags}
          hasNutritionDiagnosis={userData.hasNutritionDiagnosis}
        />

        {/* 섹션 2-1: 종합 가이드 (영양 진단 있을 경우) */}
        {userData.hasNutritionDiagnosis && (
          <NutritionGuide
            userName={userData.user.name}
            condition={condition}
            nutrients={nutrients.length > 0 ? nutrients : undefined}
          />
        )}

        {/* 섹션 3: 식품 관련 명언 */}
        <FoodQuote
          quotes={userData.quotes.length > 0 ? userData.quotes : undefined}
        />

        {/* 섹션 4: 오늘의 식사 */}
        <TodayMeal
          currentCalories={userData.todayMeal.totalCalories}
          targetCalories={DEFAULT_NUTRITION_TARGETS.calories}
          nutrients={[
            {
              name: "탄수화물",
              current: userData.todayMeal.totalCarbs,
              target: DEFAULT_NUTRITION_TARGETS.carbs,
              color: "#FFC107",
            },
            {
              name: "단백질",
              current: userData.todayMeal.totalProtein,
              target: DEFAULT_NUTRITION_TARGETS.protein,
              color: "#9F85E3",
            },
            {
              name: "지방",
              current: userData.todayMeal.totalFat,
              target: DEFAULT_NUTRITION_TARGETS.fat,
              color: "#FF9800",
            },
          ]}
        />

        {/* 섹션 5: 걸음수 + 챌린지 */}
        <StepsAndChallenge
          currentSteps={userData.steps.currentSteps}
          targetSteps={userData.steps.goalSteps}
          challengeTitle={userData.challenge?.title || "매일 한잔 물마시기"}
          challengeProgress={challengeProgress}
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

      {/* 하단 네비게이션 */}
      <BottomNavigation />
    </div>
  );
}
