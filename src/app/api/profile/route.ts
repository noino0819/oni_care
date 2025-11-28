import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/profile - 사용자 프로필 조회
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    // 전화번호 마스킹
    const maskedPhone = profile?.phone 
      ? profile.phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-****-$3")
      : null;

    return NextResponse.json({
      ...profile,
      masked_phone: maskedPhone,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - 사용자 프로필 수정
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const updates = await request.json();

    // 수정 가능한 필드만 허용
    const allowedFields = [
      "name",
      "birth_date",
      "gender",
      "height",
      "weight",
      "activity_level",
      "diseases",
      "interests",
      "business_code",
      "marketing_push_agreed",
      "marketing_sms_agreed",
    ];

    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    // 사업장 코드 변경 시 유효성 검사
    if (filteredUpdates.business_code) {
      const { data: businessCode, error: codeError } = await supabase
        .from("business_codes")
        .select("*")
        .eq("code", filteredUpdates.business_code)
        .eq("is_active", true)
        .single();

      if (codeError || !businessCode) {
        return NextResponse.json(
          { error: "유효하지 않은 사업장코드입니다." },
          { status: 400 }
        );
      }

      // 진행중인 챌린지 확인 (사업장 제한 챌린지)
      // 실제로는 챌린지 테이블과 조인해서 확인해야 함
      // 여기서는 간단히 처리
    }

    // 마케팅 동의 시간 업데이트
    if (filteredUpdates.marketing_push_agreed !== undefined) {
      filteredUpdates.push_agreed_at = filteredUpdates.marketing_push_agreed 
        ? new Date().toISOString() 
        : null;
    }
    if (filteredUpdates.marketing_sms_agreed !== undefined) {
      filteredUpdates.sms_agreed_at = filteredUpdates.marketing_sms_agreed 
        ? new Date().toISOString() 
        : null;
    }

    const { data, error } = await supabase
      .from("users")
      .update(filteredUpdates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

