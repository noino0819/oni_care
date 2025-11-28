import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/coupons - 쿠폰 정보 및 내역 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, greating, cafeteria
    const month = searchParams.get("month"); // YYYY-MM format
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // 쿠폰 내역 조회
    let couponQuery = supabase
      .from("coupons")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // 타입 필터
    if (filter !== "all") {
      couponQuery = couponQuery.eq("coupon_type", filter);
    }

    // 월별 필터
    if (month) {
      const startDate = `${month}-01`;
      const [year, monthNum] = month.split("-").map(Number);
      const endDate = new Date(year, monthNum, 0).toISOString().split("T")[0];
      couponQuery = couponQuery
        .gte("created_at", startDate)
        .lte("created_at", `${endDate}T23:59:59`);
    }

    couponQuery = couponQuery.range(offset, offset + limit - 1);

    const { data: coupons, count, error } = await couponQuery;

    if (error) throw error;

    // 통계 계산
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 전환 가능 쿠폰 수 (available 상태)
    const { count: availableCount } = await supabase
      .from("coupons")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "available");

    // 이번달 발급
    const { count: thisMonthIssuedCount } = await supabase
      .from("coupons")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", thisMonthStart.toISOString());

    // 이번달 사용
    const { count: thisMonthUsedCount } = await supabase
      .from("coupons")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["used", "transferred"])
      .gte("updated_at", thisMonthStart.toISOString());

    // 30일 이내 소멸 예정
    const { count: expiringCount } = await supabase
      .from("coupons")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "available")
      .lte("expires_at", next30Days.toISOString())
      .gt("expires_at", now.toISOString());

    return NextResponse.json({
      availableCoupons: availableCount || 0,
      thisMonthIssued: thisMonthIssuedCount || 0,
      thisMonthUsed: thisMonthUsedCount || 0,
      expiringCoupons30Days: expiringCount || 0,
      coupons: coupons || [],
      pagination: {
        total: count || 0,
        offset,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

