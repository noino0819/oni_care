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

        const body = await request.json();
        const { rating, reviewText } = body;

        // 유효성 검사
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "올바른 별점을 입력해주세요. (1-5)" },
                { status: 400 }
            );
        }

        // 리뷰 저장 (여러 번 남길 수 있음)
        const { error } = await supabase.from("content_reviews").insert({
            content_id: contentId,
            user_id: user.id,
            rating,
            review_text: reviewText || null,
        });

        if (error) {
            console.error("Review insert error:", error);
            return NextResponse.json(
                { error: "리뷰 저장에 실패했습니다." },
                { status: 500 }
            );
        }

        // 리뷰 작성 포인트 지급 (첫 리뷰인 경우에만)
        let pointsEarned = 0;
        const { data: existingReviews } = await supabase
            .from("content_reviews")
            .select("id")
            .eq("content_id", contentId)
            .eq("user_id", user.id);

        // 첫 리뷰일 때만 포인트 지급
        if (existingReviews && existingReviews.length === 1) {
            pointsEarned = 10;

            // 포인트 추가
            const { data: userPoints } = await supabase
                .from("user_points")
                .select("total_points")
                .eq("user_id", user.id)
                .single();

            if (userPoints) {
                await supabase
                    .from("user_points")
                    .update({ total_points: userPoints.total_points + pointsEarned })
                    .eq("user_id", user.id);
            } else {
                await supabase.from("user_points").insert({
                    user_id: user.id,
                    total_points: pointsEarned,
                });
            }
        }

        return NextResponse.json({
            success: true,
            pointsEarned,
        });
    } catch (error) {
        console.error("Review API error:", error);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}

