import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: 영양제 루틴 목록 조회 (관리용)
export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 모든 활성화된 영양제 루틴 조회
        const { data: routines, error: routinesError } = await supabase
            .from("supplement_routines")
            .select(`
                *,
                supplement_products (
                    id,
                    name,
                    brand,
                    ingredients
                )
            `)
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("created_at", { ascending: true });

        if (routinesError) {
            console.error("Routines fetch error:", routinesError);
            return NextResponse.json({ error: routinesError.message }, { status: 500 });
        }

        // 데이터 변환
        const formattedRoutines = (routines || []).map((routine) => ({
            id: routine.id,
            name: routine.name,
            brand: routine.brand || routine.supplement_products?.brand,
            dosage: routine.dosage,
            dosagePerServing: routine.dosage_per_serving,
            daysOfWeek: routine.days_of_week || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
            scheduledTimes: routine.scheduled_times || [
                { time: "09:00", period: "AM", dosage: routine.dosage || "1정" }
            ],
            isActive: routine.is_active,
            supplementProductId: routine.supplement_product_id,
        }));

        return NextResponse.json({
            routines: formattedRoutines,
        });
    } catch (error) {
        console.error("Routines API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch routines" },
            { status: 500 }
        );
    }
}

// POST: 영양제 루틴 추가 (검색에서 선택한 제품들)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { products } = body;

        if (!products || !Array.isArray(products) || products.length === 0) {
            return NextResponse.json(
                { error: "Products array is required" },
                { status: 400 }
            );
        }

        // 최대 10개 제한
        if (products.length > 10) {
            return NextResponse.json(
                { error: "Maximum 10 products can be added at once" },
                { status: 400 }
            );
        }

        // 루틴 생성
        const routinesToInsert = products.map((product: {
            supplementProductId?: string;
            name: string;
            brand?: string;
            dosagePerServing?: string;
        }) => ({
            user_id: user.id,
            supplement_product_id: product.supplementProductId || null,
            name: product.name,
            brand: product.brand || null,
            dosage: "1정",
            dosage_per_serving: product.dosagePerServing || null,
            days_of_week: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
            scheduled_times: [{ time: "09:00", period: "AM", dosage: "1정" }],
            is_active: true,
        }));

        const { data, error } = await supabase
            .from("supplement_routines")
            .insert(routinesToInsert)
            .select();

        if (error) {
            console.error("Routines insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            routines: data,
            count: data?.length || 0,
        });
    } catch (error) {
        console.error("Routines API error:", error);
        return NextResponse.json(
            { error: "Failed to add routines" },
            { status: 500 }
        );
    }
}

// PUT: 영양제 루틴 수정 (편집 모드에서)
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { routines } = body;

        if (!routines || !Array.isArray(routines)) {
            return NextResponse.json(
                { error: "Routines array is required" },
                { status: 400 }
            );
        }

        // 각 루틴 업데이트
        const updatePromises = routines.map(async (routine: {
            id: string;
            daysOfWeek?: string[];
            scheduledTimes?: Array<{ time: string; period: string; dosage: string }>;
        }) => {
            return supabase
                .from("supplement_routines")
                .update({
                    days_of_week: routine.daysOfWeek,
                    scheduled_times: routine.scheduledTimes,
                })
                .eq("id", routine.id)
                .eq("user_id", user.id);
        });

        await Promise.all(updatePromises);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Routines API error:", error);
        return NextResponse.json(
            { error: "Failed to update routines" },
            { status: 500 }
        );
    }
}

// DELETE: 영양제 루틴 삭제
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const routineId = searchParams.get("routineId");

        if (!routineId) {
            return NextResponse.json(
                { error: "Routine ID is required" },
                { status: 400 }
            );
        }

        // 루틴 삭제 (또는 비활성화)
        const { error } = await supabase
            .from("supplement_routines")
            .update({ is_active: false })
            .eq("id", routineId)
            .eq("user_id", user.id);

        if (error) {
            console.error("Routine delete error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Routines API error:", error);
        return NextResponse.json(
            { error: "Failed to delete routine" },
            { status: 500 }
        );
    }
}

