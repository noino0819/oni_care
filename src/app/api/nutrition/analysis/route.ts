import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 영양소 기준값
const NUTRIENT_STANDARDS: Record<
  string,
  { min: number; max: number; unit: string }
> = {
  carbs: { min: 200, max: 300, unit: "g" },
  protein: { min: 50, max: 80, unit: "g" },
  fat: { min: 40, max: 70, unit: "g" },
  fiber: { min: 20, max: 30, unit: "g" },
  sodium: { min: 1500, max: 2300, unit: "mg" },
  sugar: { min: 25, max: 50, unit: "g" },
  saturatedFat: { min: 15, max: 22, unit: "g" },
  cholesterol: { min: 200, max: 300, unit: "mg" },
};

const NUTRIENT_NAME_KO: Record<string, string> = {
  carbs: "탄수화물",
  protein: "단백질",
  fat: "지방",
  fiber: "식이섬유",
  sodium: "나트륨",
  sugar: "당류",
  saturatedFat: "포화지방",
  cholesterol: "콜레스테롤",
};

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
    const period = searchParams.get("period") || "daily";

    const selectedDate = dateParam ? new Date(dateParam) : new Date();
    const dateStr = selectedDate.toISOString().split("T")[0];

    // 기간에 따른 날짜 범위 계산
    let startDate: string;
    let endDate: string = dateStr;

    if (period === "weekly") {
      const start = new Date(selectedDate);
      start.setDate(start.getDate() - 6);
      startDate = start.toISOString().split("T")[0];
    } else if (period === "monthly") {
      const start = new Date(selectedDate);
      start.setDate(start.getDate() - 29);
      startDate = start.toISOString().split("T")[0];
    } else {
      startDate = dateStr;
    }

    // 영양 진단 데이터에서 권장 칼로리 가져오기
    const { data: diagnosisData } = await supabase
      .from("nutrition_diagnosis")
      .select("recommended_calories")
      .eq("user_id", user.id)
      .order("diagnosis_date", { ascending: false })
      .limit(1)
      .single();

    const targetCalories = diagnosisData?.recommended_calories || 2100;

    // 기간별 영양 로그 조회
    const { data: nutritionLogs } = await supabase
      .from("nutrition_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", startDate)
      .lte("log_date", endDate);

    // 데이터가 없는 경우 빈 응답
    if (!nutritionLogs || nutritionLogs.length === 0) {
      return NextResponse.json({
        dailyCalories: {
          consumed: 0,
          target: targetCalories,
          burned: 0,
        },
        nutrients: Object.keys(NUTRIENT_STANDARDS).map((key) => ({
          name: key,
          nameKo: NUTRIENT_NAME_KO[key],
          status: "deficient" as const,
          value: 0,
          min: NUTRIENT_STANDARDS[key].min,
          max: NUTRIENT_STANDARDS[key].max,
          unit: NUTRIENT_STANDARDS[key].unit,
        })),
      });
    }

    // 기간별 평균 계산
    const recordCount = nutritionLogs.length;

    // 주간/월간 분석의 최소 기록 일수 체크
    if (period === "weekly" && recordCount < 3) {
      return NextResponse.json({
        dailyCalories: {
          consumed: 0,
          target: targetCalories,
          burned: 0,
        },
        nutrients: [],
        message: "일주일 분석은 3일 이상 기록이 필요합니다.",
      });
    }

    if (period === "monthly" && recordCount < 15) {
      return NextResponse.json({
        dailyCalories: {
          consumed: 0,
          target: targetCalories,
          burned: 0,
        },
        nutrients: [],
        message: "한달 분석은 15일 이상 기록이 필요합니다.",
      });
    }

    // 평균 계산
    const totalCalories =
      nutritionLogs.reduce((sum, log) => sum + (log.total_calories || 0), 0) /
      recordCount;
    const totalBurned =
      nutritionLogs.reduce((sum, log) => sum + (log.burned_calories || 0), 0) /
      recordCount;

    const avgNutrients = {
      carbs:
        nutritionLogs.reduce((sum, log) => sum + (log.total_carbs || 0), 0) /
        recordCount,
      protein:
        nutritionLogs.reduce((sum, log) => sum + (log.total_protein || 0), 0) /
        recordCount,
      fat:
        nutritionLogs.reduce((sum, log) => sum + (log.total_fat || 0), 0) /
        recordCount,
      fiber:
        nutritionLogs.reduce((sum, log) => sum + (log.total_fiber || 0), 0) /
        recordCount,
      sodium:
        nutritionLogs.reduce((sum, log) => sum + (log.total_sodium || 0), 0) /
        recordCount,
      sugar:
        nutritionLogs.reduce((sum, log) => sum + (log.total_sugar || 0), 0) /
        recordCount,
      saturatedFat:
        nutritionLogs.reduce(
          (sum, log) => sum + (log.total_saturated_fat || 0),
          0
        ) / recordCount,
      cholesterol:
        nutritionLogs.reduce(
          (sum, log) => sum + (log.total_cholesterol || 0),
          0
        ) / recordCount,
    };

    // 영양소 상태 계산
    const nutrients = Object.entries(avgNutrients).map(([key, value]) => {
      const standard = NUTRIENT_STANDARDS[key];
      let status: "adequate" | "excessive" | "deficient" = "adequate";
      if (value < standard.min) status = "deficient";
      if (value > standard.max) status = "excessive";

      return {
        name: key,
        nameKo: NUTRIENT_NAME_KO[key],
        status,
        value: Math.round(value),
        min: standard.min,
        max: standard.max,
        unit: standard.unit,
      };
    });

    return NextResponse.json({
      dailyCalories: {
        consumed: Math.round(totalCalories),
        target: targetCalories,
        burned: Math.round(totalBurned),
      },
      nutrients,
    });
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis data" },
      { status: 500 }
    );
  }
}

