import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// 서버사이드에서 service_role 키로 클라이언트 생성 (RLS 우회)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, name, phone, verificationId } = await request.json();

    if (!userId || !name || !phone) {
      return NextResponse.json(
        { error: "아이디, 이름, 휴대폰 번호를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 휴대폰 번호 정규화 (하이픈 제거)
    const normalizedPhone = phone.replace(/-/g, "");

    // 인증번호 검증 확인 (verificationId가 있는 경우)
    if (verificationId) {
      const { data: verification, error: verifyError } = await supabaseAdmin
        .from("phone_verifications")
        .select("*")
        .eq("id", verificationId)
        .eq("phone", normalizedPhone)
        .eq("purpose", "find_password")
        .eq("verified", true)
        .single();

      if (verifyError || !verification) {
        return NextResponse.json(
          { error: "인증이 완료되지 않았습니다." },
          { status: 400 }
        );
      }
    }

    // 아이디(이메일), 이름, 휴대폰 번호로 사용자 조회
    // userId가 이메일 형식인지 확인
    let emailToSearch = userId;
    if (!userId.includes("@")) {
      // 이메일 형식이 아니면 그대로 사용 (아이디로 검색)
      // 실제로는 아이디와 이메일이 같을 수 있음
      emailToSearch = userId;
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, email, provider")
      .eq("name", name)
      .eq("phone", normalizedPhone);

    if (error) {
      console.error("Find password query error:", error);
      return NextResponse.json(
        { error: "비밀번호 찾기 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 아이디(이메일) 일치 확인
    const matchedUser = data?.find(
      (user) =>
        user.email === emailToSearch ||
        user.email.split("@")[0] === emailToSearch
    );

    if (!matchedUser) {
      return NextResponse.json({
        success: true,
        found: false,
        message: "입력하신 정보와 일치하는 아이디가 없습니다.",
      });
    }

    // SNS 가입 회원인 경우
    if (matchedUser.provider && matchedUser.provider !== "email") {
      return NextResponse.json({
        success: true,
        found: true,
        isSocialAccount: true,
        provider: matchedUser.provider,
        message: `${matchedUser.provider === "naver" ? "네이버" : "카카오톡"} 간편가입 회원입니다. 해당 서비스에서 비밀번호를 변경해주세요.`,
      });
    }

    // 비밀번호 재설정 토큰 생성 (간단한 UUID 사용)
    const resetToken = crypto.randomUUID();
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료

    // 토큰을 세션이나 임시 저장소에 저장 (여기서는 간단히 응답에 포함)
    // 실제 구현에서는 별도 테이블이나 Redis 등에 저장 권장

    return NextResponse.json({
      success: true,
      found: true,
      isSocialAccount: false,
      userId: matchedUser.id,
      resetToken,
      expiresAt: resetTokenExpiry.toISOString(),
    });
  } catch (error) {
    console.error("Find password error:", error);
    return NextResponse.json(
      { error: "비밀번호 찾기 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

