import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/linked-accounts - 연동 계정 목록 조회
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 연동 가능한 계정 유형
    const accountTypes = [
      { type: "greating_mall", name: "그리팅몰", icon: "greating" },
      { type: "h_cafeteria", name: "H-cafeteria", icon: "cafeteria" },
      { type: "offline_counseling", name: "오프라인 상담", icon: "counseling" },
    ];

    // 사용자의 연동 계정 조회
    const { data: linkedAccounts, error } = await supabase
      .from("linked_accounts")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    // 모든 계정 유형에 대해 연동 상태 매핑
    const accounts = accountTypes.map((type) => {
      const linked = linkedAccounts?.find((acc) => acc.account_type === type.type);
      return {
        account_type: type.type,
        name: type.name,
        icon: type.icon,
        is_linked: linked?.is_linked || false,
        account_id: linked?.account_id || null,
        linked_at: linked?.linked_at || null,
      };
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Error fetching linked accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch linked accounts" },
      { status: 500 }
    );
  }
}

// POST /api/linked-accounts - 계정 연동/해제
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { accountType, action } = await request.json(); // action: 'link' | 'unlink'

    if (!accountType || !action) {
      return NextResponse.json(
        { error: "계정 유형과 액션을 입력해주세요." },
        { status: 400 }
      );
    }

    const validAccountTypes = ["greating_mall", "h_cafeteria", "offline_counseling"];
    if (!validAccountTypes.includes(accountType)) {
      return NextResponse.json(
        { error: "유효하지 않은 계정 유형입니다." },
        { status: 400 }
      );
    }

    // 기존 연동 정보 조회
    const { data: existing } = await supabase
      .from("linked_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("account_type", accountType)
      .single();

    if (action === "link") {
      // 카페테리아 연동 시 사업장 코드 확인
      if (accountType === "h_cafeteria") {
        const { data: userProfile } = await supabase
          .from("users")
          .select("business_code")
          .eq("id", userId)
          .single();

        // 실제로는 카페테리아 API와 연동하여 사업장 코드 확인
        // 여기서는 시뮬레이션
        const cafeteriaBusinessCode = "199879"; // 카페테리아 사업장 코드
        
        if (userProfile?.business_code !== cafeteriaBusinessCode) {
          return NextResponse.json({
            error: "사업장 불일치",
            needsChange: true,
            message: `카페테리아(${cafeteriaBusinessCode})와 그리팅 케어(${userProfile?.business_code || "없음"})에 등록된\n사업장이 다릅니다. 사업장을 다시 확인해주세요.`,
          }, { status: 400 });
        }
      }

      // 연동 처리 (실제로는 외부 API 호출 필요)
      // 여기서는 시뮬레이션
      const mockAccountId = accountType === "greating_mall" 
        ? "gr12*****" 
        : accountType === "h_cafeteria" 
          ? "cafe12****" 
          : null;

      if (existing) {
        await supabase
          .from("linked_accounts")
          .update({
            is_linked: true,
            account_id: mockAccountId,
            linked_at: new Date().toISOString(),
            unlinked_at: null,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("linked_accounts").insert({
          user_id: userId,
          account_type: accountType,
          account_id: mockAccountId,
          is_linked: true,
          linked_at: new Date().toISOString(),
        });
      }

      // 연동 보너스 포인트 지급
      const { data: pointData } = await supabase
        .from("user_points")
        .select("total_points")
        .eq("user_id", userId)
        .single();

      const currentPoints = pointData?.total_points || 0;
      const bonusPoints = 1000;

      await supabase
        .from("user_points")
        .upsert({
          user_id: userId,
          total_points: currentPoints + bonusPoints,
        });

      await supabase.from("point_history").insert({
        user_id: userId,
        points: bonusPoints,
        transaction_type: "earn",
        source: "계정 연동",
        source_detail: `${accountType === "greating_mall" ? "그리팅몰" : accountType === "h_cafeteria" ? "카페테리아" : "오프라인 상담"} 연동`,
        text1: `${accountType === "greating_mall" ? "그리팅몰" : accountType === "h_cafeteria" ? "카페테리아" : "오프라인 상담"} 연동 완료`,
        text2: "회원 연동",
        balance_after: currentPoints + bonusPoints,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1년 후 만료
      });

      const accountName = accountType === "greating_mall" 
        ? "그리팅" 
        : accountType === "h_cafeteria" 
          ? "H-cafeteria" 
          : "오프라인 상담";

      return NextResponse.json({
        success: true,
        message: `${accountName} ${mockAccountId || ""}계정과 연동되었어요!`,
        accountId: mockAccountId,
      });
    } else if (action === "unlink") {
      if (!existing || !existing.is_linked) {
        return NextResponse.json(
          { error: "연동되지 않은 계정입니다." },
          { status: 400 }
        );
      }

      await supabase
        .from("linked_accounts")
        .update({
          is_linked: false,
          unlinked_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      return NextResponse.json({
        success: true,
        message: "계정 연동이 해제되었습니다.",
      });
    }

    return NextResponse.json(
      { error: "유효하지 않은 액션입니다." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error managing linked account:", error);
    return NextResponse.json(
      { error: "Failed to manage linked account" },
      { status: 500 }
    );
  }
}

