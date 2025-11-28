import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/points - 포인트 정보 및 내역 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, earn, use, expire
    const month = searchParams.get("month"); // YYYY-MM format
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // 현재 포인트 잔액 조회
    const { data: pointData } = await supabase
      .from("user_points")
      .select("total_points")
      .eq("user_id", userId)
      .single();

    const totalPoints = pointData?.total_points || 0;

    // 포인트 내역 조회
    let historyQuery = supabase
      .from("point_history")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // 필터 적용
    if (filter !== "all") {
      historyQuery = historyQuery.eq("transaction_type", filter);
    }

    // 월별 필터
    if (month) {
      const startDate = `${month}-01`;
      const [year, monthNum] = month.split("-").map(Number);
      const endDate = new Date(year, monthNum, 0).toISOString().split("T")[0];
      historyQuery = historyQuery
        .gte("created_at", startDate)
        .lte("created_at", `${endDate}T23:59:59`);
    }

    historyQuery = historyQuery.range(offset, offset + limit - 1);

    const { data: history, count, error } = await historyQuery;

    if (error) throw error;

    // 이번달 적립/전환/소멸 예정 포인트 계산
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 이번달 적립
    const { data: earnedData } = await supabase
      .from("point_history")
      .select("points")
      .eq("user_id", userId)
      .eq("transaction_type", "earn")
      .gte("created_at", thisMonthStart.toISOString());

    const thisMonthEarned = earnedData?.reduce((sum, item) => sum + item.points, 0) || 0;

    // 이번달 전환
    const { data: transferredData } = await supabase
      .from("point_history")
      .select("points")
      .eq("user_id", userId)
      .eq("transaction_type", "transfer")
      .gte("created_at", thisMonthStart.toISOString());

    const thisMonthTransferred = Math.abs(transferredData?.reduce((sum, item) => sum + item.points, 0) || 0);

    // 30일 이내 소멸 예정
    const { data: expiringData } = await supabase
      .from("point_history")
      .select("points")
      .eq("user_id", userId)
      .eq("transaction_type", "earn")
      .lte("expires_at", next30Days.toISOString())
      .gt("expires_at", now.toISOString());

    const expiringPoints = expiringData?.reduce((sum, item) => sum + item.points, 0) || 0;

    return NextResponse.json({
      totalPoints,
      thisMonthEarned,
      thisMonthTransferred,
      expiringPoints30Days: expiringPoints,
      history: history || [],
      pagination: {
        total: count || 0,
        offset,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}

