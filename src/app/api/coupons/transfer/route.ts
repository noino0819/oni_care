import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/coupons/transfer - 쿠폰 전환
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { couponId } = await request.json();

    if (!couponId) {
      return NextResponse.json(
        { error: "쿠폰 ID를 입력해주세요." },
        { status: 400 }
      );
    }

    // 쿠폰 조회
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", couponId)
      .eq("user_id", userId)
      .single();

    if (couponError || !coupon) {
      return NextResponse.json(
        { error: "쿠폰을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (coupon.status !== "available") {
      return NextResponse.json(
        { error: "전환할 수 없는 쿠폰입니다." },
        { status: 400 }
      );
    }

    // 연동 계정 확인
    const accountType = coupon.coupon_type === "greating" ? "greating_mall" : "h_cafeteria";
    const { data: linkedAccount } = await supabase
      .from("linked_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("account_type", accountType)
      .eq("is_linked", true)
      .single();

    if (!linkedAccount) {
      return NextResponse.json({
        error: "연동 필요",
        needsLinking: true,
        accountType,
        message: `${coupon.coupon_type === "greating" ? "그리팅" : "카페테리아"} 연동이 필요해요!`,
      }, { status: 400 });
    }

    // 쿠폰 전환 처리
    const maskedAccount = linkedAccount.account_id || "***";
    
    const { error: updateError } = await supabase
      .from("coupons")
      .update({
        status: "transferred",
        transferred_account: maskedAccount,
        transferred_at: new Date().toISOString(),
      })
      .eq("id", couponId);

    if (updateError) {
      return NextResponse.json(
        { error: "쿠폰 전환중 문제가 발생했어요! 다시 시도해주세요." },
        { status: 500 }
      );
    }

    const accountName = coupon.coupon_type === "greating" ? "그리팅몰" : "카페테리아";

    return NextResponse.json({
      success: true,
      message: `확인 버튼을 누르시면\n${accountName}(${maskedAccount})로 쿠폰이 전환되어\n${accountName} 쿠폰함에서 확인하실 수 있어요!`,
      transferredAccount: maskedAccount,
    });
  } catch (error) {
    console.error("Error transferring coupon:", error);
    return NextResponse.json(
      { error: "쿠폰 전환중 문제가 발생했어요! 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

