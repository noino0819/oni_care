import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: 영양제 상품 목록 조회
export async function GET() {
    try {
        const supabase = await createClient();

        // 활성화된 영양제 상품 목록 조회
        const { data: products, error } = await supabase
            .from("supplement_products")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true })
            .order("is_popular", { ascending: false });

        if (error) {
            console.error("Products fetch error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 데이터 변환
        const formattedProducts = (products || []).map((product) => ({
            id: product.id,
            name: product.name,
            brand: product.brand,
            dosagePerServing: `${product.ingredients?.[0] || "1정"} | ${product.description || ""}`.substring(0, 30),
            ingredients: product.ingredients,
            tags: product.tags,
            relatedInterests: product.related_interests,
            isPopular: product.is_popular,
        }));

        return NextResponse.json({
            products: formattedProducts,
        });
    } catch (error) {
        console.error("Products API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

