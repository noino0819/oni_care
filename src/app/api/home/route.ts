import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // 병렬로 모든 데이터 가져오기
    const [
      userDataResult,
      userPointsResult,
      healthGoalResult,
      nutritionStatusResult,
      nutritionDiagnosisResult,
      quotesResult,
      nutritionLogResult,
      stepRecordResult,
      challengeResult,
      userChallengeResult,
    ] = await Promise.all([
      // 1. 사용자 정보
      supabase
        .from("users")
        .select("name, email")
        .eq("id", user.id)
        .single(),
      
      // 2. 포인트
      supabase
        .from("user_points")
        .select("total_points")
        .eq("user_id", user.id)
        .single(),
      
      // 3. 건강 목표
      supabase
        .from("user_health_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      
      // 4. 영양소 상태 (오늘 날짜)
      supabase
        .from("nutrition_status")
        .select("*")
        .eq("user_id", user.id)
        .eq("status_date", today),
      
      // 5. 영양 진단 여부
      supabase
        .from("nutrition_diagnosis")
        .select("*")
        .eq("user_id", user.id)
        .order("diagnosis_date", { ascending: false })
        .limit(1)
        .single(),
      
      // 6. 명언 (활성화된 것만)
      supabase
        .from("food_quotes")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
      
      // 7. 오늘의 영양 기록
      supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .single(),
      
      // 8. 오늘의 걸음수
      supabase
        .from("step_records")
        .select("*")
        .eq("user_id", user.id)
        .eq("record_date", today)
        .single(),
      
      // 9. 활성화된 챌린지 목록
      supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .single(),
      
      // 10. 사용자 챌린지 진행 상태 (오늘)
      supabase
        .from("user_challenges")
        .select("*, challenges(*)")
        .eq("user_id", user.id)
        .eq("challenge_date", today)
        .limit(1)
        .single(),
    ]);

    // 응답 데이터 구성
    const responseData = {
      // 사용자 정보
      user: {
        name: userDataResult.data?.name || user.email?.split("@")[0] || "사용자",
        email: userDataResult.data?.email || user.email,
        points: userPointsResult.data?.total_points || 0,
      },
      
      // 건강 목표
      healthGoal: healthGoalResult.data ? {
        goalType: healthGoalResult.data.goal_type,
        diseases: healthGoalResult.data.diseases || [],
        tags: healthGoalResult.data.tags || [],
        description: healthGoalResult.data.description,
      } : null,
      
      // 영양 진단 여부
      hasNutritionDiagnosis: !!nutritionDiagnosisResult.data,
      nutritionDiagnosis: nutritionDiagnosisResult.data ? {
        diagnosisType: nutritionDiagnosisResult.data.diagnosis_type,
        warningNutrients: nutritionDiagnosisResult.data.warning_nutrients || [],
        recommendations: nutritionDiagnosisResult.data.recommendations || [],
      } : null,
      
      // 영양소 상태
      nutritionStatus: (nutritionStatusResult.data || []).map((n: {
        nutrient_type: string;
        status: string;
        current_value: number;
        recommended_min: number;
        recommended_max: number;
        score: number;
      }) => ({
        nutrientType: n.nutrient_type,
        status: n.status,
        currentValue: n.current_value,
        recommendedMin: n.recommended_min,
        recommendedMax: n.recommended_max,
        score: n.score,
      })),
      
      // 명언
      quotes: (quotesResult.data || []).map((q: {
        quote: string;
        author: string | null;
      }) => ({
        quote: q.quote,
        author: q.author,
      })),
      
      // 오늘의 식사
      todayMeal: nutritionLogResult.data ? {
        totalCalories: nutritionLogResult.data.total_calories || 0,
        totalCarbs: nutritionLogResult.data.total_carbs || 0,
        totalProtein: nutritionLogResult.data.total_protein || 0,
        totalFat: nutritionLogResult.data.total_fat || 0,
      } : {
        totalCalories: 0,
        totalCarbs: 0,
        totalProtein: 0,
        totalFat: 0,
      },
      
      // 걸음수
      steps: {
        currentSteps: stepRecordResult.data?.step_count || 0,
        goalSteps: stepRecordResult.data?.goal_steps || 10000,
      },
      
      // 챌린지
      challenge: userChallengeResult.data ? {
        id: userChallengeResult.data.challenge_id,
        title: (userChallengeResult.data.challenges as { title: string })?.title || "챌린지",
        currentProgress: userChallengeResult.data.current_progress || 0,
        targetCount: (userChallengeResult.data.challenges as { target_count: number })?.target_count || 1,
        isCompleted: userChallengeResult.data.is_completed,
      } : challengeResult.data ? {
        id: challengeResult.data.id,
        title: challengeResult.data.title,
        currentProgress: 0,
        targetCount: challengeResult.data.target_count || 1,
        isCompleted: false,
      } : null,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Home API Error:", error);
    return NextResponse.json(
      { error: "데이터를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


