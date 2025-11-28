import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: 걸음수 조회 (오늘/주간/월간)
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
        const type = searchParams.get("type") || "today"; // today, weekly, monthly
        const targetDate = searchParams.get("date")
            ? new Date(searchParams.get("date")!)
            : new Date();

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        if (type === "today") {
            // 오늘의 걸음수 조회
            const { data: todayStep, error } = await supabase
                .from("step_records")
                .select("*")
                .eq("user_id", user.id)
                .eq("record_date", todayStr)
                .single();

            if (error && error.code !== "PGRST116") {
                console.error("Today step fetch error:", error);
            }

            return NextResponse.json({
                stepCount: todayStep?.step_count || 0,
                goalSteps: todayStep?.goal_steps || 10000,
                recordDate: todayStr,
            });
        }

        if (type === "weekly") {
            // 주간 걸음수 조회 (선택된 날짜 기준 해당 주)
            const startOfWeek = new Date(targetDate);
            const day = startOfWeek.getDay();
            startOfWeek.setDate(startOfWeek.getDate() - day);
            const startDateStr = startOfWeek.toISOString().split("T")[0];

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            const endDateStr = endOfWeek.toISOString().split("T")[0];

            const { data: weeklySteps, error } = await supabase
                .from("step_records")
                .select("*")
                .eq("user_id", user.id)
                .gte("record_date", startDateStr)
                .lte("record_date", endDateStr)
                .order("record_date", { ascending: true });

            if (error) {
                console.error("Weekly step fetch error:", error);
            }

            // 7일 데이터 생성 (기록 없는 날도 포함)
            const weekData = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split("T")[0];

                const dayRecord = weeklySteps?.find(
                    (s) => s.record_date === dateStr
                );

                weekData.push({
                    date: dateStr,
                    dayOfWeek: date.getDay(),
                    stepCount: dayRecord?.step_count || 0,
                    goalSteps: dayRecord?.goal_steps || 10000,
                    isGoalAchieved:
                        dayRecord?.step_count >= (dayRecord?.goal_steps || 10000),
                });
            }

            // 주간 최대값 계산
            const maxSteps = Math.max(...weekData.map((d) => d.stepCount), 0);

            return NextResponse.json({
                weekData,
                startDate: startDateStr,
                endDate: endDateStr,
                maxSteps: Math.max(maxSteps, 10000), // 최소 10000 기준
            });
        }

        if (type === "monthly") {
            // 월간 걸음수 조회 (주차별 평균)
            const year = targetDate.getFullYear();
            const month = targetDate.getMonth();

            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 0);
            const startDateStr = startOfMonth.toISOString().split("T")[0];
            const endDateStr = endOfMonth.toISOString().split("T")[0];

            const { data: monthlySteps, error } = await supabase
                .from("step_records")
                .select("*")
                .eq("user_id", user.id)
                .gte("record_date", startDateStr)
                .lte("record_date", endDateStr)
                .order("record_date", { ascending: true });

            if (error) {
                console.error("Monthly step fetch error:", error);
            }

            // 주차별로 그룹화
            const weeklyData: {
                weekNumber: number;
                weekStart: string;
                weekEnd: string;
                avgSteps: number;
                daysRecorded: number;
                totalSteps: number;
            }[] = [];

            // 월의 첫 주 시작일
            let currentWeekStart = new Date(startOfMonth);
            let weekNumber = 1;

            while (currentWeekStart <= endOfMonth) {
                const weekStartDate = new Date(currentWeekStart);
                const weekEndDate = new Date(weekStartDate);

                // 해당 주의 끝 (토요일 또는 월말)
                const daysUntilSaturday = 6 - weekStartDate.getDay();
                weekEndDate.setDate(weekEndDate.getDate() + daysUntilSaturday);

                if (weekEndDate > endOfMonth) {
                    weekEndDate.setTime(endOfMonth.getTime());
                }

                const weekStartStr = weekStartDate.toISOString().split("T")[0];
                const weekEndStr = weekEndDate.toISOString().split("T")[0];

                // 해당 주의 기록 필터링
                const weekRecords = monthlySteps?.filter(
                    (s) => s.record_date >= weekStartStr && s.record_date <= weekEndStr
                );

                const totalSteps = weekRecords?.reduce(
                    (sum, s) => sum + (s.step_count || 0),
                    0
                ) || 0;
                const daysRecorded = weekRecords?.length || 0;
                const avgSteps =
                    daysRecorded > 0 ? Math.round(totalSteps / daysRecorded) : 0;

                weeklyData.push({
                    weekNumber,
                    weekStart: weekStartStr,
                    weekEnd: weekEndStr,
                    avgSteps,
                    daysRecorded,
                    totalSteps,
                });

                // 다음 주로 이동
                currentWeekStart = new Date(weekEndDate);
                currentWeekStart.setDate(currentWeekStart.getDate() + 1);
                weekNumber++;

                if (weekNumber > 6) break; // 최대 6주
            }

            // 월간 총 걸음수 계산 (오늘까지만)
            const todayDate = new Date();
            let totalMonthlySteps = 0;
            let monthlyGoal = 0;

            if (
                year === todayDate.getFullYear() &&
                month === todayDate.getMonth()
            ) {
                // 이번 달인 경우, 오늘까지의 총 걸음수
                totalMonthlySteps = monthlySteps?.reduce(
                    (sum, s) => sum + (s.step_count || 0),
                    0
                ) || 0;
                // 목표는 해당 월 전체 일수 * 일일 목표
                const daysInMonth = endOfMonth.getDate();
                monthlyGoal = 10000 * daysInMonth;
            } else {
                // 다른 달인 경우
                totalMonthlySteps = monthlySteps?.reduce(
                    (sum, s) => sum + (s.step_count || 0),
                    0
                ) || 0;
                const daysInMonth = endOfMonth.getDate();
                monthlyGoal = 10000 * daysInMonth;
            }

            // 월간 평균 최대값
            const maxAvgSteps = Math.max(...weeklyData.map((w) => w.avgSteps), 0);

            return NextResponse.json({
                weeklyData,
                totalSteps: totalMonthlySteps,
                monthlyGoal,
                maxAvgSteps: Math.max(maxAvgSteps, 10000),
                year,
                month: month + 1,
            });
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (error) {
        console.error("Steps API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch steps data" },
            { status: 500 }
        );
    }
}

// POST: 걸음수 동기화 (Mock - 실제 외부 연동 없음)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Mock 동기화 - 실제로는 외부 헬스 앱과 연동
        // 여기서는 성공 응답만 반환
        return NextResponse.json({
            success: true,
            message: "걸음수 동기화가 완료되었습니다.",
            lastSyncedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Steps sync error:", error);
        return NextResponse.json(
            { error: "Failed to sync steps" },
            { status: 500 }
        );
    }
}

// PUT: 목표 걸음수 수정
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { goalSteps } = body;

        if (!goalSteps || goalSteps < 1000) {
            return NextResponse.json(
                { error: "Invalid goal steps" },
                { status: 400 }
            );
        }

        const todayStr = new Date().toISOString().split("T")[0];

        // 오늘 기록 업데이트 또는 생성
        const { data, error } = await supabase
            .from("step_records")
            .upsert(
                {
                    user_id: user.id,
                    record_date: todayStr,
                    goal_steps: goalSteps,
                },
                { onConflict: "user_id,record_date" }
            )
            .select()
            .single();

        if (error) {
            console.error("Goal update error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            goalSteps: data.goal_steps,
        });
    } catch (error) {
        console.error("Goal update API error:", error);
        return NextResponse.json(
            { error: "Failed to update goal" },
            { status: 500 }
        );
    }
}

