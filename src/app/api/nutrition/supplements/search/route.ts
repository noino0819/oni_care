import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: 영양제 검색 (제품 마스터 테이블에서 검색)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q") || "";
        const limit = parseInt(searchParams.get("limit") || "50");

        if (!query.trim()) {
            // 검색어가 없으면 전체 제품 반환 (최신순)
            const { data: products, error } = await supabase
                .from("supplement_products_master")
                .select(`
                    *,
                    ingredients:product_ingredient_mapping(
                        content_amount,
                        content_unit,
                        ingredient:functional_ingredients(external_name)
                    )
                `)
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(limit);

            if (error) {
                console.error("Products fetch error:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            const formattedProducts = formatProducts(products || []);
            return NextResponse.json({ products: formattedProducts });
        }

        // 제품명 또는 제조사로 검색
        const { data: products, error } = await supabase
            .from("supplement_products_master")
            .select(`
                *,
                ingredients:product_ingredient_mapping(
                    content_amount,
                    content_unit,
                    ingredient:functional_ingredients(external_name)
                )
            `)
            .eq("is_active", true)
            .or(`product_name.ilike.%${query}%,manufacturer.ilike.%${query}%`)
            .order("product_name", { ascending: true })
            .limit(limit);

        if (error) {
            console.error("Search error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 성분명으로도 검색
        const { data: ingredientProducts, error: ingredientError } = await supabase
            .from("product_ingredient_mapping")
            .select(`
                product:supplement_products_master(
                    *,
                    ingredients:product_ingredient_mapping(
                        content_amount,
                        content_unit,
                        ingredient:functional_ingredients(external_name)
                    )
                ),
                ingredient:functional_ingredients(external_name)
            `)
            .ilike("ingredient.external_name", `%${query}%`);

        if (ingredientError) {
            console.error("Ingredient search error:", ingredientError);
        }

        // 결과 병합 및 중복 제거
        const allProducts = [...(products || [])];
        const productIds = new Set(allProducts.map((p) => p.id));
        
        (ingredientProducts || []).forEach((item) => {
            const product = item.product;
            if (product && !productIds.has(product.id)) {
                allProducts.push(product);
                productIds.add(product.id);
            }
        });

        // 데이터 변환 및 정렬 (이름 일치도순)
        const formattedProducts = formatProducts(allProducts)
            .map((product) => ({
                ...product,
                matchScore: product.name.toLowerCase().indexOf(query.toLowerCase()),
            }))
            .sort((a, b) => {
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

// 제품 데이터 포맷팅
function formatProducts(products: Array<{
    id: string;
    product_name: string;
    manufacturer?: string;
    form_unit?: string;
    single_dose?: number;
    dosage_unit?: string;
    default_intake_amount?: string;
    ingredients?: Array<{
        content_amount: number;
        content_unit: string;
        ingredient?: { external_name: string };
    }>;
}>) {
    return products.map((product) => {
        // 성분 정보 추출
        const ingredientNames = (product.ingredients || [])
            .map((ing) => ing.ingredient?.external_name)
            .filter(Boolean);

        // 용량 정보 생성
        const dosageInfo = product.single_dose && product.dosage_unit
            ? `${product.single_dose}${product.dosage_unit}`
            : null;

        const intakeAmount = product.default_intake_amount || "1";
        const formUnit = product.form_unit || "정";

        return {
            id: product.id,
            name: product.product_name,
            brand: product.manufacturer || "",
            formUnit: formUnit,
            dosagePerServing: dosageInfo 
                ? `${intakeAmount}${formUnit} | ${dosageInfo}` 
                : `${intakeAmount}${formUnit}`,
            ingredients: ingredientNames,
        };
    });
}
