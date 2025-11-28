import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: 영양진단 이력 조회 (기간별 필터)
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
        const period = parseInt(searchParams.get("period") || "3"); // 기본 3개월

        // 기간 계산 (월 단위)
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - period);
        const startDateStr = startDate.toISOString().split("T")[0];

        // 영양진단 이력 조회
        const { data: diagnosisList, error } = await supabase
            .from("nutrition_diagnosis")
            .select("*")
            .eq("user_id", user.id)
            .gte("diagnosis_date", startDateStr)
            .order("diagnosis_date", { ascending: false });

        if (error) {
            console.error("Diagnosis history fetch error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 진단 차수 계산 (전체 진단 기준)
        const { data: allDiagnosis } = await supabase
            .from("nutrition_diagnosis")
            .select("id, diagnosis_date")
            .eq("user_id", user.id)
            .order("diagnosis_date", { ascending: true });

        // 차수 매핑
        const diagnosisWithNumber = diagnosisList?.map((diagnosis) => {
            const index = allDiagnosis?.findIndex((d) => d.id === diagnosis.id) ?? -1;
            return {
                ...diagnosis,
                diagnosis_number: index + 1,
            };
        });

        // 마지막 진단일로부터 경과일 계산
        let daysSinceLastDiagnosis = null;
        let lastDiagnosis = null;

        if (diagnosisList && diagnosisList.length > 0) {
            lastDiagnosis = diagnosisList[0];
            const lastDate = new Date(lastDiagnosis.diagnosis_date);
            const today = new Date();
            daysSinceLastDiagnosis = Math.floor(
                (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
            );
        }

        return NextResponse.json({
            diagnosisList: diagnosisWithNumber || [],
            lastDiagnosis,
            daysSinceLastDiagnosis,
            totalCount: allDiagnosis?.length || 0,
        });
    } catch (error) {
        console.error("Diagnosis history API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch diagnosis history" },
            { status: 500 }
        );
    }
}

