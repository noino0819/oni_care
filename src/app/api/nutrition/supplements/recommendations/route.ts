import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: 맞춤 영양제 추천 및 인기상품 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const searchParams = request.nextUrl.searchParams;
    const interest = searchParams.get("interest");

    // 사용자 관심사 조회 (로그인한 경우)
    let userInterests: string[] = [];
    let userName = "회원";

    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("name, interests")
        .eq("id", user.id)
        .single();

      if (userData) {
        userInterests = userData.interests || [];
        userName = userData.name || "회원";
      }
    }

    // 기본 관심사 (설정이 없는 경우)
    if (userInterests.length === 0) {
      userInterests = ["피부건강", "모발건강", "소화기/장건강"];
    }

    // 선택된 관심사 (없으면 첫 번째 관심사)
    const selectedInterest = interest || userInterests[0];

    // 관심사별 성분 정보 조회
    const { data: ingredients, error: ingredientsError } = await supabase
      .from("interest_ingredients")
      .select("*")
      .eq("interest_name", selectedInterest)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(3);

    if (ingredientsError) {
      console.error("Ingredients fetch error:", ingredientsError);
    }

    // 관심사 관련 추천 상품 조회
    const { data: recommendedProducts, error: productsError } = await supabase
      .from("supplement_products")
      .select("*")
      .contains("related_interests", [selectedInterest])
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(6);

    if (productsError) {
      console.error("Products fetch error:", productsError);
    }

    // 인기 상품 조회
    const { data: popularProducts, error: popularError } = await supabase
      .from("supplement_products")
      .select("*")
      .eq("is_active", true)
      .eq("is_popular", true)
      .order("view_count", { ascending: false })
      .limit(6);

    if (popularError) {
      console.error("Popular products fetch error:", popularError);
    }

    // 성분 정보 포맷팅
    const formattedIngredients = (ingredients || []).map((ing) => ({
      name: ing.ingredient_name,
      benefit: ing.benefit_description,
      isWarning: ing.is_warning || false,
    }));

    // 상품 정보 포맷팅
    const formatProduct = (product: {
      id: string;
      name: string;
      brand: string;
      image_url: string | null;
      price: number;
      sale_price: number | null;
      tags: string[];
      product_url: string | null;
    }) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image: product.image_url,
      price: product.price,
      salePrice: product.sale_price,
      tags: product.tags || [],
      productUrl: product.product_url,
    });

    return NextResponse.json({
      userName,
      interests: userInterests,
      selectedInterest,
      ingredients: formattedIngredients,
      recommendedProducts: (recommendedProducts || []).map(formatProduct),
      popularProducts: (popularProducts || []).map(formatProduct),
    });
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

