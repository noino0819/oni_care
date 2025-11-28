import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: 영양제 루틴 및 오늘의 복용 기록 조회
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
        const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
        
        // 현재 요일 확인
        const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date(date).getDay()];

        // 활성화된 영양제 루틴 조회
        const { data: routines, error: routinesError } = await supabase
            .from("supplement_routines")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("created_at", { ascending: true });

        if (routinesError) {
            console.error("Routines fetch error:", routinesError);
            return NextResponse.json({ error: routinesError.message }, { status: 500 });
        }

        // 해당 요일에 복용해야 하는 루틴만 필터링
        const todayRoutines = (routines || []).filter((routine) => {
            const daysOfWeek = routine.days_of_week || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
            return daysOfWeek.includes(dayOfWeek);
        });

        // 오늘의 복용 기록 조회
        const { data: logs, error: logsError } = await supabase
            .from("supplement_logs")
            .select("*")
            .eq("user_id", user.id)
            .eq("log_date", date);

        if (logsError) {
            console.error("Logs fetch error:", logsError);
            return NextResponse.json({ error: logsError.message }, { status: 500 });
        }

        // 루틴과 로그 병합
        const supplementsWithStatus = todayRoutines.map((routine) => {
            const log = (logs || []).find((l) => l.routine_id === routine.id);
            const scheduledTimes = routine.scheduled_times || [
                { time: "09:00", period: "AM", dosage: routine.dosage || "1정" }
            ];
            
            return {
                id: routine.id,
                name: routine.name,
                brand: routine.brand,
                dosage: routine.dosage,
                scheduledTimes,
                isTaken: log?.is_taken || false,
                takenAt: log?.taken_at,
            };
        });

        return NextResponse.json({
            supplements: supplementsWithStatus,
            routines: todayRoutines,
            logs: logs || [],
        });
    } catch (error) {
        console.error("Supplements API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch supplements" },
            { status: 500 }
        );
    }
}

// PUT: 복용 기록 업데이트
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
        const { routineId, action, date } = body;

        if (action === "toggleTaken") {
            // 복용 기록 토글
            const logDate = date || new Date().toISOString().split("T")[0];

            // 기존 기록 확인
            const { data: existingLog } = await supabase
                .from("supplement_logs")
                .select("*")
                .eq("user_id", user.id)
                .eq("routine_id", routineId)
                .eq("log_date", logDate)
                .single();

            if (existingLog) {
                // 기존 기록 업데이트
                const { data, error } = await supabase
                    .from("supplement_logs")
                    .update({
                        is_taken: !existingLog.is_taken,
                        taken_at: !existingLog.is_taken ? new Date().toISOString() : null,
                    })
                    .eq("id", existingLog.id)
                    .select()
                    .single();

                if (error) {
                    console.error("Log update error:", error);
                    return NextResponse.json({ error: error.message }, { status: 500 });
                }

                return NextResponse.json({ success: true, log: data });
            } else {
                // 새 기록 생성
                const { data, error } = await supabase
                    .from("supplement_logs")
                    .insert({
                        user_id: user.id,
                        routine_id: routineId,
                        log_date: logDate,
                        is_taken: true,
                        taken_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (error) {
                    console.error("Log insert error:", error);
                    return NextResponse.json({ error: error.message }, { status: 500 });
                }

                return NextResponse.json({ success: true, log: data });
            }
        } else if (action === "completeDaily") {
            // 일일 기록 완료 - 포인트 지급
            const logDate = date || new Date().toISOString().split("T")[0];
            
            // 오늘 포인트를 이미 받았는지 확인
            const { data: existingPointHistory } = await supabase
                .from("point_history")
                .select("id")
                .eq("user_id", user.id)
                .eq("source", "supplement_log")
                .gte("created_at", `${logDate}T00:00:00`)
                .lte("created_at", `${logDate}T23:59:59`)
                .single();

            if (existingPointHistory) {
                return NextResponse.json({ 
                    success: true, 
                    pointsEarned: 0,
                    message: "이미 오늘 포인트를 받았습니다." 
                });
            }

            // 포인트 지급 (20P)
            const pointsToEarn = 20;

            // 현재 포인트 조회
            const { data: userPoints } = await supabase
                .from("user_points")
                .select("total_points")
                .eq("user_id", user.id)
                .single();

            const currentPoints = userPoints?.total_points || 0;
            const newTotal = currentPoints + pointsToEarn;

            // 포인트 업데이트 또는 생성
            await supabase
                .from("user_points")
                .upsert({
                    user_id: user.id,
                    total_points: newTotal,
                }, {
                    onConflict: "user_id",
                });

            // 포인트 히스토리 추가
            await supabase
                .from("point_history")
                .insert({
                    user_id: user.id,
                    points: pointsToEarn,
                    transaction_type: "earn",
                    source: "supplement_log",
                    source_detail: "영양제 기록 완료",
                    balance_after: newTotal,
                });

            return NextResponse.json({ 
                success: true, 
                pointsEarned: pointsToEarn,
                totalPoints: newTotal,
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Supplements API error:", error);
        return NextResponse.json(
            { error: "Failed to update supplement" },
            { status: 500 }
        );
    }
}
