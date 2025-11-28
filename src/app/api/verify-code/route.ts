import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// 서버사이드에서 service_role 키로 클라이언트 생성 (RLS 우회)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { phone, code, purpose } = await request.json();

    if (!phone || !code || !purpose) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 휴대폰 번호 정규화
    const normalizedPhone = phone.replace(/-/g, "");

    // 인증번호 조회
    const { data: verification, error: selectError } = await supabaseAdmin
      .from("phone_verifications")
      .select("*")
      .eq("phone", normalizedPhone)
      .eq("purpose", purpose)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (selectError || !verification) {
      return NextResponse.json(
        { error: "인증번호를 먼저 요청해주세요." },
        { status: 400 }
      );
    }

    // 만료 확인
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "인증번호가 만료되었습니다. 다시 요청해주세요." },
        { status: 400 }
      );
    }

    // 시도 횟수 확인 (최대 5회)
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: "인증 시도 횟수를 초과했습니다. 다시 요청해주세요." },
        { status: 400 }
      );
    }

    // 인증번호 확인
    if (verification.code !== code) {
      // 시도 횟수 증가
      await supabaseAdmin
        .from("phone_verifications")
        .update({ attempts: verification.attempts + 1 })
        .eq("id", verification.id);

      return NextResponse.json(
        { error: "유효하지 않은 인증번호입니다." },
        { status: 400 }
      );
    }

    // 인증 성공 - verified 상태 업데이트
    await supabaseAdmin
      .from("phone_verifications")
      .update({ verified: true })
      .eq("id", verification.id);

    return NextResponse.json({
      success: true,
      message: "인증이 완료되었습니다.",
      verificationId: verification.id,
    });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "인증 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


