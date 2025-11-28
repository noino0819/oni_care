import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/profile/password - 비밀번호 변경
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "새 비밀번호가 일치하지 않습니다." },
        { status: 400 }
      );
    }

    // 비밀번호 규칙 검사 (영문, 숫자, 특수문자 포함 8~15자)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,15}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: "영문, 숫자, 특수문자를 포함하여 8자 이상 15자 이내로 설정해주세요" },
        { status: 400 }
      );
    }

    // 현재 비밀번호 확인 (재로그인으로 검증)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "현재 비밀번호가 일치하지 않습니다." },
        { status: 400 }
      );
    }

    // 비밀번호 변경
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json(
        { error: "비밀번호 변경에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 변경되었습니다.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}


