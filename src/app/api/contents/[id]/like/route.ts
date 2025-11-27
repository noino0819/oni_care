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

        // 기존 좋아요 확인
        const { data: existingLike } = await supabase
            .from("content_likes")
            .select("id")
            .eq("content_id", contentId)
            .eq("user_id", user.id)
            .single();

        if (existingLike) {
            // 좋아요 취소
            await supabase
                .from("content_likes")
                .delete()
                .eq("id", existingLike.id);

            // 좋아요 카운트 감소
            const { data: content } = await supabase
                .from("contents")
                .select("like_count")
                .eq("id", contentId)
                .single();

            if (content) {
                await supabase
                    .from("contents")
                    .update({ like_count: Math.max(0, (content.like_count || 0) - 1) })
                    .eq("id", contentId);
            }

            return NextResponse.json({
                success: true,
                isLiked: false,
            });
        } else {
            // 좋아요 추가
            const { error } = await supabase.from("content_likes").insert({
                content_id: contentId,
                user_id: user.id,
            });

            if (error) {
                console.error("Like insert error:", error);
                return NextResponse.json(
                    { error: "좋아요 저장에 실패했습니다." },
                    { status: 500 }
                );
            }

            // 좋아요 카운트 증가
            const { data: content } = await supabase
                .from("contents")
                .select("like_count")
                .eq("id", contentId)
                .single();

            if (content) {
                await supabase
                    .from("contents")
                    .update({ like_count: (content.like_count || 0) + 1 })
                    .eq("id", contentId);
            }

            return NextResponse.json({
                success: true,
                isLiked: true,
            });
        }
    } catch (error) {
        console.error("Like API error:", error);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}

