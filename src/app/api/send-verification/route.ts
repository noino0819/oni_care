import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// 서버사이드에서 service_role 키로 클라이언트 생성 (RLS 우회)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 6자리 랜덤 인증번호 생성
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { phone, purpose } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "휴대폰 번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 휴대폰 번호 정규화 (하이픈 제거)
    const normalizedPhone = phone.replace(/-/g, "");

    // 11자리 검증
    if (normalizedPhone.length !== 11) {
      return NextResponse.json(
        { error: "휴대폰 번호는 11자리입니다." },
        { status: 400 }
      );
    }

    // purpose 검증
    const validPurposes = ["find_id", "find_password", "signup"];
    if (!purpose || !validPurposes.includes(purpose)) {
      return NextResponse.json(
        { error: "잘못된 요청입니다." },
        { status: 400 }
      );
    }

    // 기존 미사용 인증번호 삭제 (같은 번호, 같은 목적)
    await supabaseAdmin
      .from("phone_verifications")
      .delete()
      .eq("phone", normalizedPhone)
      .eq("purpose", purpose)
      .eq("verified", false);

    // 새 인증번호 생성
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3분 후 만료

    // 인증번호 저장
    const { error: insertError } = await supabaseAdmin
      .from("phone_verifications")
      .insert({
        phone: normalizedPhone,
        code,
        purpose,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Insert verification error:", insertError);
      return NextResponse.json(
        { error: "인증번호 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    // TODO: 실제 SMS 발송 로직 (여기서는 콘솔에 출력)
    // 실제 구현 시 NHN Cloud, Twilio 등 SMS API 연동 필요
    console.log(`[그리팅 케어] 본인확인 인증번호 [${code}] 입니다.`);

    // 개발 환경에서는 인증번호를 응답에 포함 (실제 배포 시 제거)
    const isDev = process.env.NODE_ENV === "development";

    return NextResponse.json({
      success: true,
      message: "인증번호가 전송되었습니다.",
      ...(isDev && { code }), // 개발 환경에서만 코드 반환
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: "인증번호 전송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


