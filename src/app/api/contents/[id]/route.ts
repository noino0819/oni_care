import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // 현재 사용자 확인
        const {
            data: { user },
        } = await supabase.auth.getUser();

        // 컨텐츠 상세 조회
        const { data: content, error } = await supabase
            .from("contents")
            .select(
                `
        id,
        title,
        thumbnail_url,
        background_color,
        card_style,
        view_count,
        like_count,
        created_at,
        category:content_categories(
          id,
          category_name,
          category_type
        ),
        subcategory:content_subcategories(
          id,
          subcategory_name
        ),
        media:content_media(
          id,
          media_type,
          media_url,
          display_order,
          alt_text
        )
      `
            )
            .eq("id", id)
            .eq("is_published", true)
            .single();

        if (error || !content) {
            return NextResponse.json(
                { error: "컨텐츠를 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        // 조회수 증가
        await supabase
            .from("contents")
            .update({ view_count: (content.view_count || 0) + 1 })
            .eq("id", id);

        // 사용자별 데이터 조회 (로그인한 경우)
        let userRating: number | null = null;
        let isLiked = false;
        let isRead = false;

        if (user) {
            // 마지막 별점 조회
            const { data: reviews } = await supabase
                .from("content_reviews")
                .select("rating")
                .eq("content_id", id)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1);

            if (reviews && reviews.length > 0) {
                userRating = reviews[0].rating;
            }

            // 좋아요 상태 조회
            const { data: like } = await supabase
                .from("content_likes")
                .select("id")
                .eq("content_id", id)
                .eq("user_id", user.id)
                .single();

            isLiked = !!like;

            // 읽음 상태 조회
            const { data: readHistory } = await supabase
                .from("content_read_history")
                .select("id")
                .eq("content_id", id)
                .eq("user_id", user.id)
                .single();

            isRead = !!readHistory;
        }

        // 미디어 정렬
        const sortedMedia = content.media?.sort(
            (a, b) => a.display_order - b.display_order
        );

        return NextResponse.json({
            id: content.id,
            title: content.title,
            thumbnail_url: content.thumbnail_url,
            category: content.category
                ? {
                    id: content.category.id,
                    name: content.category.category_name,
                    type: content.category.category_type,
                }
                : null,
            subcategory: content.subcategory
                ? {
                    id: content.subcategory.id,
                    name: content.subcategory.subcategory_name,
                }
                : null,
            media: sortedMedia || [],
            userRating,
            isLiked,
            isRead,
        });
    } catch (error) {
        console.error("Content detail API error:", error);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}

