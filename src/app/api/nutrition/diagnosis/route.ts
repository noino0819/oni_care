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
      eatScore,
      completedAt,
      diagnosisType,
      warningNutrients,
      recommendedCalories,
      analysis,
    } = body;

    // diagnosis_date를 DATE 형식으로 변환
    const diagnosisDate = completedAt
      ? new Date(completedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    // 영양진단 결과 저장 (upsert: 같은 날짜에 이미 진단 결과가 있으면 업데이트)
    const { data, error } = await supabase
      .from("nutrition_diagnosis")
      .upsert(
        {
          user_id: user.id,
          eat_score: eatScore,
          overall_score: eatScore,
          diagnosis_date: diagnosisDate,
          diagnosis_type: diagnosisType,
          warning_nutrients: warningNutrients,
          recommended_calories: recommendedCalories,
          basal_metabolic_rate: analysis?.basalMetabolicRate,
          recommendations: [
            `${diagnosisType} 유형으로 ${warningNutrients?.join(", ")} 섭취에 주의하세요.`,
          ],
        },
        {
          onConflict: "user_id,diagnosis_date",
        }
      )
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

    // 사용자 정보 조회
    const { data: userData } = await supabase
      .from("users")
      .select("name, gender, birth_date, height, weight, diseases, interests")
      .eq("id", user.id)
      .single();

    // 나이 계산
    let age = 40;
    if (userData?.birth_date) {
      const birthDate = new Date(userData.birth_date);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
    }

    const searchParams = request.nextUrl.searchParams;
    const diagnosisId = searchParams.get("id");

    let diagnosisData;
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
      diagnosisData = data;
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
      diagnosisData = data;
    }

    if (!diagnosisData) {
      return NextResponse.json(null);
    }

    // 사용자 정보와 함께 반환
    return NextResponse.json({
      ...diagnosisData,
      user_name: userData?.name || "사용자",
      gender: userData?.gender || "female",
      age,
      height: userData?.height || 165,
      weight: userData?.weight || 55,
      diseases: userData?.diseases || [],
      interests: userData?.interests || [],
    });
  } catch (error) {
    console.error("Diagnosis API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch diagnosis" },
      { status: 500 }
    );
  }
}

