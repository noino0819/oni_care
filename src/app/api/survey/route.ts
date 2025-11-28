import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const { height, weight, activity_level, disease, interests } = body;

    // 유효성 검사
    if (height !== undefined && (height < 0 || height > 200)) {
      return NextResponse.json({ error: "키는 0~200cm 사이여야 합니다." }, { status: 400 });
    }
    
    if (weight !== undefined && (weight < 0 || weight > 300)) {
      return NextResponse.json({ error: "몸무게는 0~300kg 사이여야 합니다." }, { status: 400 });
    }

    const validActivityLevels = ['sedentary', 'lightly_active', 'moderately_active', 'very_active'];
    if (activity_level && !validActivityLevels.includes(activity_level)) {
      return NextResponse.json({ error: "올바른 활동량을 선택해주세요." }, { status: 400 });
    }

    // 업데이트할 데이터 구성
    const updateData: Record<string, unknown> = {};
    
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (activity_level) updateData.activity_level = activity_level;
    if (disease) updateData.diseases = [disease]; // 1개만 선택 가능
    if (interests && Array.isArray(interests)) updateData.interests = interests;

    // 사용자 정보 업데이트
    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      console.error("설문 저장 에러:", error);
      return NextResponse.json({ error: "설문 저장에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "설문이 저장되었습니다." 
    });
  } catch (error) {
    console.error("설문 저장 에러:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 사용자 설문 데이터 조회
    const { data: userData, error } = await supabase
      .from("users")
      .select("height, weight, activity_level, diseases, interests")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("설문 조회 에러:", error);
      return NextResponse.json({ error: "설문 조회에 실패했습니다." }, { status: 500 });
    }

    // 설문 완료 여부 확인
    const isComplete = userData && 
      userData.height && 
      userData.weight && 
      userData.activity_level && 
      userData.diseases?.length > 0 && 
      userData.interests?.length > 0;

    return NextResponse.json({ 
      success: true,
      survey: userData,
      isComplete
    });
  } catch (error) {
    console.error("설문 조회 에러:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

