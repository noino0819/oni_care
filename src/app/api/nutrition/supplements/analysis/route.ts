import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: 영양제 분석 결과 조회
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
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    // 사용자의 영양제 루틴 조회
    const { data: routines, error: routinesError } = await supabase
      .from("supplement_routines")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (routinesError) {
      console.error("Routines fetch error:", routinesError);
      return NextResponse.json(
        { error: routinesError.message },
        { status: 500 }
      );
    }

    // 해당 날짜의 분석 결과 조회
    const { data: analysis, error: analysisError } = await supabase
      .from("supplement_analysis")
      .select("*")
      .eq("user_id", user.id)
      .eq("analysis_date", date);

    // 분석 데이터가 없으면 기본 분석 생성 (시뮬레이션)
    let analysisData = analysis || [];
    if (analysisData.length === 0 && routines && routines.length > 0) {
      // 영양제 루틴이 있으면 기본 분석 데이터 생성
      analysisData = generateDefaultAnalysis(routines);
    }

    // 부족/적정/과다 카운트
    const deficientCount = analysisData.filter(
      (a) => a.status === "deficient"
    ).length;
    const adequateCount = analysisData.filter(
      (a) => a.status === "adequate"
    ).length;
    const excessiveCount = analysisData.filter(
      (a) => a.status === "excessive"
    ).length;

    return NextResponse.json({
      totalSupplements: routines?.length || 0,
      analysis: {
        deficient: deficientCount,
        adequate: adequateCount,
        excessive: excessiveCount,
      },
      details: analysisData,
      hasAnalysis: routines && routines.length > 0,
    });
  } catch (error) {
    console.error("Supplement analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}

// 기본 분석 데이터 생성 (실제로는 서버에서 계산해야 함)
function generateDefaultAnalysis(
  routines: { id: string; name: string; dosage: string }[]
) {
  // 영양제 이름 기반으로 성분 추론 및 분석 생성
  const ingredientMap: Record<
    string,
    { name: string; status: string; recommended: number; unit: string }
  > = {
    프로바이오틱스: {
      name: "프로바이오틱스",
      status: "adequate",
      recommended: 10000000000,
      unit: "CFU",
    },
    비타민: {
      name: "비타민",
      status: "adequate",
      recommended: 100,
      unit: "mg",
    },
    오메가: { name: "오메가-3", status: "adequate", recommended: 1000, unit: "mg" },
    콜라겐: { name: "콜라겐", status: "deficient", recommended: 2000, unit: "mg" },
    유산균: {
      name: "프로바이오틱스",
      status: "adequate",
      recommended: 10000000000,
      unit: "CFU",
    },
    아연: { name: "아연", status: "adequate", recommended: 10, unit: "mg" },
    철분: { name: "철분", status: "deficient", recommended: 14, unit: "mg" },
    칼슘: { name: "칼슘", status: "deficient", recommended: 700, unit: "mg" },
    마그네슘: {
      name: "마그네슘",
      status: "deficient",
      recommended: 350,
      unit: "mg",
    },
    비오틴: { name: "비오틴", status: "adequate", recommended: 30, unit: "mcg" },
  };

  const analysisResults: {
    ingredient_name: string;
    status: string;
    current_amount: number;
    recommended_amount: number;
    unit: string;
    source_supplements: string[];
  }[] = [];

  const processedIngredients = new Set<string>();

  routines.forEach((routine) => {
    const name = routine.name.toLowerCase();

    Object.entries(ingredientMap).forEach(([keyword, data]) => {
      if (
        name.includes(keyword.toLowerCase()) &&
        !processedIngredients.has(data.name)
      ) {
        processedIngredients.add(data.name);
        const statusRandomizer = Math.random();
        let status = data.status;

        // 약간의 랜덤성 추가
        if (statusRandomizer < 0.2) status = "deficient";
        else if (statusRandomizer > 0.8) status = "excessive";
        else status = "adequate";

        const currentAmount =
          status === "adequate"
            ? data.recommended * (0.8 + Math.random() * 0.4)
            : status === "deficient"
            ? data.recommended * (0.3 + Math.random() * 0.3)
            : data.recommended * (1.3 + Math.random() * 0.4);

        analysisResults.push({
          ingredient_name: data.name,
          status,
          current_amount: Math.round(currentAmount * 10) / 10,
          recommended_amount: data.recommended,
          unit: data.unit,
          source_supplements: [routine.name],
        });
      }
    });
  });

  // 기본 성분 추가 (영양제가 있지만 인식되지 않는 경우)
  if (analysisResults.length === 0) {
    analysisResults.push(
      {
        ingredient_name: "비타민D",
        status: "deficient",
        current_amount: 200,
        recommended_amount: 400,
        unit: "IU",
        source_supplements: routines.map((r) => r.name),
      },
      {
        ingredient_name: "비타민C",
        status: "adequate",
        current_amount: 100,
        recommended_amount: 100,
        unit: "mg",
        source_supplements: routines.map((r) => r.name),
      },
      {
        ingredient_name: "오메가-3",
        status: "adequate",
        current_amount: 900,
        recommended_amount: 1000,
        unit: "mg",
        source_supplements: routines.map((r) => r.name),
      }
    );
  }

  return analysisResults;
}

