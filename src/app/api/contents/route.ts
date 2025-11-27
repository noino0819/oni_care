import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("categoryId");
    const subcategoryId = searchParams.get("subcategoryId");
    const keyword = searchParams.get("keyword");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // 현재 사용자 확인 (좋아요 상태 확인용)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 기본 쿼리 생성
    let query = supabase
      .from("contents")
      .select(
        `
        id,
        title,
        thumbnail_url,
        background_color,
        card_style,
        created_at,
        category:content_categories(
          id,
          category_name,
          category_type
        ),
        subcategory:content_subcategories(
          id,
          subcategory_name
        )
      `,
        { count: "exact" }
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // 카테고리 필터링
    if (subcategoryId) {
      query = query.eq("subcategory_id", subcategoryId);
    } else if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    // 키워드 검색
    if (keyword) {
      query = query.ilike("title", `%${keyword}%`);
    }

    const { data: contents, count, error } = await query;

    if (error) {
      console.error("Contents fetch error:", error);
      return NextResponse.json(
        { error: "컨텐츠를 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 좋아요 상태 확인
    let likedContentIds: string[] = [];
    if (user) {
      const { data: likes } = await supabase
        .from("content_likes")
        .select("content_id")
        .eq("user_id", user.id);
      likedContentIds = likes?.map((l) => l.content_id) || [];
    }

    // 응답 데이터 변환
    const contentCards = contents?.map((content) => ({
      id: content.id,
      category: content.category?.category_name || "",
      subCategory: content.subcategory?.subcategory_name,
      title: content.title,
      thumbnailUrl: content.thumbnail_url,
      backgroundColor: content.background_color,
      cardStyle: content.card_style,
      isLiked: likedContentIds.includes(content.id),
      createdAt: content.created_at,
    }));

    return NextResponse.json({
      contents: contentCards || [],
      totalCount: count || 0,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (error) {
    console.error("Contents API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

