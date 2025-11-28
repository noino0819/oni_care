import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/profile/phone - 연락처 변경 (인증 후)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { phone, verificationCode } = await request.json();

    // 유효성 검사
    if (!phone || !verificationCode) {
      return NextResponse.json(
        { error: "전화번호와 인증번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 전화번호 형식 검사 (11자리)
    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(phone.replace(/-/g, ""))) {
      return NextResponse.json(
        { error: "휴대폰 번호는 11자리입니다" },
        { status: 400 }
      );
    }

    // 인증번호 확인
    const { data: verification, error: verificationError } = await supabase
      .from("phone_verifications")
      .select("*")
      .eq("phone", phone.replace(/-/g, ""))
      .eq("code", verificationCode)
      .eq("purpose", "find_password") // 또는 phone_change
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (verificationError || !verification) {
      return NextResponse.json(
        { error: "인증번호가 올바르지 않거나 만료되었습니다." },
        { status: 400 }
      );
    }

    // 인증 완료 처리
    await supabase
      .from("phone_verifications")
      .update({ verified: true })
      .eq("id", verification.id);

    // 전화번호 업데이트
    const { error: updateError } = await supabase
      .from("users")
      .update({ phone: phone.replace(/-/g, "") })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: "연락처 변경에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "연락처가 성공적으로 변경되었습니다.",
    });
  } catch (error) {
    console.error("Error changing phone:", error);
    return NextResponse.json(
      { error: "Failed to change phone" },
      { status: 500 }
    );
  }
}


