import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/points/transfer - 포인트 전환
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { optionType, points } = await request.json();

    // 유효성 검사
    if (!optionType || !points) {
      return NextResponse.json(
        { error: "옵션 타입과 포인트를 입력해주세요." },
        { status: 400 }
      );
    }

    if (points < 5000) {
      return NextResponse.json(
        { error: "5,000 포인트 이상부터 사용할 수 있어요!" },
        { status: 400 }
      );
    }

    if (points > 10000) {
      return NextResponse.json(
        { error: "포인트를 전환할 때는 한번에 10,000원 까지만 전환할 수 있어요!" },
        { status: 400 }
      );
    }

    // 현재 포인트 확인
    const { data: pointData } = await supabase
      .from("user_points")
      .select("total_points")
      .eq("user_id", userId)
      .single();

    const currentPoints = pointData?.total_points || 0;

    if (currentPoints < points) {
      return NextResponse.json(
        { error: "보유한 포인트 내에서만 전환할 수 있어요!" },
        { status: 400 }
      );
    }

    // 전환 옵션 확인
    const { data: optionData } = await supabase
      .from("point_conversion_options")
      .select("*")
      .eq("option_type", optionType)
      .eq("is_active", true)
      .single();

    if (!optionData) {
      return NextResponse.json(
        { error: "유효하지 않은 전환 옵션입니다." },
        { status: 400 }
      );
    }

    // 포인트 차감
    const newBalance = currentPoints - points;
    
    await supabase
      .from("user_points")
      .update({ total_points: newBalance })
      .eq("user_id", userId);

    // 포인트 내역 기록
    await supabase.from("point_history").insert({
      user_id: userId,
      points: -points,
      transaction_type: "transfer",
      source: optionData.option_name,
      source_detail: `${optionData.option_name}로 전환`,
      text1: `${optionData.option_name} 전환`,
      text2: "포인트 전환",
      balance_after: newBalance,
    });

    return NextResponse.json({
      success: true,
      message: `${optionData.option_name}로 ${points.toLocaleString()}P가 전환되었습니다.`,
      newBalance,
    });
  } catch (error) {
    console.error("Error transferring points:", error);
    return NextResponse.json(
      { error: "Failed to transfer points" },
      { status: 500 }
    );
  }
}

// GET /api/points/transfer - 전환 가능 옵션 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 전환 옵션 조회
    const { data: options, error } = await supabase
      .from("point_conversion_options")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (error) throw error;

    // H.point 회원 여부 확인 (연동된 계정 체크)
    const { data: linkedAccount } = await supabase
      .from("linked_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("account_type", "greating_mall")
      .eq("is_linked", true)
      .single();

    const isHpointMember = !!linkedAccount;

    // 회원 상태에 따라 옵션 필터링
    const filteredOptions = options?.map((option) => ({
      ...option,
      available: !option.requires_membership || 
        (option.membership_type === "hpoint_member" && isHpointMember),
    }));

    return NextResponse.json({ options: filteredOptions || [] });
  } catch (error) {
    console.error("Error fetching transfer options:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfer options" },
      { status: 500 }
    );
  }
}


