import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// 서버사이드에서 service_role 키로 클라이언트 생성 (RLS 우회)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 비밀번호 규칙 검증: 영문, 숫자, 특수문자 포함 8~15자
function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8 || password.length > 15) {
    return { valid: false, message: "비밀번호는 8자 이상 15자 이내로 설정해주세요." };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasLetter) {
    return { valid: false, message: "비밀번호에 영문을 포함해주세요." };
  }
  if (!hasNumber) {
    return { valid: false, message: "비밀번호에 숫자를 포함해주세요." };
  }
  if (!hasSpecial) {
    return { valid: false, message: "비밀번호에 특수문자를 포함해주세요." };
  }

  return { valid: true, message: "" };
}

export async function POST(request: NextRequest) {
  try {
    const { userId, password, passwordConfirm } = await request.json();

    if (!userId || !password || !passwordConfirm) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 비밀번호 일치 확인
    if (password !== passwordConfirm) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 400 }
      );
    }

    // 비밀번호 규칙 검증
    const validation = validatePassword(password);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    // Supabase Admin API로 비밀번호 변경
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: password,
    });

    if (error) {
      console.error("Password reset error:", error);
      return NextResponse.json(
        { error: "비밀번호 변경에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "비밀번호가 변경되었습니다.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "비밀번호 변경 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


