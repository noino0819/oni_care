import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    const selectedDate = dateParam ? new Date(dateParam) : new Date();
    const dateStr = selectedDate.toISOString().split("T")[0];

    // 사용자 정보 조회
    const { data: userData } = await supabase
      .from("users")
      .select("name, diseases, interests, is_fs_member, height, weight")
      .eq("id", user.id)
      .single();

    // 포인트 조회
    const { data: pointsData } = await supabase
      .from("user_points")
      .select("total_points")
      .eq("user_id", user.id)
      .single();

    // 영양 진단 결과 조회 (최신)
    const { data: diagnosisData } = await supabase
      .from("nutrition_diagnosis")
      .select("*")
      .eq("user_id", user.id)
      .order("diagnosis_date", { ascending: false })
      .limit(1)
      .single();

    // 해당 날짜의 식사 기록 조회
    const { data: mealsData } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .eq("meal_date", dateStr);

    // 해당 날짜의 끼니 상태 조회
    const { data: mealStatusData } = await supabase
      .from("meal_status")
      .select("*")
      .eq("user_id", user.id)
      .eq("meal_date", dateStr);

    // 해당 날짜의 영양 로그 조회
    const { data: nutritionLog } = await supabase
      .from("nutrition_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", dateStr)
      .single();

    // 해당 날짜의 영양소 상태 조회
    const { data: nutritionStatus } = await supabase
      .from("nutrition_status")
      .select("*")
      .eq("user_id", user.id)
      .eq("status_date", dateStr);

    // 걸음수 조회 (소모 칼로리 계산용)
    const { data: stepData } = await supabase
      .from("step_records")
      .select("step_count")
      .eq("user_id", user.id)
      .eq("record_date", dateStr)
      .single();

    // 끼니별 칼로리 계산
    const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;
    const meals = mealTypes.map((type) => {
      const mealRecords = mealsData?.filter((m) => m.meal_type === type) || [];
      const statusRecord = mealStatusData?.find((s) => s.meal_type === type);
      const totalCalories = mealRecords.reduce((sum, m) => sum + (m.calories || 0), 0);

      // 권장 칼로리 계산 (기획서 기준)
      const recommendedCalories = diagnosisData?.recommended_calories || 2100;
      const snackCalories = getSnackCalories(recommendedCalories);
      const remainingCalories = recommendedCalories - snackCalories;

      let targetCalories: number;
      if (type === "snack") {
        targetCalories = snackCalories;
      } else {
        // 3끼 기준 2:3:3 비율
        const ratios: Record<string, number> = {
          breakfast: 2 / 8,
          lunch: 3 / 8,
          dinner: 3 / 8,
        };
        targetCalories = Math.round(remainingCalories * ratios[type]);
      }

      let status: "not_recorded" | "recorded" | "skipped" = "not_recorded";
      if (statusRecord?.status === "skipped") {
        status = "skipped";
      } else if (mealRecords.length > 0) {
        status = "recorded";
      }

      return {
        type,
        status,
        calories: totalCalories,
        targetCalories,
      };
    });

    // 소모 칼로리 계산 (기획서 공식)
    const height = userData?.height || 165;
    const weight = userData?.weight || 60;
    const steps = stepData?.step_count || 0;
    const burnedCalories = Math.round(3.5 * 3.4 * weight * 5 / 1000 * (steps * height * 0.41 / 5333));

    // 권장 영양소 기준 (기본값)
    const NUTRIENT_STANDARDS: Record<string, { min: number; max: number; unit: string }> = {
      carbs: { min: 200, max: 300, unit: "g" },
      protein: { min: 50, max: 80, unit: "g" },
      fat: { min: 40, max: 70, unit: "g" },
      fiber: { min: 20, max: 30, unit: "g" },
      sodium: { min: 1500, max: 2300, unit: "mg" },
      sugar: { min: 25, max: 50, unit: "g" },
      saturatedFat: { min: 15, max: 22, unit: "g" },
      cholesterol: { min: 200, max: 300, unit: "mg" },
    };

    // 영양소 상태 매핑
    const nutrients = nutritionStatus?.map((n) => {
      const standard = NUTRIENT_STANDARDS[n.nutrient_type] || { min: 0, max: 100, unit: "g" };
      const needsAttention = diagnosisData?.warning_nutrients?.includes(n.nutrient_type) || false;

      return {
        name: n.nutrient_type,
        nameKo: getNutrientNameKo(n.nutrient_type),
        status: n.status,
        value: n.current_value || 0,
        min: standard.min,
        max: standard.max,
        unit: standard.unit,
        needsAttention,
      };
    }) || getDefaultNutrients(nutritionLog);

    return NextResponse.json({
      user: {
        name: userData?.name || "사용자",
        points: pointsData?.total_points || 0,
        diseases: userData?.diseases || [],
        isFsMember: userData?.is_fs_member || false,
      },
      eatScore: diagnosisData?.eat_score || null,
      hasNutritionDiagnosis: !!diagnosisData,
      warningNutrients: diagnosisData?.warning_nutrients || [],
      diagnosisType: diagnosisData?.diagnosis_type || null,
      meals,
      dailyCalories: {
        consumed: nutritionLog?.total_calories || 0,
        target: diagnosisData?.recommended_calories || 2100,
        burned: burnedCalories,
      },
      nutrients,
    });
  } catch (error) {
    console.error("Nutrition data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition data" },
      { status: 500 }
    );
  }
}

// 간식 열량 기준 (기획서)
function getSnackCalories(dailyCalories: number): number {
  if (dailyCalories >= 2500) return 325;
  if (dailyCalories >= 2400) return 275;
  if (dailyCalories >= 1800) return 225;
  return 175;
}

// 영양소 한글명
function getNutrientNameKo(nutrientType: string): string {
  const map: Record<string, string> = {
    carbs: "탄수화물",
    protein: "단백질",
    fat: "지방",
    fiber: "식이섬유",
    sodium: "나트륨",
    sugar: "당류",
    saturatedFat: "포화지방",
    cholesterol: "콜레스테롤",
  };
  return map[nutrientType] || nutrientType;
}

// 기본 영양소 데이터 생성
function getDefaultNutrients(nutritionLog: {
  total_carbs?: number;
  total_protein?: number;
  total_fat?: number;
  total_fiber?: number;
  total_sodium?: number;
  total_sugar?: number;
  total_saturated_fat?: number;
  total_cholesterol?: number;
} | null) {
  const NUTRIENT_STANDARDS: Record<string, { min: number; max: number; unit: string }> = {
    carbs: { min: 200, max: 300, unit: "g" },
    protein: { min: 50, max: 80, unit: "g" },
    fat: { min: 40, max: 70, unit: "g" },
    fiber: { min: 20, max: 30, unit: "g" },
    sodium: { min: 1500, max: 2300, unit: "mg" },
    sugar: { min: 25, max: 50, unit: "g" },
    saturatedFat: { min: 15, max: 22, unit: "g" },
    cholesterol: { min: 200, max: 300, unit: "mg" },
  };

  const nutrients = [
    { name: "carbs", value: nutritionLog?.total_carbs || 0 },
    { name: "protein", value: nutritionLog?.total_protein || 0 },
    { name: "fat", value: nutritionLog?.total_fat || 0 },
    { name: "fiber", value: nutritionLog?.total_fiber || 0 },
    { name: "sodium", value: nutritionLog?.total_sodium || 0 },
    { name: "sugar", value: nutritionLog?.total_sugar || 0 },
    { name: "saturatedFat", value: nutritionLog?.total_saturated_fat || 0 },
    { name: "cholesterol", value: nutritionLog?.total_cholesterol || 0 },
  ];

  return nutrients.map((n) => {
    const standard = NUTRIENT_STANDARDS[n.name];
    let status: "adequate" | "excessive" | "deficient" = "adequate";
    if (n.value < standard.min) status = "deficient";
    if (n.value > standard.max) status = "excessive";

    return {
      name: n.name,
      nameKo: getNutrientNameKo(n.name),
      status,
      value: n.value,
      min: standard.min,
      max: standard.max,
      unit: standard.unit,
      needsAttention: false,
    };
  });
}
