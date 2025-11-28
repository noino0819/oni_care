import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: contentId } = await params;

        // 사용자 인증 확인
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        // 읽음 히스토리 저장 (upsert - 이미 있으면 업데이트)
        const { error } = await supabase
            .from("content_read_history")
            .upsert(
                {
                    content_id: contentId,
                    user_id: user.id,
                    read_at: new Date().toISOString(),
                },
                {
                    onConflict: "content_id,user_id",
                }
            );

        if (error) {
            console.error("Read history insert error:", error);
            return NextResponse.json(
                { error: "읽음 기록 저장에 실패했습니다." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("Read API error:", error);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}


