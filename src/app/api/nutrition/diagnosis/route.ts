import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: 영양진단 결과 저장
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      diagnosisId,
      eatScore,
      completedAt,
      diagnosisType,
      warningNutrients,
      recommendedCalories,
      nutrientScores,
      analysis,
    } = body;

    // 영양진단 결과 저장
    const { data, error } = await supabase
      .from("nutrition_diagnosis")
      .insert({
        id: diagnosisId,
        user_id: user.id,
        eat_score: eatScore,
        diagnosis_date: completedAt || new Date().toISOString(),
        diagnosis_type: diagnosisType,
        warning_nutrients: warningNutrients,
        recommended_calories: recommendedCalories,
        nutrient_scores: nutrientScores,
        bmi: analysis?.bmi,
        basal_metabolic_rate: analysis?.basalMetabolicRate,
        activity_level: analysis?.activityLevel,
      })
      .select()
      .single();

    if (error) {
      console.error("Diagnosis save error:", error);
      // 중복 키 에러 등은 무시하고 성공 처리
      if (error.code === "23505") {
        return NextResponse.json({ success: true, message: "Already exists" });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, diagnosis: data });
  } catch (error) {
    console.error("Diagnosis API error:", error);
    return NextResponse.json(
      { error: "Failed to save diagnosis" },
      { status: 500 }
    );
  }
}

// GET: 영양진단 결과 조회
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
    const diagnosisId = searchParams.get("id");

    if (diagnosisId) {
      // 특정 진단 결과 조회
      const { data, error } = await supabase
        .from("nutrition_diagnosis")
        .select("*")
        .eq("id", diagnosisId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    } else {
      // 최신 진단 결과 조회
      const { data, error } = await supabase
        .from("nutrition_diagnosis")
        .select("*")
        .eq("user_id", user.id)
        .order("diagnosis_date", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || null);
    }
  } catch (error) {
    console.error("Diagnosis API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch diagnosis" },
      { status: 500 }
    );
  }
}

