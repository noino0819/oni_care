import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: 영양제 검색
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q") || "";
        const limit = parseInt(searchParams.get("limit") || "50");

        if (!query.trim()) {
            // 검색어가 없으면 인기 상품 반환
            const { data: products, error } = await supabase
                .from("supplement_products")
                .select("*")
                .eq("is_active", true)
                .order("is_popular", { ascending: false })
                .order("display_order", { ascending: true })
                .limit(limit);

            if (error) {
                console.error("Products fetch error:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            const formattedProducts = (products || []).map((product) => ({
                id: product.id,
                name: product.name,
                brand: product.brand,
                dosagePerServing: `1정 | ${product.description?.substring(0, 20) || "1000mg"}`,
                ingredients: product.ingredients,
            }));

            return NextResponse.json({ products: formattedProducts });
        }

        // 이름 또는 성분으로 검색
        const { data: products, error } = await supabase
            .from("supplement_products")
            .select("*")
            .eq("is_active", true)
            .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
            .order("name", { ascending: true })
            .limit(limit);

        if (error) {
            console.error("Search error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 성분 기반 검색도 수행
        const { data: ingredientProducts, error: ingredientError } = await supabase
            .from("supplement_products")
            .select("*")
            .eq("is_active", true)
            .contains("ingredients", [query])
            .limit(limit);

        if (ingredientError) {
            console.error("Ingredient search error:", ingredientError);
        }

        // 결과 병합 및 중복 제거
        const allProducts = [...(products || [])];
        const productIds = new Set(allProducts.map((p) => p.id));
        
        (ingredientProducts || []).forEach((p) => {
            if (!productIds.has(p.id)) {
                allProducts.push(p);
            }
        });

        // 데이터 변환 및 정렬 (이름 일치도순)
        const formattedProducts = allProducts
            .map((product) => ({
                id: product.id,
                name: product.name,
                brand: product.brand,
                dosagePerServing: `1정 | ${product.description?.substring(0, 20) || "1000mg"}`,
                ingredients: product.ingredients,
                matchScore: product.name.toLowerCase().indexOf(query.toLowerCase()),
            }))
            .sort((a, b) => {
                // 이름에서 먼저 일치하는 것이 우선
                if (a.matchScore !== -1 && b.matchScore !== -1) {
                    return a.matchScore - b.matchScore;
                }
                if (a.matchScore !== -1) return -1;
                if (b.matchScore !== -1) return 1;
                return 0;
            })
            .map(({ matchScore, ...rest }) => rest);

        return NextResponse.json({
            products: formattedProducts,
            query,
            total: formattedProducts.length,
        });
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json(
            { error: "Failed to search products" },
            { status: 500 }
        );
    }
}

