import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 카테고리와 세분류를 함께 조회
    const { data: categories, error } = await supabase
      .from("content_categories")
      .select(`
        id,
        category_type,
        category_name,
        display_order,
        is_active,
        created_at,
        subcategories:content_subcategories(
          id,
          subcategory_name,
          display_order,
          is_active
        )
      `)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Categories fetch error:", error);
      return NextResponse.json(
        { error: "카테고리를 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 타입별로 분류
    const interest = categories?.filter((c) => c.category_type === "interest") || [];
    const disease = categories?.filter((c) => c.category_type === "disease") || [];
    const exercise = categories?.filter((c) => c.category_type === "exercise") || [];

    return NextResponse.json({
      interest,
      disease,
      exercise,
    });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

