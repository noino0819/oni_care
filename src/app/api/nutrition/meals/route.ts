import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: 특정 날짜의 식사 기록 조회
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
        const mealType = searchParams.get("mealType");

        let query = supabase
            .from("meals")
            .select("*")
            .eq("user_id", user.id)
            .eq("meal_date", date)
            .order("created_at", { ascending: false });

        if (mealType) {
            query = query.eq("meal_type", mealType);
        }

        const { data: meals, error } = await query;

        if (error) {
            console.error("Meals fetch error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 끼니별 상태도 함께 조회
        const { data: mealStatus } = await supabase
            .from("meal_status")
            .select("*")
            .eq("user_id", user.id)
            .eq("meal_date", date);

        return NextResponse.json({
            meals: meals || [],
            mealStatus: mealStatus || [],
        });
    } catch (error) {
        console.error("Meals API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch meals" },
            { status: 500 }
        );
    }
}

// POST: 식사 기록 추가
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
        const { mealType, mealDate, foods, totalCalories, totalCarbs, totalProtein, totalFat } = body;

        if (!mealType || !foods || foods.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // 음식 기록 추가
        const mealRecords = foods.map((food: {
            name: string;
            calories: number;
            carbs: number;
            protein: number;
            fat: number;
            fiber?: number;
            sodium?: number;
            sugar?: number;
            saturatedFat?: number;
            cholesterol?: number;
            servingSize?: string;
        }) => ({
            user_id: user.id,
            meal_type: mealType,
            meal_date: mealDate || new Date().toISOString().split("T")[0],
            food_name: food.name,
            calories: food.calories,
            carbs: food.carbs,
            protein: food.protein,
            fat: food.fat,
            fiber: food.fiber || 0,
            sodium: food.sodium || 0,
            sugar: food.sugar || 0,
            saturated_fat: food.saturatedFat || 0,
            cholesterol: food.cholesterol || 0,
            serving_size: food.servingSize,
        }));

        const { data: insertedMeals, error: mealError } = await supabase
            .from("meals")
            .insert(mealRecords)
            .select();

        if (mealError) {
            console.error("Meal insert error:", mealError);
            return NextResponse.json({ error: mealError.message }, { status: 500 });
        }

        // 끼니 상태 업데이트
        const { error: statusError } = await supabase
            .from("meal_status")
            .upsert({
                user_id: user.id,
                meal_date: mealDate || new Date().toISOString().split("T")[0],
                meal_type: mealType,
                status: "recorded",
            }, {
                onConflict: "user_id,meal_date,meal_type",
            });

        if (statusError) {
            console.error("Meal status update error:", statusError);
        }

        // 일일 영양 로그 업데이트
        await updateNutritionLog(supabase, user.id, mealDate || new Date().toISOString().split("T")[0]);

        return NextResponse.json({
            success: true,
            meals: insertedMeals,
        });
    } catch (error) {
        console.error("Meals API error:", error);
        return NextResponse.json(
            { error: "Failed to save meal" },
            { status: 500 }
        );
    }
}

// PUT: 식사 기록 수정
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
        const { mealId, ...updates } = body;

        if (!mealId) {
            return NextResponse.json(
                { error: "Meal ID is required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("meals")
            .update(updates)
            .eq("id", mealId)
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) {
            console.error("Meal update error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 일일 영양 로그 업데이트
        if (data.meal_date) {
            await updateNutritionLog(supabase, user.id, data.meal_date);
        }

        return NextResponse.json({ success: true, meal: data });
    } catch (error) {
        console.error("Meals API error:", error);
        return NextResponse.json(
            { error: "Failed to update meal" },
            { status: 500 }
        );
    }
}

// DELETE: 식사 기록 삭제
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
        const mealId = searchParams.get("mealId");
        const mealType = searchParams.get("mealType");
        const mealDate = searchParams.get("mealDate");

        if (mealId) {
            // 개별 음식 삭제
            const { error } = await supabase
                .from("meals")
                .delete()
                .eq("id", mealId)
                .eq("user_id", user.id);

            if (error) {
                console.error("Meal delete error:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        } else if (mealType && mealDate) {
            // 끼니 전체 삭제 (안먹음 처리)
            const { error: deleteError } = await supabase
                .from("meals")
                .delete()
                .eq("user_id", user.id)
                .eq("meal_type", mealType)
                .eq("meal_date", mealDate);

            if (deleteError) {
                console.error("Meals delete error:", deleteError);
                return NextResponse.json({ error: deleteError.message }, { status: 500 });
            }

            // 끼니 상태를 skipped로 변경
            const { error: statusError } = await supabase
                .from("meal_status")
                .upsert({
                    user_id: user.id,
                    meal_date: mealDate,
                    meal_type: mealType,
                    status: "skipped",
                }, {
                    onConflict: "user_id,meal_date,meal_type",
                });

            if (statusError) {
                console.error("Meal status update error:", statusError);
            }
        }

        // 일일 영양 로그 업데이트
        if (mealDate) {
            await updateNutritionLog(supabase, user.id, mealDate);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Meals API error:", error);
        return NextResponse.json(
            { error: "Failed to delete meal" },
            { status: 500 }
        );
    }
}

// 일일 영양 로그 업데이트 헬퍼 함수
async function updateNutritionLog(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    date: string
) {
    // 해당 날짜의 모든 식사 기록 조회
    const { data: meals } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", userId)
        .eq("meal_date", date);

    if (!meals) return;

    // 합계 계산
    const totals = meals.reduce(
        (acc, meal) => ({
            totalCalories: acc.totalCalories + (meal.calories || 0),
            totalCarbs: acc.totalCarbs + (meal.carbs || 0),
            totalProtein: acc.totalProtein + (meal.protein || 0),
            totalFat: acc.totalFat + (meal.fat || 0),
            totalFiber: acc.totalFiber + (meal.fiber || 0),
            totalSodium: acc.totalSodium + (meal.sodium || 0),
            totalSugar: acc.totalSugar + (meal.sugar || 0),
            totalSaturatedFat: acc.totalSaturatedFat + (meal.saturated_fat || 0),
            totalCholesterol: acc.totalCholesterol + (meal.cholesterol || 0),
        }),
        {
            totalCalories: 0,
            totalCarbs: 0,
            totalProtein: 0,
            totalFat: 0,
            totalFiber: 0,
            totalSodium: 0,
            totalSugar: 0,
            totalSaturatedFat: 0,
            totalCholesterol: 0,
        }
    );

    // 영양 로그 업데이트
    await supabase
        .from("nutrition_logs")
        .upsert({
            user_id: userId,
            log_date: date,
            total_calories: totals.totalCalories,
            total_carbs: totals.totalCarbs,
            total_protein: totals.totalProtein,
            total_fat: totals.totalFat,
            total_fiber: totals.totalFiber,
            total_sodium: totals.totalSodium,
            total_sugar: totals.totalSugar,
            total_saturated_fat: totals.totalSaturatedFat,
            total_cholesterol: totals.totalCholesterol,
        }, {
            onConflict: "user_id,log_date",
        });
}


