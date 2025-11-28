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

    // 활성화된 영양제 루틴 조회
    const { data: routines, error: routinesError } = await supabase
      .from("supplement_routines")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("time_slot", { ascending: true });

    if (routinesError) {
      console.error("Routines fetch error:", routinesError);
      return NextResponse.json({ error: routinesError.message }, { status: 500 });
    }

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
    const supplementsWithStatus = (routines || []).map((routine) => {
      const log = (logs || []).find((l) => l.routine_id === routine.id);
      return {
        id: routine.id,
        name: routine.name,
        dosage: routine.dosage,
        timeSlot: routine.time_slot,
        isTaken: log?.is_taken || false,
        takenAt: log?.taken_at,
      };
    });

    return NextResponse.json({
      supplements: supplementsWithStatus,
      routines: routines || [],
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

// POST: 영양제 루틴 추가
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
    const { name, dosage, timeSlot } = body;

    if (!name || !timeSlot) {
      return NextResponse.json(
        { error: "Name and timeSlot are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("supplement_routines")
      .insert({
        user_id: user.id,
        name,
        dosage: dosage || "1정",
        time_slot: timeSlot,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Routine insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, routine: data });
  } catch (error) {
    console.error("Supplements API error:", error);
    return NextResponse.json(
      { error: "Failed to add routine" },
      { status: 500 }
    );
  }
}

// PUT: 영양제 루틴 수정 또는 복용 기록 업데이트
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
    const { routineId, action, updates, date } = body;

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
    } else if (action === "markAllTaken") {
      // 전체 복용 완료
      const logDate = date || new Date().toISOString().split("T")[0];
      
      // 모든 활성 루틴 조회
      const { data: routines } = await supabase
        .from("supplement_routines")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (routines && routines.length > 0) {
        const logs = routines.map((r) => ({
          user_id: user.id,
          routine_id: r.id,
          log_date: logDate,
          is_taken: true,
          taken_at: new Date().toISOString(),
        }));

        await supabase
          .from("supplement_logs")
          .upsert(logs, {
            onConflict: "user_id,routine_id,log_date",
          });
      }

      return NextResponse.json({ success: true });
    } else if (updates) {
      // 루틴 정보 업데이트
      const { data, error } = await supabase
        .from("supplement_routines")
        .update(updates)
        .eq("id", routineId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Routine update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, routine: data });
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

// DELETE: 영양제 루틴 삭제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const routineId = searchParams.get("routineId");

    if (!routineId) {
      return NextResponse.json(
        { error: "Routine ID is required" },
        { status: 400 }
      );
    }

    // 루틴 삭제 (cascade로 관련 로그도 삭제됨)
    const { error } = await supabase
      .from("supplement_routines")
      .delete()
      .eq("id", routineId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Routine delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Supplements API error:", error);
    return NextResponse.json(
      { error: "Failed to delete routine" },
      { status: 500 }
    );
  }
}

